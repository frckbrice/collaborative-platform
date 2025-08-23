'use client';

import * as React from 'react';
import { routes, components } from '../api/data';
import Link from 'next/link';
import Image from 'next/image';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuViewport,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';

import { Button } from '@/components/ui/button';
import { ListItem } from '.';
import { cn } from '@/lib/utils';
import { ModeToggle } from '@/components/global-components';
import { useSupabaseUser } from '@/lib/providers/supabase-user-provider';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import LogoutButton from '@/components/global-components/logout-button';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { usePathname } from 'next/navigation';

export interface IAppProps {}

export function Header(props: IAppProps) {
  const [activeHash, setActiveHash] = React.useState('');
  const { user, loading } = useSupabaseUser();
  const pathname = usePathname();

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const onHashChange = () => {
        setActiveHash(window.location.hash);
      };
      window.addEventListener('hashchange', onHashChange);
      setActiveHash(window.location.hash);
      return () => window.removeEventListener('hashchange', onHashChange);
    }
  }, []);

  return (
    <header
      className="px-6 py-4 mx-auto w-full max-w-7xl sticky top-0 z-50 
      border-b border-border bg-background/80 backdrop-blur 
      supports-[backdrop-filter]:bg-background/60 transition-colors"
    >
      <div className="flex items-center justify-between w-full">
        {/* Left Section - Logo */}
        <div className="flex-shrink-0">
          <Link
            href={'/'}
            className="flex gap-3 items-center transition-shadow hover:shadow-lg 
            rounded-lg p-2 dark:shadow-gray-700"
          >
            <Image
              src={'/images/opengraph-image.png'}
              alt="Cypress Logo"
              width={80}
              height={80}
              className="rounded-lg dark:shadow-2xl dark:shadow-white"
            />
            <span className="font-bold text-xl text-foreground hidden sm:block">
              Av-digital workspaces
            </span>
          </Link>
        </div>

        {/* Center Section - Navigation Menu */}
        <div className="flex-1 flex justify-center">
          <NavigationMenu role="navigation" aria-label="Main site navigation">
            <NavigationMenuList className="gap-2">
              {routes.map((route) => {
                const isAnchor = route.href.startsWith('/#');
                const isActive = isAnchor
                  ? activeHash === route.href.replace('/', '')
                  : pathname === route.href;
                return (
                  <NavigationMenuItem key={route.title}>
                    <NavigationMenuLink asChild>
                      <Link
                        href={route.href}
                        scroll={isAnchor}
                        aria-current={isActive ? 'page' : undefined}
                        className={cn(
                          navigationMenuTriggerStyle(),
                          'font-medium text-base transition-all duration-200',
                          'rounded-lg px-4 py-2.5',
                          isActive
                            ? 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary'
                            : 'bg-transparent text-foreground/70 dark:text-foreground/80',
                          'hover:bg-primary/5 dark:hover:bg-primary/10 hover:text-primary',
                          'focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2',
                          'backdrop-blur'
                        )}
                      >
                        {route.title}
                      </Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                );
              })}
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {/* Right Section - Theme Toggle & Authentication */}
        <div className="flex items-center gap-4 flex-shrink-0">
          <ModeToggle />

          {!loading && user ? (
            <Popover>
              <PopoverTrigger asChild>
                <div className="flex items-center gap-2 cursor-pointer">
                  <Avatar>
                    <AvatarImage
                      src={user.user_metadata?.avatar_url || ''}
                      alt={user.user_metadata?.full_name || user.email || 'User'}
                      width={32}
                      height={32}
                    />
                    <AvatarFallback>{user.email?.slice(0, 2)?.toUpperCase() || 'U'}</AvatarFallback>
                  </Avatar>
                </div>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-4 flex flex-col items-center">
                <Avatar className="mb-2">
                  <AvatarImage
                    src={user.user_metadata?.avatar_url || ''}
                    alt={user.user_metadata?.full_name || user.email || 'User'}
                  />
                  <AvatarFallback>{user.email?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
                </Avatar>
                <div className="text-center mb-2">
                  <div className="font-semibold text-lg">
                    {user.user_metadata?.full_name || 'User'}
                  </div>
                  <div className="text-xs text-muted-foreground">{user.email}</div>
                </div>
                <Link href="/profile" className="text-primary text-sm mb-2 hover:underline">
                  Profile
                </Link>
                <LogoutButton className="w-full mt-2" showIcon={true}>
                  Logout
                </LogoutButton>
              </PopoverContent>
            </Popover>
          ) : (
            <div className="flex items-center gap-2">
              <Link href={'/login'}>
                <Button
                  variant="secondary"
                  className="px-4 py-2 hidden sm:block 
                    bg-background/60 dark:bg-background/40 text-foreground/70 dark:text-foreground/80
                    hover:bg-background/60 dark:hover:bg-background/40
                    transition-colors duration-200"
                >
                  Login
                </Button>
              </Link>
              <Link href="/signup">
                <Button
                  variant="secondary"
                  className="px-4 py-2 whitespace-nowrap
                     bg-background/60 dark:bg-background/40 text-foreground/70 dark:text-foreground/80
                     hover:bg-background/60 dark:hover:bg-background/40
                     transition-colors duration-200"
                >
                  Sign Up
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
