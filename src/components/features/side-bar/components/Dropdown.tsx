'use client';
import { useAppState } from '@/lib/providers/state-provider';
import { createClient } from '../../../../utils/client';
import { useRouter } from 'next/navigation';
import React, { memo, useMemo, useState } from 'react';
import { AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import clsx from 'clsx';
import { EmojiPicker } from '../../../global-components';
import { createFile, updateFile, updateFolder } from '@/lib/supabase/queries';
import { isUuid } from '@/lib/utils';
import { TooltipComponent, InlineEdit } from '../../../global-components';
import { PlusIcon, Trash } from 'lucide-react';
import { File } from '@/lib/supabase/supabase.types';
import { v4 } from 'uuid';
import { useSupabaseUser } from '@/lib/providers/supabase-user-provider';
import { toast } from 'sonner';

interface DropdownProps {
  title: string;
  id: string;
  listType: 'folder' | 'file';
  iconId: string;
  children?: React.ReactNode;
  disabled?: boolean;
}
function Dropdown({ title, id, listType, iconId, children, disabled, ...props }: DropdownProps) {
  const supabase = createClient();
  const { user } = useSupabaseUser();
  const { state, dispatch, workspaceId, folderId } = useAppState();
  const router = useRouter();

  //folder Title synced with server data and local
  const folderTitle: string | undefined = useMemo(() => {
    if (listType === 'folder') {
      const stateTitle = state.workspaces
        .find((workspace) => workspace.id === workspaceId)
        ?.folders.find((folder) => folder.id === id)?.title;
      if (title === stateTitle || !stateTitle) return title;
      return stateTitle;
    }
  }, [state, listType, workspaceId, id, title]);

  //fileItitle

  const fileTitle: string | undefined = useMemo(() => {
    if (listType === 'file') {
      const fileAndFolderId = id.split('folder');
      const stateTitle = state.workspaces
        .find((workspace) => workspace?.id === workspaceId)
        ?.folders.find((folder) => folder?.id === fileAndFolderId[0])
        ?.files.find((file) => file.id === fileAndFolderId[1])?.title;
      if (title === stateTitle || !stateTitle) return title;
      return stateTitle;
    }
  }, [state, listType, workspaceId, id, title]);

  //Navigate the user to a different page
  const navigatePage = (accordionId: string, type: string) => {
    if (type === 'folder') {
      router.push(`/dashboard/${workspaceId}/${accordionId}`);
    }
    if (type === 'file') {
      router.push(`/dashboard/${workspaceId}/${folderId}/${accordionId.split('folder')[1]}`);
    }
  };



  //onchanges
  const onChangeEmoji = async (selectedEmoji: string) => {
    if (!workspaceId || !isUuid(workspaceId)) {
      return;
    }
    if (listType === 'folder') {
      dispatch({
        type: 'UPDATE_FOLDER',
        payload: {
          workspaceId,
          folderId: id,
          folder: { icon_id: selectedEmoji },
        },
      });
      const { data, error } = await updateFolder({ icon_id: selectedEmoji }, id);
      if (error) {
        toast.error('Could not update the emoji for this folder');
      } else {
        toast.success('Update emoji for the folder');
      }
    }
  };
  const folderTitleChange = (e: any) => {
    if (!workspaceId) return;
    const fid = id.split('folder');
    if (fid.length === 1) {
      dispatch({
        type: 'UPDATE_FOLDER',
        payload: {
          folder: { title: e.target.value },
          folderId: fid[0],
          workspaceId,
        },
      });
    }
  };
  const fileTitleChange = (e: any) => {
    if (!workspaceId || !folderId) return;
    const fid = id.split('folder');
    if (fid.length === 2 && fid[1]) {
      dispatch({
        type: 'UPDATE_FILE',
        payload: {
          file: { title: e.target.value },
          folderId,
          workspaceId,
          fileId: fid[1],
        },
      });
    }
  };

  const handleTitleUpdate = async (newTitle: string) => {
    const fId = id.split('folder');

    if (fId?.length === 1) {
      // Folder update
      if (!workspaceId) return;
      dispatch({
        type: 'UPDATE_FOLDER',
        payload: {
          folder: { title: newTitle },
          folderId: fId[0],
          workspaceId,
        },
      });
      const { error } = await updateFolder({ title: newTitle }, fId[0]);
      if (error) {
        toast.error('Could not update the folder title');
      } else {
        toast.success('Folder title updated');
      }
    }

    if (fId.length === 2 && fId[1]) {
      // File update
      if (!workspaceId || !folderId) return;
      dispatch({
        type: 'UPDATE_FILE',
        payload: {
          file: { title: newTitle },
          folderId,
          workspaceId,
          fileId: fId[1],
        },
      });
      const { error } = await updateFile({ title: newTitle }, fId[1]);
      if (error) {
        toast.error('Could not update the file title');
      } else {
        toast.success('File title updated');
      }
    }
  };

  //move to trash
  const moveToTrash = async () => {
    if (!user?.email || !workspaceId) {
      return;
    }
    const pathId = id.split('folder');
    if (listType === 'folder') {
      dispatch({
        type: 'UPDATE_FOLDER',
        payload: {
          folder: {
            in_trash: `Deleted by ${user?.email}`,
          },
          folderId: pathId[0],
          workspaceId,
        },
      });
      const { error } = await updateFolder({ in_trash: `Deleted by ${user?.email}` }, pathId[0]);
      if (error) {
        toast.error('Could not move the folder to trash');
      } else {
        toast.success('Moved folder to trash');
      }
    }

    if (listType === 'file') {
      dispatch({
        type: 'UPDATE_FILE',
        payload: {
          file: {
            in_trash: `Deleted by ${user?.email}`,
          },
          folderId: pathId[0],
          workspaceId,
          fileId: pathId[1],
        },
      });
      const { data, error } = await updateFile(
        { in_trash: `Deleted by ${user?.email}` },
        pathId[1]
      );
      if (error) {
        toast.error('Could not move the folder to trash');
      } else {
        toast.success('Moved folder to trash');
      }
    }
  };

  const isFolder = listType === 'folder';

  const groupIdentifies = clsx(
    'dark:text-white whitespace-nowrap flex justify-between items-center w-full relative',
    {
      'group/folder': isFolder,
      'group/file': !isFolder,
    }
  );

  const listStyles = useMemo(
    () =>
      clsx('relative', {
        'border-none text-md bg-indigo-50 dark:bg-transparent': isFolder,
        'border-none ml-6 text-[16px] py-1 bg-blue-50 dark:bg-transparent': !isFolder,
      }),
    [isFolder]
  );

  const hoverStyles = useMemo(
    () =>
      clsx('h-full hidden rounded-sm absolute right-0 items-center justify-center', {
        'group-hover/file:block': listType === 'file',
        'group-hover/folder:block': listType === 'folder',
      }),
    [listType]
  );

  const addNewFile = async () => {
    if (!workspaceId || listType !== 'folder') return;
    const newFile: File = {
      folder_id: id,
      data: '',
      created_at: new Date().toISOString(),
      in_trash: null,
      title: 'Untitled',
      icon_id: '📄',
      id: v4(),
      workspace_id: workspaceId,
      banner_url: '',
    };
    dispatch({
      type: 'ADD_FILE',
      payload: { file: newFile, folderId: id, workspaceId },
    });
    const { data, error } = await createFile(newFile);
    if (error) {
      toast.error('Could not create a file');
    } else {
      toast.success('File created.');
    }
  };

  return (
    <AccordionItem
      value={id}
      className={listStyles}
      onClick={(e) => {
        e.stopPropagation();
        navigatePage(id, listType);
      }}
      role="listitem"
      aria-label={listType === 'folder' ? `Folder: ${folderTitle}` : `File: ${fileTitle}`}
    >
      <AccordionTrigger
        id={listType}
        className="hover:no-underline 
        p-2 
        dark:text-muted-foreground 
        text-sm"
        disabled={listType === 'file'}
      >
        <div className={groupIdentifies}>
          <div
            className="flex 
          gap-4 
          items-center 
          justify-center 
          overflow-hidden"
          >
            <div className="relative">
              <EmojiPicker getValue={onChangeEmoji}>{iconId}</EmojiPicker>
            </div>
            <InlineEdit
              value={listType === 'folder' ? (folderTitle || title) : (fileTitle || title)}
              onSave={handleTitleUpdate}
              className={clsx(
                'outline-none overflow-hidden w-[140px] bg-transparent',
                listType === 'folder'
                  ? 'text-gray-900 dark:text-Neutrals/neutrals-7 font-semibold'
                  : 'text-blue-900 dark:text-Neutrals/neutrals-7 font-medium'
              )}
              placeholder="Enter name..."
              maxLength={50}
            />
          </div>
          <div className={hoverStyles}>
            <TooltipComponent message="Delete Folder">
              <Trash
                onClick={moveToTrash}
                size={15}
                className="hover:dark:text-white dark:text-Neutrals/neutrals-7 transition-colors mr-2"
              />
            </TooltipComponent>

            {listType === 'folder' && (
              <TooltipComponent message="Add File">
                <PlusIcon
                  onClick={addNewFile}
                  size={15}
                  className="hover:dark:text-white dark:text-Neutrals/neutrals-7 transition-colors mr-2"
                />
              </TooltipComponent>
            )}
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent>
        {state.workspaces
          .find((workspace) => workspace.id === workspaceId)
          ?.folders.find((folder) => folder.id === id)
          ?.files.filter((file) => !file.in_trash)
          .map((file) => {
            const customFileId = `${id}folder${file.id}`;
            return (
              <Dropdown
                key={file.id}
                title={file.title}
                listType="file"
                id={customFileId}
                iconId={file.icon_id}
              />
            );
          })}
      </AccordionContent>
    </AccordionItem>
  );
}

export default memo(Dropdown);
