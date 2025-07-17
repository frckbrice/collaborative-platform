import HomePageComponent from '@/components/features/landing-page';
import { syncStripeProductsAndPrices } from '@/lib/utils/sync-stripe-products';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Home | avom-brice realtime collaborative app',
  description:
    'Welcome to the real-time collaborative platform. Boost productivity and teamwork with seamless collaboration tools.',
  openGraph: {
    title: 'Home | avom-brice realtime collaborative app',
    description:
      'Welcome to the real-time collaborative platform. Boost productivity and teamwork with seamless collaboration tools.',
    url: '/',
    images: [
      {
        url: '/images/appBanner.png',
        width: 1200,
        height: 630,
        alt: 'Home Banner',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Home | avom-brice realtime collaborative app',
    description:
      'Welcome to the real-time collaborative platform. Boost productivity and teamwork with seamless collaboration tools.',
    images: ['/images/appBanner.png'],
  },
  alternates: {
    canonical: '/',
  },
  icons: {
    icon: '/favicon.ico',
  },
};

const HomePage = () => {
  // syncStripeProductsAndPrices(); 
  return <HomePageComponent />;
};
export default HomePage;
