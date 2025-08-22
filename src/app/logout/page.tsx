'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader } from '@/components/global-components';
import { logger } from '@/utils/logger';

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    const performFinalLogout = async () => {
      try {
        logger.info('LogoutPage: Performing final logout cleanup...');

        // Clear any remaining storage
        if (typeof window !== 'undefined') {
          // Clear localStorage
          localStorage.clear();

          // Clear sessionStorage
          sessionStorage.clear();

          // Clear all cookies one more time
          const cookies = document.cookie.split(';');
          cookies.forEach((cookie) => {
            const eqPos = cookie.indexOf('=');
            const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`;
            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${window.location.hostname};`;
          });

          // Clear any remaining Supabase-related storage
          try {
            // Clear IndexedDB if it exists
            if ('indexedDB' in window) {
              const deleteReq = indexedDB.deleteDatabase('supabase.auth.token');
              deleteReq.onsuccess = () => logger.info('LogoutPage: IndexedDB cleared');
              deleteReq.onerror = () => logger.error('LogoutPage: IndexedDB clear failed');
            }

            // Clear any remaining localStorage items that might have been missed
            Object.keys(localStorage).forEach((key) => {
              if (key.includes('supabase') || key.includes('sb-') || key.includes('auth')) {
                localStorage.removeItem(key);
              }
            });

            // Clear any remaining sessionStorage items
            Object.keys(sessionStorage).forEach((key) => {
              if (key.includes('supabase') || key.includes('sb-') || key.includes('auth')) {
                sessionStorage.removeItem(key);
              }
            });
          } catch (storageError) {
            logger.error('LogoutPage: Error clearing additional storage', storageError);
          }
        }

        // Small delay to ensure cleanup is complete
        await new Promise((resolve) => setTimeout(resolve, 1000));

        logger.info('LogoutPage: Cleanup complete, redirecting to home...');

        // Redirect to home page
        router.replace('/');
      } catch (error) {
        logger.error('LogoutPage: Error during final cleanup', error);
        // Fallback: force redirect to home
        window.location.href = '/';
      }
    };

    performFinalLogout();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Loader size="lg" message="Logging you out..." />
        <p className="mt-4 text-muted-foreground">Please wait while we complete your logout...</p>
      </div>
    </div>
  );
}
