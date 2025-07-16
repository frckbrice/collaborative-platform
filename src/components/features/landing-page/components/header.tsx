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

export interface IAppProps { }

export function Header(props: IAppProps) {
  const [path, setPath] = React.useState('#products');

  return (
    <header
      className="p-4 flex justify-center items-center mx-auto w-full"
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
          Maebrie.
        </span> */}
      </Link>
      <NavigationMenu role="navigation" aria-label="Main site navigation">
        <NavigationMenuList className="gap-6">
          <NavigationMenuItem>
            <NavigationMenuTrigger
              onClick={() => setPath('#resources')}
              className={cn(
                'font-normal text-xl',
                path === '#resources' ? 'text-foreground' : 'text-foreground/60'
              )}
            >
              Resources
            </NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul
                className="grid
              gap-3
              p-6
              md:w-[400px]
              ld:w-[500px]
              lg:grid-cols-[.75fr_1fr]
              "
              >
                <li className="row-span-3">
                  <span
                    className="flex h-full w-full select-none
                flex-col
                justify-end
                rounded-md
                bg-gradient-to-b
                from-muted/50
                to-muted
                p-6 no-underline
                outline-none
                focus:shadow-md
                "
                  >
                    Welcome
                  </span>
                </li>
                <ListItem href="#" title="Introduction">
                  Re-usable components built using Radix UI and Tailwind CSS.
                </ListItem>
                <ListItem href="#" title="Installation">
                  How to install dependencies and structure your app.
                </ListItem>
                <ListItem href="#" title="Typography">
                  Styles for headings, paragraphs, lists...etc
                </ListItem>
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuTrigger
              onClick={() => setPath('#pricing')}
              className={cn(
                'font-normal text-xl',
                path === '#pricing' ? 'text-foreground' : 'text-foreground/60'
              )}
            >
              Pricing
            </NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="grid w-[400px] gap-3 p-4  md:grid-row-2  ">
                <ListItem title="Pro Plan" href={'#'}>
                  Unlock full power with collaboration.
                </ListItem>
                <ListItem title={'free Plan'} href={'#'}>
                  Great for teams just starting out.
                </ListItem>
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuContent>
              <ul
                className="grid w-[400px]
            gap-3
            p-4
            md:w-[500px]
            md:grid-cols-2 
            lg:w-[600px]
            "
              >
                {components.map((component) => (
                  <ListItem key={component.title} title={component.title} href={component.href}>
                    {component.description}
                  </ListItem>
                ))}
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink
              className={cn(
                navigationMenuTriggerStyle(),
                'font-normal text-xl',
                path === '#testimonials' ? 'text-foreground' : 'text-foreground/60'
              )}
            >
              Testimonial
            </NavigationMenuLink>
          </NavigationMenuItem>
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
        <Link href={'/login'}>
          <Button
            variant="btn-secondary"
            className="p-2 px-3 hidden 
            sm:block bg-secondary 
            text-foreground/60
            dark:text-secondary-foreground"
          >
            Login
          </Button>
        </Link>
        <Link href="/signup">
          <Button
            variant="btn-secondary"
            className="whitespace-nowrap 
            bg-purple-900 text-white
            dark:bg-secondary dark:text-foreground/60"
          >
            Sign Up
          </Button>
        </Link>
      </aside>

    </header>
  );
}

export default Header;
