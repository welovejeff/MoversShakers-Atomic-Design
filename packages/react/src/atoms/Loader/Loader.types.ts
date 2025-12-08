import type { HTMLAttributes } from 'react';

export type LoaderSize = 'sm' | 'md' | 'lg';
export type LoaderVariant = 'spinner' | 'dots' | 'pulse';

export interface LoaderProps extends HTMLAttributes<HTMLDivElement> {
    /** Size of the loader */
    size?: LoaderSize;
    /** Loader animation style */
    variant?: LoaderVariant;
    /** Color of the loader */
    color?: string;
    /** Accessible label */
    label?: string;
}
