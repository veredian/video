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
    <path
      className="logo-path-fill"
      d="M40 135 L129 20 L218 135 L178 135 L129 65 L80 135 Z"
      fillRule="evenodd"
    />
     <path
      className="logo-path-draw"
      d="M40 135 L129 20 L218 135 L178 135 L129 65 L80 135 Z"
      fillRule="evenodd"
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