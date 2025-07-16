import React, { memo } from 'react';
import { Subscription } from '@/lib/supabase/supabase.types';
import { cookies } from 'next/headers';
import db from '@/lib/supabase/db';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import CypressProfileIcon from '../../../icons/cypressProfileIcon';
import { ModeToggle, LogoutButton } from '../../../global-components';
import { LogOut } from 'lucide-react';
import { Loader } from '@/components/global-components';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface UserCardProps {
  subscription: Subscription | null;
}

const UserCard = async ({ subscription }: UserCardProps) => {
  const supabase = createServerComponentClient({ cookies });
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;
  const response = await db.query.users.findFirst({
    where: (u: any, { eq }: any) => eq(u.id, user.id),
  });

  let avatarPath;
  if (!response) {
    return <div className="flex justify-center items-center h-screen">
      <Loader size="lg" className="text-primary" message="Loading user..." />
    </div>;
  }

  if (!response.avatar_url)
    avatarPath = '';
  else {
    avatarPath = supabase.storage.from('avatars').getPublicUrl(response.avatar_url)?.data.publicUrl;
  }
  const profile = {
    ...response,
    avatarUrl: avatarPath,
  };

  return (
    <article
      className="hidden sm:flex justify-between items-center px-4 py-2 bg-gray-50 border border-gray-200 shadow rounded-xl dark:bg-Neutrals/neutrals-12  mt-4"
    >
      <aside className="flex justify-center items-center gap-2 dark:text-gray-400 dark:bg-white/50">
        <Avatar>
          <AvatarImage src={profile.avatarUrl} />
          <AvatarFallback>
            <CypressProfileIcon />
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <span className="text-muted-foreground dark:text-gray-700">
            {subscription?.status === 'active' ? 'Pro Plan' : 'Free Plan'}
          </span>
          <small
            className="w-[150px] 
          overflow-hidden 
          overflow-ellipsis
          text-muted-foreground 
          dark:text-gray-700
          "
          >
            {profile.email} 
          </small>
        </div>
      </aside>
      <div className="flex items-center justify-center">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <LogoutButton className='dark:bg-white/50 dark:text-black '>
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
    </article>
  );
}

export default memo(UserCard);