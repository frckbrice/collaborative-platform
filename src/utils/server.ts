import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

// Lazy client creation with proper error handling
let _client: any = null;

export async function createClient() {
    // Only create real client at runtime
    if (!_client) {
        try {
            const cookieStore = await cookies();

            // Determine environment and use appropriate credentials
            let supabaseUrl: string;
            let supabaseAnonKey: string;

            if (process.env.NODE_ENV === 'production') {
                // Production: Use production credentials
                supabaseUrl = process.env.SUPABASE_URL || '';
                supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';
            } else {
                // Development: Use local credentials
                supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321';
                supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
            }

            if (!supabaseUrl || !supabaseAnonKey) {
                // In development, provide helpful error messages
                if (process.env.NODE_ENV === 'development') {
                    console.error('Missing Supabase configuration:', {
                        NODE_ENV: process.env.NODE_ENV,
                        SUPABASE_URL: !!process.env.SUPABASE_URL,
                        SUPABASE_ANON_KEY: !!process.env.SUPABASE_ANON_KEY,
                        NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
                        NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
                    });
                    throw new Error('Missing Supabase configuration for current environment');
                }

                // In production, return a safe fallback that won't break the build
                // but will fail gracefully at runtime with proper error handling
                return {
                    auth: {
                        getUser: async () => {
                            throw new Error('Supabase client not properly configured');
                        },
                    },
                } as any;
            }

            _client = createServerClient(supabaseUrl, supabaseAnonKey, {
                cookies: {
                    get(name: string) {
                        return cookieStore.get(name)?.value;
                    },
                    set(name: string, value: string, options: CookieOptions) {
                        try {
                            cookieStore.set({ name, value, ...options });
                        } catch (error) {
                            // The `set` method was called from a Server Component.
                            // This can be ignored if you have middleware refreshing
                            // user sessions.
                        }
                    },
                    remove(name: string, options: CookieOptions) {
                        try {
                            cookieStore.set({ name, value: '', ...options });
                        } catch (error) {
                            // The `delete` method was called from a Server Component.
                            // This can be ignored if you have middleware refreshing
                            // user sessions.
                        }
                    },
                },
            });
        } catch (error) {
            // If cookies() fails (e.g., during build), return a safe fallback
            if (process.env.NODE_ENV !== 'development') {
                return {
                    auth: {
                        getUser: async () => {
                            throw new Error('Supabase client not properly configured');
                        },
                    },
                } as any;
            }
            throw error;
        }
    }

    return _client;
}
