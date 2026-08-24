import { Providers } from '@/Frontend/contexts/Providers';
import Header from '@/Frontend/components/layout/Header';
import Footer from '@/Frontend/components/layout/Footer';

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
