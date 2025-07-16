'use client';
import { useAppState } from '@/lib/providers/state-provider';
import { useSupabaseUser } from '@/lib/providers/supabase-user-provider';
import { createClient } from '@/utils/client';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { Button } from '../ui/button';
import { toast } from 'sonner';
import { LogOut } from 'lucide-react';

interface LogoutButtonProps {
  children?: React.ReactNode;
  className?: string;
  showIcon?: boolean;
}

export default function LogoutButton({
  children,
  className = '',
  showIcon = true
}: LogoutButtonProps) {
  const { user } = useSupabaseUser();
  const { dispatch } = useAppState();
  const router = useRouter();
  const supabase = createClient();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const logout = async () => {
    if (!supabase) {
      toast.error('Supabase client not available');
      return;
    }

    setIsLoggingOut(true);

    try {
      // Clear all app state
      dispatch({ type: 'SET_WORKSPACES', payload: { workspaces: [] } });

      // Sign out from Supabase
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error('Logout error:', error);
        toast.error('Failed to logout. Please try again.');
        return;
      }

      toast.success('Successfully logged out');

      // Redirect to login page
      router.push('/login');
      router.refresh();

    } catch (error) {
      console.error('Logout error:', error);
      toast.error('An unexpected error occurred during logout');
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <Button
      className={`${className} ${isLoggingOut ? 'opacity-50 cursor-not-allowed' : ''}`}
      onClick={logout}
      disabled={isLoggingOut}
    >
      {children || (isLoggingOut ? 'Logging out...' : 'Logout')}
    </Button>
  );
}
