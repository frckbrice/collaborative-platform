import { MobileSideBar } from '@/components/features/side-bar';
import Sidebar from '@/components/features/side-bar';
import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
  params: any;
}

const Layout: React.FC<LayoutProps> = ({ children, params }) => {
  return (
    <main
      className="flex overflow-hidden h-screen w-screen bg-white border-r border-gray-200 shadow-lg dark:bg-background dark:border-none"
    >
      <Sidebar params={params}
        className="bg-white border-r 
        border-gray-200 
        dark:bg-white/10 
        dark:border-gray-400 
        dark:border-none" />
      <MobileSideBar>
        <Sidebar params={params} className="w-screen inline-block sm:hidden bg-white border-b border-gray-200 dark:bg-background dark:border-none" />
      </MobileSideBar>
      <div
        className="border-l border-gray-200 w-full relative overflow-scroll bg-gray-50 dark:bg-background dark:border-none"
      >
        {children}
      </div>
    </main>
  );
};

export default Layout;
