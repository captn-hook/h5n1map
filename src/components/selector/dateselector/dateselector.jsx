import React, { useState } from 'react';

import styles from './dateselector.module.css';
import MultiRangeSlider from './multirangeslider';

export default function Dateselector(props) {

    const [minValue, setMinValue] = useState(new Date('2022-01-01').getTime());
    const [maxValue, setMaxValue] = useState(new Date().getTime());

    // onChange
    return (
        <div className={styles.bb + ' borderBox smallF'}>
            <MultiRangeSlider
                // disabled={true}
                ruler={false}
                min={new Date('2022-01-01').getTime()}
                max={new Date().getTime()}
                minValue={minValue}
                maxValue={maxValue}
                onChange={(e) => {
                    setMinValue(e.minValue);
                    setMaxValue(e.maxValue);
                    props.setMinDate(new Date(e.minValue));
                    props.setMaxDate(new Date(e.maxValue));
                }}
            ></MultiRangeSlider>
        </div>
    );
}