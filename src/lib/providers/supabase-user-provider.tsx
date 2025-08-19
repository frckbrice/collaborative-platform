'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { client } from '../../utils/client';
import { Subscription } from '../supabase/supabase.types';
import { useCallback, useRef } from 'react';
import { getUserSubscriptionStatus } from '../supabase/queries';
import { toast } from 'sonner';

type SupabaseUserContextType = {
  user: User | null;
  subscription: Subscription | null;
  loading: boolean;
  refreshUser: () => Promise<void>;
  refreshSubscription: () => Promise<void>;
};

interface SupabaseUserProviderProps {
  children: React.ReactNode;
}

const SupabaseUserContext = createContext<SupabaseUserContextType>({
  user: null,
  subscription: null,
  loading: true,
  refreshUser: async () => {},
  refreshSubscription: async () => {},
});

export const useSupabaseUser = () => {
  const context = useContext(SupabaseUserContext);
  if (!context) {
    throw new Error('useSupabaseUser must be used within a SupabaseUserProvider');
  }
  return context;
};

export const SupabaseUserProvider: React.FC<SupabaseUserProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const isInitialized = useRef(false);
  const authListener = useRef<any>(null);

  // Check if Supabase client is available
  const isClientAvailable = client !== null;

  // Refresh user data
  const refreshUser = useCallback(async () => {
    if (!isClientAvailable || !client) {
      return;
    }

    try {
      // First try to get the session
      const {
        data: { session },
        error: sessionError,
      } = await client.auth.getSession();

      if (session?.user) {
        setUser(session.user);
        return;
      }

      // Fallback to getUser if session doesn't work
      const {
        data: { user },
        error,
      } = await client!.auth.getUser();

      if (error) {
        console.error('Error refreshing user:', error);
        // Don't show error toast for missing session - this is normal when not logged in
        if (!error.message.includes('Auth session missing')) {
          toast.error('Failed to refresh user session');
        }
        setUser(null);
        return;
      }

      if (user) {
        setUser(user);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Error in refreshUser:', error);
      // Don't show error for session missing - this is expected when not logged in
      if (error instanceof Error && !error.message?.includes('Auth session missing')) {
        console.error('Unexpected error in refreshUser:', error);
      }
      setUser(null);
    }
  }, [isClientAvailable]);

  // Refresh subscription data
  const refreshSubscription = useCallback(async () => {
    if (!user || !isClientAvailable) {
      setSubscription(null);
      return;
    }

    try {
      const { data, error } = await getUserSubscriptionStatus(user.id);
      if (error) {
        console.error('Error fetching subscription:', error);
        toast.error('Failed to refresh subscription data');
        setSubscription(null);
        return;
      }
      setSubscription(data);
    } catch (error) {
      console.error('Error in refreshSubscription:', error);
      setSubscription(null);
    }
  }, [user, isClientAvailable]);

  // Initialize user and set up auth state listener
  useEffect(() => {
    if (isInitialized.current) {
      return;
    }

    if (!isClientAvailable) {
      setLoading(false);
      return;
    }

    isInitialized.current = true;

    const initializeAuth = async () => {
      try {
        setLoading(true);

        // Add a small delay to ensure server-side session is available
        await new Promise((resolve) => setTimeout(resolve, 100));

        // Get initial user
        try {
          // First try to get the session
          const {
            data: { session },
            error: sessionError,
          } = await client!.auth.getSession();

          if (session?.user) {
            setUser(session.user);

            // Fetch subscription for initial user
            const { data: subscriptionData, error: subscriptionError } =
              await getUserSubscriptionStatus(session.user.id);
            if (subscriptionError) {
              console.error('Error fetching initial subscription:', subscriptionError);
            } else {
              setSubscription(subscriptionData);
            }
          } else {
            // Fallback to getUser if session doesn't work
            const {
              data: { user },
              error,
            } = await client!.auth.getUser();

            if (error) {
              console.error('Error getting initial user:', error);
              // Don't show error toast for missing session - this is normal
              if (!error.message.includes('Auth session missing')) {
                toast.error('Failed to get user session');
              }
            } else if (user) {
              setUser(user);

              // Fetch subscription for initial user
              const { data: subscriptionData, error: subscriptionError } =
                await getUserSubscriptionStatus(user.id);
              if (subscriptionError) {
                console.error('Error fetching initial subscription:', subscriptionError);
              } else {
                setSubscription(subscriptionData);
              }
            } else {
              console.log(
                'SupabaseUserProvider - No initial user found, trying one more time after delay...'
              );

              // Try one more time after a delay in case of timing issues
              await new Promise((resolve) => setTimeout(resolve, 500));
              const {
                data: { session: retrySession },
                error: retryError,
              } = await client!.auth.getSession();

              if (retrySession?.user) {
                setUser(retrySession.user);

                // Fetch subscription for retry user
                const { data: subscriptionData, error: subscriptionError } =
                  await getUserSubscriptionStatus(retrySession.user.id);
                if (subscriptionError) {
                  console.error('Error fetching retry subscription:', subscriptionError);
                } else {
                  setSubscription(subscriptionData);
                }
              } else {
                console.log('SupabaseUserProvider - No user found on retry');
              }
            }
          }
        } catch (error) {
          console.error('Unexpected error getting initial user:', error);
          // Don't show error for session missing - this is expected when not logged in
        }
      } catch (error) {
        console.error('Error in initializeAuth:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Set up auth state change listener
    const {
      data: { subscription },
    } = client!.auth.onAuthStateChange(async (event, session) => {
      // Clear any existing listener to prevent duplicates
      if (authListener.current) {
        authListener.current.unsubscribe();
      }
      authListener.current = subscription;

      if (event === 'TOKEN_REFRESHED') {
        await refreshUser();
        await refreshSubscription();
        return;
      }

      if (session?.user) {
        setUser(session.user);

        // Fetch subscription for new user
        const { data, error } = await getUserSubscriptionStatus(session.user.id);
        if (error) {
          console.error('Error fetching subscription after auth change:', error);
        } else {
          setSubscription(data);
        }
      } else {
        setUser(null);
        setSubscription(null);
      }
    });

    // Cleanup function
    return () => {
      if (authListener.current) {
        authListener.current.unsubscribe();
      }
    };
  }, [refreshUser, refreshSubscription, isClientAvailable]);

  // Set up automatic token refresh
  useEffect(() => {
    const setupTokenRefresh = () => {
      // Check if token needs refresh every 5 minutes
      const interval = setInterval(
        async () => {
          if (!isClientAvailable || !client) {
            return;
          }

          try {
            const {
              data: { session },
              error,
            } = await client!.auth.getSession();
            if (error) {
              // Don't log errors for missing session - this is normal when not logged in
              if (!error.message.includes('Auth session missing')) {
                console.error('Unexpected session error:', error);
              }
              return;
            }

            if (session) {
              // Check if token expires in the next 10 minutes
              const expiresAt = session.expires_at;
              const now = Math.floor(Date.now() / 1000);
              const timeUntilExpiry = expiresAt && expiresAt - now;

              if (timeUntilExpiry && timeUntilExpiry < 600) {
                // 10 minutes
                const { error: refreshError } = await client.auth.refreshSession();
                if (refreshError) {
                  console.error('Error refreshing token:', refreshError);
                  toast.error('Session expired. Please log in again.');
                  setUser(null);
                  setSubscription(null);
                } else {
                }
              }
            }
          } catch (error) {
            console.error('Error in token refresh check:', error);
          }
        },
        5 * 60 * 1000
      ); // Check every 5 minutes

      return () => clearInterval(interval);
    };

    const cleanup = setupTokenRefresh();
    return cleanup;
  }, [isClientAvailable]);

  return (
    <SupabaseUserContext.Provider
      value={{
        user,
        subscription,
        loading,
        refreshUser,
        refreshSubscription,
      }}
    >
      {children}
    </SupabaseUserContext.Provider>
  );
};
