'use client';

import React from 'react';
import { ModeToggle, LogoutButton } from '../../../global-components';
import { LogOut } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const UserCardActions = () => {
  return (
    <div className="flex items-center justify-center">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <LogoutButton className="dark:bg-white/50 dark:text-black hover:bg-white/50 hover:text-black">
              <LogOut />
            </LogoutButton>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-sm">Logout</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <div className="w-2"></div>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <ModeToggle />
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-sm">Toggle dark mode</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

export default UserCardActions;
