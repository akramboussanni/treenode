'use client';

import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Button } from './ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';

// Import all theme components
import BallpitTheme from './themes/Ballpit';
import BeamsTheme from './themes/Beams';
import DitherTheme from './themes/Dither';
import DotGridTheme from './themes/DotGrid';
import Galaxy from './themes/Galaxy';
import Iridescence from './themes/Iridescence';
import LightningTheme from './themes/Lightning';
import LiquidChrome from './themes/LiquidChrome';
import LoveTheme from './themes/LoveTheme';
import NatureForest from './themes/NatureForest';
import NeonCyber from './themes/NeonCyber';
import RetroTerminal from './themes/RetroTerminal';
import ThreadsTheme from './themes/Threads';
import WavesTheme from './themes/Waves';
import Whirlwind from './themes/Whirlwind';
import { ThemeProps } from './themes/types';

// Theme interface
interface ThemeInfo {
  id: string;
  name: string;
  description: string;
  category: string;
  component: React.ComponentType<ThemeProps>;
  accentColor?: string;
}

// Theme categories and data
const themes: ThemeInfo[] = [
  // Interactive & Dynamic
  {
    id: 'ballpit',
    name: 'Ballpit',
    description: 'Bouncing balls with physics simulation',
    category: 'Interactive & Dynamic',
    component: BallpitTheme,
    accentColor: '#4f46e5'
  },
  {
    id: 'love',
    name: 'Love Theme',
    description: 'Romantic hearts that follow your cursor',
    category: 'Interactive & Dynamic',
    component: LoveTheme,
    accentColor: '#ff6b9d'
  },
  {
    id: 'threads',
    name: 'Threads',
    description: 'Dynamic thread-like animations',
    category: 'Interactive & Dynamic',
    component: ThreadsTheme,
    accentColor: '#8b5cf6'
  },
  {
    id: 'whirlwind',
    name: 'Whirlwind',
    description: 'Spinning particle effects',
    category: 'Interactive & Dynamic',
    component: Whirlwind,
    accentColor: '#06b6d4'
  },

  // Geometric & Abstract
  {
    id: 'dotgrid',
    name: 'Dot Grid',
    description: 'Animated grid of connected dots',
    category: 'Geometric & Abstract',
    component: DotGridTheme,
    accentColor: '#10b981'
  },
  {
    id: 'beams',
    name: 'Beams',
    description: 'Dynamic light beam effects',
    category: 'Geometric & Abstract',
    component: BeamsTheme,
    accentColor: '#f59e0b'
  },
  {
    id: 'waves',
    name: 'Waves',
    description: 'Flowing wave animations',
    category: 'Geometric & Abstract',
    component: WavesTheme,
    accentColor: '#3b82f6'
  },

  // Retro & Cyber
  {
    id: 'retro-terminal',
    name: 'Retro Terminal',
    description: 'Classic terminal with glitch effects',
    category: 'Retro & Cyber',
    component: RetroTerminal,
    accentColor: '#00ff00'
  },
  {
    id: 'neon-cyber',
    name: 'Neon Cyber',
    description: 'Futuristic neon aesthetics',
    category: 'Retro & Cyber',
    component: NeonCyber,
    accentColor: '#ff0080'
  },
  {
    id: 'liquid-chrome',
    name: 'Liquid Chrome',
    description: 'Metallic liquid animations',
    category: 'Retro & Cyber',
    component: LiquidChrome,
    accentColor: '#c0c0c0'
  },

  // Natural & Organic
  {
    id: 'nature-forest',
    name: 'Nature Forest',
    description: 'Organic forest-inspired animations',
    category: 'Natural & Organic',
    component: NatureForest,
    accentColor: '#059669'
  },
  {
    id: 'galaxy',
    name: 'Galaxy',
    description: 'Cosmic space animations',
    category: 'Natural & Organic',
    component: Galaxy,
    accentColor: '#7c3aed'
  },

  // Effects & Filters
  {
    id: 'dither',
    name: 'Dither',
    description: 'Retro dithering effects',
    category: 'Effects & Filters',
    component: DitherTheme,
    accentColor: '#6b7280'
  },
  {
    id: 'iridescence',
    name: 'Iridescence',
    description: 'Shimmering color-shifting effects',
    category: 'Effects & Filters',
    component: Iridescence,
    accentColor: '#ec4899'
  },
  {
    id: 'lightning',
    name: 'Lightning',
    description: 'Electric lightning effects',
    category: 'Effects & Filters',
    component: LightningTheme,
    accentColor: '#fbbf24'
  }
];

// Group themes by category
const groupedThemes = themes.reduce((acc, theme) => {
  if (!acc[theme.category]) {
    acc[theme.category] = [];
  }
  acc[theme.category].push(theme);
  return acc;
}, {} as Record<string, ThemeInfo[]>);

interface ThemeSelectorProps {
  onThemeSelect?: (themeId: string) => void;
  selectedTheme?: string;
  className?: string;
  themeColor?: string;
  accentColor?: string;
  backgroundColor?: string;
}

export default function ThemeSelector({ 
  onThemeSelect, 
  selectedTheme = 'ballpit',
  className = '',
  themeColor = '#ffffff',
  accentColor = '#4f46e5',
  backgroundColor = '#ffffff'
}: ThemeSelectorProps) {
  const [previewTheme, setPreviewTheme] = useState<string>(selectedTheme);
  const [themesCollapsed, setThemesCollapsed] = useState(false);

  const handleThemeClick = useCallback((themeId: string) => {
    setPreviewTheme(themeId);
  }, []);

  const currentTheme = themes.find(t => t.id === previewTheme) || themes[0];
  const ThemeComponent = currentTheme.component;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Main Preview Card */}
      <Card className="relative overflow-hidden">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">
              Theme Preview
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setThemesCollapsed(!themesCollapsed)}
              className="flex items-center gap-2"
            >
              {themesCollapsed ? (
                <>
                  <ChevronDown className="h-4 w-4" />
                  Show Themes
                </>
              ) : (
                <>
                  <ChevronUp className="h-4 w-4" />
                  Hide Themes
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="relative w-full h-64 bg-black/5 rounded-b-lg overflow-hidden">
            <div className="absolute inset-0">
              <ThemeComponent 
                accentColor={accentColor}
                themeColor={themeColor}
                backgroundColor={backgroundColor}
                mouseEffectsEnabled={true}
                previewMode={true}
              />
            </div>
            {/* Set Theme Button - Overlay on top-right */}
            <div className="absolute top-4 right-4">
              <button
                className={`px-4 py-2 rounded bg-white/90 backdrop-blur-sm text-gray-900 font-semibold shadow-lg hover:bg-white transition disabled:opacity-50 disabled:cursor-not-allowed border border-white/20`}
                disabled={previewTheme === selectedTheme}
                onClick={() => onThemeSelect?.(previewTheme)}
                type="button"
              >
                {previewTheme === selectedTheme ? 'Selected' : 'Set Theme'}
              </button>
            </div>
            {/* Overlay for theme info */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
              <div className="text-white">
                <h3 className="font-semibold text-lg">{currentTheme.name}</h3>
                <p className="text-sm opacity-90">{currentTheme.description}</p>
                <Badge variant="secondary" className="mt-2">
                  {currentTheme.category}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Theme Selection Grid - Collapsible */}
      {!themesCollapsed && (
        <div className="space-y-6">
          {Object.entries(groupedThemes).map(([category, categoryThemes]) => (
            <div key={category} className="space-y-3">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {category}
                </h3>
                <Separator className="flex-1" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {categoryThemes.map((theme) => (
                  <Card
                    key={theme.id}
                    className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                      previewTheme === theme.id 
                        ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950/20' 
                        : 'hover:bg-gray-50 dark:hover:bg-gray-900/50'
                    }`}
                    onClick={() => handleThemeClick(theme.id)}
                  >
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-gray-900 dark:text-gray-100">
                            {theme.name}
                          </h4>
                          {selectedTheme === theme.id && (
                            <Badge variant="default" className="text-xs">
                              Selected
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {theme.description}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 