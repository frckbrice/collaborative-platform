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

export interface IAppProps { }

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
      className="p-4 flex justify-center 
      items-center mx-auto w-full sticky top-0 z-50 border-b 
      border-border bg-background/80 backdrop-blur 
      supports-[backdrop-filter]:bg-background/60 transition-colors"
    >
      <Link
        href={'/'}
        className="w-full flex gap-2
      justify-left items-center  transition-shadow dark:shadow-gray-700"
      >
        <Image
          src={'/images/opengraph-image.png'}
          alt="Cypress Logo"
          width={100}
          height={100}
          className="rounded-lg dark:shadow-2xl dark:shadow-white"
        />
        {/* <span
          className="font-semibold"
        >
          av-digital-workspaces.
        </span> */}
      </Link>
      <NavigationMenu role="navigation" aria-label="Main site navigation">
        <NavigationMenuList className="gap-6">
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
                      'font-normal text-xl transition-colors',
                      'rounded-md px-3 py-2',
                      isActive
                        ? 'bg-background/60 dark:bg-background/40 text-primary dark:text-primary'
                        : 'bg-background/30 dark:bg-background/20 text-foreground/70 dark:text-foreground/80',
                      'hover:bg-background/60 dark:hover:bg-background/40',
                      'focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary',
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
      <div className='px-6 '>
        <ModeToggle />
      </div>

      <aside
        className="flex
      w-full
      gap-2
      justify-end
    "
      >
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
                {/* <span className="hidden sm:block font-medium text-foreground/80 dark:text-white text-sm">
                  {user.user_metadata?.full_name || user.email}
                </span> */}
              </div>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-4 flex flex-col items-center">
              <Avatar className="mb-2">
                <AvatarImage src={user.user_metadata?.avatar_url || ''} alt={user.user_metadata?.full_name || user.email || 'User'} />
                <AvatarFallback>{user.email?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
              </Avatar>
              <div className="text-center mb-2">
                <div className="font-semibold text-lg">{user.user_metadata?.full_name || 'User'}</div>
                <div className="text-xs text-muted-foreground">{user.email}</div>
              </div>
              <Link href="/profile" className="text-primary text-sm mb-2 hover:underline">Profile</Link>
              <LogoutButton className="w-full mt-2" showIcon={true}>Logout</LogoutButton>
            </PopoverContent>
          </Popover>
        ) : (
          <>
              <Link href={'/login'}>
                <Button
                  variant="secondary"
                  className="p-2 px-3 hidden sm:block 
                  bg-background/60 dark:bg-background/40 text-foreground/70 dark:text-foreground/80
                  hover:bg-background/60 dark:hover:bg-background/40
                  transition-colors duration-200
                  "
                >
                  Login
                </Button>
              </Link>
              <Link href="/signup">
                <Button
                  variant="secondary"
                  className="whitespace-nowrap
                   bg-background/60 dark:bg-background/40 text-foreground/70 dark:text-foreground/80
                   hover:bg-background/60 dark:hover:bg-background/40
                   transition-colors duration-200
                   "
                >
                  Sign Up
                </Button>
              </Link>
          </>
        )}
      </aside>

    </header>
  );
}

export default Header;
