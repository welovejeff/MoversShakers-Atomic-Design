import type { HTMLAttributes, ReactNode } from 'react';

export interface HeroProps extends HTMLAttributes<HTMLElement> {
    /** Hero title */
    title: string;
    /** Subtitle text */
    subtitle?: string;
    /** Hero layout variant */
    variant?: 'centered' | 'split' | 'fullWidth';
    /** Background variant */
    background?: 'dark' | 'light' | 'brand';
    /** Background image URL */
    backgroundImage?: string;
    /** Primary CTA button */
    primaryAction?: ReactNode;
    /** Secondary CTA button */
    secondaryAction?: ReactNode;
    /** Image for split layout */
    image?: string;
    /** Image alt text */
    imageAlt?: string;
    /** Decorative pattern */
    pattern?: boolean;
}
