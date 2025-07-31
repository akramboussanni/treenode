import { 
  SIMPLE_ICONS, 
  LUCIDE_ICONS, 
  ICON_LIST, 
  isSimpleIcon, 
  isLucideIcon,
} from './icon-list';

// Re-export types and helpers from icon-list.ts
export type { IconName, SimpleIconName, LucideIconName } from './icon-list';
export { 
  SIMPLE_ICONS, 
  LUCIDE_ICONS, 
  ICON_LIST, 
  isSimpleIcon, 
  isLucideIcon,
} from './icon-list';

// Security validation function
export function isValidIcon(iconId: string): boolean {
  return isSimpleIcon(iconId) || isLucideIcon(iconId);
} 