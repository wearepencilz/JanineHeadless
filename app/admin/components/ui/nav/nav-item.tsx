"use client";

import type { FC, HTMLAttributes, MouseEventHandler, ReactNode } from "react";
import Link from "next/link";
import { ChevronDown } from "@untitledui/icons";
import { cx } from "@/app/admin/components/utils/cx";

const styles = {
  root: "group relative flex w-full cursor-pointer items-center rounded-md bg-white outline-none transition duration-100 ease-linear select-none hover:bg-gray-50 focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500",
  rootSelected: "bg-gray-100 hover:bg-gray-100",
};

interface NavItemBaseProps {
  href?: string;
  type: "link" | "collapsible" | "collapsible-child";
  icon?: FC<HTMLAttributes<HTMLOrSVGElement> & { className?: string }>;
  badge?: ReactNode;
  current?: boolean;
  truncate?: boolean;
  onClick?: MouseEventHandler;
  children?: ReactNode;
}

export const NavItemBase = ({ current, type, badge, href, icon: Icon, children, truncate = true, onClick }: NavItemBaseProps) => {
  const iconElement = Icon && (
    <Icon aria-hidden="true" className="mr-2 size-4 shrink-0 text-gray-400 transition-all group-hover:text-gray-600" />
  );

  const labelElement = (
    <span
      className={cx(
        "flex-1 text-sm font-medium text-gray-600 transition-all group-hover:text-gray-900",
        truncate && "truncate",
        current && "text-gray-900",
      )}
    >
      {children}
    </span>
  );

  if (type === "collapsible") {
    return (
      <summary
        className={cx("px-2 py-1.5", styles.root, current && styles.rootSelected)}
        onClick={onClick}
      >
        {iconElement}
        {labelElement}
        {badge}
        <ChevronDown aria-hidden="true" className="ml-2 size-4 shrink-0 text-gray-400 in-open:-scale-y-100" />
      </summary>
    );
  }

  if (type === "collapsible-child") {
    return (
      <Link
        href={href!}
        className={cx("py-1.5 pr-2 pl-8", styles.root, current && styles.rootSelected)}
        onClick={onClick}
        aria-current={current ? "page" : undefined}
      >
        {labelElement}
        {badge}
      </Link>
    );
  }

  return (
    <Link
      href={href!}
      className={cx("px-2 py-1.5", styles.root, current && styles.rootSelected)}
      onClick={onClick}
      aria-current={current ? "page" : undefined}
    >
      {iconElement}
      {labelElement}
      {badge}
    </Link>
  );
};
