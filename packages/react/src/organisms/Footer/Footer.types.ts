import type { HTMLAttributes, ReactNode } from 'react';

export interface FooterLink {
    label: string;
    href: string;
}

export interface FooterColumn {
    title: string;
    links: FooterLink[];
}

export interface FooterProps extends HTMLAttributes<HTMLElement> {
    /** Logo or brand element */
    logo?: ReactNode;
    /** Description text */
    description?: string;
    /** Link columns */
    columns?: FooterColumn[];
    /** Bottom bar content (copyright, etc) */
    bottomContent?: ReactNode;
    /** Social media links */
    socialLinks?: ReactNode;
    /** Footer variant */
    variant?: 'full' | 'simple' | 'centered';
}
