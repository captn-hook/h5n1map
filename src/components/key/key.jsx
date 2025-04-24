import styles from './key.module.css';
import Scale from '../scale/scale';
import Dot from '../dot/dot';

export default function Key(props) {
    // console.log('Key:');
    // console.log(props);

    return (
            <div className={styles.key + ' borderBox dynaPad fontL'}>
                { typeof props.keyColor === 'string' && props.selected != 'Human' ?
                    <h3>{props.selected}</h3> :
                    null
                }
                { typeof props.keyColor === 'string' && props.selected != 'Human' ?
                    <Scale color={props.selected == 'Dairy Farms' ? '#142CA1' : props.keyColor} max={props.max} stateCounty={props.keyType} white={props.selected == 'Dairy Farms' ? '#ABB9FF' : '#FFFFFF'} c={props.selected == 'Dairy Farms' ? '#ABB9FF' : '#FFFFFF'} /> :
                    <ul> 
                        { props.selected == 'Human' ? <li key={0}><Dot key={0} color={props.keyColor} label='Human' outline={true} /></li> : 
                        Object.keys(props.keyColor).map((key, index) => {
                            return <li key={index}><Dot key={index} color={props.keyColor[key]} label={key} outline={props.keyType[key] != 'county'} /></li>
                        }) }
                    </ul>
                }
            </div>
    );
}