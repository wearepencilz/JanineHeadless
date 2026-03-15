'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';

interface NavItem {
  href: string;
  label: string;
  icon?: string;
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
        { href: '/admin', label: 'Dashboard', icon: '📊' },
      ],
    },
    {
      label: 'Commerce',
      items: [
        { href: '/admin/launches', label: 'Launches', icon: '🚀' },
        { href: '/admin/products', label: 'Products', icon: '🎁' },
      ],
    },
    {
      label: 'Archive',
      items: [
        { href: '/admin/flavours', label: 'Flavours', icon: '🍦' },
        { href: '/admin/ingredients', label: 'Ingredients', icon: '🌿' },
        { href: '/admin/modifiers', label: 'Modifiers', icon: '✨' },
      ],
    },
    {
      label: 'Test Kitchen',
      items: [
        { href: '/admin/batches', label: 'Batches', icon: '🧪' },
      ],
    },
    {
      label: 'Content',
      items: [
        { href: '/admin/news', label: 'News', icon: '📰' },
        { href: '/admin/pages', label: 'Pages', icon: '📄' },
      ],
    },
    {
      label: 'Interactive',
      items: [
        { href: '/admin/games', label: 'Games', icon: '🎮' },
        { href: '/admin/sprites', label: 'Sprites', icon: '🎨' },
      ],
    },
    {
      label: 'System',
      items: [
        { href: '/admin/taxonomies', label: 'Taxonomies', icon: '🏷️' },
        { href: '/admin/formats', label: 'Formats', icon: '📦' },
        { href: '/admin/settings', label: 'Settings', icon: '⚙️' },
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
      <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col border-r border-gray-200 bg-white">
        <div className="flex flex-col flex-1 min-h-0">
          {/* Logo */}
          <div className="flex items-center h-16 px-6 border-b border-gray-200">
            <span className="text-xl font-semibold text-gray-900">Janine CMS</span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4">
            <div className="px-3 space-y-1">
              {navCategories.map((category, categoryIndex) => (
                <div key={category.label}>
                  {categoryIndex > 0 && <div className="my-3 border-t border-gray-200" />}
                  <h3 className="px-3 pt-3 pb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {category.label}
                  </h3>
                  <div className="space-y-1">
                    {category.items.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        prefetch={true}
                        className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                          isActive(item.href)
                            ? 'bg-gray-100 text-gray-900'
                            : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                      >
                        {item.icon && <span className="text-lg flex-shrink-0">{item.icon}</span>}
                        <span>{item.label}</span>
                      </Link>
                    ))}
                  </div>
                </div>
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
