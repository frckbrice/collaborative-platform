'use client';
import { NavigationMenuLink } from '@/components/ui/navigation-menu';
import { cn } from '@/lib/utils';
import React from 'react';

const ListItem = React.forwardRef<React.ElementRef<'a'>, React.ComponentPropsWithoutRef<'a'>>(
  ({ className, title, children, ...props }, ref) => {
    return (
      <li>
        <NavigationMenuLink asChild>
          <a
            ref={ref}
            className={cn('group block select-none space-y-1 font-medium leading-none')}
            {...props}
          >
            <div className="text-foreground text-sm font-medium leading-none">{title}</div>
            <p
              className="group-hover:text-muted-foreground
            line-clamp-2
            text-sm
            leading-snug
            text-muted-foreground
          "
            >
              {children}
            </p>
          </a>
        </NavigationMenuLink>
      </li>
    );
  }
);

ListItem.displayName = 'ListItem';

export default ListItem;
