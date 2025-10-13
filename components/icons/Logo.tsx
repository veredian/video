import React from 'react';

export const Logo: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    viewBox="0 0 258 155"
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
      d="M194.55 71.363c-6.15-31.25-34.93-54.68-68.52-54.68-29.35 0-54.81 18.04-65.57 43.85-4.52-1.63-9.4-2.58-14.51-2.58-25.21 0-45.64 20.43-45.64 45.64s20.43 45.64 45.64 45.64h148.1c31.13 0 56.36-25.23 56.36-56.36 0-30-23.5-54.4-52.56-56.19l-1.36-.02z"
      fill="url(#logo-gradient)"
    />
    <path
      d="M109.11 81.333l42.48 24.52-42.48 24.52v-49.04z"
      fill="#fff"
    />
  </svg>
);
