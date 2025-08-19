'use client';

import { Loader } from '@/components/global-components';
import dynamic from 'next/dynamic';

export const DashboardSetup = dynamic(() => import('./dashboard-setup'), {
  loading: () => (
    <div className="flex justify-center items-center h-screen">
      <Loader message="Loading setup ..." size="xl" color="purple" />
    </div>
  ),
  ssr: false,
});
