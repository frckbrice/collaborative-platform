'use client';
import { appFoldersType, useAppState } from '@/lib/providers/state-provider';
import { File } from '@/lib/supabase/supabase.types';
import { FileIcon, FolderIcon } from 'lucide-react';
import CypressPageIcon from '@/components/icons/cypressPageIcon';
import CypressTemplateIcon from '@/components/icons/cypressTemplatesIcon';
import CypressTrashIcon from '@/components/icons/cypressTrashIcon';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';

export default function TrashRestore() {
  const { state, workspaceId } = useAppState();
  const [folders, setFolders] = useState<appFoldersType[] | []>([]);
  const [files, setFiles] = useState<File[] | []>([]);

  useEffect(() => {
    const stateFolders =
      state.workspaces
        .find((workspace) => workspace.id === workspaceId)
        ?.folders.filter((folder) => folder.in_trash) || [];
    setFolders(stateFolders);

    let stateFiles: File[] = [];
    state.workspaces
      .find((workspace) => workspace.id === workspaceId)
      ?.folders.forEach((folder) => {
        folder.files.forEach((file) => {
          if (file.in_trash) {
            stateFiles.push(file);
          }
        });
      });
    setFiles(stateFiles);
  }, [state, workspaceId]);

  return (
    <section className="relative min-h-[300px]">
      <div className="flex flex-col items-center mb-6">
        <div className="rounded-full bg-muted p-4 mb-2">
          <CypressTrashIcon />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-1">Trash</h2>
        <p className="text-muted-foreground text-sm">
          Restore or permanently delete your files and folders
        </p>
      </div>
      {!!folders.length && (
        <>
          <h3 className="text-lg font-semibold text-muted-foreground mb-2 mt-4">Folders</h3>
          <div className="grid gap-2">
            {folders.map((folder) => (
              <Link
                className="bg-card/80 hover:bg-muted border border-muted rounded-lg p-3 flex items-center gap-3 transition-all shadow-sm group"
                href={`/dashboard/${folder.workspace_id}/${folder.id}`}
                key={folder.id}
              >
                <span className="flex items-center justify-center w-8 h-8">
                  <CypressTemplateIcon />
                </span>
                <span className="font-medium text-foreground group-hover:text-primary transition-colors">
                  {folder.title}
                </span>
              </Link>
            ))}
          </div>
        </>
      )}
      {!!files.length && (
        <>
          <h3 className="text-lg font-semibold text-muted-foreground mb-2 mt-6">Files</h3>
          <div className="grid gap-2">
            {files.map((file) => (
              <Link
                key={file.id}
                className="bg-card/80 hover:bg-muted border border-muted rounded-lg p-3 flex items-center gap-3 transition-all shadow-sm group"
                href={`/dashboard/${file.workspace_id}/${file.folder_id}/${file.id}`}
              >
                <span className="flex items-center justify-center w-8 h-8">
                  <CypressPageIcon />
                </span>
                <span className="font-medium text-foreground group-hover:text-primary transition-colors">
                  {file.title}
                </span>
              </Link>
            ))}
          </div>
        </>
      )}
      {!files.length && !folders.length && (
        <div
          className="
          text-muted-foreground
          flex flex-col items-center justify-center min-h-[200px] py-8
      "
        >
          <div className="mb-2">
            <CypressTrashIcon />
          </div>
          <div className="text-lg font-semibold">No Items in Trash</div>
          <div className="text-sm">Deleted files and folders will appear here</div>
        </div>
      )}
    </section>
  );
}
