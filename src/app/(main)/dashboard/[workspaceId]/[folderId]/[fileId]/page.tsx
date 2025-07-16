import React from 'react';
import QuillEditor from '@/components/features/main/quill-editor';
import { getFileDetails, createFile } from '@/lib/supabase/queries';
import { verifyUserAuth, checkWorkspaceAccess, safeRedirect } from '@/lib/utils/auth-utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, ArrowLeft, Home } from 'lucide-react';
import Link from 'next/link';
import AppStateProvider from '@/lib/providers/state-provider';
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

// generate metadata
export async function generateMetadata({ params }: IFilePageProps) {
  const { fileId, workspaceId, folderId } = await params;
  const { data, error } = await getFileDetails(fileId);
  return {
    title: data?.[0]?.title || 'Untitled',
  };
}

export default async function FilePage({
  params,
  searchParams,
}: {
  params: Promise<{ fileId: string; workspaceId: string; folderId: string }>;
  searchParams?: Promise<{ created?: string }>;
}) {
  const { fileId, workspaceId, folderId } = await params;
  const createdFlag = (await searchParams)?.created;
  let { data, error } = await getFileDetails(fileId);

  // Only auto-create if not already just created (no ?created=1)
  if ((error || !data?.length) && createdFlag !== '1') {
    const newFileId = uuidv4();
    const newFile = {
      id: newFileId,
      folder_id: folderId,
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
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100 dark:from-background dark:via-background dark:to-muted/20">
      {/* Sticky header with back button and file title */}
      <div className="sticky top-0 z-40 bg-white/10 backdrop-blur-sm border-b border-gray-200  dark:border-none dark:bg-white/10 shadow-lg dark:shadow-gray-700">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-2">
            <Button asChild className='dark:bg-white bg-primary' variant="outline">
              <Link href={`/dashboard/${workspaceId}/${folderId}`} className="flex items-center">
                <ArrowLeft className="h-4 w-4 mr-2 dark:text-black dark:bg-white text-gray-300" />
                <span className="text-gray-300 dark:text-black">Back to Folder</span>
              </Link>
            </Button>
            <span className="text-gray-400 dark:text-muted-foreground">/</span>
            <span className="font-medium text-gray-900 dark:text-foreground">{file.title || 'Untitled'}</span>
          </div>
        </div>
      </div>
      {/* Editor in a card */}
      <div className="flex justify-center items-start py-4 px-1">
        <div className="w-full max-w-3xl bg-white rounded-xl shadow border border-gray-500 p-3 flex flex-col dark:bg-card dark:border-none">
          <div className="flex-1 min-h-[200px] h-auto">
            <QuillEditor dirType="file" fileId={fileId} dirDetails={file} />
          </div>
        </div>
      </div>
    </div>
  );
}
