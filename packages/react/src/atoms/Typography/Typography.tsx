import { forwardRef } from 'react';
import type { TypographyProps, TypographyVariant } from './Typography.types';
import { colors, typography } from '../../tokens';

const variantConfig: Record<
    TypographyVariant,
    { element: string; fontSize: string; fontWeight: string; lineHeight: string; isHeading: boolean }
> = {
    h1: { element: 'h1', fontSize: '3rem', fontWeight: '700', lineHeight: '1.1', isHeading: true },
    h2: { element: 'h2', fontSize: '2.25rem', fontWeight: '700', lineHeight: '1.2', isHeading: true },
    h3: { element: 'h3', fontSize: '1.875rem', fontWeight: '700', lineHeight: '1.25', isHeading: true },
    h4: { element: 'h4', fontSize: '1.5rem', fontWeight: '600', lineHeight: '1.3', isHeading: true },
    h5: { element: 'h5', fontSize: '1.25rem', fontWeight: '600', lineHeight: '1.4', isHeading: true },
    h6: { element: 'h6', fontSize: '1rem', fontWeight: '600', lineHeight: '1.5', isHeading: true },
    body1: { element: 'p', fontSize: '1rem', fontWeight: '400', lineHeight: '1.6', isHeading: false },
    body2: { element: 'p', fontSize: '0.875rem', fontWeight: '400', lineHeight: '1.6', isHeading: false },
    caption: { element: 'span', fontSize: '0.75rem', fontWeight: '400', lineHeight: '1.5', isHeading: false },
    overline: { element: 'span', fontSize: '0.75rem', fontWeight: '700', lineHeight: '1.5', isHeading: false },
};

/**
 * Typography component for consistent text styling.
 * 
 * @example
 * ```tsx
 * // Heading
 * <Typography variant="h1">Welcome</Typography>
 * 
 * // Body text
 * <Typography variant="body1">Lorem ipsum...</Typography>
 * 
 * // Overline with brand font
 * <Typography variant="overline" brand>Category</Typography>
 * 
 * // Custom element
 * <Typography variant="h1" as="div">Styled as h1</Typography>
 * ```
 */
export const Typography = forwardRef<HTMLElement, TypographyProps>(
    (
        {
            variant = 'body1',
            as,
            brand,
            color = colors.brand.black,
            truncate = false,
            lineClamp,
            children,
            style,
            ...props
        },
        ref
    ) => {
        const config = variantConfig[variant];
        const Component = as || config.element;
        const useBrandFont = brand ?? config.isHeading;

        const baseStyles: React.CSSProperties = {
            fontFamily: useBrandFont ? typography.fontFamily.brand : typography.fontFamily.body,
            fontSize: config.fontSize,
            fontWeight: config.fontWeight,
            lineHeight: config.lineHeight,
            color,
            margin: 0,
            ...(config.isHeading && { textTransform: 'uppercase', letterSpacing: '0.02em' }),
            ...(variant === 'overline' && { textTransform: 'uppercase', letterSpacing: '0.1em' }),
        };

        const truncateStyles: React.CSSProperties = truncate
            ? {
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
            }
            : {};

        const lineClampStyles: React.CSSProperties = lineClamp
            ? {
                display: '-webkit-box',
                WebkitLineClamp: lineClamp,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
            }
            : {};

        const combinedStyles: React.CSSProperties = {
            ...baseStyles,
            ...truncateStyles,
            ...lineClampStyles,
            ...style,
        };

        return (
            <Component ref={ref} style={combinedStyles} {...props}>
                {children}
            </Component>
        );
    }
);

Typography.displayName = 'Typography';

export default Typography;
