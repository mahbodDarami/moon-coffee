import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

// 2-hour session timeout in milliseconds
const SESSION_TIMEOUT_MS = 2 * 60 * 60 * 1000 // 7,200,000 ms
const SESSION_COOKIE_NAME = 'session_start'

const protectedRoutes = ['/cart', '/checkout', '/orders', '/account']
const authRoutes = ['/login', '/register', '/forgot-password', '/reset-password']

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session — IMPORTANT: use getUser() not getSession()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // --- 2-hour session timeout (rolling window) ---
  if (user) {
    const sessionStartCookie = request.cookies.get(SESSION_COOKIE_NAME)
    const now = Date.now()

    if (sessionStartCookie) {
      const sessionStart = parseInt(sessionStartCookie.value, 10)

      if (!isNaN(sessionStart) && now - sessionStart > SESSION_TIMEOUT_MS) {
        // Session expired — sign out and redirect to login
        await supabase.auth.signOut()
        const expiredUrl = request.nextUrl.clone()
        expiredUrl.pathname = '/login'
        expiredUrl.searchParams.set('expired', 'true')
        const expiredResponse = NextResponse.redirect(expiredUrl)
        expiredResponse.cookies.delete(SESSION_COOKIE_NAME)
        return expiredResponse
      }
    }

    // Update session_start cookie — rolling window resets on every request
    supabaseResponse.cookies.set(SESSION_COOKIE_NAME, now.toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: SESSION_TIMEOUT_MS / 1000, // 7200 seconds
    })
  } else {
    // No user — clean up session_start cookie if it exists
    if (request.cookies.has(SESSION_COOKIE_NAME)) {
      supabaseResponse.cookies.delete(SESSION_COOKIE_NAME)
    }
  }

  // --- Route protection ---
  // Redirect unauthenticated users from protected routes to login
  if (!user && protectedRoutes.some((route) => pathname.startsWith(route))) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(url)
  }

  // Redirect authenticated users from auth routes to home
  if (user && authRoutes.some((route) => pathname.startsWith(route))) {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|images|videos|.*\\.(?:svg|png|jpg|jpeg|gif|webp|mp4)$).*)',
  ],
}
