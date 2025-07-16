'use server';
import { and, eq, ilike, notExists } from 'drizzle-orm';
import { files, folders, users, workspaces } from '../../../migrations/schema';
import db from './db';
import { File, Folder, Subscription, User, workspace } from './supabase.types';
import { collaborators } from './schema';
import { revalidatePath } from 'next/cache';
import { isUuid } from '@/lib/utils';
import type { TablesInsert } from './supabase.types';

/**
 * Retrieves the subscription status of a user.
 *
 * @param {string} userId - The ID of the user.
 * @return {Promise<{ data: Subscription | null, error: string | null }> A promise that resolves to an object with the user's subscription data or null if not found, and an error message if any.}
 */
export const getUserSubscriptionStatus = async (userId: string) => {
  try {
    const data = await db.query.subscriptions.findFirst({
      where: (s, { eq }) => eq(s.user_id, userId),
    });
    if (data)
      return {
        data: data as Subscription,
        error: null,
      };
    else
      return {
        data: null,
        error: null,
      };
  } catch (error) {
    console.log(error);
    return {
      data: null,
      error: `Error`,
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
    await db.insert(workspaces).values(workspace);
    return { data: null, error: null };
  } catch (error) {
    console.log(error);
    return { data: null, error: 'Error' };
  }
};

/**
 * Retrieves a list of files associated with a given folder ID.
 *
 * @param {string} folderId - The ID of the folder.
 * @return {Promise<{ data: File[] | null; error: string | null }>} A promise that resolves to an object containing the list of files and an error message if any.
 */
export const getFiles = async (folderId: string) => {
  const isValid = isUuid(folderId);
  if (!isValid) return { data: null, error: 'Error, invalid folder Id' };
  try {
    const results = (await db
      .select()
      .from(files)
      .orderBy(files.created_at)
      .where(eq(files.folder_id, folderId))) as File[] | [];
    return { data: results, error: null };
  } catch (error) {
    console.log(error);
    return { data: null, error: 'Error' };
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
      error: 'Error',
    };
  }

  const isValid = isUuid(workspaceId);
  if (!isValid) {
    return {
      data: null,
      error: 'Error',
    };
  }

  try {
    const results: Folder[] | [] = await db
      .select()
      .from(folders)
      .orderBy(folders.created_at)
      .where(eq(folders.workspace_id, workspaceId));

    return { data: results, error: null };
  } catch (error) {
    return { data: null, error: 'Error' };
  }
};

/**
 * Retrieves the private workspaces for a given user.
 *
 * @param {string} userId - The ID of the user.
 * @return {Promise<workspace[]>} A promise that resolves to an array of private workspaces.
 */
export const getPrivateWorkspaces = async (userId: string) => {
  if (!userId || !isUuid(userId)) return [];
  const privateWorkspaces = (await db
    .select({
      id: workspaces.id,
      createdAt: workspaces.created_at,
      workspaceOwner: workspaces.workspaces_owner,
      title: workspaces.title,
      iconId: workspaces.icon_id,
      data: workspaces.data,
      inTrash: workspaces.in_trash,
      logo: workspaces.logo,
      bannerUrl: workspaces.banner_url,
    })
    .from(workspaces)
    .where(
      and(
        notExists(
          db.select().from(collaborators).where(eq(collaborators.workspaceId, workspaces.id))
        ),
        eq(workspaces.workspaces_owner, userId)
      )
    )) as unknown as workspace[];

  return privateWorkspaces;
};

/**
 * Retrieves the collaborating workspaces for a specific user.
 *
 * @param {string} userId - The ID of the user.
 * @return {workspace[]} A promise that resolves to an array of collaborated workspaces.
 */
export const getCollaboratingWorkspaces = async (userId: string) => {
  if (!userId || !isUuid(userId)) return [];
  const collaboratedWorkspaces = (await db
    .select({
      id: workspaces.id,
      createdAt: workspaces.created_at,
      workspaceOwner: workspaces.workspaces_owner,
      title: workspaces.title,
      iconId: workspaces.icon_id,
      data: workspaces.data,
      inTrash: workspaces.in_trash,
      logo: workspaces.logo,
      bannerUrl: workspaces.banner_url,
    })
    .from(users)
    .innerJoin(collaborators, eq(users.id, collaborators.user_id))
    .innerJoin(workspaces, eq(collaborators.workspaceId, workspaces.id))
    .where(eq(users.id, userId))) as unknown as workspace[];

  return collaboratedWorkspaces;
};

/**
 * Retrieves a list of shared workspaces for a given user.
 *
 * @param {string} userId - The ID of the user.
 * @return {Promise<workspace[]>} A promise that resolves to an array of shared workspaces.
 */
export const getSharedWorkspaces = async (userId: string) => {
  if (!userId || !isUuid(userId)) return [];
  const sharedWorkspaces = (await db
    .selectDistinct({
      id: workspaces.id,
      createdAt: workspaces.created_at,
      workspaceOwner: workspaces.workspaces_owner,
      title: workspaces.title,
      iconId: workspaces.icon_id,
      data: workspaces.data,
      inTrash: workspaces.in_trash,
      logo: workspaces.logo,
      bannerUrl: workspaces.banner_url,
    })
    .from(workspaces)
    .orderBy(workspaces.created_at)
    .innerJoin(collaborators, eq(workspaces.id, collaborators.workspaceId))
    .where(eq(workspaces.workspaces_owner, userId))) as unknown as workspace[];

  return sharedWorkspaces;
};



/**
 * Adds collaborators to a workspace.
 *
 * @param {User[]} users - An array of users to add as collaborators.
 * @param {string} workspaceId - The ID of the workspace to add collaborators to.
 */
export const addCollaborators = async (users: User[], workspaceId: string) => {
  const response = users.forEach(async (user: User) => {
    const userExists = await db.query.collaborators.findFirst({
      where: (u, { eq }) => and(eq(u.user_id, user.id), eq(u.workspace_id, workspaceId)),
    });
    if (!userExists) await db.insert(collaborators).values({ workspaceId, user_id: user.id });
  });
};

/**
 * Retrieves a list of users from the database based on a search query.
 *
 * @param {string} email - The search query to match against the email field.
 * @return {Promise<Array<User>>} A promise that resolves to an array of users matching the search query.
 */
export const getUsersFromSearch = async (email: string) => {
  if (!email) return [];
  try {
    console.log('Searching users for:', email);
    const accounts = await db
      .select()
      .from(users)
      .where(ilike(users.email, `%${email}%`));

    console.log('Search result:', accounts);
    return accounts;
  } catch (error) {
    console.log('Error in getUsersFromSearch:', error);
    return { data: [], error: 'Error' };
  }
};

/**
 * Retrieves the details of a workspace by its ID.
 *
 * @param {string} workspaceId - The ID of the workspace.
 * @return {Promise<{ data: workspace[]; error?: string }>} A promise that resolves to an object containing the workspace details and an error message if any.
 */
export const getWorkspaceDetails = async (workspaceId: string) => {
  const isValid = isUuid(workspaceId);
  if (!isValid) {
    return {
      data: [],
      error: 'Error',
    };
  }

  try {
    const response = await db.query.workspaces.findFirst({
      where: (workspaces, { eq }) => eq(workspaces.id, workspaceId),
    });

    return { data: response ? [response] : [], error: null };
  } catch (error) {
    return { data: [], error: 'Error' };
  }
};

/**
 * Retrieves the details of a file by its ID.
 *
 * @param {string} fileId - The ID of the file.
 * @return {Promise<{ data: File[]; error?: string }>} A promise that resolves to an object containing the file details and an error message if any.
 */
export const getFileDetails = async (fileId: string) => {
  const isValid = isUuid(fileId);
  if (!isValid) {
    return { data: [], error: 'Error' };
  }
  try {
    const response = (await db.select().from(files).where(eq(files.id, fileId)).limit(1)) as File[];
    return { data: response, error: null };
  } catch (error) {
    console.error('🔴Error', error);
    return { data: [], error: 'Error' };
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
  await db.delete(files).where(eq(files.id, fileId));
};

/**
 * Deletes a folder based on the provided folder ID.
 *
 * @param {string} folderId - The ID of the folder to be deleted.
 */
export const deleteFolder = async (folderId: string) => {
  if (!folderId) return;
  await db.delete(folders).where(eq(folders.id, folderId));
};

/**
 * Retrieves the details of a folder by its ID.
 *
 * @param {string} folderId - The ID of the folder.
 * @return {Promise<{ data: Folder[]; error?: string }>} A promise that resolves to an object containing the folder details and an error message if any.
 */
export const getFolderDetails = async (folderId: string) => {
  const isValid = isUuid(folderId);
  if (!isValid) {
    return { data: [], error: 'Error' };
  }

  try {
    const response = (await db
      .select()
      .from(folders)
      .where(eq(folders.id, folderId))
      .limit(1)) as Folder[];

    return { data: response, error: null };
  } catch (error) {
    return { data: [], error: 'Error' };
  }
};

export const removeCollaborators = async (users: User[], workspaceId: string) => {
  if (!users) return;
  const response = users.forEach(async (user: User) => {
    const userExists = await db.query.collaborators.findFirst({
      where: (u, { eq }) => and(eq(u.user_id, user.id), eq(u.workspace_id, workspaceId)),
    });
    if (userExists)
      await db
        .delete(collaborators)
        .where(and(eq(collaborators.workspaceId, workspaceId), eq(collaborators.user_id, user.id)));
  });
};

/**
 * Finds a user based on the provided userId.
 *
 * @param {string} userId - The id of the user to find.
 * @return {Promise<User>} The user object that matches the userId.
 */
export const findUser = async (userId: string) => {
  return await db.query.users.findFirst({
    where: (u, { eq }) => eq(u.id, userId),
  });
};

export const getActiveProductsWithPrice = async () => {
  try {
    const res = await db.query.products.findMany({
      where: (pro, { eq }) => eq(pro.active, true),

      with: {
        prices: {
          where: (pri: any, { eq }: any) => eq(pri.active, true),
        },
      },
    });
    if (res.length) return { data: res, error: null };
    return { data: [], error: null };
  } catch (error) {
    console.log(error);
    return { data: [], error };
  }
};

export const createFolder = async (folder: Folder) => {
  try {
    await db.insert(folders).values(folder);
    return { data: null, error: null };
  } catch (error) {
    console.log(error);
    return { data: null, error: 'Error' };
  }
};

export const createFile = async (file: TablesInsert<'files'>) => {
  try {
    await (db as any).insert(files).values(file);
    return { data: null, error: null };
  } catch (error) {
    console.error(error);
    return { data: null, error: 'Error' };
  }
};

export const updateFolder = async (folder: Partial<Folder>, folderId: string) => {
  try {
    await db.update(folders).set(folder).where(eq(folders.id, folderId));
    return { data: null, error: null };
  } catch (error) {
    console.error(error);
    return { data: null, error: 'Error' };
  }
};

export const updateFile = async (file: Partial<File>, fileId: string) => {
  try {
    await db.update(files).set(file).where(eq(files.id, fileId));
    return { data: null, error: null };
  } catch (error) {
    console.log('error updating the file', error);
    return { data: null, error: 'Error' };
  }
};

export const updateWorkspace = async (workspace: Partial<workspace>, workspaceId: string) => {
  if (!workspaceId) return;
  try {
    await db.update(workspaces).set(workspace).where(eq(workspaces.id, workspaceId));

    // this refresh the workspace every on  change
    // revalidatePath("/dashboard/" + workspaceId);
    return { data: null, error: null };
  } catch (error) {
    console.log(error);
    return { data: null, error: 'Error' };
  }
};

/**
 * Retrieves and returns the collaborators associated with a specific workspace.
 *
 * @param {string} workspaceId - The ID of the workspace to retrieve collaborators for.
 * @return {User[]} An array of users who are collaborators in the workspace.
 */
export const getCollaborators = async (workspaceId: string) => {
  if (!workspaceId || !isUuid(workspaceId)) {
    console.log('Invalid workspace id');
    return;
  }
  const response = await db
    .select()
    .from(collaborators)
    .where(eq(collaborators.workspaceId, workspaceId));
  if (!response.length) return [];
  const userInformation: Promise<User | undefined>[] = response.map(async (user) => {
    const exists = await db.query.users.findFirst({
      where: (u, { eq }) => eq(u.id, user.user_id),
    });
    return exists;
  });
  const resolvedUsers = await Promise.all(userInformation);
  return resolvedUsers.filter(Boolean) as User[];
};

//update user data
export const updateUser = async (user: Partial<User>, userId: string) => {
  if (!userId || !isUuid(userId)) {
    return console.error('invalid user Id');
  }

  try {
    const response = await db.update(users).set(user).where(eq(users.id, userId));
    return { data: null, error: null };
  } catch (error) {
    console.error(error);
    return { data: null, error: 'Error' };
  }
};

/**
 * Deletes a workspace from the database.
 *
 * @param {string} workspaceId - The ID of the workspace to delete.
 * @return {Promise<void>} A promise that resolves when the workspace is deleted.
 */
export const deleteWorkspace = async (workspaceId: string) => {
  if (!workspaceId || !isUuid(workspaceId)) {
    console.log('Invalid workspace id');
    return;
  }

  await db.delete(workspaces).where(eq(workspaces.id, workspaceId));
};
