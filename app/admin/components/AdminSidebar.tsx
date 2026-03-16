'use client';

import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { NavSections } from './ui/nav/nav-sections';
import type { NavSectionType } from './ui/nav/nav-sections';
import {
    HomeLine,
    Rocket01,
    ShoppingBag01,
    Star01,
    Atom01,
    Beaker01,
    LayersThree01,
    Sliders01,
    Announcement01,
    Dice1,
    Settings01,
    Tag01,
} from '@untitledui/icons';

const sections: NavSectionType[] = [
    {
        label: 'General',
        items: [
            { label: 'Dashboard', href: '/admin', icon: HomeLine },
        ],
    },
    {
        label: 'Commerce',
        items: [
            { label: 'Launches', href: '/admin/launches', icon: Rocket01 },
            { label: 'Products', href: '/admin/products', icon: ShoppingBag01 },
        ],
    },
    {
        label: 'Archive',
        items: [
            { label: 'Flavours', href: '/admin/flavours', icon: Star01 },
            { label: 'Batches', href: '/admin/batches', icon: Beaker01 },
            { label: 'Modifiers', href: '/admin/modifiers', icon: Sliders01 },
            { label: 'Ingredients', href: '/admin/ingredients', icon: Atom01 },
        ],
    },
    {
        label: 'Content',
        items: [
            { label: 'News', href: '/admin/news', icon: Announcement01 },
            { label: 'Games', href: '/admin/games', icon: Dice1 },
        ],
    },
    {
        label: 'System',
        items: [
            { label: 'Formats', href: '/admin/formats', icon: LayersThree01 },
            { label: 'Taxonomies', href: '/admin/taxonomies', icon: Tag01 },
            { label: 'Settings', href: '/admin/settings', icon: Settings01 },
        ],
    },
];

export default function AdminSidebar() {
    const pathname = usePathname();

    const activeUrl = pathname === '/admin'
        ? '/admin'
        : sections
            .flatMap((s) => s.items)
            .find((item) => item.href !== '/admin' && item.href && (
                pathname?.startsWith(item.href + '/') || pathname === item.href
            ))?.href;

    return (
        <aside className="fixed inset-y-0 left-0 z-40 flex w-[240px] flex-col border-r border-gray-200 bg-white">
            <div className="flex h-16 items-center px-6 border-b border-gray-200">
                <span className="text-lg font-semibold text-gray-900">Janine CMS</span>
            </div>

            <div className="flex-1 overflow-y-auto">
                <NavSections items={sections} activeUrl={activeUrl} />
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
