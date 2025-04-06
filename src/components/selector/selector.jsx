import styles from './selector.module.css';

import Subselector from './subselector/subselector.jsx';

import React, { useState, useEffect } from 'react';

const icons = {
    'All Cases': (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 27.18 27.18" className={styles.iconContainer}>

            <path
                d="M19.92,13.48a5.42,5.42,0,0,0,2.62,1.07,9.67,9.67,0,0,0,2.82-.31.83.83,0,0,1,.79.25,2.51,2.51,0,0,1,.53,1.73A2.2,2.2,0,0,1,25.85,18a.85.85,0,0,1-1.08,0,6.43,6.43,0,0,0-2.47-1.23,7.16,7.16,0,0,0-3-.25"
                fill="none" />
            <path
                d="M18.32,6.46a8.88,8.88,0,0,1,2.21,2.07,3.58,3.58,0,0,0,.65-.37A7.92,7.92,0,0,0,22.8,6.49a.67.67,0,0,1,.63-.25,2,2,0,0,1,1.25.81,1.82,1.82,0,0,1,.4,1.58.69.69,0,0,1-.69.56,5,5,0,0,0-2.21.5c-.26.13-.53.3-.74.42a9,9,0,0,1,.74,3.45,8.44,8.44,0,0,1,0,.87"
                fill="none" />
            <path
                d="M13.48,7.26a5.36,5.36,0,0,0,1.07-2.62,9.67,9.67,0,0,0-.31-2.82A.82.82,0,0,1,14.49,1,2.5,2.5,0,0,1,16.22.5,2.18,2.18,0,0,1,18,1.34a.85.85,0,0,1,0,1.08,6.35,6.35,0,0,0-1.23,2.47,7.12,7.12,0,0,0-.25,3"
                fill="none" />
            <path
                d="M6.46,8.86A9.06,9.06,0,0,1,8.53,6.65,3.51,3.51,0,0,0,8.16,6,7.92,7.92,0,0,0,6.49,4.39a.69.69,0,0,1-.25-.64,2.06,2.06,0,0,1,.81-1.24A1.8,1.8,0,0,1,8.63,2.1a.71.71,0,0,1,.56.69A5.07,5.07,0,0,0,9.69,5c.13.26.3.53.42.73A9,9,0,0,1,13.56,5a8.46,8.46,0,0,1,.87,0"
                fill="none" />
            <path
                d="M7.26,13.71a5.32,5.32,0,0,0-2.62-1.08A9.62,9.62,0,0,0,1.82,13,.85.85,0,0,1,1,12.69,2.47,2.47,0,0,1,.5,11a2.18,2.18,0,0,1,.84-1.8.86.86,0,0,1,1.08,0,6.34,6.34,0,0,0,2.47,1.24,7,7,0,0,0,3,.24"
                fill="none" />
            <path
                d="M8.86,20.73a9.1,9.1,0,0,1-2.21-2.08A5.26,5.26,0,0,0,6,19,7.93,7.93,0,0,0,4.39,20.7a.74.74,0,0,1-.64.25,2.09,2.09,0,0,1-1.24-.82,1.79,1.79,0,0,1-.41-1.57A.71.71,0,0,1,2.79,18,5.27,5.27,0,0,0,5,17.49a7.89,7.89,0,0,0,.73-.42A9,9,0,0,1,5,13.62a8.11,8.11,0,0,1,0-.86"
                fill="none" />
            <path
                d="M13.71,19.92a5.38,5.38,0,0,0-1.08,2.62A9.62,9.62,0,0,0,13,25.36a.86.86,0,0,1-.26.79,2.48,2.48,0,0,1-1.72.53,2.21,2.21,0,0,1-1.8-.83.86.86,0,0,1,0-1.08,6.42,6.42,0,0,0,1.24-2.47,7,7,0,0,0,.24-3"
                fill="none" />
            <path
                d="M20.73,18.32a8.92,8.92,0,0,1-2.08,2.21,5.37,5.37,0,0,0,.37.65A7.93,7.93,0,0,0,20.7,22.8a.72.72,0,0,1,.25.63,2.07,2.07,0,0,1-.82,1.25,1.81,1.81,0,0,1-1.57.4.69.69,0,0,1-.56-.69,5.23,5.23,0,0,0-.51-2.21c-.12-.26-.3-.53-.42-.74a9,9,0,0,1-3.45.74,8.12,8.12,0,0,1-.86,0"
                fill="none" />
            <path d="M15,13.55a1.44,1.44,0,1,1-1.44-1.44" fill="none" />
            <path d="M19,11.06a1.43,1.43,0,1,1-1.43-1.43" fill="none" />
            <path d="M12.78,9.2a1.44,1.44,0,1,1-1.43-1.44" fill="none" />
            <path d="M17.52,17.86a1.44,1.44,0,1,1-1.43-1.43" fill="none" />
            <path d="M11,16.3a1.44,1.44,0,1,1-1.43-1.44" fill="none" />
        </svg>
    ),
    'Dairy Farms': (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32.9 24.66" className={styles.iconContainer}>
            <path
                d="M12.25,2.77H26.37a3.73,3.73,0,0,1,3.74,3.74V24.16h-2.5V15.53A1.49,1.49,0,0,0,26.12,14H16a1.49,1.49,0,0,0-1.49,1.49v8.63H12V15.29l-.13-.06a9,9,0,0,1-4-4.12"
                fill="none" />
            <path
                d="M5.26,8.08,4.69,5.23a2.71,2.71,0,0,1-.46-1.5A3.13,3.13,0,0,1,7.5.76a3.14,3.14,0,0,1,3.28,3,2.79,2.79,0,0,1-.46,1.5L9.76,8.11"
                fill="none" />
            <rect x="4.97" y="7.98" width="5.06" height="3.07" rx="0.88"
                transform="translate(15.01 19.03) rotate(-180)" fill="none" />
            <path
                d="M.74.92A.5.5,0,0,0,.5,1.2c-.07.48,1.16,1.48,2.32,1.72A2,2,0,0,0,4.27,2.7a.89.89,0,0,0,.38-.58c.1-.65-.6-1.36-1.52-1.56A3.66,3.66,0,0,0,2.45.5,3.27,3.27,0,0,0,.74.92Z"
                fill="none" />
            <path
                d="M12.69.5A3.66,3.66,0,0,0,12,.56c-.93.2-1.63.91-1.53,1.56a.94.94,0,0,0,.39.58,1.94,1.94,0,0,0,1.45.22c1.16-.24,2.39-1.24,2.31-1.72A.45.45,0,0,0,14.4.92,3.27,3.27,0,0,0,12.69.5Z"
                fill="none" />
            <path d="M21.69,14.07a3.19,3.19,0,0,0,5.9,1.68" fill="none" />
            <path d="M30.11,6.51h1.3a1,1,0,0,1,1,1V14" fill="none" stroke="#000"
                strokeMiterlimit="10" />
        </svg>
    ),
    'Poultry Farms': (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 26.15 26.44" className={styles.iconContainer}>
            <path d="M2.9,12.55V3.37h0A8.62,8.62,0,0,1,11.67,12v.18a.4.4,0,0,0,.4.41h3.45"
                fill="none" />
            <path d="M20.45,12.59a8.78,8.78,0,1,1-17.55,0" fill="none" />
            <path d="M17.21,12.59A7.16,7.16,0,1,1,2.9,12.5" fill="none" />
            <path d="M17.21,12.59a8.9,8.9,0,0,1,8.94-8.87" fill="none" />
            <path d="M20.45,12.59A5.54,5.54,0,0,1,26,7.08" fill="none" />
            <polyline points="9.98 21.13 9.98 25.94 8.16 25.94" fill="none" />
            <polyline points="13.17 21.13 13.17 25.94 11.36 25.94" fill="none" />
            <path d="M2.39,4.45A1.89,1.89,0,0,0,.5,6.34h2" fill="none" />
            <path d="M2.88,10.36a2,2,0,0,1,0-4.06" />
            <path d="M5.85,1.48A.45.45,0,0,0,5.72.77,2,2,0,0,0,3.14,3.69a.46.46,0,0,0,.72,0Z" />
            <path d="M3.71.47A.46.46,0,0,0,3.15,0a2,2,0,0,0-.07,3.9.45.45,0,0,0,.57-.43Z" />
            <path
                d="M1.37,1a.46.46,0,0,0-.72.06A2.06,2.06,0,0,0,.92,3.5a2,2,0,0,0,2.4.41.45.45,0,0,0,.11-.71Z" />
        </svg>
    ),
    'Human': (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 21.89 25.97" className={styles.iconContainer}>
            <circle cx="10.95" cy="7.08" r="6.58" fill="none" />
            <path d="M.5,26a10.45,10.45,0,1,1,20.89,0" fill="none" />
        </svg>
    ),
    'Wild Birds': (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 29.81 25.84">
            <path
                d="M29.46,25.49,10.82,6.85A4.51,4.51,0,0,1,9.5,3.66h0A3.16,3.16,0,0,0,6.34.5h0A3.16,3.16,0,0,0,3.18,3.66v6a9.26,9.26,0,0,0,9.26,9.26h1.44a1.2,1.2,0,0,1,1.2,1.2v5.44"
                fill="none" />
            <path d="M22.17,17.7a9.59,9.59,0,0,1-3,.47,9.46,9.46,0,0,1-9-12.28" fill="none"
            />
            <line x1="12.26" y1="18.92" x2="12.26" y2="25.52" fill="none" />
            <line y1="4.05" x2="3.03" y2="4.05" fill="none" />
        </svg>
    ),
    'Wildlife': (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30.4 24.67" className={styles.iconContainer}>
            <path d="M19,5.86a2.85,2.85,0,0,1-1.37.22,2.8,2.8,0,1,1,3-2.53" fill="none"
            />
            <path d="M15.79,20a5.51,5.51,0,0,0,1.9-4.16" fill="none" />
            <path d="M7.9,10.29a6.48,6.48,0,0,0-1.06.9,6.28,6.28,0,0,0,4.57,10.59" fill="none"
            />
            <line x1="15.89" y1="5.71" x2="7.9" y2="10.29" fill="none" />
            <path
                d="M17.62,12.3c.31,2.3,1.83,3.78,3.46,3.78h2.3l.26.28a.87.87,0,0,0,1.22.14.88.88,0,0,0-.06-1.23l-.46-.45a1.6,1.6,0,0,0-1.14-.46h-.53c-1.28,0-2.32-1.5-2.32-3.35A4.19,4.19,0,0,1,21.5,8.09h.57c3,0,7.83-2.45,7.83-5.48h0a.55.55,0,0,0-.56-.55H20.39"
                fill="none" />
            <path
                d="M21,13.2h3.23l.27.28a.87.87,0,0,0,1.22.14.86.86,0,0,0-.07-1.22L25.22,12a1.61,1.61,0,0,0-1.14-.47h-.53c-1.28,0-2.93-.16-2.93-2"
                fill="none" />
            <path d="M6.93,20H2.59A2.1,2.1,0,0,0,.5,22.07h0a2.1,2.1,0,0,0,2.09,2.1H13.9" fill="none"
            />
            <path d="M11.41,21.78h7.14a1.71,1.71,0,0,0-1.72-1.71H14.09" fill="none" />
        </svg>
    ),
    'Date': (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="10 10 49.39 39.73" className={styles.dateIcon} style={{ marginTop: 'auto', marginBottom: 'auto' }}>
            <rect x="16.54" y="17.24" width="35.74" height="25.28" rx="3.78" fill="none" stroke="#000" strokeMiterlimit="10" />
            <line x1="16.39" y1="22.15" x2="52.07" y2="22.15" fill="none" stroke="#000" strokeMiterlimit="10" />
            <line x1="23.63" y1="20.24" x2="23.63" y2="14.53" fill="none" stroke="#000" strokeMiterlimit="10" />
            <line x1="34.42" y1="20.24" x2="34.42" y2="14.53" fill="none" stroke="#000" strokeMiterlimit="10" />
            <line x1="45.21" y1="20.24" x2="45.21" y2="14.53" fill="none" stroke="#000" strokeMiterlimit="10" />
            <rect x="19.6" y="25.74" width="4.31" height="4.31" rx="1.23" fill="none" stroke="#000" strokeMiterlimit="10" />
            <rect x="27.86" y="25.74" width="4.31" height="4.31" rx="1.23" fill="none" stroke="#000" strokeMiterlimit="10" />
            <rect x="36.12" y="25.74" width="4.31" height="4.31" rx="1.23" fill="none" stroke="#000" strokeMiterlimit="10" />
            <rect x="44.38" y="25.74" width="4.31" height="4.31" rx="1.23" fill="none" stroke="#000" strokeMiterlimit="10" />
            <rect x="19.6" y="33.64" width="4.31" height="4.31" rx="1.23" fill="none" stroke="#000" strokeMiterlimit="10" />
            <rect x="27.86" y="33.64" width="4.31" height="4.31" rx="1.23" fill="none" stroke="#000" strokeMiterlimit="10" />
            <rect x="36.12" y="33.64" width="4.31" height="4.31" rx="1.23" fill="none" stroke="#000" strokeMiterlimit="10" />
            <rect x="44.38" y="33.64" width="4.31" height="4.31" rx="1.23" fill="none" stroke="#000" strokeMiterlimit="10" />
        </svg>
    ),
};

export default function Selector(props) {
    // console.log('Selector:');
    // console.log(props);
    const [dateSelector, setDateSelector] = useState(false);

    useEffect(() => {
        if (dateSelector) {
            props.setMinDate(new Date('2025-03-01'));
        } else {
            props.setMinDate(props.earliestEntry);
        }
    }, [dateSelector]);
    // remove all cases from the legend options
    // and put in its own ul
    const LegendOptions = props.LegendOptions.filter(option => option !== 'All Cases');

    const options = { day: 'numeric', month: 'numeric'};
    return (
        <div className={styles.selectorContainer}>
            <ul className={styles.selector + ' borderBox fontS' + ' ' + styles.allCasesC}>
                <li key={0}
                    onClick={() => props.setSelectedLegend('All Cases')}
                    className={(props.selectedLegend === 'All Cases' ? styles.active : styles.inactive) + ' ' + styles.allCases}>
                    {icons['All Cases']}
                    <h3>{'All Cases'.replace(/ /g, '\n').toUpperCase()}</h3>
                </li>
            </ul>
            <span className={styles.seperator}>Filters</span>
            <ul className={styles.selector + ' borderBox fontS' + ' ' + styles.legendOptions + ' ' + styles.s1}>
                {LegendOptions.map((option, index) => {
                    return (
                        <li key={index}
                            onClick={() => props.setSelectedLegend(option)}
                            className={option === props.selectedLegend ? styles.active : styles.inactive}>
                            {icons[option]}
                            <h3>{option.replace(/ /g, '\n').toUpperCase()}</h3>
                            <h4>{props.Dates[option] ? 'as of ' + props.Dates[option].toLocaleDateString('en-US', options) : null}</h4>
                            {option === 'Wildlife' && props.selectedLegend === 'Wildlife' ?
                                <Subselector
                                    selected={props.selectedWildlife}
                                    setSelected={props.setSelectedWildlife}
                                    options={props.WildlifeOptions}
                                /> : null}
                        </li>
                    );
                })}
            </ul>
            <ul className={styles.selector + ' borderBox fontS ' + styles.s2}>
                <li key={0}
                    onClick={() => setDateSelector(!dateSelector)}
                    className={(dateSelector ? styles.active : styles.inactive ) + ' ' + styles.allCases + ' ' + styles.dateIconC}>
                    {icons['Date']}
                </li>
            </ul>
            <div id="zoomButtons" className={styles.zoomButtons}>
                <button ref={props.bRefIn} className={'borderBox'}>+</button>
                <button ref={props.bRefOut} className={'borderBox'}><div className={styles.textUp}>-</div></button>
            </div>
        </div>
    );
}