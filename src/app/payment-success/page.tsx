'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useSupabaseUser } from '@/lib/providers/supabase-user-provider';
import { useRouter } from 'next/navigation';


export default function PaymentSuccessPage() {
    const { user } = useSupabaseUser();

    const router = useRouter();

    useEffect(() => {
        if (!user) {
            router.replace('/login');
        }
    }, [user, router]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#f8faff] via-[#e9e9ff] to-white dark:from-[#181826] dark:via-[#232347] dark:to-[#1a1a2e] px-4">
            <div className="bg-white/90 dark:bg-card/90 rounded-2xl shadow-2xl p-10 max-w-md w-full flex flex-col items-center">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" className="mb-4">
                    <circle cx="12" cy="12" r="12" fill="#38f9d7" fillOpacity="0.15" />
                    <path fillRule="evenodd" clipRule="evenodd" d="M20.7071 6.29289C21.0976 6.68342 21.0976 7.31658 20.7071 7.70711L12.1213 16.2929C10.9497 17.4645 9.05026 17.4645 7.87868 16.2929L4.29289 12.7071C3.90237 12.3166 3.90237 11.6834 4.29289 11.2929C4.68342 10.9024 5.31658 10.9024 5.70711 11.2929L9.29289 14.8787C9.68342 15.2692 10.3166 15.2692 10.7071 14.8787L19.2929 6.29289C19.6834 5.90237 20.3166 5.90237 20.7071 6.29289Z" fill="#6889FF" />
                </svg>
                <h1 className="text-3xl font-bold text-center mb-2 bg-gradient-to-r from-[#38f9d7] to-[#a78bfa] bg-clip-text text-transparent">Payment Successful!</h1>
                <p className="text-lg text-center text-muted-foreground mb-6">Thank you for upgrading to Pro. Your payment was successful and you now have access to all premium features.</p>
                <Link href="/dashboard">
                    <Button size="lg" className="w-full bg-gradient-to-r from-[#38f9d7] to-[#a78bfa] text-white shadow-lg hover:from-[#a78bfa] hover:to-[#38f9d7] rounded-full text-lg py-6 mt-2">Go to Dashboard</Button>
                </Link>
            </div>
        </div>
    );
} 