'use client';

import { usePathname } from 'next/navigation';
import Header from '@/components/Header';
import CartModal from '@/components/CartModal';

export default function ConditionalHeader() {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/admin') || false;
  // Homepage and visit page manage their own header
  const isHomepage = pathname === '/';
  const isVisitPage = pathname === '/visit';
  const isLaunchPage = pathname?.startsWith('/launches');

  if (isAdminRoute || isHomepage || isVisitPage || isLaunchPage) {
    return null;
  }

  return (
    <>
      <Header />
      <CartModal />
    </>
  );
}
