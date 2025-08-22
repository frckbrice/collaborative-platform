'use client';

import React from 'react';
import { useTheme } from 'next-themes';
import { Loader2 } from 'lucide-react';

interface LoaderProps {
  isAuth?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  message?: string;
  color?: string;
}

export default function Loader({
  isAuth = false,
  size = 'md',
  className = '',
  message = '',
  color = 'primary',
}: LoaderProps) {
  const { theme, resolvedTheme } = useTheme();
  const currentTheme = theme === 'system' ? resolvedTheme : theme;

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-10 h-10',
  };

  const authSizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-10 h-10',
  };

  if (isAuth) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <Loader2 className={`${authSizeClasses[size]} animate-spin text-${color}`} />
        {message && <p className="text-sm text-muted-foreground">{message}</p>}
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="relative">
        <Loader2 className={`${sizeClasses[size]} animate-spin text-${color}`} />
        <div
          className={`absolute inset-0 rounded-full border-2 border-transparent border-t-current animate-spin`}
          style={{
            borderTopColor: currentTheme === 'dark' ? '#ffffff' : '#000000',
          }}
          suppressHydrationWarning
        />
        {message && <p className="text-sm text-muted-foreground">{message}</p>}
      </div>
    </div>
  );
}
