import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Debug bypass option
  if (req.nextUrl.searchParams.get('debug') === 'bypass') {
    console.log('Middleware: Debug bypass enabled, skipping all checks');
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

  console.log('Middleware: Processing route:', pathname, {
    isProtectedRoute,
    isPublicRoute,
    userAgent: req.headers.get('user-agent')?.substring(0, 50),
  });

  try {
    // Create middleware-safe Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321';
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Middleware: Missing Supabase configuration');
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
      console.log('Middleware: Checking authentication for protected route:', pathname);
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      console.log('Middleware: Session check result:', {
        hasSession: !!session,
        hasUser: !!session?.user,
        userId: session?.user?.id,
        userEmail: session?.user?.email,
        hasAccessToken: !!session?.access_token,
        expiresAt: session?.expires_at,
        error: error?.message,
      });

      if (error || !session?.user) {
        console.log('Middleware: No valid session found, redirecting to home page');
        // Redirect to home page instead of login page
        return NextResponse.redirect(new URL('/', req.url));
      }

      // Additional validation: check if user ID exists and session is not expired
      if (!session.user.id || !session.access_token) {
        console.log('Middleware: Invalid session data, redirecting to home page');
        // Redirect to home page instead of login page
        return NextResponse.redirect(new URL('/', req.url));
      }

      // Check if session is expired
      if (session.expires_at) {
        const now = Math.floor(Date.now() / 1000);
        if (now >= session.expires_at) {
          console.log('Middleware: Session expired, redirecting to home page');
          // Redirect to home page instead of login page
          return NextResponse.redirect(new URL('/', req.url));
        }
      }

      console.log('Middleware: Valid session found for user:', session.user.email);
    }

    // For public auth routes, redirect authenticated users to dashboard
    if (isPublicRoute && pathname !== '/') {
      console.log('Middleware: Checking authentication for public auth route:', pathname);

      // Check if logout has recently occurred via query parameter
      const fromLogout = req.nextUrl.searchParams.get('fromLogout');
      if (fromLogout === 'true') {
        console.log(
          'Middleware: Logout detected via query param, bypassing session check for public auth route'
        );
        return NextResponse.next();
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();

      console.log('Middleware: Public route session check:', {
        hasSession: !!session,
        hasUser: !!session?.user,
        userId: session?.user?.id,
        userEmail: session?.user?.email,
        hasAccessToken: !!session?.access_token,
        expiresAt: session?.expires_at,
        pathname,
        fromLogout,
      });

      if (session?.user && session.user.id && session.access_token) {
        // Check if session is expired
        if (session.expires_at) {
          const now = Math.floor(Date.now() / 1000);
          if (now >= session.expires_at) {
            console.log('Middleware: Session expired for public auth route');
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
            console.log('Middleware: Session has invalid user, treating as logged out');
            return NextResponse.next();
          }

          // If we get here, the session is actually valid
          console.log('Middleware: User authenticated, redirecting to dashboard');
          return NextResponse.redirect(new URL('/dashboard', req.url));
        } catch (userCheckError) {
          console.log(
            'Middleware: Error checking user validity, treating as logged out:',
            userCheckError
          );
          return NextResponse.next();
        }
      } else {
        console.log('Middleware: No valid session found for public auth route');
      }
    }

    return NextResponse.next();
  } catch (error) {
    console.error('Middleware error:', error);
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
