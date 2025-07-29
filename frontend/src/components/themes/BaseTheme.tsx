'use client';

import React from 'react';
import { ThemeProps } from './types';

// Base theme component that provides common functionality
export const BaseTheme: React.FC<ThemeProps & { children?: React.ReactNode }> = ({
  backgroundColor = 'transparent',
  previewMode = false,
  children
}) => {
  return (
    <div 
      className={`${previewMode ? 'absolute inset-0' : 'fixed inset-0 z-0'}`}
      style={{ backgroundColor }}
    >
      {children}
    </div>
  );
};

// Higher-order component to wrap themes with common functionality
export const withBaseTheme = <P extends ThemeProps>(
  ThemeComponent: React.ComponentType<P>
) => {
  const WrappedComponent = (props: P) => {
    return (
      <BaseTheme {...props}>
        <ThemeComponent {...props} />
      </BaseTheme>
    );
  };
  WrappedComponent.displayName = `withBaseTheme(${ThemeComponent.displayName || ThemeComponent.name})`;
  return WrappedComponent;
};

export default BaseTheme; 