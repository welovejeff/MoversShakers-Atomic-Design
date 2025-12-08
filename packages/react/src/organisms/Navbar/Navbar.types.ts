import type { HTMLAttributes, ReactNode } from 'react';

export interface NavItem {
    /** Unique identifier */
    id: string;
    /** Display label */
    label: string;
    /** Link href */
    href?: string;
    /** Click handler */
    onClick?: () => void;
    /** Is active/current item */
    active?: boolean;
    /** Icon to display */
    icon?: ReactNode;
}

export interface NavbarProps extends HTMLAttributes<HTMLElement> {
    /** Brand/logo content */
    logo?: ReactNode;
    /** Navigation items */
    items?: NavItem[];
    /** Content for right side (actions, user menu) */
    actions?: ReactNode;
    /** Sticky navbar */
    sticky?: boolean;
    /** Navbar variant */
    variant?: 'dark' | 'light';
}
