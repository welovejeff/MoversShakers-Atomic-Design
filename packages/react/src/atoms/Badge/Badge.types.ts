import type { HTMLAttributes, ReactNode } from 'react';

export type BadgeVariant = 'default' | 'success' | 'error' | 'warning' | 'info';
export type BadgeSize = 'sm' | 'md' | 'lg';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
    /** Visual style variant */
    variant?: BadgeVariant;
    /** Size of the badge */
    size?: BadgeSize;
    /** Icon to display before text */
    icon?: ReactNode;
    /** Dot indicator instead of icon */
    dot?: boolean;
    /** Badge content */
    children?: ReactNode;
}
