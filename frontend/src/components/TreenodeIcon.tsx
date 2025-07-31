'use client';

import React from 'react';
import * as LucideIcons from 'lucide-react';
import { 
  SIMPLE_ICONS, 
  LUCIDE_ICONS, 
  isSimpleIcon, 
  isLucideIcon,
  type IconName 
} from '@/lib/icon-list';

interface TreenodeIconProps {
  icon: string;
  color?: string;
  className?: string;
  size?: number;
}

export default function TreenodeIcon({ 
  icon, 
  color = 'currentColor', 
  className = '', 
  size = 24 
}: TreenodeIconProps) {
  // Check if it's a Simple Icon
  if (isSimpleIcon(icon)) {
    const iconSlug = SIMPLE_ICONS[icon];
    const src = color && color !== 'currentColor'
      ? `https://cdn.simpleicons.org/${iconSlug}/${color.replace('#', '')}`
      : `https://cdn.simpleicons.org/${iconSlug}`;
    
    return React.createElement('img', {
      className,
      src,
      alt: icon,
      width: size,
      height: size,
      style: {
        opacity: 1
      }
    });
  }

  // Check if it's a Lucide Icon
  if (isLucideIcon(icon)) {
    const iconName = LUCIDE_ICONS[icon];
    const LucideIcon = LucideIcons[iconName as keyof typeof LucideIcons] as React.ComponentType<any>;
    return React.createElement(LucideIcon, {
      className,
      size: size
    });
  }

  // Fallback to a default icon
  console.warn(`Icon "${icon}" not found in TreenodeIcon registry`);
  return React.createElement(LucideIcons.Link, {
    className,
    size: size
  });
}

// Export the available icons for reference
export const AVAILABLE_ICONS = {
  ...SIMPLE_ICONS,
  ...LUCIDE_ICONS
} as const;

export type AvailableIcon = keyof typeof AVAILABLE_ICONS; 