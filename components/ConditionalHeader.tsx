'use client';

import { usePathname } from 'next/navigation';
import Header from '@/components/Header';
import CartModal from '@/components/CartModal';

export default function ConditionalHeader() {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/admin') || false;
  // Homepage manages its own header
  const isHomepage = pathname === '/';

  if (isAdminRoute || isHomepage) {
    return null;
  }

  return (
    <>
      <Header />
      <CartModal />
    </>
  );
}
