import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getUserPrimaryWorkspace } from '@/lib/utils/auth-utils';

export async function GET(req: NextRequest) {
  const requestURL = new URL(req.url);
  const code = requestURL.searchParams.get('code');

  console.log("\n\n received code from auth user \n\n", code, "\n\n")

  if (code) {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user }, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error('Error exchanging code for session:', error);
      return NextResponse.redirect(`${requestURL.origin}/login?error=auth_failed`);
    }

    if (user) {
      // Check if user has a workspace
      try {
        const { workspaceId, error: workspaceError } = await getUserPrimaryWorkspace(user.id);

        if (workspaceError) {
          console.error('Error checking user workspace:', workspaceError);
          // Fallback to dashboard if there's a database error
          return NextResponse.redirect(`${requestURL.origin}/dashboard`);
        }

        if (workspaceId) {
          // User has a workspace, redirect to it
          return NextResponse.redirect(`${requestURL.origin}/dashboard/${workspaceId}`);
        } else {
          // User doesn't have a workspace, redirect to dashboard setup
          return NextResponse.redirect(`${requestURL.origin}/dashboard`);
        }
      } catch (dbError) {
        console.error('Error checking user workspace:', dbError);
        // Fallback to dashboard if there's a database error
        return NextResponse.redirect(`${requestURL.origin}/dashboard`);
      }
    }

    // Fallback redirect
    return NextResponse.redirect(`${requestURL.origin}/dashboard`);
  }

  // No code provided, redirect to login
  return NextResponse.redirect(`${requestURL.origin}/login?error=no_code`);
}
