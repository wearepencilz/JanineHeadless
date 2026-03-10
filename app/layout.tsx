import type { Metadata } from 'next';
import '../src/styles/index.css';
import { CartProvider } from '@/contexts/CartContext';
import { Providers } from './providers';
import ConditionalHeader from '@/components/ConditionalHeader';

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
            <ConditionalHeader />
            {children}
          </CartProvider>
        </Providers>
      </body>
    </html>
  );
}
