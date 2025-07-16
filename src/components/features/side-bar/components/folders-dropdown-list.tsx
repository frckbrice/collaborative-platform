'use client';
import { useAppState } from '@/lib/providers/state-provider';
import { Folder } from '@/lib/supabase/supabase.types';
import React, { memo, useEffect, useState, useRef } from 'react';
import { TooltipComponent } from '../../../global-components';
import { PlusIcon } from 'lucide-react';
import { useSupabaseUser } from '@/lib/providers/supabase-user-provider';
import { uuid as v4 } from 'uuidv4';
import { createFolder } from '@/lib/supabase/queries';
import { Accordion } from '@/components/ui/accordion';
import Dropdown from './Dropdown';
import { toast } from 'sonner';
import useSupabaseRealtime from '@/lib/hooks/use-supabase-real-time';
import { useSubscriptionModal } from '@/lib/providers/subscription-modal-provider';

interface FoldersDropdownListProps {
  workspaceFolders: Folder[];
  workspaceId: string;
}

function FoldersDropdownList({ workspaceFolders, workspaceId }: FoldersDropdownListProps) {
  useSupabaseRealtime();
  const { state, dispatch, folderId } = useAppState();
  const { open, setOpen } = useSubscriptionModal();
  const [folders, setFolders] = useState(workspaceFolders);
  const { subscription } = useSupabaseUser();
  const stateRef = useRef(state);

  // Keep ref updated with current state
  stateRef.current = state;

  //effec set initial set server app state
  useEffect(() => {
    if (workspaceFolders.length > 0) {
      dispatch({
        type: 'SET_FOLDERS',
        payload: {
          workspaceId,
          folders: workspaceFolders.map((folder) => ({
            ...folder,
            files:
              stateRef.current.workspaces
                .find((workspace) => workspace.id === workspaceId)
                ?.folders.find((f) => f.id === folder.id)?.files || [],
          })),
        },
      });
    }
  }, [workspaceFolders, workspaceId, dispatch]);
  //state

  useEffect(() => {
    setFolders(state.workspaces.find((workspace) => workspace.id === workspaceId)?.folders || []);
  }, [state, workspaceId]);

  //add folder
  const addFolderHandler = async () => {
    if (folders.length >= 3 && !subscription) {
      setOpen(true);
      return;
    }
    const newFolder: Folder = {
      data: '',
      created_at: new Date().toISOString(),
      in_trash: null,
      title: 'Untitled',
      icon_id: '📄',
      id: v4(),
      workspace_id: workspaceId,
      banner_url: '',
    };
    // try {
    dispatch({
      type: 'ADD_FOLDER',
      payload: { workspaceId, folder: { ...newFolder, files: [] } },
    });
    const { data, error } = await createFolder(newFolder);
    if (error) {
      toast.error('Could not create the folder');
    } else {
      toast.success('Folder successfully Created !');
    }
    // } catch (error) { try ..catch already done in the server
    //     toast.error('Could not create the folder');
    // }
  };

  return (
    <>
      <div
        className="flex sticky z-20 top-0 bg-gray-50 w-full h-10 group/title justify-between items-center pr-4 border-b border-gray-200 rounded-t-lg text-gray-900 dark:bg-background dark:border-none dark:text-Neutrals/neutrals-8"
      >
        <span
          className="text-gray-900 px-3 font-bold text-xs dark:text-slate-400"
        >
          FOLDERS
        </span>
        <TooltipComponent message="Create Folder" >
          <div className='flex items-center justify-center p-2 dark:bg-white/10 bg-slate-500 
          text-gray-200 hover:text-primary transition-all dark:text-Neutrals/neutrals-7 dark:hover:bg-accent/10 rounded-full'>
          <PlusIcon
            onClick={addFolderHandler}
            size={16}
              className="group-hover/title:inline-block
            cursor-pointer
            hover:dark:text-white
            text-slate-400
            hover:text-primary
          "
          />
          </div>
        </TooltipComponent>
      </div>
      <Accordion type="multiple" defaultValue={[folderId || '']} className="pb-20">
        {folders
          .filter((folder) => !folder.in_trash)
          .map((folder) => (
            <Dropdown
              key={folder.id}
              title={folder.title}
              listType="folder"
              id={folder.id}
              iconId={folder.icon_id}
            />
          ))}
      </Accordion>
    </>
  );
}

export default memo(FoldersDropdownList);
