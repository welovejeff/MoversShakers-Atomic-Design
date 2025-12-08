import type { InputHTMLAttributes, ReactNode } from 'react';

export type InputSize = 'sm' | 'md' | 'lg';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
    /** Size of the input */
    size?: InputSize;
    /** Label text */
    label?: string;
    /** Helper text below input */
    helperText?: string;
    /** Error message (also sets error state) */
    error?: string;
    /** Icon to display at start of input */
    startIcon?: ReactNode;
    /** Icon to display at end of input */
    endIcon?: ReactNode;
    /** Full width input */
    fullWidth?: boolean;
}
