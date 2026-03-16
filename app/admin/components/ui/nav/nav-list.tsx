"use client";

import type { FC, HTMLAttributes, ReactNode } from "react";
import { cx } from "@/app/admin/components/utils/cx";
import { NavItemBase } from "./nav-item";

export type NavItemType = {
  label: string;
  href?: string;
  icon?: FC<HTMLAttributes<HTMLOrSVGElement> & { className?: string }>;
  badge?: ReactNode;
  items?: { label: string; href: string; badge?: ReactNode }[];
  divider?: boolean;
};

export type NavGroupType = {
  label: string;
  items: NavItemType[];
};

interface NavListProps {
  activeUrl?: string;
  className?: string;
  groups: NavGroupType[];
}

export const NavList = ({ activeUrl, groups, className }: NavListProps) => {
  return (
    <div className={cx("flex flex-col px-2 space-y-0.5", className)}>
      {groups.map((group, groupIndex) => (
        <div key={group.label}>
          {groupIndex > 0 && <div className="my-2 mx-2 border-t border-gray-100" />}
          <p className="px-2 pt-2 pb-1 text-xs font-medium text-gray-400 uppercase tracking-wider">
            {group.label}
          </p>
          <ul className="space-y-0.5">
            {group.items.map((item) => {
              if (item.divider) {
                return (
                  <li key={`divider-${item.label}`} className="w-full px-0.5 py-2">
                    <hr className="h-px w-full border-none bg-gray-100" />
                  </li>
                );
              }

              if (item.items?.length) {
                const isChildActive = item.items.some((child) => child.href === activeUrl);
                return (
                  <li key={item.label} className="py-0.5">
                    <details open={isChildActive} className="appearance-none">
                      <NavItemBase href={item.href} badge={item.badge} icon={item.icon} type="collapsible" current={isChildActive}>
                        {item.label}
                      </NavItemBase>
                      <dd>
                        <ul className="py-0.5">
                          {item.items.map((childItem) => (
                            <li key={childItem.label} className="py-0.5">
                              <NavItemBase
                                href={childItem.href}
                                badge={childItem.badge}
                                type="collapsible-child"
                                current={activeUrl === childItem.href}
                              >
                                {childItem.label}
                              </NavItemBase>
                            </li>
                          ))}
                        </ul>
                      </dd>
                    </details>
                  </li>
                );
              }

              return (
                <li key={item.label} className="py-0.5">
                  <NavItemBase
                    type="link"
                    badge={item.badge}
                    icon={item.icon}
                    href={item.href}
                    current={
                      item.href === "/admin"
                        ? activeUrl === "/admin"
                        : !!(activeUrl && item.href && activeUrl.startsWith(item.href))
                    }
                  >
                    {item.label}
                  </NavItemBase>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
};
