import withBundleAnalyzer from '@next/bundle-analyzer';

// const isAnalyze = process.env.NEXT_PUBLIC_ANALYZE === 'true'; // use this for production
const isAnalyze = process.env.ANALYZE === 'true';


/** @type {import('next').NextConfig} */
const nextConfig = {
    compiler: {
        // Remove console logs only in production
        removeConsole: process.env.NODE_ENV === 'production',
    },
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'hdlpjsjduleepnneytdf.supabase.co',
            },
            {
                protocol: 'http',
                hostname: '127.0.0.1',
            }
        ],
    },
};

export default withBundleAnalyzer({
    enabled: isAnalyze,
})(nextConfig); 