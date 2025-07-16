import { createClient } from '@/utils/client';
import React, { useEffect, useRef } from 'react';
import { useAppState } from '../providers/state-provider';

import { File } from '../supabase/supabase.types';
import { useRouter } from 'next/navigation';

const useSupabaseRealtime = () => {
  const supabase = createClient();
  const { dispatch, state, workspaceId: selectedWorskpace } = useAppState();
  const router = useRouter();
  const stateRef = useRef(state);

  // Keep ref updated with current state
  stateRef.current = state;

  useEffect(() => {
    if (!supabase) return;
    const channel = supabase
      .channel('db-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'files' }, async (payload) => {
        if (payload.eventType === 'INSERT') {
          const { folder_id: folderId, workspace_id: workspaceId, id: fileId } = payload.new;
          if (
            !stateRef.current.workspaces
              .find((workspace) => workspace.id === workspaceId)
              ?.folders.find((folder) => folder.id === folderId)
              ?.files.find((file) => file.id === fileId)
          ) {
            const newFile: File = {
              id: payload.new.id,
              workspace_id: payload.new.workspace_id,
              folder_id: payload.new.folder_id,
              created_at: payload.new.created_at,
              title: payload.new.title,
              icon_id: payload.new.icon_id,
              data: payload.new.data,
              in_trash: payload.new.in_trash,
              banner_url: payload.new.banner_url,
            };
            dispatch({
              type: 'ADD_FILE',
              payload: { file: newFile, folderId, workspaceId },
            });
          }
        } else if (payload.eventType === 'DELETE') {
          let workspaceId = '';
          let folderId = '';
          const fileExists = stateRef.current.workspaces.some((workspace) =>
            workspace.folders.some((folder) =>
              folder.files.some((file) => {
                if (file.id === payload.old.id) {
                  workspaceId = workspace.id;
                  folderId = folder.id;
                  return true;
                }
              })
            )
          );
          if (fileExists && workspaceId && folderId) {
            router.replace(`/dashboard/${workspaceId}`);
            dispatch({
              type: 'DELETE_FILE',
              payload: { fileId: payload.old.id, folderId, workspaceId },
            });
          }
        } else if (payload.eventType === 'UPDATE') {
          const { folder_id: folderId, workspace_id: workspaceId } = payload.new;
          stateRef.current.workspaces.some((workspace) =>
            workspace.folders.some((folder) =>
              folder.files.some((file) => {
                if (file.id === payload.new.id) {
                  dispatch({
                    type: 'UPDATE_FILE',
                    payload: {
                      workspaceId,
                      folderId,
                      fileId: payload.new.id,
                      file: {
                        title: payload.new.title,
                        icon_id: payload.new.icon_id,
                        in_trash: payload.new.in_trash,
                      },
                    },
                  });
                  return true;
                }
              })
            )
          );
        }
      })
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [supabase, selectedWorskpace, dispatch, router]);

  return null;
};

export default useSupabaseRealtime;
