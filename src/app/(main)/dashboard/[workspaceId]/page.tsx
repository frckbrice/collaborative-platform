import React from 'react';
import QuillEditor from '@/components/features/main/quill-editor';
import { getWorkspaceDetails } from '@/lib/supabase/queries';
// import Sidebar from '@/components/features/side-bar';
import {
  verifyUserAuth,
  checkWorkspaceAccess,
  safeRedirect,
  getUserPrimaryWorkspace,
} from '@/lib/utils/auth-utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, ArrowLeft, Home, Plus } from 'lucide-react';
import Link from 'next/link';
import AppStateProvider from '@/lib/providers/state-provider';
import { workspace as workspaceType } from '@/lib/supabase/supabase.types';
import QuillWrapper from '@/components/features/main/quill-editor/quill-wrapper';
import QuillError from '@/components/features/main/quill-editor/quill-error';
import CreateQuillCard from '@/components/features/main/quill-editor/create-quill-card';
import QuillHeader from '@/components/features/main/quill-editor/quill-header';

// Force dynamic rendering to prevent static generation issues with cookies
export const dynamic = 'force-dynamic';

export const revalidate = 0;

export interface IWorkspacePageProps {
  params: Promise<{
    workspaceId: string;
  }>;
}

export const generateMetadata = async ({ params }: IWorkspacePageProps) => {
  try {
    const { workspaceId } = await params;
    const { data, error } = await getWorkspaceDetails(workspaceId);

    if (error || !data || data.length === 0) {
      return {
        title: 'Workspace Not Found',
        alternates: {
          canonical: `/dashboard/${workspaceId}`,
        },
      };
    }

    return {
      title: data[0]?.title || 'Workspace',
      alternates: {
        canonical: `/dashboard/${workspaceId}`,
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'Workspace',
      alternates: {
        canonical: `/dashboard`,
      },
    };
  }
};

const Workspace = async ({ params }: IWorkspacePageProps) => {
  const { workspaceId } = await params;

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

    const { data, error } = await getWorkspaceDetails(workspaceId);
    if (error || !data?.length) {
      const { workspaceId: primaryWorkspaceId, error: workspaceError } =
        await getUserPrimaryWorkspace(user!.id);
      if (workspaceError) {
        return <QuillError />;
      }
      if (primaryWorkspaceId && primaryWorkspaceId !== workspaceId) {
        await new Promise((resolve) => setTimeout(resolve, 100));
        safeRedirect(`/dashboard/${primaryWorkspaceId}`);
      } else {
        return <CreateQuillCard />;
      }
    }

    const workspace = data?.[0];
    if (!workspace) {
      console.log('workspace not found');
      await new Promise((resolve) => setTimeout(resolve, 100));
      safeRedirect('/dashboard');
    }

    return (
      <AppStateProvider>
        <div className="relative min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100 dark:from-background dark:via-background dark:to-muted/20">
          {/* Header with breadcrumb */}
          <QuillHeader workspace={workspace} pageType="workspace" />

          {/* Main content */}
          <QuillWrapper>
            <QuillEditor dirType="workspace" fileId={workspaceId} dirDetails={workspace} />
          </QuillWrapper>
        </div>
      </AppStateProvider>
    );
  } catch (error) {
    console.error('Error in Workspace page catch block:', error);
    await new Promise((resolve) => setTimeout(resolve, 100));
    safeRedirect('/dashboard');
  }
};

export default Workspace;
