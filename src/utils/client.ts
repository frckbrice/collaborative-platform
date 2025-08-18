import { createBrowserClient } from '@supabase/ssr'


export const client = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
        realtime: {
            params: {
                eventsPerSecond: 2,
            },
        },
    }
);

export const createClient = () => client;

export const REALTIME_URL = process.env.NEXT_PUBLIC_SUPABASE_REALTIMEURL
    ? `${process.env.NEXT_PUBLIC_SUPABASE_REALTIMEURL}/realtime/v1`
    : '';

export const API_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
