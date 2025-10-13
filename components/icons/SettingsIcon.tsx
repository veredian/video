import React from 'react';

export const SettingsIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
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
      d="M9.594 3.94c.09-.542.56-1.007 1.11-.95.542.057.955.542.955 1.095 0 .542-.413 1.038-.955 1.095a1.007 1.007 0 01-1.11-.95zM10.049 13.931c0 .542.413 1.038.955 1.095.542.057 1.02-.355 1.11-.95.09-.542-.255-1.11-.795-1.11a1.007 1.007 0 00-1.27.965zM12 21a9 9 0 100-18 9 9 0 000 18z" 
    />
  </svg>
);
