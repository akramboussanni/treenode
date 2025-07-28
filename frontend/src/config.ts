export const config = {
  backendUrl: process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:9520',
  appName: 'Treenode',
  appDescription: 'Create beautiful link pages for your online presence',
  // Dynamic base URL for public pages
  getBaseUrl: () => {
    if (typeof window !== 'undefined') {
      return window.location.origin;
    }
    return process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  },
} as const;

export type Config = typeof config; 