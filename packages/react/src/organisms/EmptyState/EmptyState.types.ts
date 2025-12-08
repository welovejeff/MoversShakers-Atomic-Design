import type { HTMLAttributes, ReactNode } from 'react';

export interface EmptyStateProps extends HTMLAttributes<HTMLDivElement> {
    /** Title text */
    title: string;
    /** Description text */
    description?: string;
    /** Icon or illustration */
    icon?: ReactNode;
    /** Primary action button */
    action?: ReactNode;
    /** Secondary action */
    secondaryAction?: ReactNode;
    /** Size variant */
    size?: 'sm' | 'md' | 'lg';
}
