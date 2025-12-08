import type { HTMLAttributes, ReactNode } from 'react';

export interface SidebarItem {
    id: string;
    label: string;
    icon?: ReactNode;
    href?: string;
    onClick?: () => void;
    active?: boolean;
    badge?: string | number;
    children?: SidebarItem[];
}

export interface SidebarProps extends HTMLAttributes<HTMLElement> {
    /** Sidebar items */
    items: SidebarItem[];
    /** Header content */
    header?: ReactNode;
    /** Footer content */
    footer?: ReactNode;
    /** Collapsed state */
    collapsed?: boolean;
    /** Width when expanded */
    width?: string;
    /** Collapsed width */
    collapsedWidth?: string;
}
