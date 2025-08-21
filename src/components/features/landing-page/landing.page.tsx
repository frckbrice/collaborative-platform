'use client';

import TitleSection, { CustomCard } from './components';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import React, { useState, useTransition } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { twMerge } from 'tailwind-merge';
import clsx from 'clsx';
import Link from 'next/link';
// get stripe icons
import { FaStripe } from 'react-icons/fa';

import Diamond from '../../../../public/icons/diamond.svg';
import CheckIcon from '../../../../public/icons/check.svg';
import {
  CLIENTS,
  FEATURES,
  HOW_IT_WORKS,
  PRICING_CARDS,
  PRICING_PLANS,
  USERS,
} from '@/lib/constant/constants';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import Footer from './components/footer';
import { useRouter } from 'next/navigation';
import { FaGoogle, FaGithub } from 'react-icons/fa';
import { SiSupabase } from 'react-icons/si';
import { getActiveProductsWithPrice } from '@/lib/supabase/queries';
import { getStripe } from '@/lib/stripe/stripe-client';
import { postData } from '@/lib/utils';
import { createClient } from '../../../utils/client';
import { useSupabaseUser } from '@/lib/providers/supabase-user-provider';

export default function HomePageComponent() {
  const router = useRouter();
  // const [isLoading, setIsLoading] = React.useState(false);
  const [proPrice, setProPrice] = React.useState<any>(null);
  const [isPending, startTransition] = useTransition();

  // get user id from supabase user provider
  const { user } = useSupabaseUser();

  console.log('\n\n session: ', user?.id);

  React.useEffect(() => {
    const fetchPrices = async () => {
      const { data: products } = await getActiveProductsWithPrice();
      // Find the Pro Plan price (assuming product name or price nickname contains 'Pro')
      const proProduct = products?.find((p: any) => p.name?.toLowerCase().includes('pro'));
      const price = proProduct?.prices?.[0];
      console.log('\n\n price: ', proProduct?.prices);
      console.log('\n\n products: ', products);
      setProPrice(price);
    };
    fetchPrices();
  }, []);

  // Remove the client-side OAuth handling since we're using server-side auth
  // useEffect(() => {
  //   const params = new URLSearchParams(window.location.search);
  //   const code = params.get('code');
  //   console.log('code: ', code);
  //   if (code) {
  //     // Redirect to the API route to handle OAuth flow server-side
  //     router.replace(`/api/auth/callback?code=${code}`);
  //   }
  // }, [router]);

  const handleProPlanClick = async () => {
    // check if user is logged in
    if (!user) {
      router.push('/login');
      return;
    }

    if (!proPrice) return;
    startTransition(async () => {
      // setIsLoading(true);
      const { sessionId } = await postData({
        url: '/api/create-checkout-session',
        data: { price: proPrice },
      });
      const stripe = await getStripe();
      await stripe?.redirectToCheckout({ sessionId });
      // setIsLoading(false);
    });
  };

  return (
    <div className="relative min-h-screen w-full bg-[#0a0a23] text-white overflow-x-hidden">
      {/* Aurora/Glow Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[120vw] h-[60vh] bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#a78bfa]/40 via-[#38f9d7]/20 to-transparent blur-3xl opacity-70 animate-pulse" />
        <div className="absolute bottom-0 right-0 w-[60vw] h-[40vh] bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-[#3b82f6]/30 via-[#f472b6]/20 to-transparent blur-2xl opacity-60 animate-pulse" />
        <div className="absolute inset-0 bg-[url('/images/noise.png')] opacity-10 mix-blend-soft-light" />
      </div>

      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center py-36 px-4 text-center">
        <h1 className="text-6xl sm:text-7xl font-extrabold mb-8 bg-gradient-to-r from-[#38f9d7] via-[#a78bfa] to-[#f472b6] bg-clip-text text-transparent animate-gradient-x drop-shadow-[0_2px_32px_rgba(167,139,250,0.5)]">
          Unleash <span className="text-[#38f9d7]">Real-Time</span> Collaboration
        </h1>
        <p className="max-w-2xl mx-auto text-2xl mb-12 text-white/80">
          Work together, share instantly, and create beautifully. Powered by Supabase, designed for
          teams.
        </p>
        <div className="flex gap-6 justify-center">
          <Link href="/signup">
            <Button
              size="lg"
              className="bg-gradient-to-r from-[#38f9d7] to-[#a78bfa] text-white shadow-2xl hover:from-[#a78bfa] hover:to-[#38f9d7] rounded-full px-10 py-5 text-xl animate-pulse"
            >
              Get Started For Free
            </Button>
          </Link>
          <Link href="#features">
            <Button
              size="lg"
              variant="outline"
              className="border-[#a78bfa] text-[#a78bfa] rounded-full px-10 py-5 text-xl backdrop-blur hover:border-[#38f9d7] hover:text-[#38f9d7]"
            >
              See Features
            </Button>
          </Link>
        </div>
        <div className="relative w-full flex justify-center mt-20">
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-full h-[120px] bg-gradient-to-r from-[#38f9d7]/40 via-[#a78bfa]/30 to-[#f472b6]/30 blur-2xl opacity-70 z-0" />
          {/* 1200px is the max width of the image */}
          <Image
            src="/images/appBanner.png"
            alt="App Banner"
            width={520}
            height={200}
            className="relative z-10 mx-auto rounded-3xl 
          shadow-2xl border-4 border-[#a78bfa]/30 
          w-full max-w-[1200px]
          h-[500px]
          backdrop-blur-lg"
          />
        </div>
      </section>

      {/* Wavy SVG Divider */}
      <div className="w-full overflow-hidden -mb-1 z-10">
        <svg
          viewBox="0 0 1440 80"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-20"
        >
          <path
            fill="#181826"
            fillOpacity="1"
            d="M0,32L60,37.3C120,43,240,53,360,58.7C480,64,600,64,720,53.3C840,43,960,21,1080,16C1200,11,1320,21,1380,26.7L1440,32L1440,80L1380,80C1320,80,1200,80,1080,80C960,80,840,80,720,80C600,80,480,80,360,80C240,80,120,80,60,80L0,80Z"
          />
        </svg>
      </div>

      {/* Features Section */}
      <section id="features" className="py-24 px-4 max-w-6xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-[#38f9d7] to-[#a78bfa] bg-clip-text text-transparent">
          Features
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl p-8 flex flex-col items-center text-center border border-[#38f9d7]/40 hover:scale-105 transition-transform"
            >
              {feature.title === 'Stripe Payments' ? (
                <FaStripe className="w-32 h-32" />
              ) : (
                <Image
                  src={feature.icon}
                  alt={feature.title}
                  width={64}
                  height={64}
                  className="mb-4"
                />
              )}
              <h3 className="text-xl font-semibold mb-2 bg-gradient-to-r from-[#38f9d7] to-[#a78bfa] bg-clip-text text-transparent">
                {feature.title}
              </h3>
              <p className="text-white/80">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Wavy SVG Divider */}
      <div className="w-full overflow-hidden -mb-1 z-10">
        <svg
          viewBox="0 0 1440 80"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-20"
        >
          <path
            fill="#181826"
            fillOpacity="1"
            d="M0,32L60,37.3C120,43,240,53,360,58.7C480,64,600,64,720,53.3C840,43,960,21,1080,16C1200,11,1320,21,1380,26.7L1440,32L1440,80L1380,80C1320,80,1200,80,1080,80C960,80,840,80,720,80C600,80,480,80,360,80C240,80,120,80,60,80L0,80Z"
          />
        </svg>
      </div>

      {/* How It Works Section */}
      <section id="resources" className="py-24 px-4 max-w-5xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-[#38f9d7] to-[#a78bfa] bg-clip-text text-transparent">
          How It Works
        </h2>
        <div className="flex flex-col md:flex-row gap-10 justify-center">
          {HOW_IT_WORKS.map((step) => (
            <div
              key={step.step}
              className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl p-8 flex flex-col items-center text-center border border-[#38f9d7]/40"
            >
              <span className="w-14 h-14 flex items-center justify-center rounded-full bg-gradient-to-br from-[#38f9d7] to-[#a78bfa] text-white text-3xl font-bold mb-4 shadow-lg">
                {step.step}
              </span>
              <h4 className="text-lg font-semibold mb-2 bg-gradient-to-r from-[#38f9d7] to-[#a78bfa] bg-clip-text text-transparent">
                {step.title}
              </h4>
              <p className="text-white/80">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Wavy SVG Divider */}
      <div className="w-full overflow-hidden -mb-1 z-10">
        <svg
          viewBox="0 0 1440 80"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-20"
        >
          <path
            fill="#181826"
            fillOpacity="1"
            d="M0,32L60,37.3C120,43,240,53,360,58.7C480,64,600,64,720,53.3C840,43,960,21,1080,16C1200,11,1320,21,1380,26.7L1440,32L1440,80L1380,80C1320,80,1200,80,1080,80C960,80,840,80,720,80C600,80,480,80,360,80C240,80,120,80,60,80L0,80Z"
          />
        </svg>
      </div>

      {/* Integrations Section */}
      <section className="py-20 px-4 max-w-4xl mx-auto flex flex-col items-center">
        <h2 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-[#38f9d7] to-[#a78bfa] bg-clip-text text-transparent">
          Integrations
        </h2>
        <div className="flex flex-wrap gap-12 justify-center items-center">
          <div className="flex flex-col items-center">
            <span className="w-20 h-20 flex items-center justify-center rounded-full bg-white/10 backdrop-blur border border-[#3ecf8e]/40 mb-2">
              <SiSupabase className="text-[#3ecf8e] text-5xl" />
            </span>
            <span className="text-base text-white/80">Supabase</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="w-20 h-20 flex items-center justify-center rounded-full bg-white/10 backdrop-blur border border-[#ea4335]/40 mb-2">
              <FaGoogle className="text-[#ea4335] text-5xl" />
            </span>
            <span className="text-base text-white/80">Google OAuth</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="w-20 h-20 flex items-center justify-center rounded-full bg-white/10 backdrop-blur border border-[#333]/40 mb-2">
              <FaGithub className="text-[#fff] text-5xl" />
            </span>
            <span className="text-base text-white/80">GitHub OAuth</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="w-20 h-20 flex items-center justify-center rounded-full bg-white/10 backdrop-blur border border-[#a78bfa]/40 mb-2">
              <Image src="/images/cal.png" alt="Mailpit" width={48} height={48} />
            </span>
            <span className="text-base text-white/80">Mailpit</span>
          </div>
        </div>
      </section>

      {/* Wavy SVG Divider */}
      <div className="w-full overflow-hidden -mb-1 z-10">
        <svg
          viewBox="0 0 1440 80"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-20"
        >
          <path
            fill="#181826"
            fillOpacity="1"
            d="M0,32L60,37.3C120,43,240,53,360,58.7C480,64,600,64,720,53.3C840,43,960,21,1080,16C1200,11,1320,21,1380,26.7L1440,32L1440,80L1380,80C1320,80,1200,80,1080,80C960,80,840,80,720,80C600,80,480,80,360,80C240,80,120,80,60,80L0,80Z"
          />
        </svg>
      </div>

      {/* Testimonial Section (glassy, dark, neon-accented) */}
      <section id="testimonials" className="relative">
        <div
          className="w-full
          blur-[120px]
          rounded-full
          h-32
          absolute
          bg-brand-primaryPurple/50
          -z-100
          top-56
        "
        />
        <div
          className="mt-20
          px-4
          sm:px-6
          flex
          flex-col
          overflow-x-hidden
          overflow-visible
        "
        >
          <TitleSection
            title="Trusted by all"
            subHeading="Join thousands of satisfied users who rely on our platform for their
            personal and professional productivity needs."
            pill="Testimonials"
          />
          {[...Array(2)].map((arr, index) => (
            <div
              key={index || uuidv4()}
              className={twMerge(
                clsx('mt-10 flex flex-nowrap gap-6 self-start', {
                  'flex-row-reverse': index === 1,
                  'animate-[slide_250s_linear_infinite]': true,
                  'animate-[slide_250s_linear_infinite_reverse]': index === 1,
                  'ml-[100vw]': index === 1,
                }),
                'hover:paused'
              )}
            >
              {USERS.map((testimonial, index) => (
                <CustomCard
                  key={index}
                  className="w-[500px]
                  shrink-0s
                  rounded-xl
                  dark:bg-gradient-to-t
                  dark:from-border dark:to-background
                "
                  cardHeader={
                    <div
                      className="flex
                      items-center
                      gap-4
                  "
                    >
                      <Avatar>
                        <AvatarImage src={`/avatars/${index + 1}.png`} />
                        <AvatarFallback>AV</AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-foreground">{testimonial.name}</CardTitle>
                        <CardDescription className="dark:text-washed-purple-800">
                          {testimonial.name.toLocaleLowerCase()}
                        </CardDescription>
                      </div>
                    </div>
                  }
                  cardContent={<p className="dark:text-washed-purple-800">{testimonial.message}</p>}
                ></CustomCard>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* Wavy SVG Divider */}
      <div className="w-full overflow-hidden -mb-1 z-10 my-10">
        <svg
          viewBox="0 0 1440 80"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-20"
        >
          <path
            fill="#181826"
            fillOpacity="1"
            d="M0,32L60,37.3C120,43,240,53,360,58.7C480,64,600,64,720,53.3C840,43,960,21,1080,16C1200,11,1320,21,1380,26.7L1440,32L1440,80L1380,80C1320,80,1200,80,1080,80C960,80,840,80,720,80C600,80,480,80,360,80C240,80,120,80,60,80L0,80Z"
          />
        </svg>
      </div>

      {/* Price Plan Section (glassy, dark, neon-accented) */}
      <section
        id="pricing"
        className="py-24 px-4 max-w-6xl mx-auto bg-white/10 backdrop-blur-xl rounded-3xl my-12 text-white border border-[#38f9d7]/30 shadow-2xl"
      >
        <TitleSection
          title="The Perfect Plan For You"
          subHeading="Experience all the benefits of our platform. Select a plan that suits your needs and take your productivity to new heights."
          pill="Pricing"
        />
        <div className="flex flex-col-reverse sm:flex-row gap-4 justify-center sm:items-stretch items-center mt-10">
          {PRICING_CARDS.map((card) => (
            <CustomCard
              key={card.planType}
              className={clsx(
                'w-[300px] rounded-2xl bg-white/10 backdrop-blur border border-[#a78bfa]/30 text-white shadow-xl relative',
                {
                  'border-brand-primaryPurple/70': card.planType === PRICING_PLANS.proplan,
                }
              )}
              cardHeader={
                <CardTitle className="text-2xl font-semibold text-white">
                  {card.planType === PRICING_PLANS.proplan && (
                    <>
                      <div className="hidden dark:block w-full blur-[120px] rounded-full h-32 absolute bg-brand-primaryPurple/80 -z-10 top-0" />
                      <Image
                        src={Diamond}
                        alt="Pro Plan Icon"
                        className="absolute top-6 right-6"
                        width={50}
                        height={50}
                      />
                    </>
                  )}
                  {card.planType}
                </CardTitle>
              }
              cardContent={
                <CardContent className="p-0">
                  <span className="font-normal text-2xl">${card.price}</span>
                  {+card.price > 0 ? <span className="text-[#a78bfa] ml-1">/mo</span> : ''}
                  <p className="text-white/80">{card.description}</p>
                  {card.planType === PRICING_PLANS.proplan ? (
                    <Button
                      variant="secondary"
                      className="whitespace-nowrap w-full mt-4 bg-gradient-to-r from-[#38f9d7] to-[#a78bfa] text-white"
                      onClick={() => {
                        if (card.planType === PRICING_PLANS.proplan) {
                          handleProPlanClick();
                        } else {
                          router.push('/signup');
                        }
                      }}
                      disabled={isPending}
                    >
                      {isPending ? 'Redirecting...' : 'Go Pro'}
                    </Button>
                  ) : (
                    <Button
                      variant="secondary"
                      className="whitespace-nowrap w-full mt-4 bg-gradient-to-r from-[#38f9d7] to-[#a78bfa] text-white"
                      onClick={() => {
                        router.push('/signup');
                      }}
                    >
                      Get Started
                    </Button>
                  )}
                </CardContent>
              }
              cardFooter={
                <ul className="font-normal flex mb-2 flex-col gap-4">
                  <small className="text-[#a78bfa]">{card.highlightFeature}</small>
                  {card.freatures.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <Image src={CheckIcon} alt="Check Icon" width={50} height={50} />
                      {feature}
                    </li>
                  ))}
                </ul>
              }
            />
          ))}
        </div>
      </section>

      {/* Wavy SVG Divider */}
      <div className="w-full overflow-hidden -mb-1 z-10 my-10">
        <svg
          viewBox="0 0 1440 80"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-20"
        >
          <path
            fill="#181826"
            fillOpacity="1"
            d="M0,32L60,37.3C120,43,240,53,360,58.7C480,64,600,64,720,53.3C840,43,960,21,1080,16C1200,11,1320,21,1380,26.7L1440,32L1440,80L1380,80C1320,80,1200,80,1080,80C960,80,840,80,720,80C600,80,480,80,360,80C240,80,120,80,60,80L0,80Z"
          />
        </svg>
      </div>
      {/* footer section. */}
      <Footer />
    </div>
  );
}
