import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2024-04-10',
  typescript: true,
  appInfo: {
    name: 'av-digital-workspaces',
    version: '1.0.0',
  },
});
