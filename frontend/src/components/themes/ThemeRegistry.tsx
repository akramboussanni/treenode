'use client';

import React from 'react';
import { ThemeProps } from './types';
import { withBaseTheme } from './BaseTheme';
import LoveTheme from './LoveTheme';
import RetroTerminal from './RetroTerminal';
import NeonCyber from './NeonCyber';
import NatureForest from './NatureForest';
import LiquidChrome from './LiquidChrome';
import Galaxy from './Galaxy';
import Iridescence from './Iridescence';
import Whirlwind from './Whirlwind';
import Lightning from './Lightning';
import DotGrid from './DotGrid';
import Threads from './Threads';
import Beams from './Beams';
import BallpitTheme from './Ballpit';
import Waves from './Waves';
import Dither from './Dither';
import SmartGuy from './SmartGuy';

// Theme component type
type ThemeComponent = React.ComponentType<ThemeProps>;

// Theme registry mapping theme names to their components (wrapped with BaseTheme)
const themeRegistry: Record<string, ThemeComponent> = {
  'galaxy': withBaseTheme(Galaxy),
  'ballpit': withBaseTheme(BallpitTheme),
  'neon-cyber': withBaseTheme(NeonCyber),
  'liquid-chrome': withBaseTheme(LiquidChrome),
  'retro-terminal': withBaseTheme(RetroTerminal),
  'iridescence': withBaseTheme(Iridescence),
  'whirlwind': withBaseTheme(Whirlwind),
  'lightning': withBaseTheme(Lightning),
  'nature-forest': withBaseTheme(NatureForest),
  'dotgrid': withBaseTheme(DotGrid),
  'threads': withBaseTheme(Threads),
  'beams': withBaseTheme(Beams),
  'love': withBaseTheme(LoveTheme),
  'waves': withBaseTheme(Waves),
  'dither': withBaseTheme(Dither),
  'smartguy': withBaseTheme(SmartGuy),
};

// Theme component that renders the appropriate theme based on theme name
export const ThemeRenderer: React.FC<ThemeProps & { themeName: string }> = ({ 
  themeName, 
  ...themeProps 
}) => {
  const ThemeComponent = themeRegistry[themeName];
  
  if (!ThemeComponent) {
    console.warn(`Theme "${themeName}" not found in registry`);
    return null;
  }
  
  return <ThemeComponent {...themeProps} />;
};

// Helper function to get available themes
export const getAvailableThemes = (): string[] => {
  return Object.keys(themeRegistry);
};

// Helper function to check if a theme exists
export const isThemeAvailable = (themeName: string): boolean => {
  return themeName in themeRegistry;
};

export default ThemeRenderer; 