import { SubscriptionModalProvider } from '@/lib/providers/subscription-modal-provider';
import { getActiveProductsWithPrice } from '@/lib/supabase/queries';
import React from 'react';
import { logger } from '@/utils/logger';

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
      logger.error('error get active product from layout: ', result.error || 'No data returned');
      // Use empty products array as fallback
      products = [];
    } else {
      products = result.data || [];
    }

    // Debug products loading
    logger.info('Dashboard Layout - Products loaded:', {
      productsCount: products.length,
      products: products.map((p) => ({ id: p.id, name: p.name, pricesCount: p.prices?.length })),
      hasError: !!result.error,
      error: result.error,
    });
  } catch (error) {
    logger.error('Unexpected error getting products:', error);
    // Use empty products array as fallback
    products = [];
  }

  // Always provide a fallback products array to prevent errors
  const safeProducts = products || [];

  return (
    <main className="flex overflow-hidden h-screen bg-white border-r border-gray-200 shadow-lg dark:bg-background dark:border-none">
      <SubscriptionModalProvider products={safeProducts}>{children}</SubscriptionModalProvider>
    </main>
  );
};

export default Layout;
