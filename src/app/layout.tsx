import { Toaster } from '@/components/ui/sonner';
import type { Metadata } from 'next';
// import { Inter } from "next/font/google";
import './globals.css';
// import db from "@/lib/supabase/db";
import { ThemeProvider, ThemeProviderWrapper } from '@/lib/providers/next-theme-providers';
import { DM_Sans } from 'next/font/google';
import AppStateProvider from '@/lib/providers/state-provider';
import { SupabaseUserProvider } from '@/lib/providers/supabase-user-provider';
// import { SocketProvider } from '@/lib/providers/socket-provider';
import ClientLayoutFeatures from '@/components/global-components/ClientLayoutFeatures';

const inter = DM_Sans({ subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase:
    process.env.NODE_ENV === 'development'
      ? new URL(`https://localhost:${process.env.PORT || 3000}`)
      : new URL(`https://av-market-place.vercel.app/${process.env.PORT || 3000}`),
  title: {
    default: 'avom-brice realtime collaborative app',
    template: '%s - realtime collaborative app',
    absolute: 'avom-brice realtime collaborative app',
  },
  description:
    'Focus on Benefits: Increase productivity and communication with a real-time collaboration platform. [Your App Name] keeps everyone on the same page',
  openGraph: {
    title: 'avom-brice realtime collaborative app',
    description:
      'Focus on Benefits: Increase productivity and communication with a real-time collaboration platform. [Your App Name] keeps everyone on the same page',
    url: '/',
    siteName: 'avom-brice realtime collaborative app',
    images: [
      {
        url: '/images/appBanner.png',
        width: 1200,
        height: 630,
        alt: 'App Banner',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'avom-brice realtime collaborative app',
    description:
      'Focus on Benefits: Increase productivity and communication with a real-time collaboration platform. [Your App Name] keeps everyone on the same page',
    images: ['/images/appBanner.png'],
    creator: '@your_twitter_handle',
  },
  alternates: {
    canonical: '/',
  },
  // Placeholder for structured data (JSON-LD)
  other: {
    structuredData: '<!-- JSON-LD will be injected per page or globally as needed -->',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'avom-brice realtime collaborative app',
              url: 'https://av-market-place.vercel.app/',
              logo: '/images/appBanner.png',
              sameAs: ['https://twitter.com/your_twitter_handle'],
            }),
          }}
        />
      </head>
      <body className={inter.className} >
        <ClientLayoutFeatures />
        <ThemeProviderWrapper>
          <AppStateProvider>
            <SupabaseUserProvider>
              {/* <SocketProvider> */}
                <main id="main-content" tabIndex={-1}>
                  {children}
                </main>
                <Toaster richColors closeButton position="bottom-right" />
              {/* </SocketProvider> */}
            </SupabaseUserProvider>
          </AppStateProvider>
        </ThemeProviderWrapper>
      </body>
    </html>
  );
}
