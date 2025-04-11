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

export function notNameLength(cData) { // this just grabs every entry in the cData object except for the name and inactive
    let keys = Object.keys(cData);
    keys = keys.filter((key) => key !== 'name');
    let len = 0;
    for (const key of keys) {
        for (const entry of cData[key]) {
            if (!entry.includes('inictive')) {
                len += 1;
            }
        }
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
        str += `${key}: ${cData[key].length}\n`;
    }
    str += '\n';
    str += cData.toString();
    return str;
}

export function circleListenerConstructor(cData, setTooltip, setS) {
    let pret = pretty(cData);

    let state = '';


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


export function addEventListenersToID(id, cData, setTooltip, leaveListener, moveListener) {
    const element = document.getElementById(id);
    const overlay = document.getElementById(id.replace('c', 'b'));
    if (element && overlay) {
        const hoverListener = () => {
            setTopIndex(overlay);
            setTooltip({
                visible: true,
                name: pretty(cData),
                data: cData
            });
        }

        overlay.addEventListener('mouseenter', hoverListener);
        overlay.addEventListener('mouseleave', leaveListener);
        overlay.addEventListener('mousemove', moveListener);

        return hoverListener;
    }
}

export function setFillsTo(fillFunction, allData, max, color, steet = undefined) {
    const ccs = Object.keys(allData);
    for (const id of ccs) {
        const countyCode = `c${id}`;
        const overlayCode = `b${id}`;

        const datum = allData[id];

        const element = document.getElementById(countyCode)
        const overlay = document.getElementById(overlayCode)

        if (!datum) {
            console.error(`No data found for ${countyCode}`);
            continue;
        }

        if (element && overlay) {

            // set fill color based on number of cases
            //console.log('setting fill for', id, 'it is', active[id]);
            if (notNameLength(datum) > 0 || color == '#7F8FFF') {

                element.setAttribute('fill', fillFunction(datum, max, color));
                element.setAttribute('stroke', fillFunction(datum, max, color));

                overlay.setAttribute('fill', fillFunction(datum, max, color));
                overlay.setAttribute('stroke', fillFunction(datum, max, color));

            } else {

                let fill = '#b3b3b3';

                if (steet && steet.includes(element.parentNode.id)) {
                    fill = '#7F8FFF';
                }

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
    if (value >= max) {
        return color;
    }
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
    let str = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    return str;
}

export function whiteToColorLogGradient(value, color, max, min = 1, white = '#F8F9F9') {
    if (value <= 0 || min <= 0 || max <= 0) {
        if (value <= 0) {
            return '#b3b3b3';
        }
        if (min <= 0) {
            min = 1;
        }
        if (max <= 0) {
            max = 1;
        }
    }

    const ra = 0.3;
    const wr = Math.round(mix1channel(parseInt(white.slice(1, 3), 16), parseInt(color.slice(1, 3), 16), ra));
    const wg = Math.round(mix1channel(parseInt(white.slice(3, 5), 16), parseInt(color.slice(3, 5), 16), ra));
    const wb = Math.round(mix1channel(parseInt(white.slice(5, 7), 16), parseInt(color.slice(5, 7), 16), ra));
    const halfwhite = `#${wr.toString(16).padStart(2, '0')}${wg.toString(16).padStart(2, '0')}${wb.toString(16).padStart(2, '0')}`;

    const ratio = (Math.log(value) - Math.log(min)) / (Math.log(max) - Math.log(min));

    const r = Math.round(mix1channel(parseInt(halfwhite.slice(1, 3), 16), parseInt(color.slice(1, 3), 16), ratio));
    const g = Math.round(mix1channel(parseInt(halfwhite.slice(3, 5), 16), parseInt(color.slice(3, 5), 16), ratio));
    const b = Math.round(mix1channel(parseInt(halfwhite.slice(5, 7), 16), parseInt(color.slice(5, 7), 16), ratio));

    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

export function allColoringC() { // constructor for all coloring
    return function allColoring(datum, max, color) {
        let colors = [];
        let sources = [];
        for (const source of Object.keys(datum)) {
            let active = false;
            for (const entry of datum[source]) {
                if (!entry.includes('inictive')) {
                    active = true;
                    break;
                }
            }
            if (active && source != 'name' && datum[source].length > 0) {
                sources.push(source);
                // we have one color for each source
                colors.push(color[source]);
            }
        }
        sources = sources.sort();
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
            let allInactive = true;
            for (let entry of datum[selectedLegend]) {
                if (!entry.includes('inictive')) {
                    allInactive = false;
                    break;
                }
            }
            if (allInactive) {
                return '#b3b3b3';
            } else {
                return whiteToColorGradient(datum[selectedLegend].length, color, max);
            }
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
                        child.setAttribute('fill', whiteToColorLogGradient(dairyD[key], '#142CA1', maxD, 1, '#ABB9FF'));
                        child.setAttribute('stroke', whiteToColorLogGradient(dairyD[key], '#142CA1', maxD, 1, '#ABB9FF'));
                        // get the overlay by the id of the child
                        let overlay = document.getElementById(child.id.replace('c', 'b'));
                        overlay.setAttribute('fill', whiteToColorLogGradient(dairyD[key], '#142CA1', maxD, 1, '#ABB9FF'));
                        overlay.setAttribute('stroke', whiteToColorLogGradient(dairyD[key], '#142CA1', maxD, 1, '#ABB9FF'));
                    }
                }
            }
        }
    }
}

export function stateForce(dairyD, maxD) { // like stateFill but does it all to the max value
    var newDairyD = {};
    var maxDairy = 0;

    for (let key of Object.keys(dairyD)) {
        if (dairyD[key] > maxDairy) {
            maxDairy = dairyD[key];
        }
        newDairyD[key] = -1;
    }
    let res = [];
    for (let key of Object.keys(newDairyD)) {
        for (let stateI of states) {
            if (stateI.abbreviation == key) {
                let statename = stateI.state.replace(' ', '_');
                res.push(statename);
                if (document.getElementById(statename)) {
                    for (let child of document.getElementById(statename).children) {
                        child.setAttribute('fill', '#7F8FFF');
                        child.setAttribute('stroke', '#7F8FFF');
                        // get the overlay by the id of the child
                        let overlay = document.getElementById(child.id.replace('c', 'b'));
                        overlay.setAttribute('fill', '#7F8FFF');
                        overlay.setAttribute('stroke', '#7F8FFF');
                    }
                }
            }
        }
    }


    return res;
}

export function stateColoringC(dairyD, maxD) { // constructor for state coloring   
    stateFill(dairyD, maxD);

    return function stateColoring(datum, max, color) {
        for (const source of Object.keys(datum)) {
            if (source != 'name' && datum[source].length > 0) {
                let abbreve = datum[source][0].split(',')
                abbreve = abbreve[15];

                if (Object.keys(dairyD).includes(abbreve)) {
                    return whiteToColorLogGradient(dairyD[abbreve], '#142CA1', maxD + 1, 1, '#ABB9FF');
                } else {
                    return '#b3b3b3';
                }
            }
        }
    }
}

export function resetFix(listeners, moveListener, leaveListener) { // resets all event listeners to the default
    // resets all colorr of classname 'county' to #b3b3b3
    let container1 = document.getElementById('counties');
    let container2 = document.getElementById('countiesOverlay');

    function recurseUntilPath(element) {
        // remove event listeners 
        if (listeners[element.id.replace('c', '').replace('b', '')]) {
            element.removeEventListener('mouseenter', listeners[element.id]);
        }
        element.removeEventListener('mouseleave', moveListener);
        element.removeEventListener('mousemove', leaveListener);


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
            stateAbbrev = split[15];
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

export function removeOutlines() {
    for (let key of Object.keys(states)) {
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
    for (let stateI of states) {
        if (Object.keys(dairyData).includes(stateI.abbreviation)) {
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
        } else {
            let statename = stateI.state.replace(' ', '_');
            let element = document.getElementById("O_" + statename);
            if (element) {
                element.style.filter = 'none';
                element.classList.remove(styles.outlineOpacity);
            }
        }
    }
}

export function tvis(tooltip, sel) {
    if (tooltip.data == null) {
        return false;
    } else {
        // if all inictive, tooltip is not visible
        let inictive = true;
        for (let source of Object.keys(tooltip.data)) {
            if (source != 'name' && tooltip.data[source].length > 0) {
                for (let entry of tooltip.data[source]) {
                    if (!entry.includes('inictive')) {
                        inictive = false;
                        break;
                    }
                }
            }
        }
        tooltip.visible = !inictive;

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