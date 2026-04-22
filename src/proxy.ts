import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/proxy'

export async function proxy(request: NextRequest) {
  // 1. Manejar redirección de /dashboard/* a /*
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    const newPath = request.nextUrl.pathname.replace(/^\/dashboard/, '') || '/'
    console.log(`[Proxy] Redirecting legacy path: ${request.nextUrl.pathname} -> ${newPath}`)
    return NextResponse.redirect(new URL(newPath, request.url))
  }

  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
