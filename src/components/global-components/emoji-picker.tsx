'use client';

import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import React, { memo } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface EmojiPickerProps {
  children?: React.ReactNode;
  getValue?: (emoji: string) => void;
}

function EmojiPicker({ children, getValue }: EmojiPickerProps) {
  const route = useRouter();
  const Picker = dynamic(() => import('emoji-picker-react'), {
    ssr: false,
  });
  const onClick = (selectedEmoji: any) => {
    if (getValue) {
      getValue(selectedEmoji.emoji);
    }
  };

  return (
    <div className="flex items-center">
      <Popover>
        <PopoverTrigger className="cursor-pointer">{children}</PopoverTrigger>
        <PopoverContent
          className="p-0
          border-none
        "
        >
          <Picker onEmojiClick={onClick} />
        </PopoverContent>
      </Popover>
    </div>
  );
}

export default memo(EmojiPicker);
