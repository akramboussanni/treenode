// Protected routes that require authentication
export const PROTECTED_ROUTES = ['/nodes', '/dashboard'] as const;

export type ProtectedRoute = typeof PROTECTED_ROUTES[number];

// Check if a path is a protected route
export function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ROUTES.some(route => pathname.startsWith(route));
} 