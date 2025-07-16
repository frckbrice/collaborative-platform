import React from 'react';
import QuillEditor from '@/components/features/main/quill-editor';
import { getFolderDetails } from '@/lib/supabase/queries';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import ErrorCard from '@/components/ui/ErrorCard';

// Force dynamic rendering to prevent static generation issues with cookies
export const dynamic = 'force-dynamic';

export const revalidate = 0;

export interface IFolderPageProps {
  params: Promise<{ folderId: string; workspaceId: string }>;
}

export default async function FolderPage({ params }: IFolderPageProps) {
  const { folderId, workspaceId } = await params;
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
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100 dark:from-background dark:via-background dark:to-muted/20">
      {/* Sticky header with back button and folder title */}
      <div className="sticky top-0 z-40 bg-white/10 backdrop-blur-sm border-b border-gray-200  dark:border-none dark:bg-white/10 shadow-lg dark:shadow-gray-700">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-2">
              <Button asChild className='dark:bg-white bg-primary' variant="outline">
                <Link href={`/dashboard/${workspaceId}`} className="flex items-center">
                  <ArrowLeft className="h-4 w-4 mr-2 dark:text-black dark:bg-white text-gray-300" />
                  <span className="text-gray-300 dark:text-black">Back to Workspace</span>
                </Link>
              </Button>
              <span className="text-gray-400 dark:text-muted-foreground">/</span>
              <span className="font-medium text-gray-900 dark:text-foreground">{folder.title || 'Untitled'}</span>
            </div>
          </div>
        </div>
      </div>
      {/* Editor in a card */}
      <div className="flex justify-center items-start py-4 px-1">
        <div className="w-full max-w-3xl bg-white rounded-xl shadow border border-gray-200 p-3 flex flex-col dark:bg-card dark:border-none">
          <div className="flex-1 min-h-[200px] h-auto">
            <QuillEditor dirType="folder" fileId={folderId} dirDetails={folder} />
          </div>
        </div>
      </div>
    </div>
  );
}
