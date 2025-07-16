import Link from 'next/link';
import React from 'react';
import { twMerge } from 'tailwind-merge';
import CypressHomeIcon from '../../../icons/cypressHomeIcon';
import CypressSettingsIcon from '../../../icons/cypressSettingsIcon';
import CypressTrashIcon from '../../../icons/cypressTrashIcon';
import Settings from '../../settings/settings';
import { Trash } from '../../trash';

interface NativeNavigationProps {
  myWorkspaceId: string;
  className?: string;
}

export default function NativeNavigation({ myWorkspaceId, className }: NativeNavigationProps) {
  return (
    // add a beautofull background color.
    <nav className={twMerge('my-2 bg-gray-50 rounded-lg shadow p-3 dark:bg-background', className)}>
      <ul className="flex flex-col gap-2">
        <li>
          <Link
            className="group/native flex gap-2 items-center pl-0 px-3 py-2 rounded-lg hover:bg-primary/10 hover:text-primary text-gray-900 transition-all dark:text-Neutrals/neutrals-7 dark:hover:bg-accent/10"
            href={`/dashboard/${myWorkspaceId}`}
          >
            <CypressHomeIcon />
            <span>My Workspace</span>
          </Link>
        </li>

        <Settings>
          <li
            className="group/native
            flex
            dark:text-Neutrals/neutrals-7
            transition-all
            gap-2
            cursor-pointer
          "
          >
            <CypressSettingsIcon />
            <span>Settings</span>
          </li>
        </Settings>

        <Trash>
          <li
            className="group/native
            flex
            dark:text-Neutrals/neutrals-7
            transition-all
            gap-2
          "
          >
            <CypressTrashIcon />
            <span>Trash</span>
          </li>
        </Trash>
      </ul>
    </nav>
  );
}
