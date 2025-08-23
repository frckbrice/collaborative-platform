'use client';
import { useSubscriptionModal } from '@/lib/providers/subscription-modal-provider';
import React, { useState, memo, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { useSupabaseUser } from '@/lib/providers/supabase-user-provider';
import { formatPrice, postData } from '@/lib/utils';
import { Button } from '../ui/button';
import Loader from './loader';
import { Price, ProductWirhPrice } from '@/lib/supabase/supabase.types';
import { toast } from 'sonner';
import { getStripe } from '@/lib/stripe/stripe-client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../ui/card';
import { Badge } from '../ui/badge';
import { PRICING_CARDS } from '@/lib/constant/constants';
import { logger } from '@/utils/logger';

const diamondIcon = (
  <svg
    width="28"
    height="28"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="inline-block align-middle mr-2"
  >
    <path
      d="M1.84 7.18L4.77 3.22C5.33 2.45 6.23 2 7.18 2h9.64c0.95 0 1.85 0.45 2.41 1.22l2.93 3.96c0.79 1.08 0.78 2.55-0.03 3.61l-7.75 10.1c-1.2 1.57-3.56 1.57-4.76 0l-7.75-10.1C1.05 9.73 1.05 8.26 1.84 7.18z"
      fill="#6889FF"
    />
    <path
      d="M22.75 9H1.25c-0.01-0.64 0.18-1.28 0.59-1.82l2.93-3.97C5.33 2.45 6.23 2 7.18 2h9.64c0.95 0 1.85 0.45 2.41 1.22l2.93 3.96c0.39 0.54 0.58 1.18 0.59 1.82z"
      fill="#B6B2FF"
    />
  </svg>
);
const checkIcon = (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    className="inline-block align-middle mr-2"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M20.7071 6.29289C21.0976 6.68342 21.0976 7.31658 20.7071 7.70711L12.1213 16.2929C10.9497 17.4645 9.05026 17.4645 7.87868 16.2929L4.29289 12.7071C3.90237 12.3166 3.90237 11.6834 4.29289 11.2929C4.68342 10.9024 5.31658 10.9024 5.70711 11.2929L9.29289 14.8787C9.68342 15.2692 10.3166 15.2692 10.7071 14.8787L19.2929 6.29289C19.6834 5.90237 20.3166 5.90237 20.7071 6.29289Z"
      fill="#6889FF"
    />
  </svg>
);

interface SubscriptionModalProps {
  products: ProductWirhPrice[];
}

const SubscriptionModal: React.FC<SubscriptionModalProps> = memo(({ products }) => {
  const { open, setOpen } = useSubscriptionModal();
  const { subscription } = useSupabaseUser();
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useSupabaseUser();

  // Prevent hydration mismatch: only render on client
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // Debug products data
  useEffect(() => {
    logger.info('SubscriptionModal - Products data:', {
      products,
      productsLength: products?.length,
      productsData: products?.map((p) => ({
        id: p.id,
        name: p.name,
        pricesCount: p.prices?.length,
      })),
    });
  }, [products]);

  if (!mounted) return null;

  /**
   * Async function to handle the click event for continuing with a purchase.
   *
   * @param {Price} price - The price information for the purchase.
   * @return {void} No return value.
   */
  const onClickContinue = async (price: Price) => {
    try {
      setIsLoading(true);
      if (!user) {
        toast.error('You must be logged in');
        setIsLoading(false);
        return;
      }
      if (subscription) {
        toast.error('Already on a paid plan');
        setIsLoading(false);
        return;
      }
      const { sessionId } = await postData({
        url: '/api/create-checkout-session',
        data: { price },
      });

      const stripe = await getStripe();
      stripe?.redirectToCheckout({ sessionId });
    } catch (error) {
      toast.error('Oppse! Something went wrong.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md p-0 bg-gradient-to-br from-white via-[#f8faff] to-[#e9e9ff] dark:from-[#181826] dark:via-[#232347] dark:to-[#1a1a2e] shadow-2xl rounded-2xl border-0">
        {isLoading && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 rounded-2xl">
            <Loader size="lg" />
          </div>
        )}
        {subscription?.status === 'active' ? (
          <Card className="bg-white/90 dark:bg-card/90 shadow-xl border-0">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">You are already on a paid plan!</CardTitle>
              <CardDescription className="mt-2">Thank you for supporting us 🎉</CardDescription>
            </CardHeader>
          </Card>
        ) : (
          (() => {
            // Check if products array exists and has items
            if (!products || products.length === 0) {
              return (
                <Card className="bg-white/10 backdrop-blur border border-[#a78bfa]/30 shadow-xl border-0">
                  <CardHeader className="text-center">
                    <CardTitle className="text-2xl">Upgrade Your Plan</CardTitle>
                    <CardDescription className="mt-2">
                      {products === undefined
                        ? 'Loading subscription plans...'
                        : 'Unlock unlimited collaborators and premium features!'}
                    </CardDescription>
                    {products === undefined && (
                      <div className="mt-4">
                        <Loader size="sm" />
                      </div>
                    )}
                    {products !== undefined && products.length === 0 && (
                      <div className="mt-4 space-y-3">
                        <div className="text-sm text-muted-foreground">
                          <p>
                            🚀 <strong>Pro Plan Benefits:</strong>
                          </p>
                          <ul className="mt-2 space-y-1 text-left">
                            <li>• Unlimited collaborators</li>
                            <li>• Advanced features</li>
                            <li>• Priority support</li>
                            <li>• Premium integrations</li>
                          </ul>
                        </div>

                        <Button
                          onClick={() => {
                            window.open(
                              'mailto:brice@gmail.com?subject=Subscription%20Inquiry',
                              '_blank'
                            );
                          }}
                          className="w-full bg-gradient-to-r from-[#38f9d7] to-[#a78bfa] text-white"
                        >
                          Contact Sales Team
                        </Button>
                      </div>
                    )}
                  </CardHeader>
                </Card>
              );
            }

            // Show only the Pro Plan (first product with pricing)
            const proProduct =
              products.find(
                (product) =>
                  product.name?.toLowerCase().includes('pro') ||
                  product.name?.toLowerCase().includes('premium') ||
                  product.name?.toLowerCase().includes('business')
              ) || products[0];

            // Check if product exists
            if (!proProduct) {
              return (
                <Card className="bg-white/10 backdrop-blur border border-[#a78bfa]/30 shadow-xl border-0">
                  <CardHeader className="text-center">
                    <CardTitle className="text-2xl">Subscription Plans</CardTitle>
                    <CardDescription className="mt-2">
                      No subscription plans available at the moment.
                    </CardDescription>
                  </CardHeader>
                </Card>
              );
            }

            return (
              <div className="flex flex-col items-center justify-center">
                <Card
                  key={proProduct.id}
                  className="bg-white/10 backdrop-blur border border-[#a78bfa]/30 shadow-xl border-0 w-full relative overflow-hidden"
                >
                  {/* Pro Plan Glow Effect */}
                  <div className="hidden dark:block w-full blur-[120px] rounded-full h-32 absolute bg-brand-primaryPurple/80 -z-10 top-0" />

                  <CardHeader className="text-center pb-2 relative">
                    <div className="flex justify-center items-center mb-2">
                      {/* Diamond Icon for Pro Plan */}
                      <div className="mr-3">
                        <svg
                          width="28"
                          height="28"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          className="text-[#a78bfa]"
                        >
                          <path
                            d="M1.84 7.18L4.77 3.22C5.33 2.45 6.23 2 7.18 2h9.64c0.95 0 1.85 0.45 2.41 1.22l2.93 3.96c0.79 1.08 0.78 2.55-0.03 3.61l-7.75 10.1c-1.2 1.57-3.56 1.57-4.76 0l-7.75-10.1C1.05 9.73 1.05 8.26 1.84 7.18z"
                            fill="#6889FF"
                          />
                          <path
                            d="M22.75 9H1.25c-0.01-0.64 0.18-1.28 0.59-1.82l2.93-3.97C5.33 2.45 6.23 2 7.18 2h9.64c0.95 0 1.85 0.45 2.41 1.22l2.93 3.96c0.39 0.54 0.58 1.18 0.59 1.82z"
                            fill="#B6B2FF"
                          />
                        </svg>
                      </div>
                      <span className="text-3xl font-bold bg-gradient-to-r from-[#38f9d7] to-[#a78bfa] bg-clip-text text-transparent">
                        {proProduct.name || 'Pro Plan'}
                      </span>
                      <Badge
                        variant="secondary"
                        className="ml-3 px-3 py-1 
                        text-xs bg-[#6889FF]/10 text-[#6889FF]
                        border-[#6889FF]/20"
                      >
                        Most Popular
                      </Badge>
                    </div>
                    <CardTitle className="text-2xl mt-2">Upgrade to {proProduct.name}</CardTitle>
                    <CardDescription className="mt-2 text-base text-muted-foreground">
                      {proProduct.description ||
                        'Unlock all premium features and boost your productivity.'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-4 items-center">
                    {proProduct.prices?.length
                      ? proProduct.prices.map((price) => (
                          <div key={price.id} className="w-full mb-2">
                            <div className="flex items-end gap-2 mb-2 justify-center">
                              <span className="text-4xl font-extrabold text-[#6889FF]">
                                {formatPrice(price)}
                              </span>
                              <span className="text-base text-muted-foreground mb-1">
                                / {price.interval}
                              </span>
                            </div>
                            <Button
                              onClick={() => onClickContinue(price)}
                              disabled={isLoading}
                              size="lg"
                              className="w-full bg-gradient-to-r from-[#38f9d7] to-[#a78bfa] text-white shadow-lg hover:from-[#a78bfa] hover:to-[#38f9d7] rounded-full text-lg py-6 mt-2"
                            >
                              {isLoading ? <Loader /> : `Go Pro ✨`}
                            </Button>
                          </div>
                        ))
                      : null}
                    <div className="w-full mt-4">
                      <div className="flex flex-col gap-2">
                        {/* Use the same features as home page Pro Plan */}
                        {PRICING_CARDS[1]?.freatures.map((feature, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-2 text-base text-foreground/90"
                          >
                            {checkIcon}
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex flex-col items-center mt-2">
                    <span className="text-xs text-muted-foreground">
                      Billed securely with Stripe
                    </span>
                  </CardFooter>
                </Card>
              </div>
            );
          })()
        )}
      </DialogContent>
    </Dialog>
  );
});

SubscriptionModal.displayName = 'SubscriptionModal';

export default SubscriptionModal;
