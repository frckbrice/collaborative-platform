'use client';
import { useSupabaseUser } from '@/lib/providers/supabase-user-provider';
import { createClient } from '@/utils/client';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { Button } from '../ui/button';
import { toast } from 'sonner';

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
  const { refreshUser } = useSupabaseUser();
  const router = useRouter();
  const supabase = createClient();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error('Logout failed');
      setIsLoggingOut(false);
      return;
    }
    await refreshUser();
    router.refresh();
    toast.success('Logged out successfully');
    setIsLoggingOut(false);
    router.push('/');
  };

  return (
    <Button onClick={handleLogout} className={className} disabled={isLoggingOut} variant="outline">
      {children || 'Logout'}
    </Button>
  );
}
