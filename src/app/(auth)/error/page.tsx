import type { Metadata } from 'next';
import ErrorCard from '@/components/ui/ErrorCard';

export const metadata: Metadata = {
    title: 'Error | avom-brice realtime collaborative app',
    icons: {
        icon: '/favicon.ico',
    },
};

export default function AuthErrorPage() {
    return (
        <ErrorCard
            title="Authentication Error"
            description="Something went wrong during authentication. Please try again or contact support."
            actionHref="/"
            actionLabel="Back to Home"
        />
    );
}
