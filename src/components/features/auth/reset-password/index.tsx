'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function ResetPasswordPage() {
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const supabase = createClientComponentClient();
        const { error } = await supabase.auth.updateUser({ password });
        setLoading(false);
        if (error) {
            toast.error('Failed to reset password.');
        } else {
            toast('Password updated! You can now log in.');
            router.push('/auth/login');
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10 p-4">
            <div className="w-full max-w-lg bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl p-8 sm:p-12 flex flex-col items-center">
                <h2 className="text-3xl font-bold mb-4 text-center">Set New Password</h2>
                <p className="mb-6 text-muted-foreground text-center text-base">Enter your new password below to reset your account password.</p>

                <form onSubmit={handleSubmit} className="w-full space-y-6">
                    <Input
                        type="password"
                        placeholder="New password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                        className="h-12 text-lg"

                    />
                    <Button type="submit" disabled={loading || !password} className="w-full h-12 text-lg">
                        {loading ? 'Resetting...' : 'Reset Password'}
                    </Button>
                </form>
            </div>
        </div>
    );
} 
