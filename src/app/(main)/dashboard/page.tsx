import React from 'react';
import { verifyUserAuth, getUserPrimaryWorkspace, safeRedirect } from '@/lib/utils/auth-utils';
import {
  getUserSubscriptionStatus,
  getPrivateWorkspaces,
  getCollaboratingWorkspaces,
} from '@/lib/supabase/queries';
import DashboardSetupClientWrapper from '@/components/features/main/dashboard/components/DashboardSetupClientWrapper';
import DashboardPage from '@/components/features/main/dashboard';
import type { Metadata } from 'next';

// Force dynamic rendering to prevent static generation issues with cookies
export const dynamic = 'force-dynamic';

// Helper function to add a small delay to prevent race conditions
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const metadata: Metadata = {
  title: 'Dashboard | avom-brice realtime collaborative app',
  description:
    'Access your workspaces, collaborate in real-time, and manage your projects efficiently on the dashboard.',
  openGraph: {
    title: 'Dashboard | avom-brice realtime collaborative app',
    description:
      'Access your workspaces, collaborate in real-time, and manage your projects efficiently on the dashboard.',
    url: '/dashboard',
    images: [
      {
        url: '/images/appBanner.png',
        width: 1200,
        height: 630,
        alt: 'Dashboard Banner',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Dashboard | avom-brice realtime collaborative app',
    description:
      'Access your workspaces, collaborate in real-time, and manage your projects efficiently on the dashboard.',
    images: ['/images/appBanner.png'],
  },
  alternates: {
    canonical: '/dashboard',
  },
  icons: {
    icon: '/favicon.ico',
  },
};

export default DashboardPage;
