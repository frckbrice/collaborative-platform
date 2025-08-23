import Stripe from 'stripe';

import { Price, Product, Subscription } from '../supabase/supabase.types';
import { postgrestGet, postgrestPost, postgrestPut } from '@/utils/client';
import { stripe } from '.';
import { toDateTime } from '../utils';
import { StripeError } from '@stripe/stripe-js';

// when we create a product in stripe, the app will listen to webhooks and it will sync accordingly
export const upsertProductRecord = async (product: Stripe.Product) => {
  // create product object data
  const productData: Product = {
    id: product.id,
    active: product.active,
    name: product.name,
    description: product.description || null,
    image: product.images?.[0] || null,
    metadata: product.metadata || null,
  };

  try {
    // Try to insert first, if it fails due to duplicate, try to update
    try {
      await postgrestPost('products', productData);
    } catch (error: any) {
      // If it's a duplicate key error, try to update instead
      if (error.message?.includes('duplicate') || error.message?.includes('already exists')) {
        await postgrestPut('products', productData, { id: `eq.${product.id}` });
      } else {
        throw error;
      }
    }
  } catch (error: Error | any) {
    console.error(`Error upserting product ${product.id}:`, error);
    throw new Error(`Failed to upsert product: ${error.message}`);
  }
};

/**
 * Upserts a price record in the database based on the provided Stripe price object.
 *
 * @param {Stripe.Price} price - The Stripe price object to upsert.
 * @return {Promise<void>} - A promise that resolves when the upsert operation is complete.
 * @throws {Error} - If there is an error creating the price.
 */
export const upsertPriceRecord = async (price: Stripe.Price) => {
  // create price object data
  const priceData: Price = {
    id: price.id,
    active: price.active,
    currency: price.currency,
    unit_amount: price.unit_amount,
    product_id: typeof price.product === 'string' ? price.product : price.product?.id || null,
    description: price.nickname ?? null,
    type: price.type,
    interval: price.recurring?.interval ?? null,
    interval_count: price.recurring?.interval_count ?? null,
    trial_period_days: price.recurring?.trial_period_days ?? null,
    metadata: price.metadata || null,
  };

  try {
    // Try to insert first, if it fails due to duplicate, try to update
    try {
      await postgrestPost('prices', priceData);
    } catch (error: any) {
      // If it's a duplicate key error, try to update instead
      if (error.message?.includes('duplicate') || error.message?.includes('already exists')) {
        await postgrestPut('prices', priceData, { id: `eq.${price.id}` });
      } else {
        throw error;
      }
    }
  } catch (error: Error | any) {
    console.error(`Error upserting price ${price.id}:`, error);
    throw new Error(`Failed to upsert price: ${error.message}`);
  }
};

/**
 * Retrieves or creates a customer in the database and returns the customer ID.
 *
 * @param {Object} params - The parameters for the function.
 * @param {string} params.email - The email of the customer.
 * @param {string} params.uuid - The UUID of the customer.
 * @return {Promise<string>} The customer ID.
 * @throws {Error} If there is an error retrieving the customer from the database or creating a new customer.
 */
export const createOrRetrieveCustomer = async ({
  email,
  uuid,
}: {
  email: string;
  uuid: string;
}) => {
  try {
    // first retrieve the customer if he already exists
    const response = await postgrestGet('customers', { id: `eq.${uuid}` });
    if (!response || response.length === 0) {
      throw new Error('Error retrieving customer from DB');
    }
    // return customer id if exists
    return response[0].stripe_customer_id;
  } catch (error) {
    console.log('creating customer...');

    // creating customer data
    const customerData: { metadata: { supabaseUUID: string }; email?: string } = {
      metadata: { supabaseUUID: uuid },
    };
    if (email) customerData.email = email;

    try {
      const customer = await stripe.customers.create(customerData);
      await postgrestPost('customers', { id: uuid, stripe_customer_id: customer.id });

      console.log(
        'new customer created and inserted successfully: ',
        'uuid: ',
        uuid,
        'customer_id: ',
        customer.id
      );
      // return customer id
      return customer.id;
    } catch (error: StripeError | any) {
      throw new Error(error.message);
    }
  }
};

/**
 * Copies the billing details from the given payment method to the customer in the database.
 *
 * @param {string} uuid - The unique identifier of the customer.
 * @param {Stripe.PaymentMethod} payment_method - The payment method containing the billing details.
 * @return {Promise<void>} A promise that resolves when the billing details are successfully copied.
 * @throws {Error} If an error occurs while copying the billing details.
 */
export const copyBillingDetailsToCustomer = async (
  uuid: string,
  payment_method: Stripe.PaymentMethod
) => {
  // get customer from stripe payment method customer
  const customer = payment_method.customer as string;
  const { name, phone, address } = payment_method.billing_details;

  //if no customer info, it means no customer subscribed
  if (!name || !phone || !address) {
    console.log('No name or phone or address provided for customer');
    return;
  }

  // we need to update the current user data, since he has just his customer id on stripe
  //@ts-ignore
  await stripe.customers.update(customer, { name, phone, address });

  try {
    // we update local user with his billing data using PostgREST API
    await postgrestPut(
      'users',
      {
        billing_address: { ...address },
        payment_method: { ...payment_method[payment_method.type] },
      },
      { id: `eq.${uuid}` }
    );
  } catch (error: Error | any) {
    throw new Error(error.message);
  }
};

/**
 * Manages the status change of a subscription.
 *
 * @param {string} subscriptionId - The ID of the subscription.
 * @param {string} customerId - The ID of the customer.
 * @param {boolean} createAction - Indicates if the action is to initiate payment.
 * @return {Promise<void>} - A promise that resolves when the subscription status is updated.
 */
export const manageSubscriptionStatusChange = async (
  subscriptionId: string,
  customerId: string,
  createAction: boolean = false
) => {
  try {
    // find subscribed user
    const customerData = await postgrestGet('customers', {
      stripe_customer_id: `eq.${customerId}`,
    });

    if (!customerData || customerData.length === 0) {
      console.log('No customer stripe id found');
      throw new Error('🔴Cannot find the stripe customer');
    }

    /// get his id
    const { id: uuid } = customerData[0];

    // retrive his subscription from stripe account
    const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
      expand: ['default_payment_method'],
    });

    // build subscription object
    const subscriptionData: Subscription = {
      id: subscription.id,
      user_id: uuid,
      metadata: subscription.metadata || null,
      price_id: subscription.items.data[0].price?.id || null,
      //@ts-ignore
      quantity: subscription.quantity || null,
      //@ts-ignore
      status: subscription.status,
      cancel_at_period_end: subscription.cancel_at_period_end,
      cancel_at: subscription.cancel_at
        ? new Date(subscription.cancel_at * 1000).toISOString()
        : null,
      canceled_at: subscription.canceled_at
        ? toDateTime(subscription.canceled_at).toISOString()
        : null,
      //@ts-ignore
      current_period_end: subscription.current_period_end
        ? new Date(subscription.current_period_end * 1000).toISOString()
        : null,
      //@ts-ignore
      current_period_start: subscription.current_period_start
        ? new Date(subscription.current_period_start * 1000).toISOString()
        : null,
      ended_at: subscription.ended_at ? new Date(subscription.ended_at * 1000).toISOString() : null,
      start_date: subscription.start_date
        ? new Date(subscription.start_date * 1000).toISOString()
        : null,
      trial_start: subscription.trial_start
        ? new Date(subscription.trial_start * 1000).toISOString()
        : null,
      trial_end: subscription.trial_end
        ? new Date(subscription.trial_end * 1000).toISOString()
        : null,
    };

    // upsert the subscription using PostgREST API
    await postgrestPost('subscriptions', subscriptionData);

    // if customer has initiate payment action, is already authorized then copy billing details to subscription
    if (createAction && subscription.default_payment_method && uuid) {
      await copyBillingDetailsToCustomer(
        uuid,
        subscription.default_payment_method as Stripe.PaymentMethod
      );
    }
  } catch (error: any) {
    throw new Error(error.message);
  }
};
