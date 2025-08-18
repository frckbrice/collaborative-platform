"use client";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { client } from "@/utils/client";

export default function AuthCallbackPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const code = searchParams?.get("code");
    const error = searchParams?.get("error") || searchParams?.get("error_description");

    useEffect(() => {
        console.log('Auth callback page - Code:', code ? 'present' : 'missing');
        console.log('Auth callback page - Error:', error || 'none');
        
        if (code) {
            console.log('Auth callback page - Attempting to exchange code for session');
            client.auth.exchangeCodeForSession(code).then(({ data, error: exchangeError }) => {
                console.log('Auth callback page - Exchange result:', { 
                    success: !exchangeError, 
                    error: exchangeError?.message,
                    user: data?.user ? 'present' : 'missing'
                });
                
                if (exchangeError) {
                    console.error('Code exchange error:', exchangeError);
                    router.replace("/login?error=auth_failed");
                } else if (data?.user) {
                    console.log('Auth callback page - Successfully authenticated user:', data.user.email);
                    router.replace("/dashboard");
                } else {
                    console.error('Auth callback page - No user data after successful exchange');
                    router.replace("/login?error=no_user_data");
                }
            });
        } else if (error) {
            console.log("Auth callback page - Error:", error);
            router.replace(`/login?error=${encodeURIComponent(error)}`);
        } else {
            console.error('Auth callback page - No code or error provided');
            router.replace("/login?error=invalid_callback");
        }
    }, [code, error, router]);

    return <div className="flex items-center justify-center h-screen text-lg">Signing you in...</div>;
}
