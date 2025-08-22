import React from 'react';
import QuillEditor from '@/components/features/main/quill-editor';
import {
  getFileDetails,
  createFile,
  getFolderDetails,
  getWorkspaceDetails,
} from '@/lib/supabase/queries';
import { verifyUserAuth, checkWorkspaceAccess, safeRedirect } from '@/utils/auth-utils';
import AppStateProvider from '@/lib/providers/state-provider';
import { File, Folder, workspace } from '@/lib/supabase/supabase.types';
import QuillWrapper from '@/components/features/main/quill-editor/quill-wrapper';
import QuillHeader from '@/components/features/main/quill-editor/quill-header';
import ErrorCard from '@/components/ui/ErrorCard';
import { redirect } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';

// Force dynamic rendering to prevent static generation issues with cookies
export const dynamic = 'force-dynamic';

export const revalidate = 0;

export interface IFilePageProps {
  params: Promise<{ fileId: string; workspaceId: string; folderId: string }>;
  searchParams?: Promise<{ created?: string }>;
}

export const generateMetadata = async ({ params }: IFilePageProps) => {
  try {
    const { fileId } = await params;
    const { data, error } = await getFileDetails(fileId);

    if (error || !data || data.length === 0) {
      return {
        title: 'File Not Found',
        alternates: {
          canonical: `/dashboard/file/${fileId}`,
        },
      };
    }

    return {
      title: data[0]?.title || 'Untitled',
      alternates: {
        canonical: `/dashboard/file/${fileId}`,
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'File',
      alternates: {
        canonical: `/dashboard`,
      },
    };
  }
};

const FilePage = async ({
  params,
  searchParams,
}: {
  params: Promise<{ fileId: string; workspaceId: string; folderId: string }>;
  searchParams?: Promise<{ created?: string }>;
}) => {
  const { fileId, workspaceId, folderId } = await params;
  const createdFlag = (await searchParams)?.created;

  // Verify user authentication without automatic redirect
  const { user, error: authError } = await verifyUserAuth();

  if (!user || authError) {
    safeRedirect('/login?error=auth_required');
  }

  try {
    // Check if user has access to this workspace
    const hasAccess = await checkWorkspaceAccess(workspaceId, user!.id);
    if (!hasAccess) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      safeRedirect('/dashboard');
    }

    let { data, error } = await getFileDetails(fileId);

    // Only auto-create if not already just created (no ?created=1)
    if ((error || !data?.length) && createdFlag !== '1') {
      const newFileId = uuidv4();
      const newFile = {
        id: newFileId,
        folder_id: folderId,
        workspace_id: workspaceId,
        title: 'Untitled',
        icon_id: '📄',
        data: '',
        created_at: new Date().toISOString(),
        in_trash: null,
        banner_url: '',
      };
      await createFile(newFile);
      redirect(`/dashboard/${workspaceId}/${folderId}/${newFileId}?created=1`);
    }

    if (error || !data?.length) {
      // If still not found after creation, show error
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background">
          <ErrorCard
            title="File Not Found"
            description="The file you're trying to access doesn't exist or has been moved."
            actionHref={`/dashboard/${workspaceId}/${folderId}`}
            actionLabel="Back to Folder"
          />
        </div>
      );
    }

    const file = data[0];
    if (!file) {
      console.log('file not found');
      await new Promise((resolve) => setTimeout(resolve, 100));
      safeRedirect(`/dashboard/${workspaceId}/${folderId}`);
    }

    // Get workspace and folder details for the header
    const { data: workspaceData } = await getWorkspaceDetails(workspaceId);
    const { data: folderData } = await getFolderDetails(folderId);
    const workspace = workspaceData?.[0];
    const folder = folderData?.[0];

    return (
      <AppStateProvider>
        <div className="relative min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100 dark:from-background dark:via-background dark:to-muted/20">
          {/* Header with breadcrumb navigation */}
          <QuillHeader workspace={workspace} folder={folder} file={file} pageType="file" />

          {/* Main content */}
          <QuillWrapper>
            <QuillEditor dirType="file" fileId={fileId} dirDetails={file} />
          </QuillWrapper>
        </div>
      </AppStateProvider>
    );
  } catch (error) {
    console.error('Error in File page catch block:', error);
    await new Promise((resolve) => setTimeout(resolve, 100));
    safeRedirect(`/dashboard/${workspaceId}/${folderId}`);
  }
};

export default FilePage;
