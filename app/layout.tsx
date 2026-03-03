import type { Metadata } from 'next';
import '../src/styles/index.css';
import { CartProvider } from '@/contexts/CartContext';
import Header from '@/components/Header';
import CartModal from '@/components/CartModal';

export const metadata: Metadata = {
  title: 'Janine Headless Store',
  description: 'A modern headless Shopify storefront',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <CartProvider>
          <Header />
          {children}
          <CartModal />
        </CartProvider>
      </body>
    </html>
  );
}
