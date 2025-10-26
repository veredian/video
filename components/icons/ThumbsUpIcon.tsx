import React from 'react';

export const ThumbsUpIcon: React.FC<React.SVGProps<SVGSVGElement> & { filled?: boolean }> = ({ filled, ...props }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    fill={filled ? "currentColor" : "none"} 
    viewBox="0 0 24 24" 
    strokeWidth={1.5} 
    stroke="currentColor" 
    {...props}
  >
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      d="M6.633 10.5c.806 0 1.533-.422 2.031-1.08a9.041 9.041 0 012.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 00.322-1.672V3a.75.75 0 01.75-.75A2.25 2.25 0 0116.5 4.5c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 01-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 00-1.423-.23H6.633a1.875 1.875 0 01-1.875-1.875V11.25a1.875 1.875 0 011.875-1.875z" 
    />
  </svg>
);