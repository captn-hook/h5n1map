import states from '../../../public/data/states.csv';
import styles from './map.module.css';


export function setTopIndex(element) {
    const stopElement = 'countiesOverlay';
    // we went to set this element to the top of the child stack, and recurse till stopElement
    if (element.id === stopElement) {
        return;
    }
    const parent = element.parentNode;
    // get the index of the element
    const index = Array.from(parent.children).indexOf(element);
    // remove the element from the parent
    parent.removeChild(element);
    // add the element back to the parent at the top
    parent.appendChild(element);
    // recurse
    setTopIndex(parent);
}

export function notNameLength(cData) { // this just grabs every entry in the cData object except for the name
    let keys = Object.keys(cData);
    keys = keys.filter((key) => key !== 'name');
    let len = 0;
    for (const key of keys) {
        len += cData[key].length;
    }
    return len;
}

export function pretty(cData) {
    let str = '';
    // converts the data to a pretty string
    // for every source in cData, not name
    const leng = notNameLength(cData);
    str += `${cData.name}, Cases: ${leng}\n`;
    let keys = Object.keys(cData);
    keys = keys.filter((key) => key !== 'name');
    for (const key of keys) {
        if (cData[key].length > 0) {
            str += `${key}: ${cData[key].length}\n`;
        }
    }
    str += '\n';
    str += cData.toString();
    return str;
}

export function hoverListenerConstructor(cData, setTooltip, parentRef, overlay, setS) {
    let pret = pretty(cData);
    return function (event) {
        const parent = parentRef.current;
        const parentRect = parent.getBoundingClientRect();
        setTopIndex(overlay);
        setTooltip({
            visible: true,
            name: pret,
            data: cData
        });
        //setS('');
    };
}

export function circleListenerConstructor(cData, setTooltip, setS) {
    let pret = pretty(cData);

    let state = '';

    if (cData['Human'].length == 1 && Object.keys(cData).length == 2) {
        let row = cData['Human'][0].split(',');
        let statename = getStateName(row[row.length - 2]);
        state = statename;
    }
    
    return function (event) {
        //console.log('circle listener: ', cData);
        setTooltip({
            visible: true,
            name: pret,
            data: cData
        });
        setS(state);
    };
}


export function addEventListenersToID(id, cData, setTooltip, parentRef, setPos, setS) {
    const element = document.getElementById(id);
    const overlay = document.getElementById(id.replace('c', 'b'));
    const pret = pretty(cData);
    if (element && overlay) {
        const hoverListener = hoverListenerConstructor(cData, setTooltip, parentRef, overlay, setS);
        overlay.addEventListener('mouseenter', hoverListener);
        overlay.addEventListener('mouseleave', () => setTooltip({ visible: false, name: '' }));
        overlay.addEventListener('click', () => {
            //console.log(`Clicked on ${cData.name}`);
            //console.log(pret);
            //console.log('source,state,county,species_or_flock_type,flock_size,hpai_strain,outbreak_date,date_detected,date_collected,date_confirmed,woah_classification,sampling_method,submitting_agency,event,date_occurred_low_end,date_occurred_high_end,cases,confirmed_cases,deaths,cuml_cases,cuml_confirmed_cases,cuml_deaths,latitude,longitude,id');
            //console.log(cData);
        });
        overlay.addEventListener('mousemove', (event) => {
            setPos({ x: event.clientX, y: event.clientY });
        });
    }
}

export function setFillsTo(fillFunction, allData, max, color) {
    const ccs = Object.keys(allData);
    for (const id of ccs) {
        const countyCode = `c${id}`;
        const overlayCode = `b${id}`;

        const datum = allData[id];

        if (document.getElementById(countyCode) && document.getElementById(overlayCode)) {
            const element = document.getElementById(countyCode);
            const overlay = document.getElementById(overlayCode);

            // set fill color based on number of cases
            if (notNameLength(datum) > 0) {

                element.setAttribute('fill', fillFunction(datum, max, color));
                element.setAttribute('stroke', fillFunction(datum, max, color));

                overlay.setAttribute('fill', fillFunction(datum, max, color));
                overlay.setAttribute('stroke', fillFunction(datum, max, color));

            } else {
                const fill = '#b3b3b3';
                element.setAttribute('fill', fill);
                element.setAttribute('stroke', fill);

                overlay.setAttribute('fill', fill);
                overlay.setAttribute('stroke', fill);
            }
        }
    }
}

export function mix1channel(rgb1, rgb2, ratio) {
    return rgb1 + (rgb2 - rgb1) * ratio;
}
export function whiteToColorGradient(value, color, max, min = 1, white = '#F8F9F9') {
    const ra = .3;
    const wr = Math.round(mix1channel(parseInt(white.slice(1, 3), 16), parseInt(color.slice(1, 3), 16), ra));
    const wg = Math.round(mix1channel(parseInt(white.slice(3, 5), 16), parseInt(color.slice(3, 5), 16), ra));
    const wb = Math.round(mix1channel(parseInt(white.slice(5, 7), 16), parseInt(color.slice(5, 7), 16), ra));
    const halfwhite = `#${wr.toString(16).padStart(2, '0')}${wg.toString(16).padStart(2, '0')}${wb.toString(16).padStart(2, '0')}`;

    const ratio = (value - min) / (max - min);

    const r = Math.round(mix1channel(parseInt(halfwhite.slice(1, 3), 16), parseInt(color.slice(1, 3), 16), ratio));
    const g = Math.round(mix1channel(parseInt(halfwhite.slice(3, 5), 16), parseInt(color.slice(3, 5), 16), ratio));
    const b = Math.round(mix1channel(parseInt(halfwhite.slice(5, 7), 16), parseInt(color.slice(5, 7), 16), ratio));

    //console.log('got', value, 'and returned', `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`);
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

export function allColoringC(dairyD, maxD) { // constructor for all coloring
    var newDairyD = {};
    var maxDairy = 0;

    for (let key of Object.keys(dairyD)) {
        if (dairyD[key] > maxDairy) {
            maxDairy = dairyD[key];
        }
        newDairyD[key] = -1;
    }

    stateFill(newDairyD, maxDairy);

    return function allColoring(datum, max, color) {
        let colors = [];
        let sources = [];
        for (const source of Object.keys(datum)) {
            if (source != 'name' && datum[source].length > 0) {
                sources.push(source);
                // we have one color for each source
                colors.push(color[source]);
            }
        }
        if (colors.length == 0) {
            return '#b3b3b3';
        } else if (colors.length == 1) {
            return colors[0];
        } else {
            let gradientName = `gradient${sources.join('').replace(/ /g, '')}`;
            return 'url(#repeat' + gradientName + ')';
        }
    }
}

export function countyColoringC(selectedLegend) { // constructor for county coloring
    return function countyColoring(datum, max, color) {
        if (datum[selectedLegend] === undefined) {
            return '#b3b3b3';
        } else if (datum[selectedLegend].length <= 0) {
            return '#b3b3b3';
        } else {
            return whiteToColorGradient(datum[selectedLegend].length, color, max);
        }
    }
}

export function stateFill(dairyD, maxD) {
    for (let key of Object.keys(dairyD)) {
        for (let stateI of states) {
            if (stateI.abbreviation == key) {
                let statename = stateI.state.replace(' ', '_');
                if (document.getElementById(statename)) {
                    for (let child of document.getElementById(statename).children) {
                        //console.log('filling', child.id, 'with value', dairyD[key], 'and max', maxD);
                        child.setAttribute('fill', whiteToColorGradient(dairyD[key], '#677143', maxD, 1, '#EFF3C7'));
                        child.setAttribute('stroke', whiteToColorGradient(dairyD[key], '#677143', maxD, 1, '#EFF3C7'));
                        // get the overlay by the id of the child
                        let overlay = document.getElementById(child.id.replace('c', 'b'));
                        overlay.setAttribute('fill', whiteToColorGradient(dairyD[key], '#677143', maxD, 1, '#EFF3C7'));
                        overlay.setAttribute('stroke', whiteToColorGradient(dairyD[key], '#677143', maxD, 1, '#EFF3C7'));
                    }
                }
            }
        }
    }
}

export function stateColoringC(dairyD, maxD) { // constructor for state coloring   

    stateFill(dairyD, maxD);

    return function stateColoring(datum, max, color) {
        for (const source of Object.keys(datum)) {
            if (source != 'name' && datum[source].length > 0) {
                let abbreve = datum[source][0].split(',')
                abbreve = abbreve[abbreve.length - 2];

                if (abbreve in dairyD) {
                    return whiteToColorGradient(dairyD[abbreve], '#677143', maxD + 1, 1, '#EFF3C7');
                } else {
                    return '#b3b3b3';
                }
            }
        }
    }
}

export function resetFix() {
    // resets all colorr of classname 'county' to #b3b3b3
    let container1 = document.getElementById('counties');
    let container2 = document.getElementById('countiesOverlay');

    function recurseUntilPath(element) {
        if (element.tagName == 'path') {
            element.setAttribute('fill', '#b3b3b3');
            element.setAttribute('stroke', '#b3b3b3');
        } else {
            for (let child of element.children) {
                recurseUntilPath(child);
            }
        }
    }

    for (let child of container1.children) {
        recurseUntilPath(child);
    }

    for (let child of container2.children) {
        recurseUntilPath(child);
    }
}

export function wildlifeColoringC(wildlife) { // constructor for wildlife coloring
    return function wildlifeColoring(datum, max, color) {
        if (datum['Wildlife'] === undefined) {
            return '#b3b3b3';
        } else if (datum['Wildlife'].length <= 0) {
            return '#b3b3b3';
        } else {
            if (wildlife == 'All Species') {
                return whiteToColorGradient(datum['Wildlife'].length, color, max);
            } else {
                let species_amount = 0;
                for (let species of datum['Wildlife']) {
                    species = species.split(',')[2].trim() + '';
                    if (species == wildlife) {
                        species_amount += 1;
                    }
                }

                if (species_amount > 0) {
                    if (species_amount == 1 && max == 1) {
                        return color;
                    } else {
                        return whiteToColorGradient(species_amount, color, max);
                    }
                } else {
                    return '#b3b3b3';
                }
            }
        }
    }
}

export function getStateCases(dada, dairyData) {
    // if (sl != 'Dairy Farms') {
    //     return 0;
    // }

    var stateAbbrev = null;
    for (let key of Object.keys(dada)) {
        // if this key has any elements in its list
        if (dada[key].length > 0) {
            // get the first element in the list
            let first = dada[key][0];
            // split the first element by commas
            let split = first.split(',');
            // get the state abbreviation
            stateAbbrev = split[split.length - 2];
            break;
        }
    }
    if (stateAbbrev == null) {
        return 0;
    }

    if (stateAbbrev in dairyData) {
        return dairyData[stateAbbrev];
    } else {
        return 0;
    }
}


export function getStateCasesFromName(name, dairyData) {
    var stateAbbrev = null;
    name = name.replace('_', ' ');
    // remove trailing whitespace
    name = name.trim();
    for (let stateI of states) {
        if (stateI.state == name) {
            stateAbbrev = stateI.abbreviation;
            break;
        }
    }
    if (stateAbbrev == null) {
        return [0, new Date(0)];
    } else {
        if (stateAbbrev in dairyData[0]) {
            return [dairyData[0][stateAbbrev], dairyData[1][stateAbbrev]];
        } else {
            return [0, new Date(0)];
        }
    }
}

export function addStateEventListeners(stateMouseEnter, stateMouseLeave, stateMouseMove) {
    for (let stateG of document.getElementById('countiesOverlay').children) {
        //stateG.classList.add(styles.disableChildPointerEvents);
        stateG.addEventListener('mouseenter', stateMouseEnter);
        stateG.addEventListener('mouseleave', stateMouseLeave);
        stateG.addEventListener('mousemove', stateMouseMove);
    }
}

export function removeStateEventListeners(stateMouseEnter, stateMouseLeave, stateMouseMove) {
    for (let stateG of document.getElementById('countiesOverlay').children) {
        //stateG.classList.remove(styles.disableChildPointerEvents);
        stateG.removeEventListener('mouseenter', stateMouseEnter);
        stateG.removeEventListener('mouseleave', stateMouseLeave);
        stateG.removeEventListener('mousemove', stateMouseMove);
    }
}

export function addOutlines(dairyData) {
    for (let key of Object.keys(dairyData)) {
        for (let stateI of states) {
            if (stateI.abbreviation == key) {
                let statename = stateI.state.replace(' ', '_');
                let element = document.getElementById("O_" + statename);
                if (element) {
                    element.classList.add(styles.outlineOpacity);
                    element.style.filter = 'url(#outline)';
                }
            }
        }
    }
}

export function removeOutlines(dairyData) {
    for (let key of Object.keys(dairyData)) {
        for (let stateI of states) {
            if (stateI.abbreviation == key) {
                let statename = stateI.state.replace(' ', '_');
                let element = document.getElementById("O_" + statename);
                if (element) {
                    element.classList.remove(styles.outlineOpacity);
                    element.style.filter = 'none';
                }
            }
        }
    }
}

export function allOutlineFix(dairyData, stateM) {
    for (let key of Object.keys(dairyData)) {
        let set = {};
        for (let stateI of states) {
            if (!(stateI.abbreviation in set) && stateI.abbreviation == key) {
                set[stateI.abbreviation] = 1;
                let statename = stateI.state.replace(' ', '_');
                let element = document.getElementById("O_" + statename);
                if (stateM.trim() == 'All') {
                    element.style.filter = 'url(#outline)';
                    element.classList.add(styles.outlineOpacity);
                } else if (stateM.trim() == '') {
                    element.style.filter = 'none';
                    element.classList.remove(styles.outlineOpacity);
                } else if (stateM.trim() != stateI.state.trim()) {
                    element.style.filter = 'none';
                    element.classList.remove(styles.outlineOpacity);
                } else if (stateM.trim() == stateI.state.trim()) {
                    element.style.filter = 'url(#outline)';
                    element.classList.add(styles.outlineOpacity);
                }
            }
        }
    }
}

export function tvis(tooltip, sel) {
    if (tooltip.data == null) {
        return false;
    } else {
        if (sel == "All Cases") {
            return true && tooltip.visible && sel != 'Dairy Farms';
        }
        if (tooltip.data[sel] == null || tooltip.data[sel].length == 0) {
            return false;
        } else {
            return true && tooltip.visible && sel != 'Dairy Farms'
        }
    }
}

export function svis(stooltip, tool, sel) {
    if (stooltip.data == undefined || stooltip.data[0] == 0) {
        return false;
    }
    let tvix = tvis(tool, sel);
    return stooltip.visible && (sel == 'Dairy Farms' || (!tvix && sel == 'All Cases'))
}

export function getStateName(abbr) {
    for (let state of states) {
        if (state.abbreviation == abbr) {
            return state.state;
        }
    }
    return '';
}