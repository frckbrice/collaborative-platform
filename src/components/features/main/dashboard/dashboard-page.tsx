import React from 'react';
import { verifyUserAuth, getUserPrimaryWorkspace, safeRedirect } from '@/lib/utils/auth-utils';
import {
  getUserSubscriptionStatus,
  getPrivateWorkspaces,
  getCollaboratingWorkspaces,
} from '@/lib/supabase/queries';
import DashboardSetupClientWrapper from './components/DashboardSetupClientWrapper';
import { workspace, workspace as WorkspaceType } from '@/lib/supabase/supabase.types';
import { postgrestGet } from '@/utils/client';

// Helper function to add a small delay to prevent race conditions
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const DashboardPage = async () => {
  // Removed all console.log statements for cleaner output
  // Verify user authentication without automatic redirect
  const { user, error: authError } = await verifyUserAuth();

  // Handle authentication errors gracefully
  if (!user || authError) {
    console.error('Dashboard - Authentication error:', authError);
    safeRedirect('/login?error=auth_required');
  }

  try {
    let allWorkspaces: WorkspaceType[] = [];

    try {
      const privateWorkspacesResult = (await getPrivateWorkspaces(user!.id)) as {
        data: workspace[];
        error: string | null;
      };
      const collaboratingWorkspacesResult = await getCollaboratingWorkspaces(user!.id);

      if (privateWorkspacesResult.error) {
        console.error('Error fetching private workspaces:', privateWorkspacesResult.error);
      } else {
        allWorkspaces = [...(privateWorkspacesResult.data || [])];
      }

      if (collaboratingWorkspacesResult.error) {
        console.error(
          'Error fetching collaborating workspaces:',
          collaboratingWorkspacesResult.error
        );
      } else {
        allWorkspaces = [...allWorkspaces, ...(collaboratingWorkspacesResult.data || [])];
      }
    } catch (workspaceError) {
      console.error('Error fetching workspaces:', workspaceError);
      // Continue with empty workspaces array
      allWorkspaces = [];
    }

    // If no workspaces found, try a direct database query as fallback
    if (allWorkspaces.length === 0) {
      try {
        // Use PostgREST API as fallback instead of direct database connection
        const directWorkspacesData = await postgrestGet('workspaces', {
          workspaces_owner: `eq.${user!.id}`,
          in_trash: `eq.`,
        });

        if (directWorkspacesData && directWorkspacesData.length > 0) {
          const convertedWorkspaces = directWorkspacesData.map((ws: any) => ({
            id: ws.id,
            title: ws.title,
            data: ws.data || '',
            created_at: ws.created_at,
            workspaces_owner: ws.workspaces_owner,
            icon_id: ws.icon_id || '💼',
            in_trash: ws.in_trash,
            logo: ws.logo,
            banner_url: ws.banner_url,
          }));
          allWorkspaces.push(...convertedWorkspaces);
        }
      } catch (dbError) {
        console.error('Error with PostgREST fallback query:', dbError);
        // Continue with empty workspaces array
        allWorkspaces = [];
      }
    }

    // Retrieve the user subscription status
    let subscription = null;
    try {
      const { data: subscriptionData, error: subscriptionError } = await getUserSubscriptionStatus(
        user!.id
      );
      if (subscriptionError) {
        console.error('Subscription error: ', subscriptionError);
      } else {
        subscription = subscriptionData;
      }
    } catch (subscriptionError) {
      console.error('Error fetching subscription:', subscriptionError);
      // Continue with null subscription
    }

    // If the user has workspaces, show workspace selection
    if (allWorkspaces.length > 0) {
      return (
        <div className="bg-gray-50 h-screen w-screen flex justify-center items-center dark:bg-background">
          <div className="max-w-4xl mx-auto p-8 bg-white rounded-2xl shadow-lg border border-gray-200 dark:bg-card dark:border-none">
            <h1 className="text-4xl font-extrabold mb-8 text-gray-900 text-center dark:text-foreground">
              Your Workspaces
            </h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {allWorkspaces.map((workspace) => (
                <div
                  key={workspace.id}
                  className="bg-gray-50 border border-gray-200 rounded-xl shadow p-4 flex flex-col items-center text-center transition-shadow hover:shadow-xl h-auto min-h-[120px] dark:bg-card dark:border-none"
                >
                  <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-foreground">
                    {workspace.title}
                  </h3>
                  <p className="text-sm text-gray-500 mb-4 dark:text-muted-foreground">
                    {allWorkspaces.some((w) => w.id === workspace.id) ? 'Owned' : 'Collaborating'}
                  </p>
                  <a
                    href={`/dashboard/${workspace.id}`}
                    className="inline-block px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 font-medium"
                  >
                    Open Workspace
                  </a>
                </div>
              ))}
            </div>
            <div className="text-center">
              <p className="text-gray-500 mb-4 dark:text-muted-foreground">
                Want to create a new workspace?
              </p>
              <DashboardSetupClientWrapper user={user!} supabaseSubscription={subscription} />
            </div>
          </div>
        </div>
      );
    }

    // If the user doesn't have any workspaces, show setup
    return (
      <div className="bg-background h-screen w-screen flex justify-center items-center">
        <DashboardSetupClientWrapper user={user!} supabaseSubscription={subscription} />
      </div>
    );
  } catch (error) {
    console.error('Error in dashboard page:', error);
    // If there's an unexpected error, show setup page
    return (
      <div className="bg-background h-screen w-screen flex justify-center items-center">
        <DashboardSetupClientWrapper user={user!} supabaseSubscription={null} />
      </div>
    );
  }
};

export default DashboardPage;
