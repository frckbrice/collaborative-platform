'use client';
import { useAppState } from '@/lib/providers/state-provider';
import { File, Folder, workspace } from '@/lib/supabase/supabase.types';
import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import 'quill/dist/quill.snow.css';
import { Button } from '@/components/ui/button';
import {
  deleteFile,
  deleteFolder,
  findUser,
  getFileDetails,
  getFolderDetails,
  getWorkspaceDetails,
  updateFile,
  updateFolder,
  updateWorkspace,
} from '@/lib/supabase/queries';
import { usePathname, useRouter } from 'next/navigation';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { EmojiPicker } from '@/components/global-components';
import { useStore } from '@/lib/providers/cursor-provider';
import { XCircleIcon } from 'lucide-react';
import { useSupabaseUser } from '@/lib/providers/supabase-user-provider';
import BannerUpload from '../banner-upload';
import { TOOLBAR_OPTIONS } from './api/data';
import { API_KEY } from '@/utils/client';
import InlineEdit from '@/components/ui/inline-edit';
import { toast } from 'sonner';
import { RealtimeClient, RealtimePresenceState } from '@supabase/supabase-js';

interface QuillEditorProps {
  dirDetails: File | Folder | workspace;
  fileId: string;
  dirType: 'workspace' | 'folder' | 'file';
}

const QuillEditor = memo(({
  dirDetails,
  dirType,
  fileId,
}: QuillEditorProps) => {

  const supabase = createClientComponentClient();
  const { state, workspaceId, folderId, dispatch } = useAppState();
  const saveTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const { user } = useSupabaseUser();
  const router = useRouter();
  const pathname = usePathname();
  const [quill, setQuill] = useState<any>(null);
  const [collaborators, setCollaborators] = useState<
    { id: string; email: string; avatarUrl: string }[]
  >([]);
  const [deletingBanner, setDeletingBanner] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const setLocalCursors = useStore((state) => state.setLocalCursors);
  const localCursors = useStore((state) => state.localCursors);
  const wrapperRef = useRef<HTMLDivElement>(null);



  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    ?.replace('https', 'ws')
    .replace('http', 'ws')
    .replace(/\/$/, ''); // remove trailing slash
  const REALTIME_URL = `${baseUrl}/realtime/v1`;

  // Create client and channel for each instance
  const client = new RealtimeClient(REALTIME_URL, {
    params: {
      apikey: API_KEY.toString(),
    },
    // workerUrl: '/worker.js',
    // logger: (kind: string, msg: string, data: any) => { console.log(`${kind}: ${msg}`, data) },
    // reconnectAfterMs: () => 1000,
  });

  const channel = client.channel(`${fileId}`, {
    config: {
      broadcast: {
        self: false,
        ack: true
      },
      presence: {
        key: fileId,
      },
    },
  });

  const details = useMemo(() => {
    let selectedDir;
    if (dirType === 'file') {
      selectedDir = state.workspaces
        .find((workspace) => workspace.id === workspaceId)
        ?.folders.find((folder) => folder.id === folderId)
        ?.files.find((file) => file.id === fileId);
    }
    if (dirType === 'folder') {
      selectedDir = state.workspaces
        .find((workspace) => workspace.id === workspaceId)
        ?.folders.find((folder) => folder.id === fileId);
    }
    if (dirType === 'workspace') {
      selectedDir = state.workspaces.find(
        (workspace) => workspace.id === fileId
      );
    }

    if (selectedDir) {
      return selectedDir;
    }

    return {
      title: dirDetails.title,
      icon_id: dirDetails.icon_id ?? '💼',
      created_at: dirDetails.created_at,
      data: dirDetails.data,
      in_trash: dirDetails.in_trash,
      banner_url: dirDetails.banner_url,
    } as unknown as workspace | Folder | File;
  }, [state.workspaces, workspaceId, folderId, dirDetails, dirType, fileId]);

  /* create breadCrumb */
  const breadCrumbs = useMemo(() => {
    if (!pathname || !state.workspaces || !workspaceId) return null;

    const segments = pathname
      .split('/')
      .filter((val) => val !== 'dashboard' && val);
    const workspaceDetails = state.workspaces.find(
      (workspace) => workspace.id === workspaceId
    );
    const workspaceBreadCrumb = workspaceDetails
      ? `${workspaceDetails.icon_id} ${workspaceDetails.title}`
      : '';
    if (segments.length === 1) {
      return workspaceBreadCrumb;
    }

    const folderSegment = segments[1];
    const folderDetails = workspaceDetails?.folders.find(
      (folder) => folder.id === folderSegment
    );
    const folderBreadCrumb = folderDetails
      ? `/ ${folderDetails.icon_id} ${folderDetails.title}`
      : '';

    if (segments.length === 2) {
      return `${workspaceBreadCrumb} ${folderBreadCrumb}`;
    }

    const fileSegment = segments[2];
    const fileDetails = folderDetails?.files.find(
      (file) => file.id === fileSegment
    );
    const fileBreadCrumb = fileDetails
      ? `/ ${fileDetails.icon_id} ${fileDetails.title}`
      : '';

    return `${workspaceBreadCrumb} ${folderBreadCrumb} ${fileBreadCrumb}`;
  }, [state.workspaces, pathname, workspaceId]);

  /** create editor wrapper */
  const wrapperCallBackRef = useCallback(async (wrapper: HTMLDivElement) => {
    if (typeof window !== 'undefined') {
      if (wrapper === null) return;
      wrapper.innerHTML = '';
      const editor = document.createElement('div');
      wrapper.append(editor);
      const Quill = (await import('quill')).default;
      const QuillCursors = (await import('quill-cursors')).default;
      Quill.register('modules/cursors', QuillCursors);

      const q = new Quill(editor, {
        theme: 'snow',
        modules: {
          toolbar: TOOLBAR_OPTIONS,
          cursors: {
            transformOnTextChange: true,
          },
        },
        placeholder: 'Start writing...',
      });

      // Add custom classes for dark mode styling
      const quillContainer = wrapper.querySelector('.ql-container');
      const quillToolbar = wrapper.querySelector('.ql-toolbar');

      if (quillContainer) {
        quillContainer.classList.add('bg-background', 'border-border', 'rounded-md');
      }

      if (quillToolbar) {
        quillToolbar.classList.add('bg-card', 'border-border', 'rounded-t-md');
      }

      setQuill(q);
    }
  }, []);

  useEffect(() => {
    if (wrapperRef.current) {
      wrapperCallBackRef(wrapperRef.current);
    }
  }, [wrapperCallBackRef]);

  // Handle theme changes for Quill editor
  useEffect(() => {
    if (quill && wrapperRef.current) {
      const quillContainer = wrapperRef.current.querySelector('.ql-container');
      const quillToolbar = wrapperRef.current.querySelector('.ql-toolbar');
      const quillEditor = wrapperRef.current.querySelector('.ql-editor');

      if (quillContainer) {
        quillContainer.classList.remove('bg-white', 'bg-gray-900');
        quillContainer.classList.add('bg-background', 'border-border');
      }

      if (quillToolbar) {
        quillToolbar.classList.remove('bg-white', 'bg-gray-900');
        quillToolbar.classList.add('bg-card', 'border-border');
      }

      if (quillEditor) {
        quillEditor.classList.remove('text-black', 'text-white');
        quillEditor.classList.add('text-foreground');
      }
    }
  }, [quill]);

  const restoreFileHandler = async () => {
    if (dirType === 'file') {
      if (!folderId || !workspaceId) return;
      dispatch({
        type: 'UPDATE_FILE',
        payload: { file: { in_trash: '' }, fileId, folderId, workspaceId },
      });
      await updateFile({ in_trash: '' }, fileId);
    }
    if (dirType === 'folder') {
      if (!workspaceId) return;
      dispatch({
        type: 'UPDATE_FOLDER',
        payload: { folder: { in_trash: '' }, folderId: fileId, workspaceId },
      });
      await updateFolder({ in_trash: '' }, fileId);
    }
    if (dirType === 'workspace') {
      dispatch({
        type: 'UPDATE_WORKSPACE',
        payload: { workspace: { in_trash: '' }, workspaceId: fileId },
      });
      await updateWorkspace({ in_trash: '' }, fileId);
    }
  };

  const deleteFileHandler = async () => {
    if (dirType === 'file') {
      if (!folderId || !workspaceId) return;
      dispatch({
        type: 'DELETE_FILE',
        payload: { fileId, folderId, workspaceId },
      });
      await deleteFile(fileId);
      router.replace(`/dashboard/${workspaceId}`);
    }
    if (dirType === 'folder') {
      if (!workspaceId) return;
      dispatch({
        type: 'DELETE_FOLDER',
        payload: { folderId: fileId, workspaceId },
      });
      await deleteFolder(fileId);
      router.replace(`/dashboard/${workspaceId}`);
    }
  };

  const iconOnChange = async (icon: string) => {
    if (!fileId) return;
    if (dirType === 'workspace') {
      dispatch({
        type: 'UPDATE_WORKSPACE',
        payload: { workspace: { icon_id: icon }, workspaceId: fileId },
      });
      await updateWorkspace({ icon_id: icon }, fileId);
    }
    if (dirType === 'folder') {
      if (!workspaceId) return;
      dispatch({
        type: 'UPDATE_FOLDER',
        payload: {
          folder: { icon_id: icon },
          workspaceId,
          folderId: fileId,
        },
      });
      await updateFolder({ icon_id: icon }, fileId);
    }
    if (dirType === 'file') {
      if (!workspaceId || !folderId) return;

      dispatch({
        type: 'UPDATE_FILE',
        payload: { file: { icon_id: icon }, workspaceId, folderId, fileId },
      });
      await updateFile({ icon_id: icon }, fileId);
    }
  };

  const titleOnChange = async (newTitle: string) => {
    if (!fileId) {
      console.log("no fileId");
      return;
    }
    if (dirType === 'workspace') {
      dispatch({
        type: 'UPDATE_WORKSPACE',
        payload: { workspace: { title: newTitle }, workspaceId: fileId },
      });
      await updateWorkspace({ title: newTitle }, fileId);
    }
    if (dirType === 'folder') {
      if (!workspaceId) {
        console.log("no workspaceId");
        return;
      }
      dispatch({
        type: 'UPDATE_FOLDER',
        payload: {
          folder: { title: newTitle },
          workspaceId,
          folderId: fileId,
        },
      });
      await updateFolder({ title: newTitle }, fileId);
    }
    if (dirType === 'file') {
      if (!workspaceId || !folderId) {
        console.log("no workspaceId or folderId");
        return;
      }

      dispatch({
        type: 'UPDATE_FILE',
        payload: { file: { title: newTitle }, workspaceId, folderId, fileId },
      });
      await updateFile({ title: newTitle }, fileId);
    }
  };

  const deleteBanner = async () => {
    if (!fileId) return;
    setDeletingBanner(true);
    try {
      if (dirType === 'file') {
        if (!folderId || !workspaceId) {
          console.log("no folderId or workspaceId");
          return;
        }
        dispatch({
          type: 'UPDATE_FILE',
          payload: { file: { banner_url: '' }, fileId, folderId, workspaceId },
        });
        await supabase.storage.from('file-banners').remove([`banner-${fileId}`]);
        await updateFile({ banner_url: '' }, fileId);
      }
      if (dirType === 'folder') {
        if (!workspaceId) {
          console.log("no workspaceId");
          return;
        }
        dispatch({
          type: 'UPDATE_FOLDER',
          payload: { folder: { banner_url: '' }, folderId: fileId, workspaceId },
        });
        await supabase.storage.from('file-banners').remove([`banner-${fileId}`]);
        await updateFolder({ banner_url: '' }, fileId);
      }
      if (dirType === 'workspace') {
        if (!workspaceId) {
          console.log("no workspaceId");
          return;
        }
        dispatch({
          type: 'UPDATE_WORKSPACE',
          payload: {
            workspace: { banner_url: '' },
            workspaceId: fileId,
          },
        });
        await supabase.storage.from('file-banners').remove([`banner-${fileId}`]);
        await updateWorkspace({ banner_url: '' }, fileId);
      }
    } catch (error) {
      console.error('Error deleting banner:', error);
    } finally {
      setDeletingBanner(false);
    }
  };

  // Manual refresh for debugging
  const handleManualRefresh = async () => {
    try {
      let latestData = '';
      if (dirType === 'file') {
        const { data } = await getFileDetails(fileId);

        latestData = data?.[0]?.data || '';
      } else if (dirType === 'folder') {
        const { data } = await getFolderDetails(fileId);
        latestData = data?.[0]?.data || '';
      } else if (dirType === 'workspace') {
        const { data } = await getWorkspaceDetails(fileId);
        latestData = data?.[0]?.data || '';
      }
      console.log("\n\n\n latestData: ", latestData);

      if (quill && latestData) {
        try {
          quill.setContents(JSON.parse(latestData));
          toast.success('Editor refreshed successfully');
        } catch (e) {
          quill.setText('');
        }
      }
      toast.success('Editor refreshed but no data found');
    } catch (e) {
      console.error('Manual refresh failed', e);
      toast.error('Failed to refresh editor');
    }
  };

  // Manual save for debugging
  const handleManualSave = async () => {
    if (!quill) {
      console.log("no quill");
      return;
    }
    setSaveStatus('saving');
    const contents = quill.getContents();
    let saveResult;
    try {
      if (dirType === 'workspace') {
        saveResult = await updateWorkspace({ data: JSON.stringify(contents) }, fileId);
      } else if (dirType === 'folder') {
        saveResult = await updateFolder({ data: JSON.stringify(contents) }, fileId);
      } else if (dirType === 'file') {
        saveResult = await updateFile({ data: JSON.stringify(contents) }, fileId);
      }
      if (!saveResult?.error) {
        setSaveStatus('saved');
        toast('Saved!');
      } else {
        setSaveStatus('error');
        toast.error('Failed to save.');
        console.error('Save error:', saveResult.error);
      }
    } catch (e) {
      setSaveStatus('error');
      toast.error('Failed to save.');
      console.error('Save error:', e);
    }
  };

  // Memoize the fetchInformation function to prevent infinite loops
  const fetchInformation = useCallback(async () => {
    if (!fileId) {
      return console.log("fileId not found");
    }
    try {
      if (dirType === 'file') {
        const { data: selectedDir, error } = await getFileDetails(fileId);
        if (error || !selectedDir) {
          console.error('Error loading file details', error);
          return router.replace('/dashboard');
        }
        if (!selectedDir[0]) {
          if (!workspaceId) {
            console.log("no workspaceId");
            return;
          }
          router.replace(`/dashboard/${workspaceId}`);
        }
        if (!workspaceId || quill === null) {
          console.log("no workspaceId or quill");
          return console.log(`No workspaceId: ${workspaceId ? workspaceId : ""}, quill ${quill ? quill : ""}`);
        }
        try {
          quill.setContents(JSON.parse(selectedDir[0].data || ''));
        } catch (e) {
          quill.setText('');
        }
        dispatch({
          type: 'UPDATE_FILE',
          payload: {
            file: { data: selectedDir[0].data },
            fileId,
            folderId: selectedDir[0].folder_id as string,
            workspaceId,
          },
        });
      }
      if (dirType === 'folder') {
        const { data: selectedDir, error } = await getFolderDetails(fileId);
        if (error || !selectedDir) {
          console.error('Error loading folder details', error);
          return router.replace('/dashboard');
        }
        if (!selectedDir[0]) {
          if (!workspaceId) {
            console.log("no workspaceId");
            return;
          }
          router.replace(`/dashboard/${workspaceId}`);
        }
        if (quill === null) {
          console.log("no quill");
          return;
        }
        try {
          quill.setContents(JSON.parse(selectedDir[0].data || ''));
        } catch (e) {
          quill.setText('');
        }
        dispatch({
          type: 'UPDATE_FOLDER',
          payload: {
            folderId: fileId,
            folder: { data: selectedDir[0].data },
            workspaceId: selectedDir[0].workspace_id as string,
          },
        });
      }
      if (dirType === 'workspace') {
        const { data: selectedDir, error } = await getWorkspaceDetails(fileId);
        if (error || !selectedDir) {
          console.error('Error loading workspace details', error);
          return router.replace('/dashboard');
        }
        if (!selectedDir[0] || quill === null) {
          console.log("no selectedDir[0] or quill");
          return;
        }
        try {
          quill.setContents(JSON.parse(selectedDir[0].data || ''));
        } catch (e) {
          quill.setText('');
        }
        dispatch({
          type: 'UPDATE_WORKSPACE',
          payload: {
            workspace: { data: selectedDir[0].data },
            workspaceId: fileId,
          },
        });
      }
    } catch (error) {
      console.error('Error in fetchInformation', error);
      toast.error('Failed to load editor data.');
      setSaveStatus('error');
    }
  }, [fileId, workspaceId, quill, dirType, dispatch, router]);

  useEffect(() => {
    fetchInformation();
  }, [fetchInformation]);

  /* Send quill changes to all clients */
  useEffect(() => {
    if (!fileId || quill === null || !user) {
      console.log("no fileId, quill, or user");
      return;
    }

    let isSubscribed = true;

    const setupChannel = async () => {
      try {
        // Set up presence tracking
        channel
          .on('presence', { event: 'sync' }, () => {
            if (!isSubscribed) return;
            const newState = channel.presenceState();
            const newCollaboratorsRaw = Object.values(newState).flat() as any || [];
            console.log('Presence state:', newState, 'Raw:', newCollaboratorsRaw);

            const newCollaborators = newCollaboratorsRaw.filter(
              (c: any) => c && typeof c.id === 'string' && typeof c.email === 'string' && typeof c.avatarUrl === 'string'
            );
            setCollaborators(newCollaborators as any);

            if (user && quill) {
              newCollaborators.forEach((collaborator: { id: string; email: string; avatarUrl: string }) => {
                if (collaborator.id !== user.id) {
                  const userCursor = quill.getModule('cursors');
                  const cursor = userCursor.createCursor(
                    collaborator.id,
                    collaborator.email.split('@')[0],
                    `#${Math.random().toString(16).slice(2, 8)}`
                  );
                  setLocalCursors(cursor);
                }
              });
            }
          })
          .on('presence', { event: 'join' }, ({ key, newPresences }) => {
            console.log('User joined:', newPresences);
          })
          .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
            console.log('User left:', leftPresences);
          })
          .subscribe(async (status) => {
            console.log("Channel status:", status);

            if (status === 'SUBSCRIBED' && user && isSubscribed) {
              try {
                const response = await findUser(user.id);
                if (!response) {
                  console.log("can't find user for collaboration");
                  return;
                }

                // Track user presence
                await channel.track({
                  id: user.id,
                  email: user.email || 'anonymous',
                  avatarUrl: response.avatar_url
                    ? supabase.storage.from('avatars').getPublicUrl(response.avatar_url).data.publicUrl
                    : '',
                });

                console.log("User presence tracked successfully");

                // Set up event handlers
                const selectionChangeHandler = (cursorId: string) => {
                  return async (range: { index: number, length: number },
                    oldRange: { index: number, length: number },
                    source: string) => {
                    if (source === 'user' && cursorId && fileId && range) {
                      try {
                        await channel.send({
                          type: "broadcast",
                          event: "send-cursor-move",
                          payload: { range, fileId, cursorId }
                        });
                        console.log("cursor-move sent");
                      } catch (error) {
                        console.log("error sending cursor-move", error);
                      }
                    }
                  };
                };

                const quillHandler = async (delta: any, oldDelta: any, source: string) => {
                  if (source !== 'user') return;

                  if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
                  setSaveStatus('saving');

                  const contents = quill.getContents();
                  const quillLength = quill.getLength();

                  saveTimerRef.current = setTimeout(async () => {
                    let saveResult;
                    if (contents && quillLength !== 1 && fileId) {
                      if (dirType === 'workspace') {
                        dispatch({
                          type: 'UPDATE_WORKSPACE',
                          payload: { workspace: { data: JSON.stringify(contents) }, workspaceId: fileId },
                        });
                        saveResult = await updateWorkspace({ data: JSON.stringify(contents) }, fileId);
                      } else if (dirType === 'folder') {
                        if (!workspaceId) return;
                        dispatch({
                          type: 'UPDATE_FOLDER',
                          payload: { folder: { data: JSON.stringify(contents) }, workspaceId, folderId: fileId },
                        });
                        saveResult = await updateFolder({ data: JSON.stringify(contents) }, fileId);
                      } else if (dirType === 'file') {
                        if (!workspaceId || !folderId) return;
                        dispatch({
                          type: 'UPDATE_FILE',
                          payload: { file: { data: JSON.stringify(contents) }, workspaceId, folderId: folderId, fileId },
                        });
                        saveResult = await updateFile({ data: JSON.stringify(contents) }, fileId);
                      }

                      if (!saveResult?.error) {
                        setSaveStatus('saved');
                        toast.success('Saved!');
                      } else {
                        setSaveStatus('error');
                        toast.error('Failed to save.');
                        console.error('Save error:', saveResult.error);
                      }
                    }
                  }, 850);

                  try {
                    await channel.send({
                      type: "broadcast",
                      event: "send-changes",
                      payload: { delta, fileId }
                    });
                    console.log("quill changes sent");
                  } catch (error: any) {
                    console.log("error sending changes", error);
                  }
                };

                // Attach event listeners
                quill.on('text-change', quillHandler);
                quill.on('selection-change', selectionChangeHandler(user.id));

                console.log("Event handlers attached successfully");
              } catch (error) {
                console.error('Error in subscription setup:', error);
              }
            } else {
              console.log("Not subscribed or user not available");
            }
          });
      } catch (error) {
        console.error('Error setting up channel:', error);
      }
    };

    setupChannel();

    /* listening for changes on the editor : added, deleted,  etc */
    const changesListener = channel.on("broadcast",
      { event: 'send-changes' },
      (payload: Payload<{ delta: any, fileId: string }>) => {
        if (fileId == payload!.payload!.fileId) {
          console.log("quill changes received: ", payload!.payload!.delta)
          quill.updateContents(payload!.payload!.delta);
        }
      });

    /* receiving cursor */
    const cursorListener = channel.on("broadcast",
      { event: "send-cursor-move" },
      (payload: Payload<{ range: any, fileId: string, cursorId: string }>) => {
        const { cursorId, range } = payload!.payload!;

        // check if the collaborators are working in the same file.
        if (fileId == payload!.payload!.fileId) {
          // we get quill cursor module to apply the cursor on the selected text.
          const userCursor = quill.getModule('cursors');
          userCursor.moveCursor(cursorId, range)
        };
      });

    return () => {
      isSubscribed = false;
      changesListener.unsubscribe();
      cursorListener.unsubscribe();
      if (channel) {
        channel.unsubscribe();
        supabase.removeChannel(channel);
      }
    }
  }, [fileId, quill, user, dirType, dispatch, folderId, setLocalCursors, supabase, workspaceId, channel]);

  // Banner logic: use own banner if set, else fallback to workspace banner
  const getBannerUrl = () => {
    if (dirDetails.banner_url) return dirDetails.banner_url;
    if ((dirType === 'folder' || dirType === 'file') && state.workspaces) {
      const parentWorkspace = state.workspaces.find(w => w.id === workspaceId);
      if (parentWorkspace && parentWorkspace.banner_url) {
        return parentWorkspace.banner_url;
      }
    }
    return null;
  };

  // check if the client is connected
  const isConnected = channel.presenceState();

  return (
    <>
      {isConnected ? <span className="text-green-500">🟢 connected</span> : <span className="text-red-500">🔴 not connected</span>}
      <div className="relative">
        {details.in_trash && (
          <article
            className="py-2 
          z-40 
          bg-[#EB5757] 
          flex  
          md:flex-row 
          flex-col 
          justify-center 
          items-center 
          gap-4 
          flex-wrap"
          >
            <div
              className="flex 
            flex-col 
            md:flex-row 
            gap-2 
            justify-center 
            items-center"
            >
              <span className="text-white">
                This {dirType} is in the trash.
              </span>
              <Button
                className="bg-transparent border-foreground text-foreground hover:bg-foreground hover:text-background"
                onClick={restoreFileHandler}
              >
                Restore
              </Button>

              <Button
                className="bg-transparent border-foreground text-foreground hover:bg-foreground hover:text-destructive"
                onClick={deleteFileHandler}
              >
                Delete
              </Button>
            </div>
            <span className="text-sm text-foreground">{details.in_trash}</span>
          </article>
        )}
        <div
          className="flex 
        flex-col-reverse 
        sm:flex-row 
        sm:justify-between 
        justify-center 
        sm:items-center 
        sm:p-2 
        p-8"
        >
          <div>{breadCrumbs?.replace('undefined', 'Your_workspace /')}</div>
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center h-10">
              {collaborators?.map((collaborator, index) => (
                <TooltipProvider key={index}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Avatar
                        className="
                      -ml-3 
                      bg-accent
                      border-2 
                      flex 
                      items-center 
                      justify-center 
                      border-border 
                      h-8 
                      w-8 
                      rounded-full
                      "
                      >
                        <AvatarImage
                          src={
                            collaborator.avatarUrl ? collaborator.avatarUrl : ''
                          }
                          className="rounded-full"
                        />
                        <AvatarFallback>
                          {collaborator.email.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </TooltipTrigger>
                    <TooltipContent>{collaborator.email}</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>
            <Button onClick={handleManualRefresh}
              className="text-xs px-2 py-1 h-7">
              Refresh
            </Button>
            {saveStatus === 'saving' && <span className="text-yellow-500">Saving...</span>}
            {saveStatus === 'saved' && <span className="text-green-500">Saved</span>}
            {saveStatus === 'error' && <span className="text-red-500">Error</span>}
            {/* <Button onClick={handleManualSave} className="absolute top-2 left-2 z-50" size="sm" variant="outline">Manual Save</Button> */}
          </div>
        </div>
      </div>
      {/* Banner display with inheritance */}
      {getBannerUrl() && (
        <div className="relative w-full h-[200px]">
          <Image
            src={
              supabase.storage
                .from('file-banners')
                .getPublicUrl(getBannerUrl() || '')
                .data.publicUrl ?? "/images/opengraph-image.png"
            }
            fill
            className="w-full md:h-48 h-20 object-cover"
            alt="Banner Image"
          />
        </div>
      )}
      <div
        className="flex justify-center items-center flex-col relative bg-card border border-border rounded-lg shadow-sm p-6 m-4" >
        <div
          className="w-full self-center max-w-3xl flex flex-col px-4 lg:my-8"
        >
          {/* Workspace Logo and Name Block */}
          <div className="w-full flex flex-col items-center gap-4">
            <EmojiPicker getValue={iconOnChange}>
              <div className="w-24 h-24 text-6xl flex items-center justify-center bg-muted rounded-full shadow-md cursor-pointer hover:bg-muted-foreground/20 transition-colors">
                {details.icon_id ?? dirDetails.icon_id}
              </div>
            </EmojiPicker>
            <div className='flex items-center gap-2 justify-center'>
              <div className='flex items-center gap-2'>
                <span className="text-muted-foreground text-md ">
                  {dirType.toUpperCase() + "NAME :  "}
                </span>
              </div>
              <InlineEdit
                value={details.title ?? dirDetails.title}
                onSave={titleOnChange}
                className="text-foreground text-3xl font-extrabold text-center "
                placeholder="Enter title..."
                maxLength={100}
                editOnlyWithIcon={dirType === 'folder' || dirType === 'file'}
              />
            </div>

          </div>
          {/* End Workspace Logo and Name Block */}
          <div className="flex jusbtify-between md:w-full m-3">

            <BannerUpload
              id={fileId}
              dirType={dirType}
              className="mt-2 text-sm p-2 hover:text-primary-blue-100
               transition-all rounded-md bg-primary text-primary-foreground
                hover:bg-primary/90 dark:hover:text-accent dark:text-gray-300 text-gray-300 cursor-pointer"
            >
              {(details.banner_url || dirDetails.banner_url) ? 'Update Banner' : 'Add Banner'}
            </BannerUpload>

            <div className="h-5 w-1 bg-border" />

            {(details.banner_url || dirDetails.banner_url) && (
              <Button
                disabled={deletingBanner}
                onClick={deleteBanner}
                className="gap-2 hover:bg-destructive/10 flex item-center justify-center mt-2 text-sm text-destructive w-36 p-2 rounded-md border border-destructive/20"
              >
                <XCircleIcon size={16} />
                <span className="whitespace-nowrap font-normal p-2 rounded-md">
                  Remove Banner
                </span>
              </Button>
            )}

          </div>
        </div>
        <div
          id="container"
          className="w-full min-h-[200px] h-auto border border-border rounded-md overflow-hidden"
          ref={wrapperRef}
        ></div>
      </div>
    </>
  );
});

QuillEditor.displayName = 'QuillEditor';

export default QuillEditor;
