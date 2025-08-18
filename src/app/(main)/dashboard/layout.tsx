import { SubscriptionModalProvider } from '@/lib/providers/subscription-modal-provider';
import { getActiveProductsWithPrice } from '@/lib/supabase/queries';
import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
  params: any;
}

const Layout: React.FC<LayoutProps> = async ({ children, params }) => {
  let products = [];

  try {
    const result = await getActiveProductsWithPrice();

    // Handle both error cases: explicit error or null/undefined data
    if (result.error || !result.data) {
      console.error('error get active product from layout: ', result.error || 'No data returned');
      // Use empty products array as fallback
      products = [];
    } else {
      products = result.data || [];
    }
  } catch (error) {
    console.error('Unexpected error getting products:', error);
    // Use empty products array as fallback
    products = [];
  }

  // Always provide a fallback products array to prevent errors
  const safeProducts = products || [];

  return (
    <main className="flex overflow-hidden h-screen bg-white border-r border-gray-200 shadow-lg dark:bg-background dark:border-none">
      <SubscriptionModalProvider products={safeProducts}>
        {children}
      </SubscriptionModalProvider>
    </main>
  );
};

export default Layout;
