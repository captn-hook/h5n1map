import React, { forwardRef, useEffect, useRef, useState } from 'react';
import styles from './multirangeslider.module.css';

let _wheelTimeout = null;
let _triggerTimeout = null;

function getDateString(value) {
    let options = {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit',
    }
    let date = new Date(parseInt(value));
    let dateString = date.toLocaleDateString('en-US', options);
    return dateString;
}



const MultiRangeSlider = (props, ref) => {
    let ruler = props.ruler === undefined || props.ruler === null ? true : props.ruler;
    let label = props.label === undefined || props.label === null ? true : props.label;
    let subSteps = props.subSteps === undefined || props.subSteps === null ? false : props.subSteps;
    let stepOnly = props.stepOnly === undefined || props.stepOnly === null ? false : props.stepOnly;
    let preventWheel = props.preventWheel === undefined || props.preventWheel === null ? false : props.preventWheel;
    let refBar = useRef(null);
    let min = +(props.min || 0);
    let max = +(props.max || 100);
    let step = Math.abs(+(props.step || 5));
    let fixed = 0;
    let disabled = !!props.disabled;
    let stepValue = props.canMinMaxValueSame ? 0 : step;

    let stepCount = Math.floor((+max - +min) / +step);
    let labels = props.labels || [];
    if (labels.length === 0) {
        labels = [];
        labels.push(min.toString());
        labels.push(max.toString());
    } else {
        stepCount = labels.length - 1;
    }

    if (typeof label === 'string') {
        label = label === 'true';
    }
    if (typeof ruler === 'string') {
        ruler = ruler === 'true';
    }
    if (typeof preventWheel === 'string') {
        preventWheel = preventWheel === 'true';
    }
    if (step.toString().includes('.')) {
        fixed = 2;
    }
    let _minValue = props.minValue;
    if (_minValue === null || _minValue === undefined) {
        _minValue = 25;
    }
    _minValue = +_minValue;
    let _maxValue = props.maxValue;
    if (_maxValue === null || _maxValue === undefined) {
        _maxValue = 75;
    }
    _maxValue = +_maxValue;

    if (_minValue < min) {
        _minValue = min;
    }
    if (_minValue > max) {
        _minValue = max;
    }
    if (_maxValue < _minValue) {
        _maxValue = +_minValue + +step;
    }
    if (_maxValue > max) {
        _maxValue = max;
    }
    if (_maxValue < min) {
        _maxValue = min;
    }

    const [minValue, set_minValue] = useState(+_minValue);
    const [maxValue, set_maxValue] = useState(+_maxValue);
    const [barMin, set_barMin] = useState(((minValue - min) / (max - min)) * 100);
    const [barMax, set_barMax] = useState(((max - maxValue) / (max - min)) * 100);
    const [minCaption, setMinCaption] = useState('');
    const [maxCaption, setMaxCaption] = useState('');
    const [isChange, setIsChange] = useState(true);

    const onBarLeftClick = (e) => {
        console.log('onBarLeftClick', e);
        if (disabled) return;
        let _minValue = minValue - step;
        if (_minValue < min) {
            _minValue = min;
        }
        set_minValue(_minValue);
    };
    const onInputMinChange = (e) => {
        if (disabled) return;
        let _minValue = parseFloat(e.target.value);
        if (_minValue > maxValue - stepValue) {
            _minValue = maxValue - stepValue;
        }
        set_minValue(_minValue);
        setIsChange(true);
    };
    const onLeftThumbMousedown = (e) => {
        if (disabled) return;
        let startX = e.clientX;
        let thumb = e.target;
        let bar = thumb.parentNode;
        let barBox = bar.getBoundingClientRect();
        let barValue = minValue;
        setIsChange(false);
        let onLeftThumbMousemove = (e) => {
            let clientX = e.clientX;
            let dx = clientX - startX;
            let per = dx / barBox.width / 30;
            let val = barValue + (max - min) * per;
            if (stepOnly) {
                val = Math.round(val / step) * step;
            }
            val = parseFloat(val.toFixed(fixed));
            if (val < min) {
                val = min;
            } else if (val > maxValue - stepValue) {
                val = maxValue - stepValue;
            }
            set_minValue(val);
        };
        let onLeftThumbMouseup = (e) => {
            setIsChange(true);
            document.removeEventListener('mousemove', onLeftThumbMousemove);
            document.removeEventListener('mouseup', onLeftThumbMouseup);
        };
        document.addEventListener('mousemove', onLeftThumbMousemove);
        document.addEventListener('mouseup', onLeftThumbMouseup);
    };
    const onLeftThumbTouchStart = (e) => {
        if (disabled) return;
        let startX = e.touches[0].clientX;
        let thumb = e.target;
        let bar = thumb.parentNode;
        let barBox = bar.getBoundingClientRect();
        let barValue = minValue;
        setIsChange(false);
        let onLeftThumbToucheMove = (e) => {
            let clientX = e.touches[0].clientX;
            let dx = clientX - startX;
            let per = dx / barBox.width / 10;
            let val = barValue + (max - min) * per;
            if (stepOnly) {
                val = Math.round(val / step) * step;
            }
            val = parseFloat(val.toFixed(fixed));
            if (val < min) {
                val = min;
            } else if (val > maxValue - stepValue) {
                val = maxValue - stepValue;
            }
            set_minValue(val);
        };
        let onLeftThumbTouchEnd = (e) => {
            setIsChange(true);
            document.removeEventListener('touchmove', onLeftThumbToucheMove);
            document.removeEventListener('touchend', onLeftThumbTouchEnd);
        };

        document.addEventListener('touchmove', onLeftThumbToucheMove);
        document.addEventListener('touchend', onLeftThumbTouchEnd);
    };
    const onInnerBarLeftClick = (e) => {
        if (disabled) return;
        let _minValue = minValue + step;
        if (_minValue > maxValue - stepValue) {
            _minValue = maxValue - stepValue;
        }
        set_minValue(_minValue);
    };
    const onInnerBarRightClick = (e) => {
        if (disabled) return;
        let _maxValue = maxValue - step;
        if (_maxValue < minValue + stepValue) {
            _maxValue = minValue + stepValue;
        }
        set_maxValue(_maxValue);
    };
    const onInputMaxChange = (e) => {
        if (disabled) return;
        let _maxValue = parseFloat(e.target.value);
        if (_maxValue < minValue + stepValue) {
            _maxValue = minValue + stepValue;
        }
        set_maxValue(_maxValue);
        setIsChange(true);
    };
    const onRightThumbMousedown = (e) => {
        if (disabled) return;
        let startX = e.clientX;
        let thumb = e.target;
        let bar = thumb.parentNode;
        let barBox = bar.getBoundingClientRect();
        let barValue = maxValue;
        setIsChange(false);
        let onRightThumbMousemove = (e) => {
            let clientX = e.clientX;
            let dx = clientX - startX;
            let per = dx / barBox.width / 30;
            let val = barValue + (max - min) * per;
            if (stepOnly) {
                val = Math.round(val / step) * step;
            }
            val = parseFloat(val.toFixed(fixed));
            if (val < minValue + stepValue) {
                val = minValue + stepValue;
            } else if (val > max) {
                val = max;
            }
            set_maxValue(val);
        };
        let onRightThumbMouseup = (e) => {
            setIsChange(true);
            document.removeEventListener('mousemove', onRightThumbMousemove);
            document.removeEventListener('mouseup', onRightThumbMouseup);
        };
        document.addEventListener('mousemove', onRightThumbMousemove);
        document.addEventListener('mouseup', onRightThumbMouseup);
    };
    const onRightThumbTouchStart = (e) => {
        console.log('onRightThumbTouchStart', e);
        if (disabled) return;
        let startX = e.touches[0].clientX;
        let thumb = e.target;
        let bar = thumb.parentNode;
        let barBox = bar.getBoundingClientRect();
        let barValue = maxValue;
        setIsChange(false);
        let onRightThumbTouchMove = (e) => {
            let clientX = e.touches[0].clientX;
            let dx = clientX - startX;
            let per = dx / barBox.width / 10;
            let val = barValue + (max - min) * per;
            if (stepOnly) {
                val = Math.round(val / step) * step;
            }
            val = parseFloat(val.toFixed(fixed))
            if (val < minValue + stepValue) {
                val = minValue + stepValue;
            } else if (val > max) {
                val = max;
            }
            set_maxValue(val);
        };
        let onRightThumbTouchEnd = (e) => {
            setIsChange(true);
            document.removeEventListener('touchmove', onRightThumbTouchMove);
            document.removeEventListener('touchend', onRightThumbTouchEnd);
        };
        document.addEventListener('touchmove', onRightThumbTouchMove);
        document.addEventListener('touchend', onRightThumbTouchEnd);
    };
    const onBarRightClick = (e) => {
        console.log('onBarRightClick', e);
        if (disabled) return;
        let _maxValue = maxValue + step;
        if (_maxValue > max) {
            _maxValue = max;
        }
        set_maxValue(_maxValue);
    };
    const onMouseWheel = (e) => {
        if (disabled) return;
        if (preventWheel === true) {
            return;
        }
        if (!e.shiftKey && !e.ctrlKey) {
            return;
        }
        let val = (max - min) / 100;
        if (val > 1) {
            val = 1;
        }
        if (e.deltaY < 0) {
            val = -val;
        }

        let _minValue = minValue;
        let _maxValue = maxValue;
        if (e.shiftKey && e.ctrlKey) {
            if (_minValue + val >= min && _maxValue + val <= max) {
                _minValue = _minValue + val;
                _maxValue = _maxValue + val;
            }
        } else if (e.ctrlKey) {
            val = _maxValue + val;
            if (val < _minValue + stepValue) {
                val = _minValue + stepValue;
            } else if (val > max) {
                val = max;
            }
            _maxValue = val;
        } else if (e.shiftKey) {
            val = _minValue + val;
            if (val < min) {
                val = min;
            } else if (val > _maxValue - stepValue) {
                val = _maxValue - stepValue;
            }
            _minValue = val;
        }
        setIsChange(false);
        set_maxValue(_maxValue);
        set_minValue(_minValue);
        _wheelTimeout && window.clearTimeout(_wheelTimeout);
        _wheelTimeout = window.setTimeout(() => {
            setIsChange(true);
        }, 100);
    };
    useEffect(() => {
        if (refBar && refBar.current) {
            let bar = refBar.current;
            let p_bar = bar.parentNode;
            p_bar.addEventListener('wheel', (e) => {
                if (!e.shiftKey && !e.ctrlKey) {
                    return;
                }
                e.preventDefault();
            });
        }
    }, [refBar]);

    useEffect(() => {
        if (maxValue < minValue) {
            throw new Error('maxValue is less than minValue');
        }
        const triggerChange = () => {
            let result = { min, max, minValue, maxValue };
            isChange && props.onChange && props.onChange(result);
            props.onInput && props.onInput(result);
        };
        setMinCaption(props.minCaption || minValue.toFixed(fixed));
        setMaxCaption(props.maxCaption || maxValue.toFixed(fixed));
        let _barMin = ((minValue - min) / (max - min)) * 100;
        set_barMin(_barMin);
        let _barMax = ((max - maxValue) / (max - min)) * 100;
        set_barMax(_barMax);
        _triggerTimeout && window.clearTimeout(_triggerTimeout);
        _triggerTimeout = window.setTimeout(triggerChange, 20);
    }, [minValue, maxValue, min, max, fixed, props, isChange]);

    useEffect(() => {
        let _minValue = props.minValue;
        if (_minValue === null || _minValue === undefined) {
            _minValue = 25;
        }
        _minValue = +_minValue;
        if (_minValue < min) {
            _minValue = min;
        }
        if (_minValue > max) {
            _minValue = max;
        }
        setIsChange(false);
        set_minValue(+_minValue);
    }, [props.minValue, min, max]);
    useEffect(() => {
        let _maxValue = props.maxValue;
        if (_maxValue === null || _maxValue === undefined) {
            _maxValue = 75;
        }
        _maxValue = +_maxValue;

        if (_maxValue > max) {
            _maxValue = max;
        }
        if (_maxValue < min) {
            _maxValue = min;
        }
        setIsChange(false);
        set_maxValue(+_maxValue);
    }, [props.maxValue, min, max, step]);


    return (
        <div
            ref={ref}
            id={props.id}
            className={`${props.baseClassName || styles.multiRangeSlider} ${props.className || ''} ${disabled ? styles.disabled : ''
                }`}
            style={props.style}
            onWheel={onMouseWheel}
        >
            <div className={styles.labels + ' fontS'}>
                <div className={styles.labelCaption}>
                    <div>
                        Starting<br />Date
                    </div>
                    <span className={styles.minCaption}>{getDateString(minValue)}</span>
                </div>
                <div className={styles.spacer}></div>
                <div className={styles.labelCaption}>
                    <div>
                        Ending<br />Date
                    </div>
                    <span className={styles.maxCaption}>{getDateString(maxValue)}</span>
                </div>
            </div>
            <div className={styles.bar} ref={refBar}>
                <div
                    className={styles.barLeft}
                    style={{ width: barMin + '%', backgroundColor: props.barLeftColor }}
                    onClick={onBarLeftClick}
                ></div>
                <input
                    placeholder="min-value"
                    className={`${styles.inputTypeRange} ${styles.inputTypeRangeMin}`}
                    type="range"
                    min={min}
                    max={max}
                    step={step}
                    value={minValue}
                    onInput={onInputMinChange}
                />
                <div
                    className={styles.thumbLeft}
                    style={{ backgroundColor: props.thumbLeftColor }}
                    onMouseDown={onLeftThumbMousedown}
                    onTouchStart={onLeftThumbTouchStart}
                >
                    <div className={styles.caption}>
                        <span className={styles.dot}>
                        </span>
                    </div>
                </div>
                <div className={styles.barInner} style={{ backgroundColor: props.barInnerColor }}>
                    <div className={styles.barInnerLeft} onClick={onInnerBarLeftClick}></div>
                    <div className={styles.barInnerRight} onClick={onInnerBarRightClick}></div>
                </div>
                <input
                    placeholder="max-value"
                    className={`${styles.inputTypeRange} ${styles.inputTypeRangeMax}`}
                    type="range"
                    min={min}
                    max={max}
                    step={step}
                    value={maxValue}
                    onInput={onInputMaxChange}
                />
                <div
                    className={styles.thumbRight}
                    style={{ backgroundColor: props.thumbRightColor }}
                    onMouseDown={onRightThumbMousedown}
                    onTouchStart={onRightThumbTouchStart}
                >
                    <div className={styles.caption}>
                        <span className={styles.dot}>
                        </span>
                    </div>
                </div>
                <div
                    className={styles.barRight}
                    style={{ width: barMax + '%', backgroundColor: props.barRightColor }}
                    onClick={onBarRightClick}
                ></div>
            </div>
            {ruler && (
                <div className={styles.ruler}>
                    {[...Array(stepCount)].map((e, i) => (
                        <div key={i} className={styles.rulerRule}>
                            {subSteps &&
                                [...Array(10)].map((e, n) => (
                                    <div key={n} className={styles.rulerSubRule}></div>
                                ))}
                        </div>
                    ))}
                </div>
            )}
            {label && (
                <div className={styles.labels}>
                    {labels.map((label) => {
                        return (
                            <div key={label.toString()} className={styles.label}>
                                {getDateString(label)}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default React.memo(forwardRef(MultiRangeSlider));