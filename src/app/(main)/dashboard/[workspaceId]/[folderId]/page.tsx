import React from 'react';
import QuillEditor from '@/components/features/main/quill-editor';
import { getFolderDetails, getWorkspaceDetails } from '@/lib/supabase/queries';
import { verifyUserAuth, checkWorkspaceAccess, safeRedirect } from '@/lib/utils/auth-utils';
import AppStateProvider from '@/lib/providers/state-provider';
import { Folder, workspace } from '@/lib/supabase/supabase.types';
import QuillWrapper from '@/components/features/main/quill-editor/quill-wrapper';
import QuillHeader from '@/components/features/main/quill-editor/quill-header';
import ErrorCard from '@/components/ui/ErrorCard';

// Force dynamic rendering to prevent static generation issues with cookies
export const dynamic = 'force-dynamic';

export const revalidate = 0;

export interface IFolderPageProps {
  params: Promise<{ folderId: string; workspaceId: string }>;
}

export const generateMetadata = async ({ params }: IFolderPageProps) => {
  try {
    const { folderId } = await params;
    const { data, error } = await getFolderDetails(folderId);

    if (error || !data || data.length === 0) {
      return {
        title: 'Folder Not Found',
        alternates: {
          canonical: `/dashboard/folder/${folderId}`,
        },
      };
    }

    return {
      title: data[0]?.title || 'Folder',
      alternates: {
        canonical: `/dashboard/folder/${folderId}`,
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'Folder',
      alternates: {
        canonical: `/dashboard`,
      },
    };
  }
};

const FolderPage = async ({ params }: IFolderPageProps) => {
  const { folderId, workspaceId } = await params;

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

    const { data, error } = await getFolderDetails(folderId);
    if (error || !data?.length) {
      return (
        <ErrorCard
          title="Folder Not Found"
          description="The folder you're trying to access doesn't exist or has been moved."
          actionHref={`/dashboard/${workspaceId}`}
          actionLabel="Back to Workspace"
        />
      );
    }

    const folder = data[0];
    if (!folder) {
      console.log('folder not found');
      await new Promise((resolve) => setTimeout(resolve, 100));
      safeRedirect(`/dashboard/${workspaceId}`);
    }

    // Get workspace details for the header
    const { data: workspaceData } = await getWorkspaceDetails(workspaceId);
    const workspace = workspaceData?.[0];

    return (
      <AppStateProvider>
        <div className="relative min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100 dark:from-background dark:via-background dark:to-muted/20">
          {/* Header with breadcrumb navigation */}
          <QuillHeader workspace={workspace} folder={folder} pageType="folder" />

          {/* Main content */}
          <QuillWrapper>
            <QuillEditor dirType="folder" fileId={folderId} dirDetails={folder} />
          </QuillWrapper>
        </div>
      </AppStateProvider>
    );
  } catch (error) {
    console.error('Error in Folder page catch block:', error);
    await new Promise((resolve) => setTimeout(resolve, 100));
    safeRedirect(`/dashboard/${workspaceId}`);
  }
};

export default FolderPage;
