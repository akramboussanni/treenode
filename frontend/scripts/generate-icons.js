const fs = require('fs');
const path = require('path');

// This script generates icon mappings automatically
// Run with: node scripts/generate-icons.js

const generateIconMappings = () => {
  const lucideIcons = [
    'Twitter', 'Github', 'Linkedin', 'Instagram', 'Youtube', 'Facebook',
    'Globe', 'Mail', 'Phone', 'MapPin', 'Calendar', 'Heart', 'Star', 'Home',
    'User', 'Settings', 'Link', 'ExternalLink', 'Download', 'Upload', 'Share2',
    'Copy', 'Edit', 'Trash2', 'Plus', 'Minus', 'Check', 'X', 'AlertCircle',
    'Info', 'HelpCircle', 'Search', 'Filter', 'Grid', 'List', 'Eye', 'EyeOff',
    'Lock', 'Unlock', 'Key', 'Shield', 'Camera', 'Image', 'Video', 'Music',
    'File', 'Folder', 'Database', 'Server', 'Cloud', 'Wifi', 'Bluetooth',
    'Smartphone', 'Tablet', 'Monitor', 'Laptop', 'Printer', 'Keyboard',
    'Mouse', 'Headphones', 'Speaker', 'Gamepad2', 'Puzzle', 'Trophy',
    'Medal', 'Award', 'Gift', 'Package', 'ShoppingCart', 'CreditCard',
    'DollarSign', 'Euro', 'Bitcoin', 'TrendingUp', 'TrendingDown',
    'BarChart3', 'PieChart', 'Activity', 'Zap', 'Target', 'Flag',
    'Bookmark', 'Tag', 'Hash', 'AtSign', 'Percent', 'Infinity', 'Pi',
    'Sigma', 'Omega'
  ];

  const simpleIconMappings = {
    tiktok: 'tiktok',
    discord: 'discord',
    twitch: 'twitch',
    reddit: 'reddit',
    snapchat: 'snapchat',
    whatsapp: 'whatsapp',
    telegram: 'telegram',
    spotify: 'spotify',
    pinterest: 'pinterest',
    tumblr: 'tumblr',
    vimeo: 'vimeo',
    dailymotion: 'dailymotion',
    vk: 'vk',
    wechat: 'wechat',
    line: 'line',
    kakao: 'kakao',
    naver: 'naver',
    stackoverflow: 'stackoverflow',
    medium: 'medium',
    hashnode: 'hashnode',
    substack: 'substack',
    notion: 'notion',
    figma: 'figma',
    slack: 'slack',
    zoom: 'zoom',
    dropbox: 'dropbox',
    googledrive: 'googledrive',
    box: 'box',
    evernote: 'evernote',
    trello: 'trello',
    asana: 'asana',
    jira: 'jira',
    confluence: 'confluence',
    bitbucket: 'bitbucket',
    gitlab: 'gitlab',
    docker: 'docker',
    kubernetes: 'kubernetes',
    heroku: 'heroku',
    vercel: 'vercel',
    netlify: 'netlify',
    cloudflare: 'cloudflare',
    digitalocean: 'digitalocean',
    vultr: 'vultr',
    stripe: 'stripe',
    paypal: 'paypal',
    square: 'square',
    shopify: 'shopify',
    woo: 'woo',
    prestashop: 'prestashop',
    wordpress: 'wordpress',
    drupal: 'drupal',
    joomla: 'joomla',
    wix: 'wix',
    squarespace: 'squarespace',
    webflow: 'webflow',
    zapier: 'zapier',
    ifttt: 'ifttt',
    make: 'make',
    n8n: 'n8n',
    nodered: 'nodered',
    homeassistant: 'homeassistant',
    openhab: 'openhab',
    homebridge: 'homebridge',
    tasmota: 'tasmota',
    esphome: 'esphome',
    arduino: 'arduino',
    raspberrypi: 'raspberrypi',
    arm: 'arm',
    intel: 'intel',
    amd: 'amd',
    nvidia: 'nvidia',
    qualcomm: 'qualcomm',
    mediatek: 'mediatek',
    broadcom: 'broadcom',
    stmicroelectronics: 'stmicroelectronics',
    nxp: 'nxp',
    samsung: 'samsung',
    lg: 'lg',
    sony: 'sony',
    sharp: 'sharp',
    toshiba: 'toshiba',
    hitachi: 'hitachi',
    mitsubishi: 'mitsubishi',
    fujitsu: 'fujitsu',
    nec: 'nec',
    epson: 'epson',
    hp: 'hp',
    dell: 'dell',
    lenovo: 'lenovo',
    asus: 'asus',
    acer: 'acer',
    msi: 'msi',
    corsair: 'corsair',
    coolermaster: 'coolermaster',
    nzxt: 'nzxt'
  };

  // Generate Lucide icons mapping
  const lucideMapping = lucideIcons.reduce((acc, icon) => {
    const key = icon.charAt(0).toLowerCase() + icon.slice(1);
    acc[key] = icon;
    return acc;
  }, {});

  console.log('Generated mappings:');
  console.log('Lucide icons:', Object.keys(lucideMapping).length);
  console.log('Simple icons:', Object.keys(simpleIconMappings).length);
  
  return { lucideMapping, simpleIconMappings };
};

if (require.main === module) {
  const mappings = generateIconMappings();
  console.log('Lucide mapping:', mappings.lucideMapping);
  console.log('Simple icons mapping:', mappings.simpleIconMappings);
}

module.exports = { generateIconMappings }; 