'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import type { ComponentType, HTMLAttributes } from 'react';
import {
  Home01,
  Rocket01,
  Package,
  Star01,
  Drop,
  Beaker01,
  BookOpen01,
  Image01,
  PuzzlePiece01,
  Tag01,
  Settings01,
  LogOut01,
  LayersThree01,
  Sliders01,
  Grid01,
} from '@untitledui/icons';

type IconComponent = ComponentType<HTMLAttributes<SVGElement> & { className?: string }>;

interface NavItem {
  href: string;
  label: string;
  icon: IconComponent;
}

interface NavCategory {
  label: string;
  items: NavItem[];
}

export default function SimpleSidebar() {
  const pathname = usePathname();

  const navCategories: NavCategory[] = [
    {
      label: 'Overview',
      items: [
        { href: '/admin', label: 'Dashboard', icon: Home01 },
      ],
    },
    {
      label: 'Commerce',
      items: [
        { href: '/admin/launches', label: 'Launches', icon: Rocket01 },
        { href: '/admin/products', label: 'Products', icon: Package },
      ],
    },
    {
      label: 'Archive',
      items: [
        { href: '/admin/flavours', label: 'Flavours', icon: Star01 },
        { href: '/admin/ingredients', label: 'Ingredients', icon: Drop },
        { href: '/admin/modifiers', label: 'Modifiers', icon: Sliders01 },
      ],
    },
    {
      label: 'Test Kitchen',
      items: [
        { href: '/admin/batches', label: 'Batches', icon: Beaker01 },
      ],
    },
    {
      label: 'Content',
      items: [
        { href: '/admin/news', label: 'News', icon: BookOpen01 },
        { href: '/admin/pages', label: 'Pages', icon: Grid01 },
      ],
    },
    {
      label: 'Interactive',
      items: [
        { href: '/admin/games', label: 'Games', icon: PuzzlePiece01 },
        { href: '/admin/sprites', label: 'Sprites', icon: Image01 },
      ],
    },
    {
      label: 'System',
      items: [
        { href: '/admin/taxonomies', label: 'Taxonomies', icon: Tag01 },
        { href: '/admin/formats', label: 'Formats', icon: LayersThree01 },
        { href: '/admin/settings', label: 'Settings', icon: Settings01 },
      ],
    },
  ];

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin';
    return pathname?.startsWith(href);
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-[240px] lg:flex-col border-r border-gray-200 bg-white">
        <div className="flex flex-col flex-1 min-h-0">
          {/* Logo */}
          <div className="flex items-center h-16 px-4 border-b border-gray-200">
            <span className="text-sm font-semibold text-gray-900">Janine CMS</span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-3">
            <div className="px-2 space-y-0.5">
              {navCategories.map((category, categoryIndex) => (
                <div key={category.label}>
                  {categoryIndex > 0 && <div className="my-2 mx-2 border-t border-gray-100" />}
                  <p className="px-2 pt-2 pb-1 text-xs font-medium text-gray-400 uppercase tracking-wider">
                    {category.label}
                  </p>
                  <div className="space-y-0.5">
                    {category.items.map((item) => {
                      const Icon = item.icon;
                      const active = isActive(item.href);
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          prefetch={true}
                          className={`flex items-center gap-2.5 px-2 py-1.5 rounded-md text-sm font-medium transition-colors ${
                            active
                              ? 'bg-gray-100 text-gray-900'
                              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                          }`}
                        >
                          <Icon
                            className={`size-4 flex-shrink-0 ${active ? 'text-gray-700' : 'text-gray-400'}`}
                          />
                          <span>{item.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </nav>

          {/* Sign Out */}
          <div className="flex-shrink-0 border-t border-gray-200 p-2">
            <button
              onClick={() => signOut({ callbackUrl: '/admin/login' })}
              className="flex items-center gap-2.5 w-full px-2 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-md transition-colors"
            >
              <LogOut01 className="size-4 flex-shrink-0 text-gray-400" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden sticky top-0 z-10 flex h-16 items-center gap-x-4 border-b border-gray-200 bg-white px-4">
        <span className="text-sm font-semibold text-gray-900">Janine CMS</span>
      </div>
    </>
  );
}
