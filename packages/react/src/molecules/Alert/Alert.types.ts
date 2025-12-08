import type { HTMLAttributes, ReactNode } from 'react';

export type AlertVariant = 'info' | 'success' | 'warning' | 'error';

export interface AlertProps extends HTMLAttributes<HTMLDivElement> {
    /** Alert variant */
    variant?: AlertVariant;
    /** Alert title */
    title?: string;
    /** Icon to display */
    icon?: ReactNode;
    /** Whether alert can be dismissed */
    dismissible?: boolean;
    /** Callback when dismissed */
    onDismiss?: () => void;
    /** Action button or element */
    action?: ReactNode;
    /** Alert content */
    children?: ReactNode;
}
