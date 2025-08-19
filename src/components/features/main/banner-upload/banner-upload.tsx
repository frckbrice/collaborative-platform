import React, { memo } from 'react';
import { CustomDialogTrigger } from '@/components/global-components';
import BannerUploadForm from './components/banner-upload-form';

interface BannerUploadProps {
  children: React.ReactNode;
  className?: string;
  dirType: 'workspace' | 'file' | 'folder';
  id: string;
}

const BannerUpload = memo(({ id, dirType, children, className }: BannerUploadProps) => {
  return (
    <CustomDialogTrigger
      header="Upload Banner"
      content={<BannerUploadForm dirType={dirType} id={id} />}
      className={className}
    >
      {children}
    </CustomDialogTrigger>
  );
});

BannerUpload.displayName = 'BannerUpload';

export default BannerUpload;
