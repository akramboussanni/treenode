import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { isProtectedRoute } from '@/lib/auth-config'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if user has session cookie
  const hasSession = request.cookies.has('session')

  // Only redirect to login if accessing protected routes without auth
  if (isProtectedRoute(pathname) && !hasSession) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Redirect authenticated users away from login/register to dashboard
  if ((pathname === '/login' || pathname === '/register') && hasSession) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * all except
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
} 