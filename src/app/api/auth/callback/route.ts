import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/server';
import { ensureUserProfile } from '@/utils/auth-utils';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/dashboard';
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');

  console.log('Auth callback received:', { code: !!code, error, errorDescription });

  try {
    if (error) {
      console.error('OAuth error:', error, errorDescription);
      const errorUrl = new URL('/login', origin);
      errorUrl.searchParams.set('error', error);
      if (errorDescription) {
        errorUrl.searchParams.set('error_description', errorDescription);
      }
      return NextResponse.redirect(errorUrl);
    }

    if (!code) {
      console.error('No code provided in auth callback');
      const errorUrl = new URL('/login', origin);
      errorUrl.searchParams.set('error', 'no_code');
      errorUrl.searchParams.set('error_description', 'No authorization code received');
      return NextResponse.redirect(errorUrl);
    }

    // Exchange the code for a session
    const supabase = await createClient();
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.exchangeCodeForSession(code);

    if (sessionError) {
      console.error('Error exchanging code for session:', sessionError);
      const errorUrl = new URL('/login', origin);
      errorUrl.searchParams.set('error', 'session_error');
      errorUrl.searchParams.set('error_description', sessionError.message);
      return NextResponse.redirect(errorUrl);
    }

    if (!session?.user) {
      console.error('No session or user after code exchange');
      const errorUrl = new URL('/login', origin);
      errorUrl.searchParams.set('error', 'no_session');
      errorUrl.searchParams.set('error_description', 'Failed to create session');
      return NextResponse.redirect(errorUrl);
    }

    console.log('Auth callback successful for user:', session.user.id);

    // Ensure user profile exists
    try {
      await ensureUserProfile(session.user);
      console.log('User profile ensured successfully');
    } catch (profileError) {
      console.error('Error ensuring user profile:', profileError);
      // Continue anyway - auth was successful
    }

    // Create response and set cookies
    const response = NextResponse.redirect(new URL(next, origin));

    // Set session cookies manually if needed (usually handled by Supabase client)
    if (session.access_token && session.refresh_token) {
      const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax' as const,
        path: '/',
      };

      response.cookies.set('sb-access-token', session.access_token, {
        ...cookieOptions,
        maxAge: session.expires_in || 3600, // 1 hour default
      });

      response.cookies.set('sb-refresh-token', session.refresh_token, {
        ...cookieOptions,
        maxAge: 60 * 60 * 24 * 30, // 30 days
      });
    }

    return response;
  } catch (error) {
    console.error('Unexpected error in auth callback:', error);
    const errorUrl = new URL('/login', origin);
    errorUrl.searchParams.set('error', 'callback_error');
    errorUrl.searchParams.set(
      'error_description',
      'An unexpected error occurred during authentication'
    );
    return NextResponse.redirect(errorUrl);
  }
}
