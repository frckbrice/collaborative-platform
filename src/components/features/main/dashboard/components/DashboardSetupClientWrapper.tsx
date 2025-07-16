'use client';
import React from 'react';
import { DashboardSetup } from './dynamic-import';

interface DashboardSetupClientWrapperProps {
    user: any;
    supabaseSubscription: any;
}

const DashboardSetupClientWrapper: React.FC<DashboardSetupClientWrapperProps> = ({ user, supabaseSubscription }) => {
    return <DashboardSetup user={user} supabaseSubscription={supabaseSubscription} />;
};

export default DashboardSetupClientWrapper; 
