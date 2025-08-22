import type { Metadata } from 'next';
import { Login } from '@/components/features/auth';

export const metadata: Metadata = {
  title: 'Login | avom-brice realtime collaborative app',
  icons: {
    icon: '/favicon.ico',
  },
};

export default Login;
