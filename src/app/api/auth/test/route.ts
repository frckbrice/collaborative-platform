import { NextResponse } from 'next/server';
import { createClient } from '@/utils/server';

export async function GET() {
  try {
    console.log('Testing Supabase connection...');
    
    const supabase = await createClient();
    
    // Test basic connection
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.error('Auth error:', userError);
      return NextResponse.json({ 
        success: false, 
        error: userError.message,
        type: 'auth_error'
      }, { status: 500 });
    }
    
    // Test database connection
    const { data: dbData, error: dbError } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json({ 
        success: false, 
        error: dbError.message,
        type: 'database_error'
      }, { status: 500 });
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Supabase connection successful',
      user: user ? 'authenticated' : 'not_authenticated',
      database: 'connected'
    });
    
  } catch (error) {
    console.error('Test route error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error',
      type: 'general_error'
    }, { status: 500 });
  }
}
