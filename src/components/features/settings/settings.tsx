import React from 'react';
import { CustomDialogTrigger } from '@/components/global-components';
import SettingsForm from './settings-form';

interface SettingsProps {
  children: React.ReactNode;
}

export default function Settings({ children }: SettingsProps) {
  return (
    <CustomDialogTrigger header="Settings" content={<SettingsForm />}>
      {children}
    </CustomDialogTrigger>
  );
}
