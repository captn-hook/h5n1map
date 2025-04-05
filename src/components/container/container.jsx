'use client';

import React, { useRef, useState } from 'react';

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
    if (allData[''] === undefined) {
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
            if (date > dairyDates[abbrev][1] ) {
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



function dataIngest(data) {
    // allData json structure:
    // allData['countyID'] = { 'source': ['row1', 'row2', ...], 'name': 'countyName' }
    // maxMins = [[maxPoultry, 0], [maxWildBirds, 0], [maxWildlife, 0]]
    // maxes = { 'Dairy Farms': maxDairy, 'Poultry Farms': maxPoultry, 'Wild Birds': maxWildBirds, 'Human': maxHuman, 'All Cases': maxAll, 'All Species': maxAllSpecies, 'Otter': maxOtter}
    // dates = { 'Dairy Farms': mostRecentDate, 'Poultry Farms': mostRecentDate, 'Wild Birds': mostRecentDate, 'Human': mostRecentDate, 'All Cases': mostRecentDate, 'All Species': mostRecentDate }
    let maxes = {};
    let dates = {};
    let legendOptions = [LegendDefault];
    let wildlifeOptions = [WildlifeDefault];

    if (Object.keys(data).length === 0) {
        return [maxes, legendOptions, wildlifeOptions, dates];
    }
    var earliestDate = new Date(0); // earliest date for all data
    for (var entry in data) {
        var countyData = undefined;

        if (entry == '') {
            continue;
        } else {
            countyData = data[entry];
        }

        // print the date
        
        const date = extractDate(true, line.split(','));
        if (date < earliestDate) {
            earliestDate = date;
            console.log('earliest date: ' + earliestDate);
        }


        // base case
        if (Object.keys(maxes).length === 0) {
            for (const source of Object.keys(countyData)) {
                if (source != 'name') {
                    maxes[source] = 0;
                    legendOptions.push(source);
                    dates[source] = new Date(0);
                }
            }
            maxes['All Cases'] = 0;
            maxes['All Species'] = 0;
            dates['All Cases'] = new Date(0);
        }

        var allmax = 0;
        var alldate = new Date(0);
        for (const source of Object.keys(countyData)) {
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
                    const date = extractDate(true, line.split(','));
                    if (date > dates[source]) {
                        dates[source] = date;
                    }
                }
            }
        }
    }

    return [maxes, legendOptions, wildlifeOptions, dates];
}


export default function Container({ allData, lastUpdated, showLastUpdated }) {
    // map container has the controls and the key for the map
     
    if (Object.keys(allData).length === 0) {
        return <div>
            <LoadingOverlay loading={true} />
        </div>;
    }
    const bRefOut = useRef(null);
    const bRefIn = useRef(null);

    // Min and max dates for the data
    const minDate = useState(new Date(0));
    const maxDate = useState(new Date(0));

    // data ingest takes some time so show a loading overlay
    const [loading, setLoading] = React.useState(true);
    
    var [Maxes, LegendOptions, WildlifeOptions, Dates] = dataIngest(allData, minDate, maxDate);
    // default selected values, can be selected via key
    const [selectedLegend, setSelectedLegend] = React.useState(LegendOptions[0]);
    const [selectedWildlife, setSelectedWildlife] = React.useState(WildlifeOptions[0]);

    let max = getMax(allData, selectedLegend, selectedWildlife, WildlifeOptions, Maxes); // the max value for the current selected item

    useEffect(() => {
        var [maxes, legendOptions, wildlifeOptions, dates] = dataIngest(allData, minDate, maxDate);
        setMax(maxes);
        setLegendOptions(legendOptions);
        setWildlifeOptions(wildlifeOptions);
        setDates(dates);
        setLoading(false);
    }, [minDate, maxDate, allData]);


    // fg has elemnts that are in front of the map, and pinned to the corners with absolute positioning to accomodate iframe scaling
    return (
        <div className={styles.container}>
            <LoadingOverlay loading={loading} />
            <div className={styles.bg}>
                <Map setLoading={setLoading} selectedLegend={selectedLegend} selectedWildlife={selectedWildlife} allData={allData} color={selectedLegend == 'All Cases' ? keyColor : keyColor[selectedLegend]} max={max} dairydata={getDairyData(allData)} bRefOut={bRefOut} bRefIn={bRefIn} />
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
                <Selector setSelectedLegend={setSelectedLegend} selectedLegend={selectedLegend} setSelectedWildlife={setSelectedWildlife} selectedWildlife={selectedWildlife} LegendOptions={LegendOptions} WildlifeOptions={WildlifeOptions} Dates={Dates} bRefOut={bRefOut} bRefIn={bRefIn} />
            </Div100vh>
        </div >
    );
};``