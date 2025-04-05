import styles from './tooltip.module.css';
import extractDate from '../utils/extractDate';
import { getStateName } from './mapHelpers';
function textD(info) {
    // if info isnt iterable, return null

    let name = '';
    let sourcd = {};
    let origins = {};
    let earliestDate = null;
    let latestDate = null;
    for (let source of Object.keys(info)) {
        if (source != 'name' && source.length > 0) {
            for (let line of info[source]) {
                let data = line.split(','); // source,county,species_or_flock_type,flock_size,hpai_strain,outbreak_date,date_detected,date_collected,date_confirmed,woah_classification,sampling_method,submitting_agency,event,date_occurred_low_end,date_occurred_high_end,cases,confirmed_cases,suspected_cases,probable_cases,deaths,confirmed_deaths,suspected_deaths,probable_deaths,cuml_cases,cuml_confirmed_cases,cuml_suspected_cases,cuml_probable_cases,cuml_deaths,cuml_confirmed_deaths,cuml_suspected_deaths,cuml_probable_deaths,latitude,longitude,abbreviation,id
                if (data[11] != undefined && data[11] != '') {
                    if (origins[data[11]] == undefined) {
                        origins[data[11]] = 1;
                    } else {
                        origins[data[11]] += 1;
                    }
                }
                if (name == '') {
                    name = info['name'] + ', ' + data[data.length - 2];
                }
                if (source == 'Human') {
                    sourcd[source] = data[data.length - 3];
                } else if (sourcd[source] == undefined) {
                    sourcd[source] = 1;
                } else if (source != 'Human') {
                    sourcd[source] += 1;
                }

                let eDate = extractDate(true, data);
                let lDate = extractDate(false, data);

                if (eDate == null && lDate == null) {
                    continue;
                }

                if (earliestDate == null || eDate < earliestDate) {
                    earliestDate = eDate;
                }
                if (latestDate == null || lDate > latestDate) {
                    latestDate = lDate;
                }
            }
        }

    }

    // name in bold,
    // list of source: count
    // earliest date - latest date 
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    const formattedEarliestDate = earliestDate.toLocaleDateString('en-US', options);
    const formattedLatestDate = latestDate.toLocaleDateString('en-US', options);

    return [name, sourcd, formattedEarliestDate, formattedLatestDate, origins];

}

function underlined(text) {
    // underline the text but not the spaces
    const underlinedElements = [];
    for (let i = 0; i < text.length; i++) {
        let char = text[i];
        // if there are any (), remove them and the text inside
        char = char.replace(/\(.*?\)/g, '');
        if (char !== ' ') {
            underlinedElements.push(<u key={i}>{char}</u>);
        } else {
            underlinedElements.push(' '); // Preserve spaces
        }
        if (i < text.length - 1 && char !== ' ') {
            underlinedElements.push(', '); // Add a comma and space after each character except the last
        }
    }
    return underlinedElements;
}

function renderTextComponent([name, sourcd, formattedEarliestDate, formattedLatestDate, origins], stateCases, selectedLegend) {

    // remove everything from sourced that is inot selectedLegend, unless selectedLegend is 'All Cases'
    if (selectedLegend != 'All Cases') {
        for (let source of Object.keys(sourcd)) {
            if (source != selectedLegend) {
                delete sourcd[source];
            }
        }
    }
    if (name[0] == ',' && name[1] == ' ') {
        name = getStateName(name.slice(2));
    }

    return (
        <div style={{ zIndex: 99999999999, whiteSpace: 'nowrap' }}>
            <h3>{name}</h3>
            <ul>
                {Object.keys(sourcd).map((source) => (
                    <li key={source}>{source}: <b>{sourcd[source]} Cases</b></li>
                ))}
                {stateCases > 0 && selectedLegend == 'All Cases' ? <li>{name.split(',')[1].trim()} Dairy: <b>{stateCases} Cases</b></li> : null}
            </ul>
            <p style={{ fontSize: '0.7em' }}>{formattedEarliestDate} - {formattedLatestDate}</p>
            {Object.keys(origins).length > 0 ? <p style={{ fontSize: '0.7em' }} className={styles.originText}><i>Source: {underlined(Object.keys(origins))}</i></p> : null}
        </div>
    );
}


export function Tooltip(props) {

    // get width and height for the tooltip
    const tooltipInfo = textD(props.info);
    let t1 = Object.keys(tooltipInfo[1]).length ? Object.keys(tooltipInfo[1]).length : 0;
    let t2 = tooltipInfo[2].length ? tooltipInfo[2].length : 0;
    let t3 = tooltipInfo[3].length ? tooltipInfo[3].length : 0;

    let heights = [110, 140, 250, 260, 300, 380, 440];
    let widthOnHeight = [180, 200, 210, 240, 280, 320, 360];

    let height = heights[t1];
    let width = widthOnHeight[t1];

    if (t2 + t3 > 28) {
        let over = (t2 + t3 - 28) * 10;
        width += over;
    }

    //     <svg xmlns="http://www.w3.org/2000/svg" viewBox={`0 0 278.9 140.52`} style={{ zIndex: 1, position: 'absolute', width: '100%', height: '100%' }}>
    //     <path
    //         d="M268.31,140.52H25.45a10.68,10.68,0,0,1-10.59-10.77v-51a5.06,5.06,0,0,0-2.4-4.32L1.65,67.81a3,3,0,0,1,0-5l10.92-6.95a5.06,5.06,0,0,0,2.33-4.27V11A10.68,10.68,0,0,1,25.45.25H268.31A10.68,10.68,0,0,1,278.9,11V129.75A10.68,10.68,0,0,1,268.31,140.52Z"
    //         fill="#F8F9F9" stroke="#0c0a10" strokeWidth="0.5" />
    // </svg>
    return (
        <div className={styles.tooltip} style={{ left: props.x + 'px', top: props.y + 'px', width: width + 'px', height: height + 'px' }}>

            <div className={styles.textContent} style={{ zIndex: 2, position: 'absolute', transform: 'translate(30px, -50%)' }}>
                {renderTextComponent(tooltipInfo, props.stateCases, props.selectedLegend)}
            </div>
            <div className={styles.svgArrow} >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 22.59">
                    <path d="M17.77,22.14l-16-8A3.29,3.29,0,0,1,1.71,9L17.77.44" fill="#F8F9F9" stroke="#0c0a10" stroke-miterlimit="10" />
                </svg>
            </div>
        </div>
    );
}

export function STooltip(props) {
    let width = 200;
    let height = 110;

    const options = { year: 'numeric', month: 'long', day: 'numeric' };

    if (props.tool.data[1][0] != null && props.tool.data[1][1] != null) {
        var formattedEarliestDate = props.tool.data[1][0].toLocaleDateString('en-US', options);
        var formattedLatestDate = props.tool.data[1][1].toLocaleDateString('en-US', options);
    } else {
        var formattedEarliestDate = 'N/A';
        var formattedLatestDate = 'N/A';
    }
    return (
        <div className={styles.tooltip} style={{ left: props.x + 'px', top: props.y + 'px', width: width + 'px', height: height + 'px' }}>
            <div className={styles.textContent} style={{ zIndex: 2, position: 'absolute', transform: 'translate(30px, -50%)' }}>
                <div style={{ zIndex: 99999999999, whiteSpace: 'nowrap' }}>
                    <h3>{props.tool.name.replace(/_/g, ' ')}</h3>
                    <ul>
                        <li>Dairy Farms: <b>{props.stateCases} Cases</b></li>
                    </ul>
                    <p style={{ fontSize: '0.7em' }}>{formattedEarliestDate} - {formattedLatestDate}</p>
                </div>
            </div>
            <div className={styles.svgArrow} >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 22.59">
                    <path d="M17.77,22.14l-16-8A3.29,3.29,0,0,1,1.71,9L17.77.44" fill="#F8F9F9" stroke="#0c0a10" stroke-miterlimit="10" />
                </svg>
            </div>
        </div>
    );
}