import { Header } from '@/components/features/landing-page/components';
import Footer from '@/components/features/landing-page/components/footer';

export default function SitePageLayout({ children }: { children: React.ReactNode }) {
  return (
    <main >
      <Header />
      {children}
    </main>
  );
}
