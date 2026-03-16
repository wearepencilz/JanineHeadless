"use client";

import type { FC, HTMLAttributes, MouseEventHandler, ReactNode } from "react";
import Link from "next/link";
import { ChevronDown, Share04 } from "@untitledui/icons";
import { cx, sortCx } from "@/app/admin/components/utils/cx";

const styles = sortCx({
    root: "group relative flex w-full cursor-pointer items-center rounded-md bg-primary outline-focus-ring transition duration-100 ease-linear select-none hover:bg-primary_hover focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-offset-2",
    rootSelected: "bg-active hover:bg-secondary_hover",
});

export interface NavItemBaseProps {
    iconOnly?: boolean;
    open?: boolean;
    href?: string;
    type: "link" | "collapsible" | "collapsible-child";
    icon?: FC<HTMLAttributes<HTMLOrSVGElement> & { className?: string }>;
    badge?: ReactNode;
    current?: boolean;
    truncate?: boolean;
    onClick?: MouseEventHandler;
    children?: ReactNode;
}

export const NavItemBase = ({
    current,
    type,
    badge,
    href,
    icon: Icon,
    children,
    truncate = true,
    onClick,
}: NavItemBaseProps) => {
    const iconElement = Icon && (
        <Icon aria-hidden="true" className="mr-2 size-5 shrink-0 text-fg-quaternary transition-inherit-all" />
    );

    const labelElement = (
        <span
            className={cx(
                "flex-1 text-sm font-semibold text-secondary transition-inherit-all group-hover:text-secondary_hover",
                truncate && "truncate",
                current && "text-secondary_hover",
            )}
        >
            {children}
        </span>
    );

    const isExternal = href && href.startsWith("http");
    const externalIcon = isExternal && <Share04 className="size-4 stroke-[2.5px] text-fg-quaternary" />;

    if (type === "collapsible") {
        return (
            <summary
                className={cx("px-3 py-2", styles.root, current && styles.rootSelected)}
                onClick={onClick}
            >
                {iconElement}
                {labelElement}
                {badge}
                <ChevronDown
                    aria-hidden="true"
                    className="ml-3 size-4 shrink-0 stroke-[2.5px] text-fg-quaternary in-open:-scale-y-100"
                />
            </summary>
        );
    }

    if (type === "collapsible-child") {
        return (
            <Link
                href={href!}
                target={isExternal ? "_blank" : "_self"}
                rel={isExternal ? "noopener noreferrer" : undefined}
                className={cx("py-2 pr-3 pl-10", styles.root, current && styles.rootSelected)}
                onClick={onClick}
                aria-current={current ? "page" : undefined}
            >
                {labelElement}
                {externalIcon}
                {badge}
            </Link>
        );
    }

    return (
        <Link
            href={href!}
            target={isExternal ? "_blank" : "_self"}
            rel={isExternal ? "noopener noreferrer" : undefined}
            className={cx("px-3 py-2", styles.root, current && styles.rootSelected)}
            onClick={onClick}
            aria-current={current ? "page" : undefined}
        >
            {iconElement}
            {labelElement}
            {externalIcon}
            {badge}
        </Link>
    );
};
