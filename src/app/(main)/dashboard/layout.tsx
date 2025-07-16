import { SubscriptionModalProvider } from '@/lib/providers/subscription-modal-provider';
import { getActiveProductsWithPrice } from '@/lib/supabase/queries';
import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
  params: any;
}

const Layout: React.FC<LayoutProps> = async ({ children, params }) => {
  const { data: products, error } = await getActiveProductsWithPrice();
  if (error) {
    console.error('error get active product from layout: ', error);
    throw new Error('error get active product from layout: ');
  }

  return (
    <main className="flex overflow-hidden h-screen bg-white border-r border-gray-200 shadow-lg dark:bg-background dark:border-none">
      <SubscriptionModalProvider products={products}>
        {children}
      </SubscriptionModalProvider>
    </main>
  );
};

export default Layout;
