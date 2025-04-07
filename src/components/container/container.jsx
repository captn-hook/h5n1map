'use client';

import React, { useRef, useState, useEffect } from 'react';

import Div100vh from 'react-div-100vh';

import styles from './container.module.css';

import LoadingOverlay from '@/components/loading/loading';

import Title from '@/components/title/title';
import Key from '@/components/key/key';
import Selector from '@/components/selector/selector';

import Map from '@/components/map/map';

import extractDate from '@/components/utils/extractDate';

const LegendDefault = 'All Cases';
const WildlifeDefault = 'All Species';

const keyColor = {
    'Dairy Farms': '#7F8FFF', // lo #EFF3C7 mid #B2B98C hi #677143
    'Poultry Farms': '#7653A5',
    'Human': '#FFC200',
    'Wild Birds': '#FC573E',
    'Wildlife': '#519A8F',
};

const keyType = {
    'Dairy Farms': 'state',
    'Poultry Farms': 'county',
    'Human': 'point',
    'Wild Birds': 'county',
    'Wildlife': 'county',
};

function getDairyData(allData) {
    if (allData == undefined || allData[''] === undefined) {
        return [{}, {}];
    } else if (allData['']['Dairy Farms'] === undefined) {
        return [{}, {}];
    }
    let dairyData = allData['']['Dairy Farms'];

    let dairyD = {};
    let dairyDates = {};

    for (let line of dairyData) {
        if (line.includes('inictive')) {
            continue;
        }
        let abbrev = line.split(',')
        abbrev = abbrev[15];

        dairyD[abbrev] = dairyD[abbrev] === undefined ? 1 : dairyD[abbrev] + 1;

        if (dairyDates[abbrev] === undefined) {
            dairyDates[abbrev] = [extractDate(true, line.split(',')), extractDate(true, line.split(','))];
        } else {
            let date = extractDate(true, line.split(','));
            if (date > dairyDates[abbrev][1]) {
                dairyDates[abbrev][1] = date;
            } else if (date < dairyDates[abbrev][0]) {
                dairyDates[abbrev][0] = date;
            }
        }
    }
    return [dairyD, dairyDates]
}

function getMax(allData, selectedLegend, selectedWildlife, WildlifeOptions, Maxes) {
    // selectedLegend == 'Wildlife' ? selectedWildlife == WildlifeOptions[0] ? Maxes['All Species'] : Maxes[selectedWildlife] : Maxes[selectedLegend]} stateCounty='county'
    if (selectedLegend == 'Wildlife') {
        if (selectedWildlife == WildlifeOptions[0]) {
            return Maxes['All Species'];
        } else {
            return Maxes[selectedWildlife];
        }
    } else if (selectedLegend == 'Dairy Farms') {
        let dairyD = getDairyData(allData)[0];

        return Math.max(...Object.values(dairyD));
    }
    return Maxes[selectedLegend];
}



function dataIngest(data, minDate, maxDate) {
    // allData json structure:
    // allData['countyID'] = { 'source': ['row1', 'row2', ...], 'name': 'countyName' }
    // maxMins = [[maxPoultry, 0], [maxWildBirds, 0], [maxWildlife, 0]]
    // maxes = { 'Dairy Farms': maxDairy, 'Poultry Farms': maxPoultry, 'Wild Birds': maxWildBirds, 'Human': maxHuman, 'All Cases': maxAll, 'All Species': maxAllSpecies, 'Otter': maxOtter}
    // dates = { 'Dairy Farms': mostRecentDate, 'Poultry Farms': mostRecentDate, 'Wild Birds': mostRecentDate, 'Human': mostRecentDate, 'All Cases': mostRecentDate, 'All Species': mostRecentDate }
    let maxes = {};
    let dates = {};
    let active = {};
    let legendOptions = [LegendDefault];
    let wildlifeOptions = [WildlifeDefault];

    let earliest = null;
    let latest = null;

    if (data == undefined || Object.keys(data).length === 0) {
        return [maxes, legendOptions, wildlifeOptions, dates];
    }

    for (var i = 0; i < Object.keys(data).length; i++) {
        if (data[Object.keys(data)[i]] == undefined || data[Object.keys(data)[i]] == '') {
            continue;
        }
        var countyData = data[Object.keys(data)[i]];

        // block everything outside the date range
        let activeCounty = false;
        let sourceList = [];
        for (var j = 0; j < Object.keys(countyData).length; j++) {
            const source = Object.keys(countyData)[j];
            if (source != 'name') {
                for (var k = 0; k < countyData[source].length; k++) {
                    const date = extractDate(true, countyData[source][k].split(','));
                    if (earliest == null || date < earliest) {
                        earliest = date;
                    }

                    if (latest == null || date > latest) {
                        latest = date;
                    }

                    if (date < minDate || date > maxDate) {
                        // append inactive or replace active with inactive
                        if (!countyData[source][k].includes('inictive')) {
                            countyData[source][k] = countyData[source][k] + ',inictive';
                        }
                    } else {
                        // if the date is active, remove inactive
                        if (countyData[source][k].includes('inictive')) {
                            countyData[source][k] = countyData[source][k].replace(',inictive', '');
                        }
                        activeCounty = true;
                    }
                }
                if (countyData[source].length > 0) {
                    sourceList.push(source);
                }
            }
        }

        if (activeCounty) {
            active[Object.keys(data)[i]] = sourceList.sort();
        }


        // base case
        if (Object.keys(maxes).length === 0) {
            for (const source of Object.keys(countyData)) {
                if (source != 'name') {
                    maxes[source] = 0;
                    legendOptions.push(source);
                    dates[source] = null;
                }
            }
            maxes['All Cases'] = 0;
            maxes['All Species'] = 0;
            dates['All Cases'] = null;
        }

        var allmax = 0;
        var alldate = null;
        if (activeCounty) {
            for (const source of active[Object.keys(data)[i]]) {
                if (source != 'name') {
                    if (countyData[source].length > maxes[source]) {
                        maxes[source] = countyData[source].length;
                    }
                    allmax += countyData[source].length;

                    if (countyData[source].length > 0) {
                        for (const line of countyData[source]) {
                            const date = extractDate(true, line.split(','));
                            if (date > dates[source]) {
                                dates[source] = date;
                            }
                            if (date > alldate) {
                                alldate = date;
                            }
                        }
                    }

                    if (source == 'Wildlife') {
                        // wildlife is a list of comma separated strings: Wildlife,California,Mono,Mountain lion...
                        let specmax = 0;
                        for (const line of countyData[source]) {
                            const species = line.split(',')[2].trim() + '';
                            // if not in maxes, add it
                            if (!(species in maxes)) {
                                maxes[species] = 0;
                                wildlifeOptions.push(species);
                            }
                            if (countyData[source].length > maxes[species]) {
                                maxes[species] = countyData[source].length;
                                specmax = countyData[source].length;
                            }
                        }
                        if (specmax > maxes['All Species']) {
                            maxes['All Species'] = specmax;
                        }

                    }
                }
            }
        }
        if (allmax > maxes['All Cases']) {
            maxes['All Cases'] = allmax;
        }
        if (alldate > dates['All Cases']) {
            dates['All Cases'] = alldate;
        }
    }

    // sort legend options according to keyColor order
    legendOptions.sort((a, b) => {
        return Object.keys(keyColor).indexOf(a) - Object.keys(keyColor).indexOf(b);
    });

    // sort wildlife options by max value
    wildlifeOptions.sort((a, b) => {
        return maxes[b] - maxes[a];
    });

    //get the dairy farm date
    if (data[''] != undefined) {
        for (const source of Object.keys(data[''])) {
            if (source == 'Dairy Farms') {
                for (var i = 0; i < data[''][source].length; i++) {
                    let line = data[''][source][i];
                    const date = extractDate(true, line.split(','));
                    // check if the date is in range
                    let nline;
                    if (date < minDate || date > maxDate) {
                        // append inactive or replace active with inactive
                        if (!line.includes('inictive')) {
                            nline = line + ',inictive';
                        } else {
                            // line is already inactive
                            nline = line;
                        }
                    } else {
                        // if the date is active, remove inactive
                        if (line.includes('inictive')) {
                            nline = line.replace(',inictive', '');
                        } else {
                            nline = line;
                        }
                    }
                    data[''][source][i] = nline;
                    if (date > dates[source] && !data[''][source][i].includes('inictive')) {
                        dates[source] = date;
                    }
                }
            }
        }
    }
    return [maxes, legendOptions, wildlifeOptions, dates, data, active, earliest, latest];
}


export default function Container({ allData, lastUpdated, showLastUpdated, setAllData }) {
    // map container has the controls and the key for the map


    const earliestEntry = new Date('2021-12-29');

    // Min and max dates for the data
    const [minDate, setMinDate] = useState(new Date('2021-12-29'));
    const [maxDate, setMaxDate] = useState(new Date());

    const bRefOut = useRef(null);
    const bRefIn = useRef(null);
    // data ingest takes some time so show a loading overlay
    const [loading, setLoading] = React.useState(true);

    const [max, setMax] = React.useState(0); // the max value for the current selected item
    const [active, setActive] = React.useState({}); // the active counties for the current selected item
    const [Maxes, setMaxes] = React.useState({});
    const [LegendOptions, setLegendOptions] = React.useState([]);
    const [WildlifeOptions, setWildlifeOptions] = React.useState([]);
    const [Dates, setDates] = React.useState([]);

    // default selected values, can be selected via key
    const [selectedLegend, setSelectedLegend] = React.useState(LegendDefault); // the selected legend
    const [selectedWildlife, setSelectedWildlife] = React.useState(WildlifeDefault); // the selected wildlife

    useEffect(() => {
        console.log('loading metadata');
        setLoading(true);
        if (allData == undefined || Object.keys(allData).length === 0) {
            return;
        }
        const [maxes, legendOptions, wildlifeOptions, dates, data, active, earliest, latest] = dataIngest(allData, minDate, maxDate);
        setAllData(data);
        setMaxes(maxes);
        setLegendOptions(legendOptions);
        setWildlifeOptions(wildlifeOptions);
        setDates(dates);
        setActive(active);
        console.log('active', Object.keys(active).length);
        console.log('earliest', earliest);
        console.log('latest', latest);
    }, [minDate, maxDate]);

    useEffect(() => {
        console.log('loading max');
        if (allData == undefined || Object.keys(allData).length === 0) {
            return;
        }
        let max = getMax(allData, selectedLegend, selectedWildlife, WildlifeOptions, Maxes); // the max value for the current selected item
        setMax(max);
        setLoading(false);
    }, [selectedLegend, selectedWildlife, Maxes]);

    if (Object.keys(allData).length === 0) {
        return <div>
            <LoadingOverlay loading={true} />
        </div>;
    }
    
    // fg has elemnts that are in front of the map, and pinned to the corners with absolute positioning to accomodate iframe scaling
    return (
        <div className={styles.container}>
            <LoadingOverlay loading={loading} />
            <div className={styles.bg}>
                <Map setLoading={setLoading} selectedLegend={selectedLegend} selectedWildlife={selectedWildlife} allData={allData} color={keyColor} max={max} dairydata={getDairyData(allData)} bRefOut={bRefOut} bRefIn={bRefIn} active={active} />
            </div>
            <Div100vh className={styles.fg}>
                <Title {...{ lastUpdated, showLastUpdated }} />
                <Key max={max} keyColor={selectedLegend == 'All Cases' ? keyColor : keyColor[selectedLegend]} keyType={selectedLegend == 'All Cases' ? keyType : keyType[selectedLegend]}
                    selected={selectedLegend == 'All Cases' ?  // if selectedLegend is 'All Cases' then show all the options
                        LegendOptions :
                        selectedLegend == 'Wildlife' ? // if we have selected wildlife, do more filtering
                            selectedWildlife == WildlifeOptions[0] ? // if we have selected 'All Species' then show aggregated wildlife
                                'Wildlife' : // aggregated wildlife
                                selectedWildlife : // specific wildlife
                            selectedLegend} // just the normal legend 
                />
                <Selector setSelectedLegend={setSelectedLegend} selectedLegend={selectedLegend} setSelectedWildlife={setSelectedWildlife} selectedWildlife={selectedWildlife} LegendOptions={LegendOptions} WildlifeOptions={WildlifeOptions} Dates={Dates} bRefOut={bRefOut} bRefIn={bRefIn} setMinDate={setMinDate} setMaxDate={setMaxDate} minDate={minDate} maxDate={maxDate} earliestEntry={earliestEntry} />
            </Div100vh>
        </div >
    );
};