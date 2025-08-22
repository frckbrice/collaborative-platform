'use client';
import { createClient, createLogoutClient } from '@/utils/client';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { Button } from '../ui/button';
import { toast } from 'sonner';
import { logger } from '@/utils/logger';

interface LogoutButtonProps {
  children?: React.ReactNode;
  className?: string;
  showIcon?: boolean;
}

export default function LogoutButton({
  children,
  className = '',
  showIcon = true,
}: LogoutButtonProps) {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      logger.info('Logout: Starting logout process...');
      setIsLoggingOut(true);

      // Force clear the SupabaseUserProvider state first
      if (typeof window !== 'undefined') {
        logger.info('Logout: Dispatching auth reset event...');
        window.dispatchEvent(new CustomEvent('supabase-auth-reset'));
      }

      logger.info('Logout: Creating Supabase client...');
      const supabase = createClient();
      logger.info('Logout: Supabase client created:', !!supabase);

      // Check if we have a current session before trying to sign out
      logger.info('Logout: Checking current session...');

      let session = null;
      let sessionError = null;

      try {
        // Add timeout to prevent hanging
        const sessionPromise = supabase.auth.getSession();
        const timeoutPromise = new Promise(
          (_, reject) => setTimeout(() => reject(new Error('Session check timeout')), 5000) // Reduced timeout
        );

        const result = (await Promise.race([sessionPromise, timeoutPromise])) as any;

        session = result.data.session;
        sessionError = result.error;
      } catch (error) {
        logger.error('Logout: Session check failed or timed out', error);
        sessionError = error as any;
        // If session check times out, assume we need to force logout
        logger.info('Logout: Session check timed out, proceeding with force logout...');
      }

      logger.info('Logout: Current session', { hasSession: !!session, sessionError });

      // Skip Supabase signOut if session check failed - go straight to force logout
      if (session && !sessionError) {
        logger.info('Logout: Attempting Supabase signOut...');

        try {
          // Use special logout client that disables persistence
          const logoutSupabase = createLogoutClient();
          const signOutPromise = logoutSupabase.auth.signOut();
          const signOutTimeoutPromise = new Promise(
            (_, reject) => setTimeout(() => reject(new Error('SignOut timeout')), 5000) // Reduced timeout
          );

          const result = (await Promise.race([signOutPromise, signOutTimeoutPromise])) as any;

          logger.info('Logout: SignOut completed', { error: result.error });

          if (result.error) {
            logger.error('Logout error', result.error);
          }
        } catch (error) {
          logger.error('Logout: SignOut failed or timed out', error);
        }
      } else {
        logger.info(
          'Logout: Skipping Supabase signOut due to session check failure, proceeding with force logout...'
        );
      }

      // Force multiple signOut attempts to ensure server-side invalidation
      logger.info('Logout: Attempting additional signOut calls to ensure invalidation...');
      for (let i = 0; i < 3; i++) {
        try {
          logger.info(`Logout: Additional signOut attempt ${i + 1}/3`);
          const additionalSupabase = createLogoutClient();
          await additionalSupabase.auth.signOut();
          logger.info(`Logout: Additional signOut attempt ${i + 1} successful`);
        } catch (additionalError) {
          logger.error(`Logout: Additional signOut attempt ${i + 1} failed:`, additionalError);
        }
      }

      // Try to force clear the Supabase client's internal state
      logger.info('Logout: Attempting to force clear Supabase client internal state...');
      try {
        // Create a new client and try to manually clear its state
        const forceClearSupabase = createLogoutClient();

        // Try to access and clear internal properties if possible
        if ((forceClearSupabase as any).auth?.session) {
          logger.info('Logout: Found internal session, attempting to clear...');
          (forceClearSupabase as any).auth.session = null;
        }

        // Try to clear any cached tokens
        if ((forceClearSupabase as any).auth?.storage) {
          logger.info('Logout: Found internal storage, attempting to clear...');
          try {
            await (forceClearSupabase as any).auth.storage.removeItem('supabase.auth.token');
          } catch (storageError) {
            logger.error('Logout: Could not clear internal storage:', storageError);
          }
        }

        logger.info('Logout: Internal state clearing attempted');
      } catch (internalError) {
        logger.error('Logout: Error clearing internal state:', internalError);
      }

      // Verify session is actually gone
      logger.info('Logout: Verifying session is actually invalidated...');
      try {
        const verifySupabase = createClient();
        const {
          data: { session: verifySession },
        } = await verifySupabase.auth.getSession();
        if (verifySession) {
          logger.warn('Logout: WARNING - Session still exists after signOut!');
          logger.warn('Logout: Session details:', {
            userId: verifySession.user?.id,
            email: verifySession.user?.email,
            accessToken: verifySession.access_token ? 'EXISTS' : 'MISSING',
          });

          // Try to force invalidate by calling the auth API directly
          if (verifySession.access_token) {
            logger.info('Logout: Attempting to force invalidate session via API...');
            try {
              const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
              if (supabaseUrl) {
                const response = await fetch(`${supabaseUrl}/auth/v1/logout`, {
                  method: 'POST',
                  headers: {
                    Authorization: `Bearer ${verifySession.access_token}`,
                    'Content-Type': 'application/json',
                  },
                });
                logger.info('Logout: Direct API logout response', {
                  status: response.status,
                  statusText: response.statusText,
                });
              }
            } catch (apiError) {
              logger.error('Logout: Direct API logout failed', apiError);
            }
          }
        } else {
          logger.info('Logout: Session successfully invalidated');
        }
      } catch (verifyError) {
        logger.error('Logout: Error verifying session invalidation', verifyError);
      }

      logger.info('Logout: Proceeding with force logout (clearing local storage)...');

      // Force logout - clear all local data
      if (typeof window !== 'undefined') {
        // Clear all possible Supabase-related storage
        localStorage.removeItem('supabase.auth.token');
        localStorage.removeItem('sb-access-token');
        localStorage.removeItem('sb-refresh-token');

        // Clear any other auth-related items
        localStorage.clear();

        // Clear all cookies that might contain session data
        const cookies = document.cookie.split(';');
        cookies.forEach((cookie) => {
          const eqPos = cookie.indexOf('=');
          const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
          if (name.includes('supabase') || name.includes('sb-') || name.includes('auth')) {
            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`;
            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${window.location.hostname};`;
          }
        });

        // Also try to clear cookies by setting them to expire
        document.cookie = 'sb-access-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        document.cookie = 'sb-refresh-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        document.cookie = 'supabase-auth-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      }

      logger.info('Logout: Local storage cleared, showing success message...');
      toast.success('Logged out successfully');

      logger.info('Logout: Waiting a moment for cleanup, then redirecting...');
      // Small delay to ensure all cleanup is complete
      setTimeout(async () => {
        // Debug: Check what's left in the authentication state
        try {
          logger.info('Logout: Debug - Checking remaining auth state...');
          const debugSupabase = createClient();
          const {
            data: { session },
          } = await debugSupabase.auth.getSession();
          logger.info('Logout: Debug - Remaining session', { hasSession: !!session });
          if (session) {
            logger.warn('Logout: Debug - Session still exists', {
              userId: session.user?.id,
              email: session.user?.email,
            });
          }
        } catch (debugError) {
          logger.error('Logout: Debug - Error checking session', debugError);
        }

        logger.info('Logout: Redirecting to home page...');

        // Force a complete app reset by clearing everything and reloading
        try {
          // Clear all possible storage
          if (typeof window !== 'undefined') {
            // Clear localStorage
            localStorage.clear();

            // Clear sessionStorage
            sessionStorage.clear();

            // Clear all cookies more aggressively
            const cookies = document.cookie.split(';');
            cookies.forEach((cookie) => {
              const eqPos = cookie.indexOf('=');
              const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
              // Clear cookies with various domain and path combinations
              document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
              document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`;
              document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${window.location.hostname};`;
              document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname.split('.').slice(-2).join('.')};`;
            });

            // Clear specific Supabase cookies
            const supabaseCookies = [
              'sb-access-token',
              'sb-refresh-token',
              'supabase-auth-token',
              'supabase.auth.token',
              'supabase.auth.refreshToken',
            ];
            supabaseCookies.forEach((cookieName) => {
              document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
              document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`;
              document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${window.location.hostname};`;
            });

            // Set a flag to indicate logout has occurred (this will persist through the redirect)
            sessionStorage.setItem('logout_occurred', 'true');
            sessionStorage.setItem('logout_timestamp', Date.now().toString());
          }

          // Try to force invalidate the session by calling the Supabase API directly
          logger.info('Logout: Attempting to force invalidate session via direct API call...');
          try {
            const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
            if (supabaseUrl && session?.access_token) {
              const response = await fetch(`${supabaseUrl}/auth/v1/logout`, {
                method: 'POST',
                headers: {
                  Authorization: `Bearer ${session.access_token}`,
                  'Content-Type': 'application/json',
                },
              });
              logger.info('Logout: Direct API logout response', {
                status: response.status,
                statusText: response.statusText,
              });
            }
          } catch (apiError) {
            logger.error('Logout: Direct API logout failed', apiError);
          }

          // Try to force clear the session by setting expired tokens
          logger.info('Logout: Attempting to force clear session by setting expired tokens...');
          try {
            // Create a new client and try to manually clear its state
            const forceClearSupabase = createLogoutClient();

            // Try to set expired tokens to force session invalidation
            if ((forceClearSupabase as any).auth?.storage) {
              try {
                await (forceClearSupabase as any).auth.storage.setItem(
                  'supabase.auth.token',
                  JSON.stringify({
                    access_token: 'expired_token',
                    refresh_token: 'expired_token',
                    expires_at: Math.floor(Date.now() / 1000) - 3600, // 1 hour ago
                    token_type: 'bearer',
                    user: null,
                  })
                );
                logger.info('Logout: Set expired tokens in storage');
              } catch (storageError) {
                logger.error('Logout: Could not set expired tokens', storageError);
              }
            }
          } catch (internalError) {
            logger.error('Logout: Error setting expired tokens', internalError);
          }

          // Instead of redirecting to home (which triggers middleware),
          // redirect to a special logout page that will handle the cleanup
          logger.info('Logout: Redirecting to logout page for final cleanup...');
          window.location.href = '/logout';

          // Fallback: if the above doesn't work, try a hard reload
          setTimeout(() => {
            window.location.reload();
          }, 100);
        } catch (redirectError) {
          logger.error('Logout: Redirect failed, trying fallback', redirectError);
          // Last resort: force reload
          window.location.reload();
        }
      }, 500);
    } catch (error) {
      logger.error('Unexpected logout error', error);
      toast.error('An unexpected error occurred during logout');

      // Even if there's an error, try to force logout
      try {
        if (typeof window !== 'undefined') {
          localStorage.clear();
          document.cookie = 'sb-access-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
          document.cookie = 'sb-refresh-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
          window.location.href = '/';
        }
      } catch (fallbackError) {
        logger.error('Fallback logout also failed', fallbackError);
      }
    } finally {
      logger.info('Logout: Setting isLoggingOut to false...');
      setIsLoggingOut(false);
    }
  };

  return (
    <Button onClick={handleLogout} className={className} disabled={isLoggingOut} variant="outline">
      {children || 'Logout'}
    </Button>
  );
}
