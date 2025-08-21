import { createBrowserClient } from '@supabase/ssr';

// Determine the correct Supabase URL and key based on environment
const getSupabaseConfig = () => {
  if (typeof window !== 'undefined') {
    // Client-side: always use NEXT_PUBLIC variables
    return {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
      anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    };
  }
  
  // Server-side: use environment-specific variables
  if (process.env.NODE_ENV === 'production') {
    return {
      url: process.env.SUPABASE_URL!,
      anonKey: process.env.SUPABASE_ANON_KEY!,
    };
  }
  
  return {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  };
};

const config = getSupabaseConfig();

export const client = createBrowserClient(
  config.url,
  config.anonKey,
  {
    realtime: {
      params: {
        eventsPerSecond: 2,
      },
    },
    auth: {
      // Ensure proper auth flow
      flowType: 'pkce',
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  }
);

export const createClient = () => client;

export const REALTIME_URL = process.env.NEXT_PUBLIC_SUPABASE_REALTIMEURL
  ? `${process.env.NEXT_PUBLIC_SUPABASE_REALTIMEURL}/realtime/v1`
  : '';

export const API_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// PostgREST API Helper Functions
// These use the same client but provide convenient methods for database operations

/**
 * Helper function for GET requests using Supabase client
 */
export const postgrestGet = async (endpoint: string, params?: Record<string, string>) => {
  try {
    console.log('🔍 postgrestGet: Starting query for endpoint:', endpoint, 'with params:', params);
    console.log('🔍 postgrestGet: Supabase client available:', !!client);
    console.log('🔍 postgrestGet: Environment variables:', {
      NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    });

    let query = client.from(endpoint).select('*');

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value.startsWith('eq.')) {
          const actualValue = value.substring(3);
          console.log('🔍 postgrestGet: Adding eq filter:', key, '=', actualValue);
          query = query.eq(key, actualValue);
        } else if (value.startsWith('in.')) {
          const actualValue = value.substring(3);
          const values = actualValue
            .slice(1, -1)
            .split(',')
            .map((v) => v.trim());
          console.log('🔍 postgrestGet: Adding in filter:', key, '=', values);
          query = query.in(key, values);
        } else if (value.startsWith('order.')) {
          const orderInfo = value.substring(6);
          const [column, direction] = orderInfo.split('.');
          console.log('🔍 postgrestGet: Adding order:', column, direction);
          query = query.order(column, { ascending: direction === 'asc' });
        }
      });
    }

    console.log('🔍 postgrestGet: Executing query...');
    const { data, error } = await query;
    console.log('🔍 postgrestGet: Query result:', { data, error });

    if (error) {
      console.error('❌ postgrestGet: Supabase query failed:', error);
      throw new Error(`Supabase query failed: ${error.message}`);
    }

    console.log('✅ postgrestGet: Query successful, returning data');
    return data;
  } catch (error) {
    console.error(`❌ postgrestGet: Error for ${endpoint}:`, error);
    throw error;
  }
};

/**
 * Helper function for POST requests using Supabase client
 */
export const postgrestPost = async (endpoint: string, data: any) => {
  try {
    const { data: result, error } = await client.from(endpoint).insert(data).select();

    if (error) {
      throw new Error(`Supabase insert failed: ${error.message}`);
    }

    return result;
  } catch (error) {
    console.error(`Error in postgrestPost for ${endpoint}:`, error);
    throw error;
  }
};

/**
 * Helper function for PUT requests using Supabase client
 */
export const postgrestPut = async (
  endpoint: string,
  data: any,
  params?: Record<string, string>
) => {
  try {
    let query = client.from(endpoint).update(data);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value.startsWith('eq.')) {
          const actualValue = value.substring(3);
          query = query.eq(key, actualValue);
        }
      });
    }

    const { data: result, error } = await query.select();

    if (error) {
      throw new Error(`Supabase update failed: ${error.message}`);
    }

    return result;
  } catch (error) {
    console.error(`Error in postgrestPut for ${endpoint}:`, error);
    throw error;
  }
};

/**
 * Helper function for DELETE requests using Supabase client
 */
export const postgrestDelete = async (endpoint: string, params?: Record<string, string>) => {
  try {
    let query = client.from(endpoint).delete();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value.startsWith('eq.')) {
          const actualValue = value.substring(3);
          query = query.eq(key, actualValue);
        }
      });
    }

    const { data: result, error } = await query.select();

    if (error) {
      throw new Error(`Supabase delete failed: ${error.message}`);
    }

    return result;
  } catch (error) {
    console.error(`Error in postgrestDelete for ${endpoint}:`, error);
    throw error;
  }
};
