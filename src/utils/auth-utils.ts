import { createClient } from '@/utils/server';
import { redirect } from 'next/navigation';

// Global flag to prevent multiple redirects
let redirectInProgress = false;

// Safe redirect function that prevents multiple simultaneous redirects
export function safeRedirect(url: string) {
  if (redirectInProgress) {
    console.log('Redirect already in progress, skipping:', url);
    return;
  }

  redirectInProgress = true;
  console.log('Safe redirect to:', url);

  // Reset the flag after a short delay
  setTimeout(() => {
    redirectInProgress = false;
  }, 1000);

  redirect(url);
}

/**
 * Verifies user authentication and returns user data
 * @returns Promise<{ user: AuthUser | null, error: string | null }>
 */
export async function verifyUserAuth() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      console.error('Auth verification error:', error);
      return { user: null, error: error.message };
    }

    if (!user) {
      return { user: null, error: 'No user found' };
    }

    return { user, error: null };
  } catch (error) {
    console.error('Unexpected auth error:', error);
    return { user: null, error: 'Unexpected authentication error' };
  }
}

/**
 * Verifies user authentication and redirects to login if not authenticated
 * @returns Promise<AuthUser>
 */
export async function requireAuth() {
  const { user, error } = await verifyUserAuth();

  if (!user || error) {
    console.error('Authentication required but not found:', error);
    // Add a small delay to prevent race conditions
    await new Promise((resolve) => setTimeout(resolve, 100));
    // Use safe redirect to avoid conflicts
    safeRedirect('/login?error=auth_required');
  }

  return user;
}

/**
 * Checks if a user has access to a specific workspace
 * @param workspaceId - The workspace ID to check access for
 * @param userId - The user ID to check access for
 * @returns Promise<boolean>
 */
export async function checkWorkspaceAccess(workspaceId: string, userId: string) {
  try {
    // console.log(
    //   '\n\n🔍 Checking workspace access for user: ',
    //   userId,
    //   ' and workspace: ',
    //   workspaceId
    // );

    // Use server-side Supabase client instead of client-side postgrestGet
    const supabase = await createClient();

    // First check if user is the owner using server-side Supabase client
    console.log('🔍 Fetching workspace data from server-side Supabase...');
    const { data: workspaceData, error: workspaceError } = await supabase
      .from('workspaces')
      .select('*')
      .eq('id', workspaceId)
      .single();

    // console.log('🔍 Server-side Supabase workspace response:', { workspaceData, workspaceError });

    if (workspaceError || !workspaceData) {
      console.log('❌ Workspace not found:', workspaceId, workspaceError);
      return false;
    }

    // console.log('\n\n🔍 Parsed workspace: ', workspaceData);
    // console.log('\n\n🔍 Workspace owner: ', workspaceData.workspaces_owner);
    // console.log('\n\n🔍 User ID: ', userId);

    // Check if user is the owner
    if (workspaceData.workspaces_owner === userId) {
      console.log('✅ User is workspace owner');
      return true;
    }

    // Check if user is a collaborator using server-side Supabase client
    console.log('🔍 Checking if user is collaborator...');
    const { data: collaboratorData, error: collaboratorError } = await supabase
      .from('collaborators')
      .select('*')
      .eq('workspace_id', workspaceId)
      .eq('user_id', userId)
      .single();

    console.log('🔍 Server-side Supabase collaborator response:', {
      collaboratorData,
      collaboratorError,
    });

    if (collaboratorData && !collaboratorError) {
      console.log('✅ User is workspace collaborator');
      return true;
    }

    console.log('❌ User has no access to workspace:', {
      workspaceId,
      userId,
      ownerId: workspaceData.workspaces_owner,
      isCollaborator: !!collaboratorData,
    });

    return false;
  } catch (error) {
    console.error('❌ Error checking workspace access:', error);
    return false;
  }
}

/**
 * Gets the user's primary workspace or null if none exists
 * @param userId - The user ID from Supabase Auth
 * @returns Promise<{ workspaceId: string | null, error: string | null }>
 */
export async function getUserPrimaryWorkspace(userId: string) {
  try {
    // Use server-side Supabase client instead of client-side postgrestGet
    const supabase = await createClient();

    // First try to find a workspace the user owns using server-side Supabase client
    const { data: ownedWorkspaceData, error: ownedError } = await supabase
      .from('workspaces')
      .select('id')
      .eq('workspaces_owner', userId)
      .limit(1);

    if (ownedError) {
      console.error('Error fetching owned workspaces:', ownedError);
    } else if (ownedWorkspaceData && ownedWorkspaceData.length > 0) {
      const ownedWorkspace = ownedWorkspaceData[0];
      console.log('User has owned workspace:', ownedWorkspace.id);
      return { workspaceId: ownedWorkspace.id, error: null };
    }

    // If no owned workspace, check for collaborated workspaces using server-side Supabase client
    const { data: collaboratedWorkspaceData, error: collaboratedError } = await supabase
      .from('collaborators')
      .select('workspace_id')
      .eq('user_id', userId)
      .limit(1);

    if (collaboratedError) {
      console.error('Error fetching collaborated workspaces:', collaboratedError);
    } else if (collaboratedWorkspaceData && collaboratedWorkspaceData.length > 0) {
      const collaboratedWorkspace = collaboratedWorkspaceData[0];
      console.log('User has collaborated workspace:', collaboratedWorkspace.workspace_id);
      return { workspaceId: collaboratedWorkspace.workspace_id, error: null };
    }

    console.log('User has no workspaces (owned or collaborated)');
    return { workspaceId: null, error: null };
  } catch (error) {
    console.error('Error getting user primary workspace:', error);
    return { workspaceId: null, error: 'Database error' };
  }
}

export async function ensureUserProfile(user: any) {
  const supabase = await createClient();
  // Check if user exists in your app's users table
  const { data: existing } = await supabase.from('users').select('id').eq('id', user.id).single();

  if (!existing) {
    // Insert user into your app's users table
    await supabase.from('users').insert({
      id: user.id,
      email: user.email,
      full_name: user.user_metadata?.full_name || null,
      avatar_url: user.user_metadata?.avatar_url || null,
      // Add other fields as needed
    });
  }
}
