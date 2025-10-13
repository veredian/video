import React from 'react';

export const PaintBrushIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
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
        d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.998 15.998 0 011.622-3.385m5.043.025a2.25 2.25 0 00-1.128-5.78 3 3 0 01-2.245-2.4 4.5 4.5 0 00-8.4 2.245c0 .399.078.78.22 1.128m0 0a15.998 15.998 0 00-1.622 3.385m5.043-.025a15.998 15.998 0 013.388 1.62m-5.043.025a4.5 4.5 0 01-1.128 5.78 3 3 0 00-2.245 2.4 2.25 2.25 0 01-2.4-2.245 4.5 4.5 0 002.245-8.4c.399 0 .78.078 1.128.22z" 
    />
  </svg>
);