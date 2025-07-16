
import React from 'react';
import QuillEditor from '@/components/features/main/quill-editor';
import { getWorkspaceDetails } from '@/lib/supabase/queries';
// import Sidebar from '@/components/features/side-bar';
import { verifyUserAuth, checkWorkspaceAccess, safeRedirect, getUserPrimaryWorkspace } from '@/lib/utils/auth-utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, ArrowLeft, Home, Plus } from 'lucide-react';
import Link from 'next/link';
import AppStateProvider from '@/lib/providers/state-provider';

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
      await new Promise(resolve => setTimeout(resolve, 100));
      safeRedirect('/dashboard');
    }

    const { data, error } = await getWorkspaceDetails(workspaceId);
    if (error || !data?.length) {
      const { workspaceId: primaryWorkspaceId, error: workspaceError } = await getUserPrimaryWorkspace(user!.id);
      if (workspaceError) {
        return (
          <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
            <Card className="w-full max-w-md">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                  <AlertCircle className="h-6 w-6 text-destructive" />
                </div>
                <CardTitle className="text-xl">Workspace Not Found</CardTitle>
                <CardDescription>
                  The workspace you&apos;re trying to access doesn&apos;t exist or you don&apos;t have permission to view it.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button asChild className="w-full">
                  <Link href="/dashboard">
                    <Home className="mr-2 h-4 w-4" />
                    Go to Dashboard
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        );
      }
      if (primaryWorkspaceId && primaryWorkspaceId !== workspaceId) {
        await new Promise(resolve => setTimeout(resolve, 100));
        safeRedirect(`/dashboard/${primaryWorkspaceId}`);
      } else {
        return (
          <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
            <Card className="w-full max-w-md">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Plus className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl">No Workspaces Found</CardTitle>
                <CardDescription>
                  You don&apos;t have any workspaces yet. Create your first workspace to get started.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button asChild className="w-full">
                  <Link href="/dashboard">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Workspace
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        );
      }
    }

    const workspace = data[0];
    if (!workspace) {
      await new Promise(resolve => setTimeout(resolve, 100));
      safeRedirect('/dashboard');
    }

    return (
      <AppStateProvider>
        <div className="relative min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100 dark:from-background dark:via-background dark:to-muted/20">
          {/* Header with breadcrumb */}
          <div className="sticky top-0 z-40 bg-white/10 backdrop-blur-sm border-b border-gray-200  dark:border-none dark:bg-white/10 shadow-lg dark:shadow-gray-700">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center space-x-2">
                <Button className='dark:bg-white bg-primary' asChild variant="outline">
                  <Link href="/dashboard">
                    <ArrowLeft className="h-4 w-4 mr-2 dark:text-black dark:bg-white text-gray-300" />
                    <span className="text-gray-300 dark:text-black">Dashboard</span>
                  </Link>
                </Button>
                <span className="text-gray-400 dark:text-muted-foreground">/</span>
                <span className="font-medium text-gray-900 dark:text-foreground">{workspace.title}</span>
              </div>
            </div>
          </div>

          {/* Main content */}
          <div className="flex justify-center items-start py-4 px-1">
            <div className="w-full max-w-3xl bg-white rounded-xl shadow border
             border-gray-200 p-3 flex flex-col  dark:border-white/10 dark:shadow-gray-700 ">
              <div className="flex-1 min-h-[200px] h-auto">
                <QuillEditor dirType="workspace" fileId={workspaceId} dirDetails={workspace} />
              </div>
            </div>
          </div>
        </div>
      </AppStateProvider>
    );
  } catch (error) {
    await new Promise(resolve => setTimeout(resolve, 100));
    safeRedirect('/dashboard');
  }
};

export default Workspace;
