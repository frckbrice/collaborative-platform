import * as React from 'react';
import { cookies } from 'next/headers';
import {
  getCollaboratingWorkspaces,
  getFolders,
  getPrivateWorkspaces,
  getSharedWorkspaces,
  getUserSubscriptionStatus,
} from '@/lib/supabase/queries';
import { twMerge } from 'tailwind-merge';
import WorkSpaceDropdown from '../../main/workspace';
import PlanUsage from './plan-usage';
import NativeNavigation from './native-navigation';
import { ScrollArea } from '@/components/ui/scroll-area';
import FoldersDropdownList from './folders-dropdown-list';
import UserCard from './user-card';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';

interface ISidebarProps {
  params: Promise<{ workspaceId: string }>;
  className?: string;
}

const Sidebar = async ({ params, className }: ISidebarProps) => {
  // Await the params object to fix Next.js dynamic API issue
  const { workspaceId } = await params;

  const supabase = createServerComponentClient({ cookies });

  //user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  // Handle authentication errors gracefully
  if (!user || userError) {
    console.error('Sidebar - Authentication error:', userError);
    // Don't redirect here, let the parent component handle it
    return (
      <aside
        className={twMerge(
          'hidden sm:flex sm:flex-col w-[350px] shrink-0 p-4 md:gap-4 !justify-between',
          className
        )}
      >
        <div className="flex items-center justify-center h-full">
          <p className="text-muted-foreground">Authentication required</p>
        </div>
      </aside>
    );
  }

  // TODO: add a toaster here to annonce a  user to login
  if (!user) {
    console.error('Sidebar - Authentication error:', userError);
    // Don't redirect here, let the parent component handle it
    // redirect('/login')
    return (
      <aside
        className={twMerge(
          'hidden sm:flex sm:flex-col w-[350px] shrink-0 p-4 md:gap-4 !justify-between',
          className
        )}
      >
        <div className="flex items-center justify-center h-full">
          <p className="text-muted-foreground">Authentication required</p>
        </div>
      </aside>
    );
  }

  //subscr
  const subscriptionResult = await getUserSubscriptionStatus(user.id);
  const subscriptionData = subscriptionResult?.data;
  const subscriptionError = subscriptionResult?.error;

  //folders
  const foldersResult = await getFolders(workspaceId);
  const workspaceFolderData = foldersResult?.data || [];
  const foldersError = foldersResult?.error;

  //error
  if (subscriptionError || foldersError) {
    console.error('Sidebar - Data loading errors:', { subscriptionError, foldersError });
    // Don't redirect, just show an error state
    return (
      <aside
        className={twMerge(
          'hidden sm:flex sm:flex-col w-[350px] shrink-0 p-4 md:gap-4 !justify-between',
          className
        )}
      >
        <div className="flex items-center justify-center h-full">
          <p className="text-muted-foreground">Failed to load workspace data</p>
        </div>
      </aside>
    );
  }

  try {
    const [privateWorkspacesResult, collaboratingWorkspacesResult, sharedWorkspacesResult] =
      await Promise.all([
        getPrivateWorkspaces(user.id),
        getCollaboratingWorkspaces(user.id),
        getSharedWorkspaces(user.id),
      ]);

    // Extract data from the results, with fallbacks to empty arrays
    const privateWorkspaces = privateWorkspacesResult?.data || [];
    const collaboratingWorkspaces = collaboratingWorkspacesResult?.data || [];
    const sharedWorkspaces = sharedWorkspacesResult?.data || [];

    // Debug logging
    console.log('Sidebar - Workspace data:', {
      privateWorkspaces,
      collaboratingWorkspaces,
      sharedWorkspaces,
      privateResult: privateWorkspacesResult,
      collaboratingResult: collaboratingWorkspacesResult,
      sharedResult: sharedWorkspacesResult,
    });

    // Check for errors
    if (
      privateWorkspacesResult?.error ||
      collaboratingWorkspacesResult?.error ||
      sharedWorkspacesResult?.error
    ) {
      console.error('Sidebar - Workspace loading errors:', {
        privateError: privateWorkspacesResult?.error,
        collaboratingError: collaboratingWorkspacesResult?.error,
        sharedError: sharedWorkspacesResult?.error,
      });
    }

    return (
      <aside
        className={twMerge(
          'hidden sm:flex sm:flex-col w-[350px] shrink-0 p-4 md:gap-4 !justify-between bg-white border-r border-gray-200 shadow-xl rounded-xl min-h-[90vh] ',
          className
        )}
      >
        <div>
          <WorkSpaceDropdown
            privateWorkspaces={privateWorkspaces}
            sharedWorkspaces={sharedWorkspaces}
            collaboratingWorkspaces={collaboratingWorkspaces}
            defaultValue={[
              ...privateWorkspaces,
              ...collaboratingWorkspaces,
              ...sharedWorkspaces,
            ].find((workspace) => workspace.id === workspaceId)}
          />
          <PlanUsage
            foldersLength={workspaceFolderData?.length || 0}
            subscription={subscriptionData}
          />
          <NativeNavigation myWorkspaceId={workspaceId} />
          <ScrollArea
            className="overflow-scroll relative
            h-[450px]
          "
          >
            <div
              className="pointer-events-none 
            w-full 
            absolute 
            bottom-0 
            h-20 
            bg-gradient-to-t 
            from-background 
            to-transparent 
            z-40"
            />
            <FoldersDropdownList
              workspaceFolders={workspaceFolderData || []}
              workspaceId={workspaceId}
            />
          </ScrollArea>
        </div>
        <UserCard subscription={subscriptionData} />
      </aside>
    );
  } catch (error) {
    console.error('Error loading sidebar data:', error);
    // Return a minimal sidebar if there's an error
    return (
      <aside
        className={twMerge(
          'hidden sm:flex sm:flex-col w-[350px] shrink-0 p-4 md:gap-4 !justify-between',
          className
        )}
      >
        <div className="flex items-center justify-center h-full">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </aside>
    );
  }
};

export default Sidebar;
