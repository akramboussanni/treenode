'use client';

import React from 'react';
import { ThemeProps } from './types';

const SmartGuy: React.FC<ThemeProps & { children?: React.ReactNode }> = ({ children }) => {
  return (
    <div 
      className="min-h-screen w-full relative"
      style={{
        backgroundImage: 'url(https://r2.kimotherapy.dev/smartguy.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Optional overlay for better text readability */}
      <div className="absolute inset-0 bg-black/20"></div>
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default SmartGuy; 