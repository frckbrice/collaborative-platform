'use client';
import { useSubscriptionModal } from '@/lib/providers/subscription-modal-provider';
import React, { useState, memo } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { useSupabaseUser } from '@/lib/providers/supabase-user-provider';
import { formatPrice, postData } from '@/lib/utils';
import { Button } from '../ui/button';
import Loader from './loader';
import { Price, ProductWirhPrice } from '@/lib/supabase/supabase.types';
import { toast } from 'sonner';
import { getStripe } from '@/lib/stripe/stripe-client';

interface SubscriptionModalProps {
  products: ProductWirhPrice[];
}

const SubscriptionModal: React.FC<SubscriptionModalProps> = memo(({ products }) => {
  const { open, setOpen } = useSubscriptionModal();
  const { subscription } = useSupabaseUser();
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useSupabaseUser();

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

      console.log('Getting Checkout for stripe');
      const stripe = await getStripe();
      stripe?.redirectToCheckout({ sessionId });
    } catch (error) {
      toast.error('Oppse! Something went wrong.');
    } finally {
      setIsLoading(false);
    }
  };

  console.log('from subscription modal', open);
  console.log('from subscription modal : ', products);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {subscription?.status === 'active' ? (
        <DialogContent>Already on a paid plan! </DialogContent>
      ) : (
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upgrade to a Pro Plan </DialogTitle>
          </DialogHeader>
          <DialogDescription>
            To access Pro features you need to have a paid plan.
          </DialogDescription>
          {products.length
            ? products.map((product, idex) => (
              <div className="flex justify-between items-center" key={idex}>
                {product.prices?.map((price, idex) => (
                  <React.Fragment key={idex}>
                    <b className="text-3xl text-foreground">
                      {formatPrice(price)} / <small>{price.interval} </small>
                    </b>
                    <Button onClick={() => onClickContinue(price)} disabled={isLoading}>
                      {isLoading ? <Loader /> : 'Upgrade ✨'}
                    </Button>
                  </React.Fragment>
                ))}
              </div>
            ))
            : ''}
          {/* No Products Available */}
        </DialogContent>
      )}
    </Dialog>
  );
});

SubscriptionModal.displayName = "SubscriptionModal";

export default SubscriptionModal;
