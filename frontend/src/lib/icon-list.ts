// Single source of truth for all icons in Treenode
// This file defines all available icons and their types

// Simple Icons (social media platforms)
export const SIMPLE_ICONS = {
  // Social Media
  'facebook': 'facebook',
  'twitter': 'x', 
  'instagram': 'instagram',
  'youtube': 'youtube',
  'tiktok': 'tiktok',
  'snapchat': 'snapchat',
  'discord': 'discord',
  'telegram': 'telegram',
  'whatsapp': 'whatsapp',
  'reddit': 'reddit',
  'pinterest': 'pinterest',
  'twitch': 'twitch',
  'spotify': 'spotify',
  'github': 'github',
  'medium': 'medium',
  'dribbble': 'dribbble',
  'behance': 'behance',
  'flickr': 'flickr',
  'vimeo': 'vimeo',
  'stackoverflow': 'stackoverflow',
  'figma': 'figma',
  'slack': 'slack',
  'zoom': 'zoom',
  'dropbox': 'dropbox',
  'notion': 'notion',
  'trello': 'trello',
  'gitlab': 'gitlab',
  'bitbucket': 'bitbucket',
  'docker': 'docker',
  'vercel': 'vercel',
  'netlify': 'netlify',
  'stripe': 'stripe',
  'paypal': 'paypal',
  'wordpress': 'wordpress',
  'shopify': 'shopify',
} as const;

// Lucide Icons (general UI icons)
export const LUCIDE_ICONS = {
  // Communication
  'mail': 'Mail',
  'message-circle': 'MessageCircle',
  'phone': 'Phone',
  'globe': 'Globe',
  'link': 'Link',
  'external-link': 'ExternalLink',
  'share': 'Share2',
  'copy': 'Copy',
  'linkedin': 'Linkedin',
  
  // Social
  'camera': 'Camera',
  'video': 'Video',
  'mic': 'Mic',
  'headphones': 'Headphones',
  'music': 'Music',
  'play': 'Play',
  'pause': 'Pause',
  
  // Business
  'briefcase': 'Briefcase',
  'building': 'Building',
  'map-pin': 'MapPin',
  'calendar': 'Calendar',
  'clock': 'Clock',
  'star': 'Star',
  'heart': 'Heart',
  'thumbs-up': 'ThumbsUp',
  
  // Tech
  'code': 'Code',
  'terminal': 'Terminal',
  'database': 'Database',
  'server': 'Server',
  'cpu': 'Cpu',
  'smartphone': 'Smartphone',
  'laptop': 'Laptop',
  'monitor': 'Monitor',
  
  // Content
  'file-text': 'FileText',
  'image': 'Image',
  'video-off': 'VideoOff',
  'book': 'Book',
  'newspaper': 'Newspaper',
  'rss': 'Rss',
  'download': 'Download',
  'upload': 'Upload',
  
  // UI
  'home': 'Home',
  'user': 'User',
  'users': 'Users',
  'settings': 'Settings',
  'search': 'Search',
  'menu': 'Menu',
  'x': 'X',
  'plus': 'Plus',
  'minus': 'Minus',
  'check': 'Check',
  'chevron-right': 'ChevronRight',
  'chevron-left': 'ChevronLeft',
  'arrow-right': 'ArrowRight',
  'arrow-left': 'ArrowLeft',
  'arrow-up': 'ArrowUp',
  'arrow-down': 'ArrowDown',
  
  // Actions
  'edit': 'Edit',
  'trash': 'Trash2',
  'eye': 'Eye',
  'eye-off': 'EyeOff',
  'lock': 'Lock',
  'unlock': 'Unlock',
  'key': 'Key',
  'shield': 'Shield',
  
  // Media
  'file': 'File',
  'folder': 'Folder',
  'cloud': 'Cloud',
  'wifi': 'Wifi',
  'bluetooth': 'Bluetooth',
  'tablet': 'Tablet',
  'printer': 'Printer',
  'keyboard': 'Keyboard',
  'mouse': 'Mouse',
  'speaker': 'Speaker',
  
  // Gaming
  'gamepad': 'Gamepad2',
  'puzzle': 'Puzzle',
  'trophy': 'Trophy',
  'medal': 'Medal',
  'award': 'Award',
  
  // Commerce
  'gift': 'Gift',
  'package': 'Package',
  'shopping-cart': 'ShoppingCart',
  'credit-card': 'CreditCard',
  'dollar-sign': 'DollarSign',
  'euro': 'Euro',
  'bitcoin': 'Bitcoin',
  
  // Analytics
  'trending-up': 'TrendingUp',
  'trending-down': 'TrendingDown',
  'bar-chart': 'BarChart3',
  'pie-chart': 'PieChart',
  'activity': 'Activity',
  
  // Symbols
  'zap': 'Zap',
  'target': 'Target',
  'flag': 'Flag',
  'bookmark': 'Bookmark',
  'tag': 'Tag',
  'hash': 'Hash',
  'at-sign': 'AtSign',
  'percent': 'Percent',
  'infinity': 'Infinity',
  'pi': 'Pi',
  'sigma': 'Sigma',
  'omega': 'Omega',
} as const;

// Combined icon list for backward compatibility
export const ICON_LIST = [
  ...Object.keys(SIMPLE_ICONS),
  ...Object.keys(LUCIDE_ICONS),
] as const;

// Type definitions
export type SimpleIconName = keyof typeof SIMPLE_ICONS;
export type LucideIconName = keyof typeof LUCIDE_ICONS;
export type IconName = SimpleIconName | LucideIconName;

// Helper functions
export function isSimpleIcon(iconName: string): iconName is SimpleIconName {
  return iconName in SIMPLE_ICONS;
}

export function isLucideIcon(iconName: string): iconName is LucideIconName {
  return iconName in LUCIDE_ICONS;
}

export function getSimpleIconSlug(iconName: SimpleIconName): string {
  return SIMPLE_ICONS[iconName];
}

export function getLucideIconName(iconName: LucideIconName): string {
  return LUCIDE_ICONS[iconName];
}

// Icon categories for UI organization
export const ICON_CATEGORIES = {
  'Social Media': Object.keys(SIMPLE_ICONS),
  'Communication': ['mail', 'message-circle', 'phone', 'globe', 'link', 'external-link', 'share', 'copy', 'linkedin'],
  'Social': ['camera', 'video', 'mic', 'headphones', 'music', 'play', 'pause'],
  'Business': ['briefcase', 'building', 'map-pin', 'calendar', 'clock', 'star', 'heart', 'thumbs-up'],
  'Tech': ['code', 'terminal', 'database', 'server', 'cpu', 'smartphone', 'laptop', 'monitor'],
  'Content': ['file-text', 'image', 'video-off', 'book', 'newspaper', 'rss', 'download', 'upload'],
  'UI': ['home', 'user', 'users', 'settings', 'search', 'menu', 'x', 'plus', 'minus', 'check'],
  'Actions': ['edit', 'trash', 'eye', 'eye-off', 'lock', 'unlock', 'key', 'shield'],
  'Media': ['file', 'folder', 'cloud', 'wifi', 'bluetooth', 'tablet', 'printer', 'keyboard', 'mouse', 'speaker'],
  'Gaming': ['gamepad', 'puzzle', 'trophy', 'medal', 'award'],
  'Commerce': ['gift', 'package', 'shopping-cart', 'credit-card', 'dollar-sign', 'euro', 'bitcoin'],
  'Analytics': ['trending-up', 'trending-down', 'bar-chart', 'pie-chart', 'activity'],
  'Symbols': ['zap', 'target', 'flag', 'bookmark', 'tag', 'hash', 'at-sign', 'percent', 'infinity', 'pi', 'sigma', 'omega'],
} as const; 