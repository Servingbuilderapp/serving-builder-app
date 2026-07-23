import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const isAuthRoute = request.nextUrl.pathname.startsWith('/login') || 
                      request.nextUrl.pathname.startsWith('/signup') || 
                      request.nextUrl.pathname.startsWith('/forgot-password') ||
                      request.nextUrl.pathname.startsWith('/auth')
  
  const isPublicRoute = request.nextUrl.pathname === '/'
  const isApiRoute = request.nextUrl.pathname.startsWith('/api')

  if (!user && !isAuthRoute && !isPublicRoute && !isApiRoute) {
    // no user and not a public/auth route, redirect to login
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    const redirectRes = NextResponse.redirect(url)
    
    // Preserve cookies set by Supabase (like refreshed tokens)
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      redirectRes.cookies.set(cookie.name, cookie.value, cookie.options)
    })
    return redirectRes
  }

  if (user && isAuthRoute && !request.nextUrl.pathname.startsWith('/auth/callback')) {
    // user is logged in, redirect them away from auth pages
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    const redirectRes = NextResponse.redirect(url)
    
    // Preserve cookies set by Supabase
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      redirectRes.cookies.set(cookie.name, cookie.value, cookie.options)
    })
    return redirectRes
  }

  return supabaseResponse
}
