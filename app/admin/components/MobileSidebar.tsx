'use client';

import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { 
  Home05, 
  Rocket01, 
  ShoppingCart01, 
  IceCream02, 
  Package, 
  Settings01,
  BarChart03,
  FileCode01,
  Newspaper,
  GameController01,
  LogOut01,
  X as CloseIcon,
  Menu02
} from '@untitledui/icons';
import {
  Button as AriaButton,
  Dialog as AriaDialog,
  DialogTrigger as AriaDialogTrigger,
  Modal as AriaModal,
  ModalOverlay as AriaModalOverlay,
} from 'react-aria-components';
import { NavList } from '@/src/app/admin/components/ui/application/app-navigation/base-components/nav-list';
import type { NavItemType } from '@/src/app/admin/components/ui/application/app-navigation/config';
import { cx } from '@/src/utils/cx';

export default function MobileSidebar() {
  const pathname = usePathname();

  const navItems: NavItemType[] = [
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
      icon: IceCream02 
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
      icon: Newspaper 
    },
    { 
      label: 'Games', 
      href: '/admin/games', 
      icon: GameController01 
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

  return (
    <AriaDialogTrigger>
      <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white py-3 pr-2 pl-4 lg:hidden">
        <div className="flex items-center">
          <IceCream02 className="h-8 w-8 text-blue-600" />
          <span className="ml-3 text-xl font-semibold text-gray-900">Janine CMS</span>
        </div>

        <AriaButton
          aria-label="Expand navigation menu"
          className="group flex items-center justify-center rounded-lg bg-white p-2 text-gray-600 hover:bg-gray-50 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <Menu02 className="size-6 transition duration-200 ease-in-out group-aria-expanded:opacity-0" />
          <CloseIcon className="absolute size-6 opacity-0 transition duration-200 ease-in-out group-aria-expanded:opacity-100" />
        </AriaButton>
      </header>

      <AriaModalOverlay
        isDismissable
        className={({ isEntering, isExiting }) =>
          cx(
            "fixed inset-0 z-50 cursor-pointer bg-black/50 pr-16 backdrop-blur-sm lg:hidden",
            isEntering && "duration-300 ease-in-out animate-in fade-in",
            isExiting && "duration-200 ease-in-out animate-out fade-out",
          )
        }
      >
        {({ state }) => (
          <>
            <AriaButton
              aria-label="Close navigation menu"
              onPress={() => state.close()}
              className="fixed top-3 right-2 flex cursor-pointer items-center justify-center rounded-lg p-2 text-white/70 hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2"
            >
              <CloseIcon className="size-6" />
            </AriaButton>

            <AriaModal className="w-full cursor-auto will-change-transform">
              <AriaDialog className="h-dvh outline-none focus:outline-none">
                <div className="flex flex-col h-full bg-white">
                  {/* Logo in mobile sidebar */}
                  <div className="flex items-center px-6 py-4 border-b border-gray-200">
                    <IceCream02 className="h-8 w-8 text-blue-600" />
                    <span className="ml-3 text-xl font-semibold text-gray-900">Janine CMS</span>
                  </div>

                  <nav className="flex-1 overflow-y-auto">
                    <NavList activeUrl={pathname} items={navItems} />
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
              </AriaDialog>
            </AriaModal>
          </>
        )}
      </AriaModalOverlay>
    </AriaDialogTrigger>
  );
}
