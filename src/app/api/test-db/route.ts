import { NextResponse } from 'next/server';
import { db } from '@/lib/supabase/db';

export async function GET() {
  try {
    // Test basic database connection
    const result = await db.query.users.findMany({
      limit: 1
    });
    
    return NextResponse.json({ 
      success: true, 
      message: 'Database connection successful',
      userCount: result.length 
    });
  } catch (error) {
    console.error('Database connection test failed:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}
