'use client';

import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { NavList } from './ui/nav/nav-list';
import type { NavItemType } from './ui/nav/config';

const navItems: NavItemType[] = [
  { label: 'Dashboard', href: '/admin' },
  { label: 'Launches', href: '/admin/launches' },
  { label: 'Menu Items', href: '/admin/products' },
  { label: 'Flavours', href: '/admin/flavours' },
  { label: 'Ingredients', href: '/admin/ingredients' },
  { label: 'Formats', href: '/admin/formats' },
  { label: 'Modifiers', href: '/admin/modifiers' },
  { label: 'Batches', href: '/admin/batches' },
  { label: 'News', href: '/admin/news' },
  { label: 'Games', href: '/admin/games' },
  { label: 'Settings', href: '/admin/settings' },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  // Resolve active URL: exact for dashboard, prefix for others
  const activeUrl = navItems.find((item) =>
    item.href === '/admin'
      ? pathname === '/admin'
      : pathname?.startsWith(item.href + '/') || pathname === item.href
  )?.href;

  return (
    <aside className="fixed inset-y-0 left-0 z-40 flex w-[240px] flex-col border-r border-gray-200 bg-white">
      <div className="flex h-16 items-center px-6 border-b border-gray-200">
        <span className="text-lg font-semibold text-gray-900">Janine CMS</span>
      </div>

      <div className="flex-1 overflow-y-auto">
        <NavList items={navItems} activeUrl={activeUrl} />
      </div>

      <div className="border-t border-gray-200 p-4">
        <button
          onClick={() => signOut({ callbackUrl: '/admin/login' })}
          className="w-full rounded-md px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors text-left"
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}
