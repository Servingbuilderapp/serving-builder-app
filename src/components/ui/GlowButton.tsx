'use client';

import React from 'react';
export const GlowButton = ({ children, className = '', ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => {
  return (
    <button 
      className={`px-6 py-3 bg-black text-white rounded-xl font-medium shadow-md hover:shadow-lg transition-all ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
