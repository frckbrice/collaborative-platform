import React, { memo } from 'react';
import { Subscription } from '@/lib/supabase/supabase.types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import CypressProfileIcon from '../../../icons/cypressProfileIcon';
import { Loader } from '@/components/global-components';
import { createClient } from '@/utils/server';
import { postgrestGet } from '@/utils/client';
import UserCardActions from './user-card-actions';

interface UserCardProps {
  subscription: Subscription | null;
}

const UserCard = async ({ subscription }: UserCardProps) => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  let response;
  try {
    // Use PostgREST API instead of direct database connection
    const userData = await postgrestGet('users', { id: `eq.${user.id}` });
    response = userData && userData.length > 0 ? userData[0] : null;
  } catch (error) {
    console.error('Error fetching user data:', error);
    response = null;
  }

  let avatarPath;
  if (!response) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader size="lg" className="text-primary" message="Loading user..." />
      </div>
    );
  }

  if (!response.avatar_url) avatarPath = '';
  else {
    avatarPath = supabase.storage.from('avatars').getPublicUrl(response.avatar_url)?.data.publicUrl;
  }
  const profile = {
    ...response,
    avatarUrl: avatarPath,
  };

  return (
    <article className="hidden sm:flex justify-between items-center px-4 py-2 bg-gray-50 border border-gray-200 shadow rounded-xl dark:bg-Neutrals/neutrals-12  mt-4">
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
      <UserCardActions />
    </article>
  );
};

export default memo(UserCard);
