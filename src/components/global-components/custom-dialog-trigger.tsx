import React, { memo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import clsx from 'clsx';

interface CustomDialogTriggerProps {
  header?: string;
  content?: React.ReactNode;
  children: React.ReactNode;
  description?: string;
  className?: string;
}

const CustomDialogTrigger: React.FC<CustomDialogTriggerProps> = memo(
  ({ header, content, children, description, className }) => {
    return (
      <Dialog>
        <DialogTrigger className={clsx('', className)}>{children}</DialogTrigger>
        <DialogContent className="block w-full max-w-3xl sm:max-w-2xl sm:h-auto h-[90vh] p-8 bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col justify-center items-center dark:bg-background dark:border-none max-h-screen overflow-y-auto">
          <DialogHeader className="w-full mb-4">
            <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-foreground">
              {header}
            </DialogTitle>
            <DialogDescription className="text-gray-500 dark:text-muted-foreground">
              {description}
            </DialogDescription>
          </DialogHeader>
          <div className="w-full flex-1 flex flex-col items-center justify-center">{content}</div>
        </DialogContent>
      </Dialog>
    );
  }
);

CustomDialogTrigger.displayName = 'CustomDialogTrigger';

export default CustomDialogTrigger;
