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

function getDairyData(allData, minDate, maxDate) {
    if (allData == undefined || allData[''] === undefined) {
        return [{}, {}];
    } else if (allData['']['Dairy Farms'] === undefined) {
        return [{}, {}];
    }
    let dairyData = allData['']['Dairy Farms'];

    let dairyD = {};
    let dairyDates = {};

    for (let line of dairyData) {
        let abbrev = line.split(',')
        abbrev = abbrev[abbrev.length - 2];

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

function getMax(allData, selectedLegend, selectedWildlife, WildlifeOptions, Maxes, minDate, maxDate) {
    // selectedLegend == 'Wildlife' ? selectedWildlife == WildlifeOptions[0] ? Maxes['All Species'] : Maxes[selectedWildlife] : Maxes[selectedLegend]} stateCounty='county'
    if (selectedLegend == 'Wildlife') {
        if (selectedWildlife == WildlifeOptions[0]) {
            return Maxes['All Species'];
        } else {
            return Maxes[selectedWildlife];
        }
    } else if (selectedLegend == 'Dairy Farms') {
        let dairyD = getDairyData(allData, minDate, maxDate)[0];

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
    let legendOptions = [LegendDefault];
    let wildlifeOptions = [WildlifeDefault];

    let earliest = null;
    let latest = null;


    if (data == undefined || Object.keys(data).length === 0) {
        return [maxes, legendOptions, wildlifeOptions, dates];
    }


    // block everything outside the date range
    for (var i = 0; i < Object.keys(data).length; i++) {
        if (data[Object.keys(data)[i]] == undefined || data[Object.keys(data)[i]] == '') {
            continue;
        }
        var countyData = data[Object.keys(data)[i]];

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
                    }
                }
            }
        }

        // if all data is inactive, we can skip this county
        let allInactive = true;
        for (const source of Object.keys(countyData)) {
            if (source != 'name') {
                for (const line of countyData[source]) {
                    if (!line.includes('inictive')) {
                        allInactive = false;
                        break;
                    }
                }
            }
        }
        if (allInactive) {
            continue;
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
        for (const source of Object.keys(countyData)) {
            if (source != 'name') {
                // if inactive, skip
                if (countyData[source].length == 0) {
                    continue;
                }
                let actvlen = 0;
                for (const line of countyData[source]) {
                    // if inactive, skip
                    if (line.includes('inictive')) {
                        continue;
                    }
                    actvlen++;
                }

                if (actvlen > maxes[source]) {
                    maxes[source] =  actvlen;
                }
                allmax += actvlen;

                if (actvlen > 0) {
                    for (const line of countyData[source]) {
                        // if inactive, skip
                        if (line.includes('inictive')) {
                            continue;
                        }
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
                        // if inactive, skip
                        if (line.includes('inictive')) {
                            continue;
                        }
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
                for (const line of data[''][source]) {
                    // if inactive, skip
                    if (line.includes('inictive')) {
                        continue;
                    }
                    const date = extractDate(true, line.split(','));
                    if (date > dates[source]) {
                        dates[source] = date;
                    }
                }
            }
        }
    }
    return [maxes, legendOptions, wildlifeOptions, dates, data];
}


export default function Container({ allData, lastUpdated, showLastUpdated, setAllData }) {
    // map container has the controls and the key for the map

    const bRefOut = useRef(null);
    const bRefIn = useRef(null);

    //  12/30/21
    const earliestEntry = new Date('2021-12-29');

    // Min and max dates for the data
    const [minDate, setMinDate] = useState(new Date('2021-12-29'));
    const [maxDate, setMaxDate] = useState(new Date());


    // setMinDate(Date.parse('2025-04-01'));

    // data ingest takes some time so show a loading overlay
    const [loading, setLoading] = React.useState(true);

    const [Maxes, setMaxes] = React.useState({});
    const [LegendOptions, setLegendOptions] = React.useState([]);
    const [WildlifeOptions, setWildlifeOptions] = React.useState([]);
    const [Dates, setDates] = React.useState([]);

    //  [Maxes, LegendOptions, WildlifeOptions, Dates, allData] 

    // default selected values, can be selected via key
    const [selectedLegend, setSelectedLegend] = React.useState(LegendDefault);
    const [selectedWildlife, setSelectedWildlife] = React.useState(WildlifeDefault);

    const [max, setMax] = useState(getMax(allData, selectedLegend, selectedWildlife, WildlifeOptions[0], Maxes, minDate, maxDate));


    const [DairyData, setDairyData] = useState(getDairyData(allData, minDate, maxDate));

    useEffect(() => {
        console.log('date range changed');
        setLoading(true);
        const [maxes, legendOptions, wildlifeOptions, dates, newData] = dataIngest(allData, minDate, maxDate);
        setAllData(newData);
        setMaxes(maxes);
        setLegendOptions(legendOptions);
        setWildlifeOptions(wildlifeOptions);
        setDates(dates);
        setMax(maxes[selectedLegend]);
        console.log('maxes', maxes);
        console.log('max', max);
    }, [minDate, maxDate]);

    useEffect(() => {
        console.log('alldata changed');
        setDairyData(getDairyData(allData, minDate, maxDate));
    }, [allData, minDate, maxDate]);

    // fg has elemnts that are in front of the map, and pinned to the corners with absolute positioning to accomodate iframe scaling

    if (allData == undefined || Object.keys(allData).length === 0) {
        return <div>
            <LoadingOverlay loading={true} />
        </div>;
    }
    return (
        <div className={styles.container}>
            <LoadingOverlay loading={loading} />
            <div className={styles.bg}>
                <Map setLoading={setLoading} selectedLegend={selectedLegend} selectedWildlife={selectedWildlife} allData={allData} color={keyColor} max={max} dairydata={DairyData} bRefOut={bRefOut} bRefIn={bRefIn} minDate={minDate} maxDate={maxDate} />
            </div>
            <Div100vh className={styles.fg}>
                <Title {...{ lastUpdated, showLastUpdated }} />
                <Key max={max} keyColor={selectedLegend == 'All Cases' ? keyColor : keyColor[selectedLegend]} keyType={selectedLegend == 'All Cases' ? keyType : keyType[selectedLegend]}
                    selected={selectedLegend == 'All Cases' ?  // if selectedLegend is 'All Cases' then show all the options
                        LegendOptions :
                        selectedLegend == 'Wildlife' ? // if we have selected wildlife, do more filtering
                            selectedWildlife == WildlifeOptions ? // if we have selected 'All Species' then show aggregated wildlife
                                'Wildlife' : // aggregated wildlife
                                selectedWildlife : // specific wildlife
                            selectedLegend} // just the normal legend 
                />
                <Selector setSelectedLegend={setSelectedLegend} selectedLegend={selectedLegend} setSelectedWildlife={setSelectedWildlife} selectedWildlife={selectedWildlife} LegendOptions={LegendOptions} WildlifeOptions={WildlifeOptions} Dates={Dates} bRefOut={bRefOut} bRefIn={bRefIn} setMinDate={setMinDate} setMaxDate={setMaxDate} earliestEntry={earliestEntry} />
            </Div100vh>
        </div >
    );
}; ``