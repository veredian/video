import React from 'react';

export const Logo: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    viewBox="0 0 258 200"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <defs>
      <linearGradient id="logo-gradient" x1="0.103" y1="0.113" x2="0.852" y2="0.843">
        <stop offset="0" stopColor="#22d3ee" />
        <stop offset="1" stopColor="#3b82f6" />
      </linearGradient>
    </defs>

    {/* Cloud Path for Fill Animation */}
    <path
      className="logo-path-fill"
      transform="translate(19, -15)"
      d="M180,110 a 45 45 0 0 0 -45 -45 h -1 a 35 35 0 0 0 -65 -10 a 40 40 0 0 0 -34 40 v 5 h -5 a 30 30 0 1 0 0 60 h 150 a 25 25 0 0 0 0 -50 Z"
    />
    {/* Cloud Path for Stroke Draw Animation */}
    <path
      className="logo-path-draw"
      transform="translate(19, -15)"
      d="M180,110 a 45 45 0 0 0 -45 -45 h -1 a 35 35 0 0 0 -65 -10 a 40 40 0 0 0 -34 40 v 5 h -5 a 30 30 0 1 0 0 60 h 150 a 25 25 0 0 0 0 -50 Z"
    />
    
    {/* Arrow Path for Stroke Draw Animation */}
    <path
      className="logo-path-draw"
      d="M129,125 V85 M115,100 L129,85 L143,100"
      strokeWidth="8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />

    <text
      x="129"
      y="180"
      fontFamily="Inter, sans-serif"
      fontSize="40"
      fontWeight="bold"
      fill="url(#logo-gradient)"
      textAnchor="middle"
      className="logo-text"
    >
      NV .NE
    </text>
  </svg>
);
