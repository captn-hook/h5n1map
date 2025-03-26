import React from 'react';

export default function Marker(props) {

    var size = props.sc ? 36 : 50;
    
    return (
        <svg className="marker" viewBox="0 0 147.39 227.1" x={props.x - 20} y={props.y - 38}
            width={size} height={size}
            onMouseEnter={props.enterListener}
            onMouseLeave={props.leaveListener}
            onMouseMove={props.moveListener}
            onClick={props.clickListener}
        >
            <g>
                <g className="cls-3">
                    <ellipse className="cls-1" cx="73.69" cy="215.58" rx="37.95" ry="11.52" />
                </g>
                <g>
                    <path className="cls-2" d="M73.69,5.64c37.51,0,68.06,30.55,68.06,68.06,0,33.23-17.15,51.45-35.37,80.92l-32.69,52.52-32.69-52.52C22.78,125.14,5.63,106.92,5.63,73.7,5.63,36.18,36.18,5.64,73.69,5.64h0Z" />
                    <path className="cls-1" d="M73.7,217.8l-37.48-60.21c-3.44-5.57-6.83-10.71-10.08-15.64C12.11,120.68,0,102.3,0,73.7,0,33.06,33.06,0,73.7,0s73.7,33.06,73.7,73.7c0,28.6-12.11,46.98-26.14,68.26-3.25,4.92-6.64,10.07-10.07,15.63l-37.48,60.22ZM73.7,11.27c-34.42,0-62.43,28-62.43,62.43,0,25.23,10.71,41.48,24.28,62.06,3.3,5.01,6.75,10.25,10.25,15.9l27.9,44.82,27.91-44.83c3.49-5.64,6.94-10.88,10.24-15.89,13.57-20.58,24.28-36.83,24.28-62.06,0-34.42-28-62.43-62.43-62.43Z" />
                </g>
            </g>
            <circle className="cls-1" cx="73.69" cy="79.33" r="22.51" />
        </svg>
    );
}