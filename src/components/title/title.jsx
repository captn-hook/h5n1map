import styles from './title.module.css';

export default function Title( {lastUpdated, showLastUpdated} ) {
    return (
        <div className={styles.title + ' dynaPad fontL'}>
            {showLastUpdated && <h5 className={'fontS'}>{'LAST UPDATED: ' + lastUpdated}</h5>}
        </div>
    );
}