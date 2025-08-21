// import { NextRequest, NextResponse } from 'next/server';
// import { createClient } from '@/utils/server';

// export async function POST(request: NextRequest) {
//   try {
//     console.log('Auth callback - Starting POST request');
//     const supabase = await createClient();
//     const { searchParams } = new URL(request.url);
//     const code = searchParams.get('code');
//     const error = searchParams.get('error') || searchParams.get('error_description');

//     console.log('Auth callback - Code:', code ? 'present' : 'missing');
//     console.log('Auth callback - Error:', error || 'none');

//     if (error) {
//       console.error('Auth callback error:', error);
//       return NextResponse.redirect(
//         new URL(`/login?error=${encodeURIComponent(error)}`, request.url)
//       );
//     }

//     if (code) {
//       console.log('Auth callback - Attempting to exchange code for session');
//       const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

//       console.log('Auth callback - Exchange result:', {
//         success: !exchangeError,
//         error: exchangeError?.message,
//         user: data?.user ? 'present' : 'missing',
//       });

//       if (exchangeError) {
//         console.error('Code exchange error:', exchangeError);
//         return NextResponse.redirect(new URL('/login?error=auth_failed', request.url));
//       }

//       if (data?.user) {
//         console.log('Auth callback - Successfully authenticated user:', data.user.email);
//         // Successful authentication
//         return NextResponse.redirect(new URL('/dashboard', request.url));
//       } else {
//         console.error('Auth callback - No user data after successful exchange');
//         return NextResponse.redirect(new URL('/login?error=no_user_data', request.url));
//       }
//     }

//     // No code or error provided
//     console.error('Auth callback - No code provided');
//     return NextResponse.redirect(new URL('/login?error=invalid_callback', request.url));
//   } catch (error) {
//     console.error('Auth callback - Unexpected error:', error);
//     return NextResponse.redirect(new URL('/login?error=server_error', request.url));
//   }
// }

// export async function GET(request: NextRequest) {
//   // Handle GET requests (for direct browser navigation)
//   return POST(request);
// 

import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const error = url.searchParams.get('error');

  if (error) {
    return NextResponse.redirect(new URL(`/login?error=${error}`, request.url));
  }

  if (code) {
    const supabase = createRouteHandlerClient({ cookies });
    await supabase.auth.exchangeCodeForSession(code);
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.redirect(new URL('/login?error=missing_code', request.url));
}


