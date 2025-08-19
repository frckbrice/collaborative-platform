import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  // Add special handling for signup redirect
  if (req.nextUrl.searchParams.get('from') === 'signup') {
    // Allow a grace period for session establishment
    console.log('Signup redirect detected, allowing access');
    return res;
  }

  const supabase = await createClient();

  // Add retry logic for session checks to handle timing issues
  let session = null;
  let sessionError = null;
  let attempts = 0;
  const maxAttempts = 3;

  while (attempts < maxAttempts) {
    try {
      const result = await supabase.auth.getSession();
      session = result.data.session;
      sessionError = result.error;

      if (session || sessionError) {
        break; // We got a result, exit the loop
      }

      // If no session and no error, wait a bit and try again
      if (attempts < maxAttempts - 1) {
        await new Promise((resolve) => setTimeout(resolve, 300)); // 300ms delay
      }
      attempts++;
    } catch (error) {
      console.error('Middleware session check error:', error);
      sessionError = error as any;
      break;
    }
  }

  // Handle session errors gracefully
  if (sessionError && !sessionError.message?.includes('refresh_token_not_found')) {
    console.error('Session error in middleware:', sessionError);
    if (req.nextUrl.pathname.startsWith('/dashboard')) {
      return NextResponse.redirect(new URL('/login?error=session_error', req.url));
    }
  }

  // Protected routes - redirect to login if no session
  if (req.nextUrl.pathname.startsWith('/dashboard')) {
    if (!session) {
      console.log('Middleware: No session found, redirecting to login');
      return NextResponse.redirect(new URL('/login?error=no_session', req.url));
    }
  }

  // Handle email link errors
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

  // Redirect authenticated users away from auth pages
  if (['/login', '/signup'].includes(req.nextUrl.pathname)) {
    if (session) {
      console.log('Authenticated user on auth page, redirecting to dashboard');
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
  }

  return res;
}

export const config = {
  matcher: ['/', '/signup', '/login', '/dashboard/:path*'],
};
