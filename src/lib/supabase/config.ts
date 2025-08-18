// Supabase configuration for both local and production environments
export const supabaseConfig = {
  // Production Supabase (from supabase.com)
  production: {
    url: process.env.SUPABASE_URL || '',  // Production Supabase URL
    anonKey: process.env.SUPABASE_ANON_KEY || '',  // Production anon key
    serviceRoleKey: process.env.SUPABASE_ROLE_KEY || '',  // Production service role key
    databaseUrl: process.env.SUPABASE_DATABASE_URL || '',  // Production database URL
    projectId: process.env.SUPABASE_PROJECT_ID || '',  // Production project ID
  },
  
  // Local Supabase (for development)
  local: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321',  // Local Supabase URL
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',  // Local anon key
    serviceRoleKey: process.env.NEXT_PUBLIC_SERVICE_ROLE_KEY || '',  // Local service role key
    databaseUrl: process.env.NEXT_PUBLIC_DATABASE_URL || 'postgresql://postgres:postgres@127.0.0.1:54322/postgres',  // Local database URL
  },
};

// Helper function to get the appropriate Supabase URL for current environment
export function getSupabaseUrl(): string {
  if (process.env.NODE_ENV === 'production') {
    return process.env.SUPABASE_URL || '';  // Production: SUPABASE_URL
  }
  return process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321';  // Local: NEXT_PUBLIC_SUPABASE_URL
}

// Helper function to get the appropriate Supabase anon key for current environment
export function getSupabaseAnonKey(): string {
  if (process.env.NODE_ENV === 'production') {
    return process.env.SUPABASE_ANON_KEY || '';  // Production: SUPABASE_ANON_KEY
  }
  return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';  // Local: NEXT_PUBLIC_SUPABASE_ANON_KEY
}

// Helper function to get the appropriate database URL for current environment
export function getDatabaseUrl(): string {
  if (process.env.NODE_ENV === 'production') {
    return process.env.SUPABASE_DATABASE_URL || '';  // Production: SUPABASE_DATABASE_URL
  }
  return process.env.NEXT_PUBLIC_DATABASE_URL || 'postgresql://postgres:postgres@127.0.0.1:54322/postgres';  // Local: NEXT_PUBLIC_DATABASE_URL
}

// Helper function to check if we're in production
export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}

// Helper function to get the public URL for current environment
export function getPublicUrl(): string {
  if (process.env.NODE_ENV === 'production') {
    return process.env.NEXT_PUBLIC_URL || '';  // Production: NEXT_PUBLIC_URL
  }
  return 'http://localhost:3000';  // Local: hardcoded localhost:3000
}
