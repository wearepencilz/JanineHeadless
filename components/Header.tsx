'use client';

import Link from 'next/link';
import { useCart } from '@/contexts/CartContext';

export default function Header() {
  const { cart, openCart } = useCart();
  const itemCount = cart?.totalQuantity || 0;

  return (
    <header className="border-b sticky top-0 bg-white z-30">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="text-2xl font-bold">
          Janine
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          <Link href="/collections/all" className="hover:text-gray-600 transition-colors">
            Shop All
          </Link>
          <Link href="/collections/soft-serve" className="hover:text-gray-600 transition-colors">
            Soft Serve
          </Link>
          <Link href="/collections/cheese" className="hover:text-gray-600 transition-colors">
            Cheese
          </Link>
        </nav>

        {/* Cart Button */}
        <button
          onClick={openCart}
          className="relative flex items-center gap-2 hover:text-gray-600 transition-colors"
          aria-label="Open cart"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
            />
          </svg>
          {itemCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-black text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {itemCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
