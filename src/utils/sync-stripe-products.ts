import { stripe } from '../lib/stripe';
import { upsertProductRecord, upsertPriceRecord } from '../lib/stripe/admin-tasks';
import { logger } from './logger';

export async function syncStripeProductsAndPrices() {
  logger.info('Starting Stripe products and prices sync...');

  // Check if Stripe is properly configured
  if (!stripe) {
    const error = 'Stripe client is not initialized';
    logger.error('❌ Stripe configuration error:', error);
    throw new Error(error);
  }

  // Check if Stripe secret key is available
  if (!process.env.STRIPE_SECRET_KEY) {
    const error = 'STRIPE_SECRET_KEY environment variable is not set';
    logger.error('❌ Stripe configuration error:', error);
    throw new Error(error);
  }

  try {
    logger.info('Fetching products from Stripe...');
    const products = await stripe.products.list({ active: true, limit: 100 });
    logger.info(`Found ${products.data.length} active products in Stripe`);

    if (products.data.length === 0) {
      logger.warn(
        '⚠️ No active products found in Stripe. Please create products in your Stripe dashboard first.'
      );
      return { success: true, productsCount: 0, message: 'No products to sync' };
    }

    for (const product of products.data) {
      logger.info(`Syncing product: ${product.name} (${product.id})`);
      try {
        await upsertProductRecord(product);
        logger.info(`✅ Product synced: ${product.name}`);
      } catch (productError) {
        logger.error(`❌ Failed to sync product ${product.name}:`, productError);
        // Continue with other products instead of failing completely
        continue;
      }

      try {
        const prices = await stripe.prices.list({ product: product.id, active: true, limit: 100 });
        logger.info(`Found ${prices.data.length} active prices for product ${product.name}`);

        for (const price of prices.data) {
          logger.info(`Syncing price: ${price.id} for product ${product.name}`);
          try {
            await upsertPriceRecord(price);
            logger.info(`✅ Price synced: ${price.id}`);
          } catch (priceError) {
            logger.error(`❌ Failed to sync price ${price.id}:`, priceError);
            // Continue with other prices
            continue;
          }
        }
      } catch (pricesError) {
        logger.error(`❌ Failed to fetch prices for product ${product.name}:`, pricesError);
        // Continue with other products
        continue;
      }
    }

    logger.info('✅ Stripe products and prices sync completed!');
    return { success: true, productsCount: products.data.length };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
    const errorStack = err instanceof Error ? err.stack : 'No stack trace available';

    logger.error('❌ Error syncing Stripe products/prices:', {
      message: errorMessage,
      stack: errorStack,
      error: err,
    });

    throw new Error(`Stripe sync failed: ${errorMessage}`);
  }
}
