import type { HTMLAttributes, ReactNode } from 'react';

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

export interface ModalProps extends HTMLAttributes<HTMLDivElement> {
    /** Whether modal is open */
    open: boolean;
    /** Callback when modal should close */
    onClose: () => void;
    /** Modal title */
    title?: string;
    /** Modal size */
    size?: ModalSize;
    /** Close on backdrop click */
    closeOnBackdrop?: boolean;
    /** Close on escape key */
    closeOnEscape?: boolean;
    /** Show close button */
    showCloseButton?: boolean;
    /** Footer content */
    footer?: ReactNode;
    /** Modal content */
    children?: ReactNode;
}
