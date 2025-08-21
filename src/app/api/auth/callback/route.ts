import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/server';

export async function POST(request: NextRequest) {
  try {
    console.log('Auth callback - Starting POST request');
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const error = searchParams.get('error') || searchParams.get('error_description');

    console.log('Auth callback - Code:', code ? 'present' : 'missing');
    console.log('Auth callback - Error:', error || 'none');

    if (error) {
      console.error('Auth callback error:', error);
      return NextResponse.redirect(
        new URL(`/login?error=${encodeURIComponent(error)}`, request.url)
      );
    }

    if (code) {
      console.log('Auth callback - Attempting to exchange code for session');
      const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

      console.log('Auth callback - Exchange result:', {
        success: !exchangeError,
        error: exchangeError?.message,
        user: data?.user ? 'present' : 'missing',
        session: data?.session ? 'present' : 'missing',
      });

      if (exchangeError) {
        console.error('Code exchange error:', exchangeError);
        return NextResponse.redirect(new URL('/login?error=auth_failed', request.url));
      }

      if (data?.user && data?.session) {
        console.log('Auth callback - Successfully authenticated user:', data.user.email);
        console.log('Auth callback - Session established, redirecting to dashboard');

        // Set cookies and redirect to dashboard
        const response = NextResponse.redirect(new URL('/dashboard?from=oauth', request.url));

        // Ensure cookies are properly set for the session
        if (data.session.access_token) {
          response.cookies.set('sb-access-token', data.session.access_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7, // 7 days
          });
        }

        if (data.session.refresh_token) {
          response.cookies.set('sb-refresh-token', data.session.refresh_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 30, // 30 days
          });
        }

        return response;
      } else {
        console.error('Auth callback - No user or session data after successful exchange');
        return NextResponse.redirect(new URL('/login?error=no_user_data', request.url));
      }
    }

    // No code or error provided
    console.error('Auth callback - No code provided');
    return NextResponse.redirect(new URL('/login?error=invalid_callback', request.url));
  } catch (error) {
    console.error('Auth callback - Unexpected error:', error);
    return NextResponse.redirect(new URL('/login?error=server_error', request.url));
  }
}

export async function GET(request: NextRequest) {
  // Handle GET requests (for direct browser navigation)
  return POST(request);
}
