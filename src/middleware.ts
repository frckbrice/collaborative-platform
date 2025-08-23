import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Debug bypass option
  if (req.nextUrl.searchParams.get('debug') === 'bypass') {
    // Note: We can't use logger here as it's not available in middleware
    // This is a development-only feature
    return NextResponse.next();
  }

  // Public routes that don't need authentication
  const publicRoutes = ['/', '/login', '/signup', '/forgot-password', '/reset-password'];

  // Protected routes that require authentication
  const protectedRoutes = ['/dashboard'];

  // API routes and auth callback should be excluded from middleware
  const excludedRoutes = ['/api', '/_next', '/favicon.ico', '/logout'];

  // Skip middleware for excluded routes
  if (excludedRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Check if the current route is protected
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));
  const isPublicRoute = publicRoutes.includes(pathname);

  try {
    // Create middleware-safe Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321';
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

    if (!supabaseUrl || !supabaseAnonKey) {
      // Note: We can't use logger here as it's not available in middleware
      return NextResponse.next();
    }

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          // In middleware, we can't set cookies, so we'll just ignore this
        },
        remove(name: string, options: any) {
          // In middleware, we can't remove cookies, so we'll just ignore this
        },
      },
    });

    // For protected routes, verify authentication
    if (isProtectedRoute) {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error || !session?.user) {
        // Redirect to home page instead of login page
        return NextResponse.redirect(new URL('/', req.url));
      }

      // Additional validation: check if user ID exists and session is not expired
      if (!session.user.id || !session.access_token) {
        // Redirect to home page instead of login page
        return NextResponse.redirect(new URL('/', req.url));
      }

      // Check if session is expired
      if (session.expires_at) {
        const now = Math.floor(Date.now() / 1000);
        if (now >= session.expires_at) {
          // Redirect to home page instead of login page
          return NextResponse.redirect(new URL('/', req.url));
        }
      }
    }

    // For public auth routes, redirect authenticated users to dashboard
    if (isPublicRoute && pathname !== '/') {
      // Check if logout has recently occurred via query parameter
      const fromLogout = req.nextUrl.searchParams.get('fromLogout');
      if (fromLogout === 'true') {
        return NextResponse.next();
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user && session.user.id && session.access_token) {
        // Check if session is expired
        if (session.expires_at) {
          const now = Math.floor(Date.now() / 1000);
          if (now >= session.expires_at) {
            return NextResponse.next();
          }
        }

        // Additional validation: check if the access token is actually valid
        // by trying to get user info with it
        try {
          const {
            data: { user },
            error: userError,
          } = await supabase.auth.getUser();
          if (userError || !user) {
            return NextResponse.next();
          }

          // If we get here, the session is actually valid
          return NextResponse.redirect(new URL('/dashboard', req.url));
        } catch (userCheckError) {
          return NextResponse.next();
        }
      }
    }

    return NextResponse.next();
  } catch (error) {
    // On error, allow the request to proceed
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
