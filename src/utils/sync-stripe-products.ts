import { stripe } from '../lib/stripe';
import { upsertProductRecord, upsertPriceRecord } from '../lib/stripe/admin-tasks';

export async function syncStripeProductsAndPrices() {
  console.log('\n\n syncing stripe products and prices');
  try {
    const products = await stripe.products.list({ active: true, limit: 100 });
    for (const product of products.data) {
      await upsertProductRecord(product);
      const prices = await stripe.prices.list({ product: product.id, active: true, limit: 100 });
      for (const price of prices.data) {
        await upsertPriceRecord(price);
      }
    }
    console.log('✅ Stripe products and prices synced successfully!');
  } catch (err) {
    console.error('❌ Error syncing Stripe products/prices:', err);
    process.exit(1);
  }
}
