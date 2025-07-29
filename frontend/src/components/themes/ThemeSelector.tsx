'use client';

import React, { useState } from 'react';
import { ThemeProps } from './types';
import ThemeRenderer, { getAvailableThemes } from './ThemeRegistry';

interface ThemeSelectorProps {
  selectedTheme: string;
  onThemeChange: (theme: string) => void;
  themeProps: ThemeProps;
  className?: string;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  selectedTheme,
  onThemeChange,
  themeProps,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const availableThemes = getAvailableThemes();

  return (
    <div className={`relative ${className}`}>
      {/* Theme Preview */}
      <div className="relative h-32 w-full rounded-lg overflow-hidden border border-border">
        <ThemeRenderer
          themeName={selectedTheme}
          {...themeProps}
          previewMode={true}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        <div className="absolute bottom-2 left-2 text-white text-sm font-medium">
          {selectedTheme}
        </div>
      </div>

      {/* Theme Dropdown */}
      <div className="relative mt-2">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-3 py-2 text-left border border-border rounded-md bg-background hover:bg-accent"
        >
          {selectedTheme || 'Select Theme'}
        </button>
        
        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-md shadow-lg z-50 max-h-60 overflow-y-auto">
            {availableThemes.map((theme) => (
              <button
                key={theme}
                onClick={() => {
                  onThemeChange(theme);
                  setIsOpen(false);
                }}
                className={`w-full px-3 py-2 text-left hover:bg-accent ${
                  selectedTheme === theme ? 'bg-accent' : ''
                }`}
              >
                {theme}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ThemeSelector; 