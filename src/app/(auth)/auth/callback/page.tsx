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
        if (code) {
            client.auth.exchangeCodeForSession(code).then(({ error }) => {
                if (error) {
                    router.replace("/login?error=auth_failed");
                } else {
                    router.replace("/dashboard");
                }
            });
        } else if (error) {
            console.log("\n\n error", error);
            router.replace(`/login?error=${encodeURIComponent(error)}`);
        }
    }, [code, error, router]);

    return <div className="flex items-center justify-center h-screen text-lg">Signing you in...</div>;
} 