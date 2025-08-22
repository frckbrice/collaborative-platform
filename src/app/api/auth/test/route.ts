import { NextResponse } from 'next/server';
import { createClient } from '@/utils/server';

export async function GET() {
  try {
    console.log('Testing Supabase connection...');

    // Check environment variables
    const envInfo = {
      NODE_ENV: process.env.NODE_ENV,
      SUPABASE_URL: process.env.SUPABASE_URL ? 'SET' : 'MISSING',
      SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY ? 'SET' : 'MISSING',
      NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL ? 'SET' : 'MISSING',
      SUPABASE_URL_LENGTH: process.env.SUPABASE_URL?.length || 0,
      SUPABASE_ANON_KEY_LENGTH: process.env.SUPABASE_ANON_KEY?.length || 0,
    };

    console.log('Environment info:', envInfo);

    const supabase = await createClient();

    // Test basic connection
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      console.error('Auth error:', userError);
      return NextResponse.json(
        {
          success: false,
          error: userError.message,
          type: 'auth_error',
          envInfo,
          timestamp: new Date().toISOString(),
        },
        { status: 500 }
      );
    }

    // Test database connection
    const { data: dbData, error: dbError } = await supabase.from('users').select('count').limit(1);

    if (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json(
        {
          success: false,
          error: dbError.message,
          type: 'database_error',
          envInfo,
          timestamp: new Date().toISOString(),
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Supabase connection successful',
      user: user ? 'authenticated' : 'not_authenticated',
      database: 'connected',
      envInfo,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Test route error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        type: 'general_error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
