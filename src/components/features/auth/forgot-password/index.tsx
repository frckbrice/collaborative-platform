'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const supabase = createClientComponentClient();
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password`,
        });
        setLoading(false);
        if (error) {
            console.log("error Failed to send reset email.", error);
            toast.error('Failed to send reset email.');
        } else {
            toast.success('If your email exists, a reset link has been sent.');
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10 p-4">
            <div className="w-full max-w-lg bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl p-8 sm:p-12 flex flex-col items-center">
                <h2 className="text-3xl font-bold mb-4 text-center">Forgot Password</h2>
                <p className="mb-6 text-muted-foreground text-center text-base">Enter your email address and we'll send you a link to reset your password.</p>
                <form onSubmit={handleSubmit} className="w-full space-y-6">
                    <Input
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                        className="h-12 text-lg"
                    />
                    <Button type="submit" disabled={loading} className="w-full h-12 text-lg">
                        {loading ? 'Sending...' : 'Send Reset Link'}
                    </Button>
                </form>
            </div>
        </div>
    );
} 
