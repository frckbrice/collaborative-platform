import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check if user has an active session
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error) {
      console.error('Error checking session:', error);
      return NextResponse.json({ error: 'Session check failed' }, { status: 500 });
    }

    if (session) {
      console.log('Session found for user:', session.user.id);
      return NextResponse.json({
        authenticated: true,
        user: session.user,
      });
    } else {
      console.log('No active session found');
      return NextResponse.json(
        {
          authenticated: false,
        },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Unexpected error in session check:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}
