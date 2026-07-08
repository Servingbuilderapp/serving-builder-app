'use client';

import React from 'react';
export const GlassCard = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => {
  return (
    <div className={`bg-white/[0.03] backdrop-blur-[12px] border border-white/[0.08] shadow-2xl rounded-2xl hover:border-white/[0.15] transition-all duration-300 ${className}`}>
      {children}
    </div>
  );
};
