import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get current session
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    // Get user if session exists
    let user = null;
    if (session?.user) {
      const {
        data: { user: userData },
      } = await supabase.auth.getUser();
      user = userData;
    }

    // Get all cookies
    const cookies = request.cookies.getAll();

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      hasSession: !!session,
      sessionError: error?.message || null,
      user: user
        ? {
            id: user.id,
            email: user.email,
            created_at: user.created_at,
          }
        : null,
      cookies: cookies.map((c) => ({ name: c.name, value: c.value })),
      headers: {
        authorization: request.headers.get('authorization'),
        cookie: request.headers.get('cookie'),
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
