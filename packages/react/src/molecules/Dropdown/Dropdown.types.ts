import type { HTMLAttributes, ReactNode } from 'react';

export interface DropdownItem {
    /** Unique identifier */
    id: string;
    /** Display label */
    label: string;
    /** Icon to display */
    icon?: ReactNode;
    /** Disabled state */
    disabled?: boolean;
    /** Divider after this item */
    divider?: boolean;
    /** Nested items */
    children?: DropdownItem[];
}

export interface DropdownProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onSelect'> {
    /** Dropdown trigger element */
    trigger: ReactNode;
    /** Menu items */
    items: DropdownItem[];
    /** Callback when item is selected */
    onSelect?: (item: DropdownItem) => void;
    /** Menu alignment */
    align?: 'left' | 'right';
    /** Controlled open state */
    open?: boolean;
    /** Callback when open state changes */
    onOpenChange?: (open: boolean) => void;
}
