import type { HTMLAttributes, ReactNode } from 'react';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
    /** Card variant */
    variant?: 'default' | 'elevated' | 'outline';
    /** Padding size */
    padding?: 'none' | 'sm' | 'md' | 'lg';
    /** Hover effect */
    hoverable?: boolean;
    /** Clickable card */
    clickable?: boolean;
    /** Header content */
    header?: ReactNode;
    /** Footer content */
    footer?: ReactNode;
    /** Image at top of card */
    image?: string;
    /** Image alt text */
    imageAlt?: string;
    /** Card content */
    children?: ReactNode;
}
