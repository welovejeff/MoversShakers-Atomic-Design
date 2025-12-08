import type { HTMLAttributes, ElementType } from 'react';

export type TypographyVariant =
    | 'h1'
    | 'h2'
    | 'h3'
    | 'h4'
    | 'h5'
    | 'h6'
    | 'body1'
    | 'body2'
    | 'caption'
    | 'overline';

export interface TypographyProps extends HTMLAttributes<HTMLElement> {
    /** Typography variant */
    variant?: TypographyVariant;
    /** Override the default HTML element */
    as?: ElementType;
    /** Use brand font (Oswald) instead of body font */
    brand?: boolean;
    /** Text color */
    color?: string;
    /** Truncate text with ellipsis */
    truncate?: boolean;
    /** Maximum number of lines before truncating */
    lineClamp?: number;
}
