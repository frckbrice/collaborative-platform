'use client';

import * as React from 'react';
import { useAppState } from '@/lib/providers/state-provider';
import { workspace } from '@/lib/supabase/supabase.types';
import SelectedWorkspace from './selected-workspace';
import { CustomDialogTrigger, WorkspaceCreator } from '@/components/global-components';

export interface IWorkSpaceDropdownProps {
  privateWorkspaces: workspace[] | [];
  sharedWorkspaces: workspace[] | [];
  collaboratingWorkspaces: workspace[] | [];
  defaultValue: workspace | undefined;
}

export function WorkSpaceDropdown({
  privateWorkspaces,
  collaboratingWorkspaces,
  sharedWorkspaces,
  defaultValue,
}: IWorkSpaceDropdownProps) {
  const { dispatch, state } = useAppState();
  const [selectedOption, setSelectedOption] = React.useState(defaultValue);
  const [isOpen, setIsOpen] = React.useState(false);

  React.useEffect(() => {
    if (!state.workspaces.length && dispatch) {
      dispatch({
        type: 'SET_WORKSPACES',
        payload: {
          workspaces: [...privateWorkspaces, ...sharedWorkspaces, ...collaboratingWorkspaces].map(
            (workspace) => ({ ...workspace, folders: [] })
          ),
        },
      });
    }
  }, [privateWorkspaces, collaboratingWorkspaces, sharedWorkspaces, dispatch, state.workspaces]);

  const handleSelect = (option: workspace) => {
    setSelectedOption(option);
    setIsOpen(false);
  };

  return (
    <div
      className=" relative inline-block
        text-left"
    >
      <div>
        <span onClick={() => setIsOpen(!isOpen)}>
          {selectedOption ? <SelectedWorkspace workspace={selectedOption} /> : 'Select a workspace'}
        </span>
      </div>
      {isOpen && (
        <div
          className="origin-top-right
          absolute
          w-full
          rounded-md
          shadow-md
          z-50
          min-h-[250px]
          h-auto
          min-w-[320px]
          p-2
          bg-black/10
          backdrop-blur-lg
          group
          overflow-y-scroll
          border-[1px]
          border-muted
      "
        >
          <div className="rounded-md flex flex-col">
            <div className="!p-2">
              {!!privateWorkspaces.length && (
                <>
                  <p className="text-muted-foreground">Private</p>
                  <hr></hr>
                  {privateWorkspaces.map((option) => (
                    <SelectedWorkspace key={option.id} workspace={option} onClick={handleSelect} />
                  ))}
                </>
              )}
              {!!sharedWorkspaces.length && (
                <>
                  <p className="text-muted-foreground">Shared</p>
                  <hr />
                  {sharedWorkspaces.map((option) => (
                    <SelectedWorkspace key={option.id} workspace={option} onClick={handleSelect} />
                  ))}
                </>
              )}
              {!!collaboratingWorkspaces.length && (
                <>
                  <p className="text-muted-foreground">Collaborating</p>
                  <hr />
                  {collaboratingWorkspaces.map((option) => (
                    <SelectedWorkspace key={option.id} workspace={option} onClick={handleSelect} />
                  ))}
                </>
              )}
            </div>
            <CustomDialogTrigger
              header="Create A Workspace"
              content={<WorkspaceCreator />}
              description="Workspaces give you the power to collaborate with others. You can change your workspace privacy settings after creating the workspace too."
            >
              <div
                className="flex 
              transition-all 
              hover:bg-muted 
              justify-center 
              items-center 
              gap-2 
              p-2 
              w-full"
              >
                <article
                  className="text-slate-500 
                rounded-full
                 bg-slate-800 
                 w-5 
                 h-5 
                 flex 
                 items-center 
                 justify-center"
                >
                  +
                </article>
                Create workspace
              </div>
            </CustomDialogTrigger>
          </div>
        </div>
      )}
    </div>
  );
}

export default React.memo(WorkSpaceDropdown);
