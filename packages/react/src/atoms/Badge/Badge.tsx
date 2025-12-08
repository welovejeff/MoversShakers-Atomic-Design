import { forwardRef } from 'react';
import type { BadgeProps } from './Badge.types';
import { colors, typography } from '../../tokens';

const baseStyles: React.CSSProperties = {
    fontFamily: typography.fontFamily.body,
    fontWeight: typography.fontWeight.medium,
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.375rem',
    border: '1px solid',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
};

const variantStyles: Record<string, React.CSSProperties> = {
    default: {
        backgroundColor: colors.brand.greyLight,
        color: colors.brand.black,
        borderColor: colors.brand.grey,
    },
    success: {
        backgroundColor: colors.semantic.successLight,
        color: colors.semantic.success,
        borderColor: colors.semantic.success,
    },
    error: {
        backgroundColor: colors.semantic.errorLight,
        color: colors.semantic.error,
        borderColor: colors.semantic.error,
    },
    warning: {
        backgroundColor: colors.semantic.warningLight,
        color: colors.semantic.warning,
        borderColor: colors.semantic.warning,
    },
    info: {
        backgroundColor: colors.semantic.infoLight,
        color: colors.semantic.info,
        borderColor: colors.semantic.info,
    },
};

const sizeStyles: Record<string, React.CSSProperties> = {
    sm: {
        padding: '0.125rem 0.375rem',
        fontSize: '0.625rem',
    },
    md: {
        padding: '0.25rem 0.5rem',
        fontSize: '0.75rem',
    },
    lg: {
        padding: '0.375rem 0.75rem',
        fontSize: '0.875rem',
    },
};

const dotColors: Record<string, string> = {
    default: colors.brand.grey,
    success: colors.semantic.success,
    error: colors.semantic.error,
    warning: colors.semantic.warning,
    info: colors.semantic.info,
};

/**
 * Badge component for status indicators, labels, and tags.
 * 
 * @example
 * ```tsx
 * // Default badge
 * <Badge>New</Badge>
 * 
 * // Success variant with dot
 * <Badge variant="success" dot>Active</Badge>
 * 
 * // Error variant
 * <Badge variant="error">Urgent</Badge>
 * ```
 */
export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
    (
        {
            variant = 'default',
            size = 'md',
            icon,
            dot = false,
            children,
            style,
            ...props
        },
        ref
    ) => {
        const combinedStyles: React.CSSProperties = {
            ...baseStyles,
            ...variantStyles[variant],
            ...sizeStyles[size],
            ...style,
        };

        const dotStyle: React.CSSProperties = {
            width: size === 'sm' ? '0.375rem' : size === 'lg' ? '0.5rem' : '0.4375rem',
            height: size === 'sm' ? '0.375rem' : size === 'lg' ? '0.5rem' : '0.4375rem',
            borderRadius: '50%',
            backgroundColor: dotColors[variant],
        };

        return (
            <span ref={ref} style={combinedStyles} {...props}>
                {dot && <span style={dotStyle} />}
                {icon && !dot && icon}
                {children}
            </span>
        );
    }
);

Badge.displayName = 'Badge';

export default Badge;
