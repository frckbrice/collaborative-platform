'use server';
import { postgrestGet, postgrestPost, postgrestPut, postgrestDelete } from '@/utils/client';
import { Subscription, User, workspace, File, Folder } from './supabase.types';

/**
 * Retrieves the subscription status of a user.
 *
 * @param {string} userId - The ID of the user.
 * @return {Promise<{ data: Subscription | null, error: string | null }> A promise that resolves to an object with the user's subscription data or null if not found, and an error message if any.}
 */
export const getUserSubscriptionStatus = async (userId: string) => {
  try {
    const data = await postgrestGet('subscriptions', { user_id: `eq.${userId}` });
    if (data && data.length > 0) {
      return {
        data: data[0] as Subscription,
        error: null,
      };
    } else {
      return {
        data: null,
        error: null,
      };
    }
  } catch (error) {
    console.error('getUserSubscriptionStatus error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return {
      data: null,
      error: errorMessage,
    };
  }
};

/**
 * Creates a new workspace.
 *
 * @param {workspace} workspace - The workspace object to be created.
 * @return {Promise<{ data: null, error: null | string }>} A promise that resolves to an object with the created workspace data and an error message if any.
 */
export const createWorkspace = async (workspace: workspace) => {
  try {
    const result = await postgrestPost('workspaces', workspace);
    return { data: result, error: null };
  } catch (error) {
    console.error('createWorkspace error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown database error';
    return { data: null, error: errorMessage };
  }
};

/**
 * Retrieves a list of files associated with a given folder ID.
 *
 * @param {string} folderId - The ID of the folder.
 * @return {Promise<{ data: File[] | null; error: string | null }>} A promise that resolves to an object containing the list of files and an error message if any.
 */
export const getFiles = async (folderId: string) => {
  if (!folderId) return { data: null, error: 'Folder ID is required' };

  try {
    const results = await postgrestGet('files', {
      folder_id: `eq.${folderId}`,
      order: 'created_at.asc',
    });
    return { data: results as File[], error: null };
  } catch (error) {
    console.error('getFiles error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return { data: null, error: errorMessage };
  }
};

/**
 * Retrieves a list of folders associated with a given workspace ID.
 *
 * @param {string} workspaceId - The ID of the workspace.
 * @return {Promise<{ data: Folder[] | null; error: string | null }>} A promise that resolves to an object containing the list of folders and an error message if any.
 */
export const getFolders = async (workspaceId: string) => {
  if (!workspaceId) {
    return {
      data: null,
      error: 'Workspace ID is required',
    };
  }

  try {
    const results = await postgrestGet('folders', {
      workspace_id: `eq.${workspaceId}`,
      order: 'created_at.asc',
    });
    return { data: results as Folder[], error: null };
  } catch (error) {
    console.error('getFolders error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return { data: null, error: errorMessage };
  }
};

/**
 * Retrieves private workspaces for a user.
 *
 * @param {string} userId - The ID of the user.
 * @return {Promise<workspace[]>} A promise that resolves to an array of private workspaces.
 */
export const getPrivateWorkspaces = async (userId: string) => {
  if (!userId) return { data: [], error: null };

  try {
    // Get workspaces where user is owner and not in collaborators table
    const results = await postgrestGet('workspaces', {
      workspaces_owner: `eq.${userId}`,
      in_trash: `eq.`,
      order: 'created_at.desc',
    });

    // Filter out workspaces that have collaborators (this is a simplified approach)
    // In a real implementation, we'd need a more complex query
    return { data: results as workspace[], error: null };
  } catch (error) {
    console.error('getPrivateWorkspaces error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return { data: null, error: errorMessage };
  }
};

/**
 * Retrieves collaborating workspaces for a user.
 *
 * @param {string} userId - The ID of the user.
 * @return {Promise<{ data: workspace[] | null; error: string | null }>} A promise that resolves to an object containing the list of collaborated workspaces and an error message if any.
 */
export const getCollaboratingWorkspaces = async (userId: string) => {
  if (!userId) return { data: [], error: null };

  try {
    // First get collaborator records for this user
    const collaboratorResults = await postgrestGet('collaborators', {
      user_id: `eq.${userId}`,
      order: 'created_at.desc',
    });

    if (!collaboratorResults || collaboratorResults.length === 0) {
      return { data: [], error: null };
    }

    // Get the workspace IDs from collaborators
    const workspaceIds = collaboratorResults.map((c: any) => c.workspace_id);

    // Fetch the actual workspaces
    const workspaceResults = await postgrestGet('workspaces', {
      id: `in.(${workspaceIds.join(',')})`,
      in_trash: `eq.`,
      order: 'created_at.desc',
    });

    return { data: workspaceResults as workspace[], error: null };
  } catch (error) {
    console.error('getCollaboratingWorkspaces error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return { data: null, error: errorMessage };
  }
};

/**
 * Retrieves shared workspaces for a user.
 *
 * @param {string} userId - The ID of the user.
 * @return {Promise<{ data: workspace[] | null; error: string | null }>} A promise that resolves to an object containing the list of shared workspaces and an error message if any.
 */
export const getSharedWorkspaces = async (userId: string) => {
  if (!userId) return { data: [], error: null };

  try {
    // Get workspaces where user is owner and has collaborators
    const results = await postgrestGet('workspaces', {
      workspaces_owner: `eq.${userId}`,
      in_trash: `eq.`,
      order: 'created_at.desc',
    });

    // This is a simplified approach - in reality you'd need to check collaborators table
    return { data: results as workspace[], error: null };
  } catch (error) {
    console.error('getSharedWorkspaces error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return { data: null, error: errorMessage };
  }
};

/**
 * Searches for users by email or name.
 *
 * @param {string} query - The search query.
 * @return {Promise<{ data: User[] | null; error: string | null }>} A promise that resolves to an object containing the list of users and an error message if any.
 */
export const getUsersFromSearch = async (query: string) => {
  if (!query) return { data: [], error: null };

  try {
    // Search by email or full_name
    const results = await postgrestGet('users', {
      or: `(email.ilike.%${query}%,full_name.ilike.%${query}%)`,
    });
    return { data: results as User[], error: null };
  } catch (error) {
    console.error('getUsersFromSearch error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return { data: null, error: errorMessage };
  }
};

/**
 * Retrieves workspace details by ID.
 *
 * @param {string} workspaceId - The ID of the workspace.
 * @return {Promise<{ data: workspace[]; error?: string }>} A promise that resolves to an object containing the workspace details and an error message if any.
 */
export const getWorkspaceDetails = async (workspaceId: string) => {
  if (!workspaceId) return { data: [], error: 'Workspace ID is required' };

  try {
    // console.log('🔍 getWorkspaceDetails: Fetching workspace with ID:', workspaceId);

    // Use client-side Supabase client for client components
    const results = await postgrestGet('workspaces', { id: `eq.${workspaceId}` });
    // console.log('🔍 getWorkspaceDetails: PostgREST results:', results);

    if (results && results.length > 0) {
      // console.log('✅ getWorkspaceDetails: Found workspace:', results[0]);
      return { data: results as workspace[], error: null };
    }

    console.log('❌ getWorkspaceDetails: No workspace found with ID:', workspaceId);
    return { data: [], error: 'Workspace not found' };
  } catch (error) {
    console.error('❌ getWorkspaceDetails error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return { data: [], error: errorMessage };
  }
};

/**
 * Retrieves file details by ID.
 *
 * @param {string} fileId - The ID of the file.
 * @return {Promise<{ data: File[]; error?: string }>} A promise that resolves to an object containing the file details and an error message if any.
 */
export const getFileDetails = async (fileId: string) => {
  if (!fileId) return { data: [], error: 'File ID is required' };

  try {
    console.log('🔍 getFileDetails: Fetching file with ID:', fileId);
    const results = await postgrestGet('files', { id: `eq.${fileId}` });
    console.log('🔍 getFileDetails: PostgREST results:', results);

    if (results && results.length > 0) {
      console.log('✅ getFileDetails: Found file:', results[0]);
      return { data: results as File[], error: null };
    }

    console.log('❌ getFileDetails: No file found with ID:', fileId);
    return { data: [], error: 'File not found' };
  } catch (error) {
    console.error('❌ getFileDetails error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return { data: [], error: errorMessage };
  }
};

/**
 * Retrieves folder details by ID.
 *
 * @param {string} folderId - The ID of the folder.
 * @return {Promise<{ data: Folder[]; error?: string }>} A promise that resolves to an object containing the folder details and an error message if any.
 */
export const getFolderDetails = async (folderId: string) => {
  if (!folderId) return { data: [], error: 'Folder ID is required' };

  try {
    console.log('🔍 getFolderDetails: Fetching folder with ID:', folderId);
    const results = await postgrestGet('folders', { id: `eq.${folderId}` });
    console.log('🔍 getFolderDetails: PostgREST results:', results);

    if (results && results.length > 0) {
      console.log('✅ getFolderDetails: Found folder:', results[0]);
      return { data: results as Folder[], error: null };
    }

    console.log('❌ getFolderDetails: No folder found with ID:', folderId);
    return { data: [], error: 'Folder not found' };
  } catch (error) {
    console.error('❌ getFolderDetails error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return { data: [], error: errorMessage };
  }
};

/**
 * Deletes a file based on the fileId.
 *
 * @param {string} fileId - The id of the file to be deleted.
 * @return {Promise<void>} Promise indicating the completion of the deletion process.
 */
export const deleteFile = async (fileId: string) => {
  if (!fileId) return;
  try {
    await postgrestDelete('files', { id: `eq.${fileId}` });
  } catch (error) {
    console.error('deleteFile error:', error);
    throw error;
  }
};

/**
 * Deletes a folder based on the provided folder ID.
 *
 * @param {string} folderId - The ID of the folder to be deleted.
 */
export const deleteFolder = async (folderId: string) => {
  if (!folderId) return;
  try {
    await postgrestDelete('folders', { id: `eq.${folderId}` });
  } catch (error) {
    console.error('deleteFolder error:', error);
    throw error;
  }
};

/**
 * Deletes a workspace from the database.
 *
 * @param {string} workspaceId - The ID of the workspace to delete.
 * @return {Promise<void>} A promise that resolves when the workspace is deleted.
 */
export const deleteWorkspace = async (workspaceId: string) => {
  if (!workspaceId) return;
  try {
    await postgrestDelete('workspaces', { id: `eq.${workspaceId}` });
  } catch (error) {
    console.error('deleteWorkspace error:', error);
    throw error;
  }
};

/**
 * Retrieves and returns the collaborators associated with a specific workspace.
 *
 * @param {string} workspaceId - The ID of the workspace to retrieve collaborators for.
 * @return {Promise<{ data: User[] | null; error: string | null }>} A promise that resolves to an object containing the list of collaborators and an error message if any.
 */
export const getCollaborators = async (workspaceId: string) => {
  if (!workspaceId) return { data: null, error: 'Workspace ID is required' };

  try {
    // First get the workspace owner
    const workspaceData = await postgrestGet('workspaces', { id: `eq.${workspaceId}` });
    let workspaceOwner: User | null = null;

    if (workspaceData && workspaceData.length > 0) {
      const ownerId = workspaceData[0].workspaces_owner;
      if (ownerId) {
        const ownerUser = await postgrestGet('users', { id: `eq.${ownerId}` });
        if (ownerUser && ownerUser.length > 0) {
          workspaceOwner = ownerUser[0] as User;
        }
      }
    }

    // Then get the collaborator records
    const collaboratorRecords = await postgrestGet('collaborators', {
      workspace_id: `eq.${workspaceId}`,
    });

    // Create a list starting with the workspace owner
    const allUsers: User[] = [];

    // Add workspace owner first
    if (workspaceOwner) {
      allUsers.push(workspaceOwner);
    }

    // Add other collaborators
    if (collaboratorRecords && collaboratorRecords.length > 0) {
      const userPromises = collaboratorRecords.map(async (collaborator: any) => {
        const user = await postgrestGet('users', { id: `eq.${collaborator.user_id}` });
        return user && user.length > 0 ? user[0] : null;
      });

      const users = await Promise.all(userPromises);
      const validUsers = users.filter(Boolean) as User[];

      // Add collaborators (avoiding duplicates with workspace owner)
      validUsers.forEach((user) => {
        if (!allUsers.some((existing) => existing.id === user.id)) {
          allUsers.push(user);
        }
      });
    }

    return { data: allUsers, error: null };
  } catch (error) {
    console.error('getCollaborators error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return { data: null, error: errorMessage };
  }
};

/**
 * Finds a user by ID.
 *
 * @param {string} userId - The ID of the user.
 * @return {Promise<User>} The user object that matches the userId.
 */
export const findUser = async (userId: string) => {
  if (!userId) return null;

  try {
    const results = await postgrestGet('users', { id: `eq.${userId}` });
    if (results && results.length > 0) {
      return results[0] as User;
    }
    return null;
  } catch (error) {
    console.error('findUser error:', error);
    return null;
  }
};

/**
 * Creates a new folder.
 *
 * @param {Folder} folder - The folder object to be created.
 * @return {Promise<{ data: Folder | null; error: string | null }>} A promise that resolves to an object with the created folder data and an error message if any.
 */
export const createFolder = async (folder: Folder) => {
  try {
    const result = await postgrestPost('folders', folder);
    return { data: result, error: null };
  } catch (error) {
    console.error('createFolder error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown database error';
    return { data: null, error: errorMessage };
  }
};

/**
 * Creates a new file.
 *
 * @param {File} file - The file object to be created.
 * @return {Promise<{ data: File | null; error: string | null }>} A promise that resolves to an object with the created file data and an error message if any.
 */
export const createFile = async (file: File) => {
  try {
    const result = await postgrestPost('files', file);
    return { data: result, error: null };
  } catch (error) {
    console.error('createFile error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown database error';
    return { data: null, error: errorMessage };
  }
};

/**
 * Updates a folder.
 *
 * @param {Partial<Folder>} updates - The updates to apply to the folder.
 * @param {string} folderId - The ID of the folder to update.
 * @return {Promise<{ data: Folder | null; error: string | null }>} A promise that resolves to an object with the updated folder data and an error message if any.
 */
export const updateFolder = async (updates: Partial<Folder>, folderId: string) => {
  try {
    const result = await postgrestPut('folders', updates, { id: `eq.${folderId}` });
    return { data: result, error: null };
  } catch (error) {
    console.error('updateFolder error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown database error';
    return { data: null, error: errorMessage };
  }
};

/**
 * Updates a file.
 *
 * @param {Partial<File>} updates - The updates to apply to the file.
 * @param {string} fileId - The ID of the file to update.
 * @return {Promise<{ data: File | null; error: string | null }>} A promise that resolves to an object with the updated file data and an error message if any.
 */
export const updateFile = async (updates: Partial<File>, fileId: string) => {
  try {
    const result = await postgrestPut('files', updates, { id: `eq.${fileId}` });
    return { data: result, error: null };
  } catch (error) {
    console.error('updateFile error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown database error';
    return { data: null, error: errorMessage };
  }
};

/**
 * Updates a workspace.
 *
 * @param {Partial<workspace>} updates - The updates to apply to the workspace.
 * @param {string} workspaceId - The ID of the workspace to update.
 * @return {Promise<{ data: workspace | null; error: string | null }>} A promise that resolves to an object with the updated workspace data and an error message if any.
 */
export const updateWorkspace = async (updates: Partial<workspace>, workspaceId: string) => {
  try {
    const result = await postgrestPut('workspaces', updates, { id: `eq.${workspaceId}` });
    return { data: result, error: null };
  } catch (error) {
    console.error('updateWorkspace error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown database error';
    return { data: null, error: errorMessage };
  }
};

/**
 * Updates a user.
 *
 * @param {Partial<User>} updates - The updates to apply to the user.
 * @param {string} userId - The ID of the user to update.
 * @return {Promise<{ data: User | null; error: string | null }>} A promise that resolves to an object with the updated user data and an error message if any.
 */
export const updateUser = async (updates: Partial<User>, userId: string) => {
  try {
    const result = await postgrestPut('users', updates, { id: `eq.${userId}` });
    return { data: result, error: null };
  } catch (error) {
    console.error('updateUser error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown database error';
    return { data: null, error: errorMessage };
  }
};

/**
 * Adds collaborators to a workspace.
 *
 * @param {User[]} users - An array of users to add as collaborators.
 * @param {string} workspaceId - The ID of the workspace to add collaborators to.
 */
export const addCollaborators = async (users: User[], workspaceId: string) => {
  try {
    const collaboratorData = users.map((user) => ({
      workspace_id: workspaceId,
      user_id: user.id,
    }));

    await postgrestPost('collaborators', collaboratorData);
  } catch (error) {
    console.error('addCollaborators error:', error);
    throw error;
  }
};

/**
 * Removes collaborators from a workspace.
 *
 * @param {User[]} users - Array of users to remove as collaborators.
 * @param {string} workspaceId - The ID of the workspace.
 */
export const removeCollaborators = async (users: User[], workspaceId: string) => {
  try {
    const promises = users.map((user) =>
      postgrestDelete('collaborators', {
        workspace_id: `eq.${workspaceId}`,
        user_id: `eq.${user.id}`,
      })
    );

    await Promise.all(promises);
  } catch (error) {
    console.error('removeCollaborators error:', error);
    throw error;
  }
};

/**
 * Retrieves active products with prices for subscription plans.
 *
 * @return {Promise<{ data: any[] | null; error: string | null }>} A promise that resolves to an object containing the list of active products with prices and an error message if any.
 */
export const getActiveProductsWithPrice = async () => {
  try {
    // First get active products
    const products = await postgrestGet('products', {
      active: 'eq.true',
      order: 'created_at.asc',
    });

    if (!products || products.length === 0) {
      return { data: [], error: null };
    }

    // For each product, get its active prices
    const productsWithPrices = await Promise.all(
      products.map(async (product: any) => {
        try {
          const prices = await postgrestGet('prices', {
            product_id: `eq.${product.id}`,
            active: 'eq.true',
            order: 'created_at.asc',
          });
          return {
            ...product,
            prices: prices || [],
          };
        } catch (error) {
          console.error(`Error fetching prices for product ${product.id}:`, error);
          return {
            ...product,
            prices: [],
          };
        }
      })
    );

    return { data: productsWithPrices, error: null };
  } catch (error) {
    console.error('Database error in getActiveProductsWithPrice:', error);
    const errorMessage = error instanceof Error ? error.message : 'Database connection failed';
    return { data: [], error: errorMessage };
  }
};
