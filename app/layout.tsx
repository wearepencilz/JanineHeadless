import type { Metadata } from 'next';
import '../src/styles/index.css';
import { CartProvider } from '@/contexts/CartContext';
import { Providers } from './providers';
import Header from '@/components/Header';
import CartModal from '@/components/CartModal';

export const metadata: Metadata = {
  title: 'Janine - Artisanal Ice Cream',
  description: 'Artisanal ice cream and soft serve in Montreal',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <CartProvider>
            <Header />
            {children}
            <CartModal />
          </CartProvider>
        </Providers>
      </body>
    </html>
  );
}
