'use client';
import Sidebar from './side-bar';
import React from 'react';

// Client component for sidebar toggle logic
const SidebarToggleWrapper = ({ params, className }: { params: any; className?: string }) => {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  return (
    <>
      <button
        className="fixed top-4 left-4 z-50 bg-primary text-primary-foreground px-3 py-2 rounded shadow hover:bg-primary/90"
        onClick={() => setSidebarOpen((open) => !open)}
        aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
      >
        {sidebarOpen ? 'Close Sidebar' : 'Open Sidebar'}
      </button>
      {sidebarOpen && <Sidebar params={params} className={className} />}
    </>
  );
};

export default SidebarToggleWrapper;
