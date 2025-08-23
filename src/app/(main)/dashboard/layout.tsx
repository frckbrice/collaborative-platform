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

    // If no products found, try to sync automatically from Stripe
    if (products.length === 0) {
      logger.info('No products found in database, attempting automatic sync from Stripe...');
      try {
        // Import and run sync function
        const { syncStripeProductsAndPrices } = await import('@/utils/sync-stripe-products');
        const syncResult = await syncStripeProductsAndPrices();

        if (syncResult?.success) {
          logger.info(`Auto-sync successful, found ${syncResult.productsCount} products`);
          // Fetch products again after sync
          const retryResult = await getActiveProductsWithPrice();
          if (retryResult.data && retryResult.data.length > 0) {
            products = retryResult.data;
            logger.info('Products loaded successfully after auto-sync');
          } else {
            logger.warn('Auto-sync succeeded but no products were loaded from database');
          }
        } else {
          logger.warn('Auto-sync returned success: false');
        }
      } catch (syncError) {
        logger.error('Auto-sync failed with error:', {
          error: syncError,
          message: syncError instanceof Error ? syncError.message : 'Unknown error',
          stack: syncError instanceof Error ? syncError.stack : 'No stack trace',
        });

        // Check if it's a configuration issue
        if (syncError instanceof Error) {
          if (syncError.message.includes('STRIPE_SECRET_KEY')) {
            logger.error(
              'Stripe configuration issue: STRIPE_SECRET_KEY environment variable is missing'
            );
          } else if (syncError.message.includes('Stripe client is not initialized')) {
            logger.error('Stripe configuration issue: Stripe client failed to initialize');
          } else if (syncError.message.includes('No active products found')) {
            logger.warn(
              'Stripe has no active products. Please create products in your Stripe dashboard first.'
            );
          }
        }

        // Continue with empty products - user will see fallback UI
      }
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
