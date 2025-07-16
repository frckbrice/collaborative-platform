import React from 'react';
import CustomDialogTrigger from '../../global-components/custom-dialog-trigger';
import TrashRestore from './trash-restore';

interface TrashProps {
  children: React.ReactNode;
}
export function Trash({ children }: TrashProps): JSX.Element {
  return (
    <CustomDialogTrigger header="" content={<TrashRestore />}>
      {children}
    </CustomDialogTrigger>
  );
}
