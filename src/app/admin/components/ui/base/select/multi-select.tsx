"use client";

import type { KeyboardEvent } from "react";
import { useCallback, useRef, useState, useEffect } from "react";
import { SearchLg } from "@untitledui/icons";
import type { Key } from "react-aria-components";
import type { ListData } from "react-stately";
import type { IconComponentType } from "@/src/app/admin/components/ui/base/badges/badge-types";
import { HintText } from "@/src/app/admin/components/ui/base/input/hint-text";
import { Label } from "@/src/app/admin/components/ui/base/input/label";
import { type SelectItemType, sizes } from "@/src/app/admin/components/ui/base/select/select";
import { TagCloseX } from "@/src/app/admin/components/ui/base/tags/base-components/tag-close-x";
import { cx } from "@/utils/cx";
import { SelectItem } from "./select-item";

interface MultiSelectProps {
    hint?: string;
    label?: string;
    tooltip?: string;
    size?: "sm" | "md";
    placeholder?: string;
    shortcut?: boolean;
    items?: SelectItemType[];
    popoverClassName?: string;
    shortcutClassName?: string;
    selectedItems: ListData<SelectItemType>;
    placeholderIcon?: IconComponentType | null;
    isRequired?: boolean;
    isDisabled?: boolean;
    isInvalid?: boolean;
    name?: string;
    className?: string;
    "aria-label"?: string;
    children?: ((item: SelectItemType) => React.ReactNode) | React.ReactNode;
    onItemCleared?: (key: Key) => void;
    onItemInserted?: (key: Key) => void;
}

export const MultiSelectBase = ({
    items = [],
    children,
    size = "sm",
    selectedItems,
    onItemCleared,
    onItemInserted,
    placeholder = "Search",
    ...props
}: MultiSelectProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [filterText, setFilterText] = useState("");
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const selectedKeys = selectedItems.items.map((item) => item.id);

    // Filter items: exclude already-selected, match search text
    const filteredItems = items.filter((item) => {
        if (selectedKeys.includes(item.id)) return false;
        if (!filterText) return true;
        const text = (item.label || item.supportingText || "").toLowerCase();
        return text.includes(filterText.toLowerCase());
    });

    const onRemove = useCallback(
        (key: Key) => {
            selectedItems.remove(key);
            onItemCleared?.(key);
        },
        [selectedItems, onItemCleared],
    );

    const onSelect = useCallback(
        (item: SelectItemType) => {
            if (!selectedKeys.includes(item.id)) {
                selectedItems.append(item);
                onItemInserted?.(item.id);
            }
            setFilterText("");
            inputRef.current?.focus();
        },
        [selectedItems, selectedKeys, onItemInserted],
    );

    // Close on outside click
    useEffect(() => {
        const handleMouseDown = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
                setFilterText("");
            }
        };
        document.addEventListener("mousedown", handleMouseDown);
        return () => document.removeEventListener("mousedown", handleMouseDown);
    }, []);

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Escape") {
            setIsOpen(false);
            setFilterText("");
        }
        if (e.key === "Backspace" && filterText === "" && selectedItems.items.length > 0) {
            const last = selectedItems.items[selectedItems.items.length - 1];
            onRemove(last.id);
        }
    };

    const isSelectionEmpty = selectedItems.items.length === 0;
    const Icon = props.placeholderIcon !== null ? (props.placeholderIcon ?? SearchLg) : null;

    return (
        <div className={cx("flex flex-col gap-1.5", props.className)}>
            {props.label && (
                <Label isRequired={props.isRequired} tooltip={props.tooltip}>
                    {props.label}
                </Label>
            )}

            {/* Relative wrapper — dropdown anchors here */}
            <div ref={containerRef} className="relative">
                {/* Input trigger */}
                <div
                    className={cx(
                        "flex w-full flex-wrap items-center gap-1.5 rounded-lg bg-primary shadow-xs ring-1 ring-inset transition duration-100 ease-linear cursor-text",
                        props.isDisabled ? "cursor-not-allowed bg-disabled_subtle ring-primary" : "ring-primary",
                        isOpen ? "ring-2 ring-brand" : "",
                        sizes[size].root,
                    )}
                    onClick={() => {
                        if (!props.isDisabled) {
                            setIsOpen(true);
                            inputRef.current?.focus();
                        }
                    }}
                >
                    {Icon && <Icon className="pointer-events-none size-5 shrink-0 text-fg-quaternary" />}

                    {/* Selected tags */}
                    {!isSelectionEmpty && selectedItems.items.map((item) => (
                        <span key={item.id} className="flex items-center rounded-md bg-primary py-0.5 pr-1 pl-1.5 ring-1 ring-primary ring-inset">
                            <p className="truncate text-sm font-medium whitespace-nowrap text-secondary select-none">{item.label}</p>
                            <TagCloseX
                                size="md"
                                isDisabled={props.isDisabled}
                                className="ml-0.75"
                                onPress={() => onRemove(item.id)}
                            />
                        </span>
                    ))}

                    {/* Search input */}
                    <input
                        ref={inputRef}
                        type="text"
                        value={filterText}
                        placeholder={isSelectionEmpty ? placeholder : ""}
                        disabled={props.isDisabled}
                        onChange={(e) => {
                            setFilterText(e.target.value);
                            setIsOpen(true);
                        }}
                        onFocus={() => setIsOpen(true)}
                        onKeyDown={handleKeyDown}
                        className="min-w-[80px] flex-1 appearance-none bg-transparent text-sm text-primary caret-alpha-black/90 outline-none placeholder:text-placeholder disabled:cursor-not-allowed disabled:text-disabled disabled:placeholder:text-disabled"
                    />
                </div>

                {/* Dropdown — absolutely positioned below the input */}
                {isOpen && filteredItems.length > 0 && (
                    <div className={cx(
                        "absolute left-0 right-0 top-full z-50 mt-1 max-h-64 overflow-y-auto rounded-lg bg-white py-1 shadow-lg ring-1 ring-black/10",
                        props.popoverClassName,
                    )}>
                        {filteredItems.map((item) => (
                            <button
                                key={item.id}
                                type="button"
                                onMouseDown={(e) => {
                                    // Prevent blur on input
                                    e.preventDefault();
                                    onSelect(item);
                                }}
                                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-gray-900 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none"
                            >
                                <span className="flex-1 font-medium">{item.label}</span>
                                {item.supportingText && (
                                    <span className="text-xs text-gray-500">{item.supportingText}</span>
                                )}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {props.hint && <HintText isInvalid={props.isInvalid}>{props.hint}</HintText>}
        </div>
    );
};

// Keep MultiSelectTagsValue exported for any external usage
export const MultiSelectTagsValue = ({ size = "sm", placeholder }: { size?: "sm" | "md"; placeholder?: string; shortcut?: boolean; shortcutClassName?: string; placeholderIcon?: IconComponentType | null; isDisabled?: boolean }) => {
    return (
        <div className={cx("flex w-full items-center gap-2 rounded-lg bg-primary shadow-xs ring-1 ring-primary ring-inset", sizes[size].root)}>
            <SearchLg className="pointer-events-none size-5 text-fg-quaternary" />
            <input placeholder={placeholder} className="w-full bg-transparent text-sm outline-none placeholder:text-placeholder" />
        </div>
    );
};

const MultiSelect = MultiSelectBase as typeof MultiSelectBase & {
    Item: typeof SelectItem;
};

MultiSelect.Item = SelectItem;

export { MultiSelect as MultiSelect };
