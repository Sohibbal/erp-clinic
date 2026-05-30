import { NextRequest, NextResponse } from 'next/server'
import { verifySession } from '@/lib/session'

// Define protected and public routes
const publicRoutes = ['/login']
const protectedRoutes = ['/kasir', '/apoteker', '/owner']

export async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname
  
  // Define which role is needed for the path
  let requiredRole: string | null = null;
  if (path.startsWith('/kasir')) requiredRole = 'kasir';
  else if (path.startsWith('/apoteker')) requiredRole = 'apoteker';
  else if (path.startsWith('/owner')) requiredRole = 'owner';

  // If the path requires a specific role
  if (requiredRole) {
    const session = await verifySession(requiredRole);
    
    // If not authenticated for this role, redirect to login
    if (!session.isAuth) {
      return NextResponse.redirect(new URL('/login', req.nextUrl))
    }
  }

  // NOTE: We no longer redirect away from /login or /
  // If a user goes to /login, they can just login to a new role, 
  // which will just set that role's cookie.

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     * - .*\.(png|jpg|jpeg|gif|svg|webp|ico|css)$ (assets)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico|css)$).*)',
  ],
}
