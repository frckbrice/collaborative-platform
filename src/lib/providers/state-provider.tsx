'use client';

import React, { Dispatch, createContext, useContext, useEffect, useMemo, useReducer, useState } from 'react';
import { File, Folder, User, workspace } from '../supabase/supabase.types';
import { usePathname } from 'next/navigation';
import { getFiles } from '../supabase/queries';
import { Loader } from '@/components/global-components';

export type appFoldersType = Folder & { files: File[] | [] };
export type appWorkspacesType = workspace & {
  folders: appFoldersType[] | [];
};

interface AppState {
  workspaces: appWorkspacesType[] | [];
}

type Action =
  | { type: 'ADD_WORKSPACE'; payload: appWorkspacesType }
  | { type: 'DELETE_WORKSPACE'; payload: string }
  | {
    type: 'UPDATE_WORKSPACE';
    payload: { workspace: Partial<appWorkspacesType>; workspaceId: string };
    }
  | {
    type: 'UPDATE_USER';
    payload: { user: Partial<User>; userId: string };
    }
  | {
    type: 'SET_WORKSPACES';
    payload: { workspaces: appWorkspacesType[] | [] };
    }
  | {
    type: 'SET_FOLDERS';
    payload: { workspaceId: string; folders: [] | appFoldersType[] };
    }
  | {
    type: 'ADD_FOLDER';
    payload: { workspaceId: string; folder: appFoldersType };
    }
  | {
    type: 'ADD_FILE';
    payload: { workspaceId: string; file: File; folderId: string };
    }
  | {
    type: 'DELETE_FILE';
    payload: { workspaceId: string; folderId: string; fileId: string };
    }
  | {
    type: 'DELETE_FOLDER';
    payload: { workspaceId: string; folderId: string };
    }
  | {
    type: 'SET_FILES';
    payload: { workspaceId: string; files: File[]; folderId: string };
    }
  | {
    type: 'UPDATE_FOLDER';
    payload: {
      folder: Partial<appFoldersType>;
      workspaceId: string;
      folderId: string;
    };
    }
  | {
    type: 'UPDATE_FILE';
    payload: {
      file: Partial<File>;
      folderId: string;
      workspaceId: string;
      fileId: string;
    };
    };

const initialState: AppState = { workspaces: [] };

const appReducer = (state: AppState = initialState, action: Action): AppState => {
  switch (action.type) {
    case 'ADD_WORKSPACE':
      return {
        ...state,
        workspaces: [...state.workspaces, action.payload],
      };
    case 'DELETE_WORKSPACE':
      return {
        ...state,
        workspaces: state.workspaces.filter((workspace) => workspace.id !== action.payload),
      };
    case 'UPDATE_WORKSPACE':
      return {
        ...state,
        workspaces: state.workspaces.map((workspace) => {
          if (workspace.id === action.payload.workspaceId) {
            return {
              ...workspace,
              ...action.payload.workspace,
            };
          }
          return workspace;
        }),
      };
    case 'SET_WORKSPACES':
      return {
        ...state,
        workspaces: action.payload.workspaces,
      };
    case 'SET_FOLDERS':
      return {
        ...state,
        workspaces: state.workspaces.map((workspace) => {
          if (workspace.id === action.payload.workspaceId) {
            return {
              ...workspace,
              folders: action.payload.folders.sort(
                (a, b) =>
                  new Date(a.created_at as string).getTime() -
                  new Date(b.created_at as string).getTime()
              ),
            };
          }
          return workspace;
        }),
      };
    case 'ADD_FOLDER':
      return {
        ...state,
        workspaces: state.workspaces.map((workspace) => {
          if (workspace.id === action.payload.workspaceId) {
            return {
              ...workspace,
              folders: [...workspace.folders, action.payload.folder].sort(
                (a, b) =>
                  new Date(a.created_at as string).getTime() -
                  new Date(b.created_at as string).getTime()
              ),
            };
          }
          return workspace;
        }),
      };
    case 'UPDATE_FOLDER':
      return {
        ...state,
        workspaces: state.workspaces.map((workspace) => {
          if (workspace.id === action.payload.workspaceId) {
            return {
              ...workspace,
              folders: workspace.folders.map((folder) => {
                if (folder.id === action.payload.folderId) {
                  return { ...folder, ...action.payload.folder };
                }
                return folder;
              }),
            };
          }
          return workspace;
        }),
      };
    case 'DELETE_FOLDER':
      return {
        ...state,
        workspaces: state.workspaces.map((workspace) => {
          if (workspace.id === action.payload.workspaceId) {
            return {
              ...workspace,
              folders: workspace.folders.filter((folder) => folder.id !== action.payload.folderId),
            };
          }
          return workspace;
        }),
      };
    case 'SET_FILES':
      return {
        ...state,
        workspaces: state.workspaces.map((workspace) => {
          if (workspace.id === action.payload.workspaceId) {
            return {
              ...workspace,
              folders: workspace.folders.map((folder) => {
                if (folder.id === action.payload.folderId) {
                  return {
                    ...folder,
                    files: action.payload.files,
                  };
                }
                return folder;
              }),
            };
          }
          return workspace;
        }),
      };
    case 'ADD_FILE':
      return {
        ...state,
        workspaces: state.workspaces.map((workspace) => {
          if (workspace.id === action.payload.workspaceId) {
            return {
              ...workspace,
              folders: workspace.folders.map((folder) => {
                if (folder.id === action.payload.folderId) {
                  return {
                    ...folder,
                    files: [...folder.files, action.payload.file].sort(
                      (a, b) =>
                        new Date(a.created_at as string).getTime() -
                        new Date(b.created_at as string).getTime()
                    ),
                  };
                }
                return folder;
              }),
            };
          }
          return workspace;
        }),
      };
    case 'DELETE_FILE':
      return {
        ...state,
        workspaces: state.workspaces.map((workspace) => {
          if (workspace.id === action.payload.workspaceId) {
            return {
              ...workspace,
              folder: workspace.folders.map((folder) => {
                if (folder.id === action.payload.folderId) {
                  return {
                    ...folder,
                    files: folder.files.filter((file) => file.id !== action.payload.fileId),
                  };
                }
                return folder;
              }),
            };
          }
          return workspace;
        }),
      };
    case 'UPDATE_FILE':
      return {
        ...state,
        workspaces: state.workspaces.map((workspace) => {
          if (workspace.id === action.payload.workspaceId) {
            return {
              ...workspace,
              folders: workspace.folders.map((folder) => {
                if (folder.id === action.payload.folderId) {
                  return {
                    ...folder,
                    files: folder.files.map((file) => {
                      if (file.id === action.payload.fileId) {
                        return {
                          ...file,
                          ...action.payload.file,
                        };
                      }
                      return file;
                    }),
                  };
                }
                return folder;
              }),
            };
          }
          return workspace;
        }),
      };
    default:
      return initialState;
  }
};

const AppStateContext = createContext<
  | {
    state: AppState;
    dispatch: Dispatch<Action>;
    workspaceId: string | undefined;
    folderId: string | undefined;
    fileId: string | undefined;
  }
  | undefined
>({
  state: initialState,
  dispatch: () => null,
  workspaceId: undefined,
  folderId: undefined,
  fileId: undefined,
});

interface AppStateProviderProps {
  children: React.ReactNode;
}

export default function AppStateProvider({ children }: AppStateProviderProps) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const pathname = usePathname();

  const workspaceId = useMemo(() => {
    const urlSegments = pathname?.split('/').filter(Boolean);
    if (urlSegments)
      if (urlSegments.length > 1) {
        return urlSegments[1];
      }
  }, [pathname]);

  const folderId = useMemo(() => {
    const urlSegments = pathname?.split('/').filter(Boolean);
    if (urlSegments)
      if (urlSegments?.length > 2) {
        return urlSegments[2];
      }
  }, [pathname]);

  const fileId = useMemo(() => {
    const urlSegments = pathname?.split('/').filter(Boolean);
    if (urlSegments)
      if (urlSegments?.length > 3) {
        return urlSegments[3];
      }
  }, [pathname]);

  useEffect(() => {
    if (!folderId || !workspaceId) return;
    const fetchFiles = async () => {
      const { error: filesError, data } = await getFiles(folderId);
      if (filesError) {
        // console.log(filesError);
      }
      if (!data) return;
      dispatch({
        type: 'SET_FILES',
        payload: { workspaceId, files: data, folderId },
      });
    };
    fetchFiles();
  }, [folderId, workspaceId]);

  return (
    <AppStateContext.Provider value={{ state, dispatch, workspaceId, folderId, fileId }}>
      {children}
    </AppStateContext.Provider>
  );
}

export const useAppState = () => {
  const context = useContext(AppStateContext);
  if (!context || !context.state) {
    throw new Error('useAppState must be used within an AppStateProvider');
  }
  return context;
};
