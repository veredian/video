import React from 'react';

export const PictureInPictureIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        fill="none" 
        viewBox="0 0 24 24" 
        strokeWidth={1.5} 
        stroke="currentColor" 
        {...props}
    >
        <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            d="M21 12.75V12a2.25 2.25 0 00-2.25-2.25H16.5m-3 3h3V12a2.25 2.25 0 00-2.25-2.25H3.75M3 12.75V15a2.25 2.25 0 002.25 2.25h13.5A2.25 2.25 0 0021 15v-2.25m-18 0h18" 
        />
    </svg>
);