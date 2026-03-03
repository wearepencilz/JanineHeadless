import type { Metadata } from 'next';
import '../src/styles/index.css';

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
      <body>{children}</body>
    </html>
  );
}
