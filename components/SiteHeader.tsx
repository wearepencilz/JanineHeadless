'use client';

import Link from 'next/link';
import { useCart } from '@/contexts/CartContext';

export default function SiteHeader() {
  const { cart, openCart } = useCart();
  const itemCount = cart?.totalQuantity || 0;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-start justify-between px-8 pt-8 mix-blend-multiply pointer-events-none">
      {/* Logo */}
      <Link href="/" className="pointer-events-auto" aria-label="Janine home">
        <span
          className="text-[#333112] text-sm tracking-widest uppercase"
          style={{ fontFamily: 'var(--font-neue-montreal)', fontWeight: 500 }}
        >
          Janine
        </span>
      </Link>

      {/* Right nav */}
      <nav
        className="pointer-events-auto flex flex-col items-end gap-[10px] text-[#343100] text-[14px] tracking-[0.28px] uppercase leading-none"
        style={{ fontFamily: 'var(--font-diatype-mono)', fontWeight: 500 }}
      >
        <Link href="/flavours" className="hover:opacity-60 transition-opacity">Flavours</Link>
        <Link href="/stories" className="hover:opacity-60 transition-opacity">Stories</Link>
        <Link href="#visit" className="hover:opacity-60 transition-opacity">Come See Us</Link>
        <Link href="#archive" className="hover:opacity-60 transition-opacity">Archive</Link>
        {itemCount > 0 && (
          <button
            onClick={openCart}
            className="hover:opacity-60 transition-opacity"
            aria-label={`Cart (${itemCount})`}
          >
            Cart ({itemCount})
          </button>
        )}
      </nav>
    </header>
  );
}
