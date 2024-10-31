import styles from './title.module.css';

export default function Title( {lastUpdated, showLastUpdated} ) {
    return (
        <div className={styles.title + ' borderBox dynaPad fontL'}>
            <h1>Cross-Species</h1>
            <h1>H5N1 US Tracker</h1>
            <div className={styles.divider}></div>
            <h3 className={'fontS'}>{'Data represents public feeds from USDA APHIS, US CDC,\nand state departments of health in California,\nColorado, Michigan, Missouri, Texas, and Washington.'}</h3>
            {showLastUpdated && <h5 className={'fontS'}>{'Last updated: ' + lastUpdated}</h5>}
        </div>
    );
}