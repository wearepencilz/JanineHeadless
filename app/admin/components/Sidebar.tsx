'use client';

import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { memo } from 'react';
import { 
  Home05, 
  Rocket01, 
  ShoppingCart01, 
  Heart, 
  Package, 
  Settings01,
  BarChart03,
  FileCode01,
  BookOpen01,
  Target01,
  LogOut01
} from '@untitledui/icons';
import { NavList } from '@/src/app/admin/components/ui/application/app-navigation/base-components/nav-list';
import type { NavItemType, NavItemDividerType } from '@/src/app/admin/components/ui/application/app-navigation/config';

const navItems: (NavItemType | NavItemDividerType)[] = [
  { 
    label: 'Dashboard', 
    href: '/admin', 
    icon: Home05 
  },
  { 
    label: 'Launches', 
    href: '/admin/launches', 
    icon: Rocket01 
  },
  { 
    label: 'Menu Items', 
    href: '/admin/products', 
    icon: ShoppingCart01 
  },
  { 
    label: 'Flavours', 
    href: '/admin/flavours', 
    icon: Heart 
  },
  { 
    label: 'Ingredients', 
    href: '/admin/ingredients', 
    icon: Package 
  },
  { 
    label: 'Formats', 
    href: '/admin/formats', 
    icon: FileCode01 
  },
  { 
    label: 'Modifiers', 
    href: '/admin/modifiers', 
    icon: BarChart03 
  },
  { 
    label: 'Batches', 
    href: '/admin/batches', 
    icon: Package 
  },
  { 
    label: 'News', 
    href: '/admin/news', 
    icon: BookOpen01 
  },
  { 
    label: 'Games', 
    href: '/admin/games', 
    icon: Target01 
  },
  { 
    divider: true 
  },
  { 
    label: 'Settings', 
    href: '/admin/settings', 
    icon: Settings01 
  },
];

function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col border-r border-gray-200 bg-white">
      <div className="flex flex-col flex-1 min-h-0">
        {/* Logo */}
        <div className="flex items-center h-16 px-6 border-b border-gray-200">
          <Heart className="h-8 w-8 text-blue-600" />
          <span className="ml-3 text-xl font-semibold text-gray-900">Janine CMS</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto">
          <NavList activeUrl={pathname ?? undefined} items={navItems} />
        </nav>

        {/* Sign Out */}
        <div className="flex-shrink-0 border-t border-gray-200 p-4">
          <button
            onClick={() => signOut({ callbackUrl: '/admin/login' })}
            className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-900 transition-colors"
          >
            <LogOut01 className="mr-2 h-5 w-5" />
            Sign Out
          </button>
        </div>
      </div>
    </aside>
  );
}

export default memo(Sidebar);
