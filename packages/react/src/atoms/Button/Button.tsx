import { forwardRef } from 'react';
import type { ButtonProps } from './Button.types';
import { colors, shadows, transitions } from '../../tokens';

const baseStyles: React.CSSProperties = {
    fontFamily: "'Oswald', sans-serif",
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    fontWeight: 700,
    border: '2px solid',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    transition: transitions.normal,
    position: 'relative',
};

const variantStyles: Record<string, React.CSSProperties> = {
    primary: {
        backgroundColor: colors.brand.yellow,
        color: colors.brand.black,
        borderColor: colors.brand.black,
        boxShadow: shadows.md,
    },
    secondary: {
        backgroundColor: colors.brand.black,
        color: colors.brand.white,
        borderColor: colors.brand.black,
        boxShadow: shadows.md,
    },
    outline: {
        backgroundColor: 'transparent',
        color: colors.brand.black,
        borderColor: colors.brand.black,
    },
    ghost: {
        backgroundColor: 'transparent',
        color: colors.brand.black,
        borderColor: 'transparent',
    },
};

const sizeStyles: Record<string, React.CSSProperties> = {
    sm: {
        padding: '0.375rem 0.75rem',
        fontSize: '0.75rem',
    },
    md: {
        padding: '0.625rem 1.25rem',
        fontSize: '0.875rem',
    },
    lg: {
        padding: '0.875rem 1.75rem',
        fontSize: '1rem',
    },
};

const hoverStyles: Record<string, React.CSSProperties> = {
    primary: {
        transform: 'translate(-2px, -2px)',
        boxShadow: shadows.lg,
    },
    secondary: {
        transform: 'translate(-2px, -2px)',
        boxShadow: shadows.yellowMd,
    },
    outline: {
        backgroundColor: colors.brand.yellow,
    },
    ghost: {
        backgroundColor: colors.brand.greyLight,
    },
};

const disabledStyles: React.CSSProperties = {
    opacity: 0.5,
    cursor: 'not-allowed',
    transform: 'none',
};

/**
 * Button component following Movers+Shakers design system.
 * 
 * @example
 * ```tsx
 * // Primary button
 * <Button variant="primary">Click Me</Button>
 * 
 * // With icon
 * <Button variant="primary" icon={<Plus />}>Add Item</Button>
 * 
 * // Loading state
 * <Button loading>Submitting...</Button>
 * ```
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    (
        {
            variant = 'primary',
            size = 'md',
            icon,
            iconRight,
            loading = false,
            fullWidth = false,
            disabled,
            children,
            style,
            onMouseEnter,
            onMouseLeave,
            ...props
        },
        ref
    ) => {
        const isDisabled = disabled || loading;

        const combinedStyles: React.CSSProperties = {
            ...baseStyles,
            ...variantStyles[variant],
            ...sizeStyles[size],
            ...(fullWidth && { width: '100%' }),
            ...(isDisabled && disabledStyles),
            ...style,
        };

        const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
            if (!isDisabled) {
                const target = e.currentTarget;
                const hover = hoverStyles[variant];
                if (hover.transform) target.style.transform = hover.transform;
                if (hover.boxShadow) target.style.boxShadow = hover.boxShadow;
                if (hover.backgroundColor) target.style.backgroundColor = hover.backgroundColor;
            }
            onMouseEnter?.(e);
        };

        const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
            const target = e.currentTarget;
            const base = variantStyles[variant];
            target.style.transform = 'none';
            target.style.boxShadow = base.boxShadow || 'none';
            target.style.backgroundColor = base.backgroundColor || 'transparent';
            onMouseLeave?.(e);
        };

        return (
            <button
                ref={ref}
                disabled={isDisabled}
                style={combinedStyles}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                {...props}
            >
                {loading && (
                    <svg
                        style={{ width: '1em', height: '1em', animation: 'spin 1s linear infinite' }}
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                    >
                        <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                        <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
                    </svg>
                )}
                {!loading && icon}
                {children}
                {iconRight}
            </button>
        );
    }
);

Button.displayName = 'Button';

export default Button;
