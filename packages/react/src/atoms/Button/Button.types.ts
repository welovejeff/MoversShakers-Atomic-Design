import type { ButtonHTMLAttributes, ReactNode } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    /** Visual style variant */
    variant?: ButtonVariant;
    /** Size of the button */
    size?: ButtonSize;
    /** Icon to display before the text */
    icon?: ReactNode;
    /** Icon to display after the text */
    iconRight?: ReactNode;
    /** Loading state - shows spinner and disables button */
    loading?: boolean;
    /** Full width button */
    fullWidth?: boolean;
    /** Button content */
    children?: ReactNode;
}
