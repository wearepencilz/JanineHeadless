'use client';

import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { NavList } from './ui/nav/nav-list';
import type { NavItemType, NavItemDividerType } from './ui/nav/nav-list';
import {
  HomeLine,
  Rocket01,
  ShoppingBag01,
  Star01,
  Beaker01,
  LayersThree01,
  Sliders01,
  Type01,
  Announcement01,
  Dice1,
  Settings01,
  Atom01,
} from '@untitledui/icons';

const navItems: (NavItemType | NavItemDividerType)[] = [
  {
    label: 'Dashboard',
    href: '/admin',
    icon: HomeLine,
  },
  { divider: true },
  {
    label: 'Launches',
    href: '/admin/launches',
    icon: Rocket01,
  },
  {
    label: 'Menu Items',
    href: '/admin/products',
    icon: ShoppingBag01,
  },
  { divider: true },
  {
    label: 'Flavours',
    href: '/admin/flavours',
    icon: Star01,
  },
  {
    label: 'Ingredients',
    href: '/admin/ingredients',
    icon: Atom01,
  },
  {
    label: 'Batches',
    href: '/admin/batches',
    icon: Beaker01,
  },
  { divider: true },
  {
    label: 'Formats',
    href: '/admin/formats',
    icon: LayersThree01,
  },
  {
    label: 'Modifiers',
    href: '/admin/modifiers',
    icon: Sliders01,
  },
  { divider: true },
  {
    label: 'News',
    href: '/admin/news',
    icon: Announcement01,
  },
  {
    label: 'Games',
    href: '/admin/games',
    icon: Dice1,
  },
  { divider: true },
  {
    label: 'Settings',
    href: '/admin/settings',
    icon: Settings01,
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  const activeUrl = navItems.find((item): item is NavItemType =>
    !('divider' in item) &&
    !!item.href && (
      item.href === '/admin'
        ? pathname === '/admin'
        : pathname?.startsWith(item.href + '/') || pathname === item.href
    )
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
