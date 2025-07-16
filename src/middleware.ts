// import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from "@/utils/server";


export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = await createClient();
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  console.log('Middleware - URL:', req.nextUrl.pathname);
  console.log('Middleware - Session:', session ? 'exists' : 'none');
  console.log('Middleware - User:', session?.user?.email);
  console.log('Middleware - Session Error:', sessionError);

  // Handle session errors gracefully
  if (sessionError) {
    console.error('Middleware - Session error:', sessionError);
    // Clear any invalid session and redirect to login
    if (req.nextUrl.pathname.startsWith('/dashboard')) {
      return NextResponse.redirect(new URL('/login?error=session_error', req.url));
    }
  }

  //every  non logged in user is redirected to login
  if (req.nextUrl.pathname.startsWith('/dashboard')) {
    if (!session) {
      console.log('Middleware - Redirecting to login (no session)');
      return NextResponse.redirect(new URL('/login?error=no_session', req.url));
    }
  }

  // console.log(req.nextUrl)
  // in case of error redirect to error home page
  const emailLinkError = 'Email link is invalid or has expired';
  if (
    req.nextUrl.searchParams.get('error_description') === emailLinkError &&
    req.nextUrl.pathname !== '/signup'
  ) {
    return NextResponse.redirect(
      new URL(
        `/signup?error_description=${req.nextUrl.searchParams.get('error_description')}`,
        req.url
      )
    );
  }

  // if the session already exists, simply redirect to dashboard
  if (['/login', '/signup'].includes(req.nextUrl.pathname)) {
    console.log('Middleware - Checking auth pages, session exists:', !!session);
    if (session) {
      console.log('Middleware - Redirecting to dashboard (session exists)');
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
  }

  // Prevent redirect loops by not redirecting if already on dashboard routes
  if (req.nextUrl.pathname === '/dashboard' && session) {
    console.log('Middleware - Already on dashboard with session, allowing to continue');
    return res;
  }
  return res;
}

export const config = {
  matcher: ["/", "/signup", "/login", "/dashboard/:path*"],
};
