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
        await new Promise(resolve => setTimeout(resolve, 100));
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
        const { db } = await import('@/lib/supabase/db');

        console.log("\n\n checking workspace access for user: ", userId, " and workspace: ", workspaceId)
        // First check if user is the owner
        const workspace = await db.query.workspaces.findFirst({
            where: (workspaces, { eq }) => eq(workspaces.id, workspaceId),
        });

        console.log("\n\n workspace: ", workspace)
        if (!workspace) {
            console.log('Workspace not found:', workspaceId);
            return false;
        }

        console.log("\n\n workspace.workspaces_owner: ", workspace.workspaces_owner)
        console.log("\n\n userId: ", userId)

        // Check if user is the owner
        if (workspace.workspaces_owner === userId) {
            console.log('User is workspace owner');
            return true;
        }

        // Check if user is a collaborator
        const collaborator = await db.query.collaborators.findFirst({
            where: (collaborators, { and, eq }) =>
                and(
                    eq(collaborators.workspace_id, workspaceId),
                    eq(collaborators.user_id, userId)
                ),
        });

        if (collaborator) {
            console.log('User is workspace collaborator');
            return true;
        }

        console.log('User has no access to workspace:', {
            workspaceId,
            userId,
            ownerId: workspace.workspaces_owner,
            isCollaborator: !!collaborator
        });

        return false;
    } catch (error) {
        console.error('Error checking workspace access:', error);
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
        const { db } = await import('@/lib/supabase/db');

        // First try to find a workspace the user owns (using authenticated user ID)
        const ownedWorkspace = await db.query.workspaces.findFirst({
            where: (workspaces, { eq }) => eq(workspaces.workspaces_owner, userId),
        });

        if (ownedWorkspace) {
            console.log('User has owned workspace:', ownedWorkspace.id);
            return { workspaceId: ownedWorkspace.id, error: null };
        }

        // If no owned workspace, check for collaborated workspaces (using authenticated user ID)
        const collaboratedWorkspace = await db.query.collaborators.findFirst({
            where: (collaborators, { eq }) => eq(collaborators.user_id, userId),
        });

        if (collaboratedWorkspace) {
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
    const { data: existing } = await supabase
        .from('users')
        .select('id')
        .eq('id', user.id)
        .single();

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