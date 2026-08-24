import { Providers } from '@/lib/contexts/Providers';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Providers>
      <Header />
      <main style={{ flex: 1 }}>{children}</main>
      <Footer />
    </Providers>
  );
}
