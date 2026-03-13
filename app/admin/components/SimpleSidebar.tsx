'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';

export default function SimpleSidebar() {
  const pathname = usePathname();

  const navItems = [
    { href: '/admin', label: 'Dashboard' },
    { href: '/admin/launches', label: 'Launches' },
    { href: '/admin/products', label: 'Menu Items' },
    { href: '/admin/flavours', label: 'Flavours' },
    { href: '/admin/ingredients', label: 'Ingredients' },
    { href: '/admin/formats', label: 'Formats' },
    { href: '/admin/modifiers', label: 'Modifiers' },
    { href: '/admin/batches', label: 'Batches' },
    { href: '/admin/news', label: 'News' },
    { href: '/admin/games', label: 'Games' },
    { href: '/admin/settings', label: 'Settings' },
  ];

  const isActive = (href: string) => {
    if (href === '/admin') {
      return pathname === '/admin';
    }
    return pathname?.startsWith(href);
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col border-r border-gray-200 bg-white">
        <div className="flex flex-col flex-1 min-h-0">
          {/* Logo */}
          <div className="flex items-center h-16 px-6 border-b border-gray-200">
            <span className="text-xl font-semibold text-gray-900">Janine CMS</span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4">
            <div className="px-3 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  prefetch={true}
                  className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive(item.href)
                      ? 'bg-gray-100 text-gray-900'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </nav>

          {/* Sign Out */}
          <div className="flex-shrink-0 border-t border-gray-200 p-4">
            <button
              onClick={() => signOut({ callbackUrl: '/admin/login' })}
              className="w-full px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 rounded-md transition-colors text-left"
            >
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden sticky top-0 z-10 flex h-16 items-center gap-x-4 border-b border-gray-200 bg-white px-4">
        <span className="text-xl font-semibold text-gray-900">Janine CMS</span>
      </div>
    </>
  );
}
