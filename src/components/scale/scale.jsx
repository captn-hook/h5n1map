import styles from './scale.module.css';

function mix1channel(rgb1, rgb2, ratio) {
    return rgb1 + (rgb2 - rgb1) * ratio;
}

export default function Scale( { color, max, stateCounty = 'county', white = '#FFFFFF', c='#FFFFFF'} ) {
    // half white half color
    const r = .3
    const wr = Math.round(mix1channel(parseInt(white.slice(1, 3), 16), parseInt(color.slice(1, 3), 16), r));
    const wg = Math.round(mix1channel(parseInt(white.slice(3, 5), 16), parseInt(color.slice(3, 5), 16), r));
    const wb = Math.round(mix1channel(parseInt(white.slice(5, 7), 16), parseInt(color.slice(5, 7), 16), r));
    const halfwhite = `#${wr.toString(16).padStart(2, '0')}${wg.toString(16).padStart(2, '0')}${wb.toString(16).padStart(2, '0')}`;
    
    return (
        <div className={styles.scaleKey + ' fontS'}>
            <h3>Number of positive cases by { stateCounty } </h3>
            <div className={styles.gradient} style={{ background: `linear-gradient(to right, ${white == c ? halfwhite : c} 5%, ${color}) 2%` }}></div>
            <h4 className={styles.min}>1</h4><h4 className={styles.max}>{max}</h4>            
        </div>
    );
}