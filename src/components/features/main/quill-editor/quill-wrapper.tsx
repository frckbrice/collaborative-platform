import React from 'react';

type Props = {
  children: React.ReactNode;
};

const QuillWrapper = ({ children }: Props) => {
  return (
    <div className="flex justify-center items-start py-4 px-1">
      <div
        className="w-full max-w-3xl bg-white dark:bg-gray-800 rounded-xl shadow border
     border-gray-200 p-3 flex flex-col  dark:border-white/10 dark:shadow-gray-700 "
      >
        <div className="flex-1 min-h-[200px] h-auto">{children}</div>
      </div>
    </div>
  );
};

export default QuillWrapper;
