import { forwardRef } from 'react';
import type { CardProps } from './Card.types';
import { colors, shadows, transitions } from '../../tokens';

const paddingMap: Record<string, string> = {
    none: '0',
    sm: '0.75rem',
    md: '1.25rem',
    lg: '2rem',
};

/**
 * Card component for content containers.
 * 
 * @example
 * ```tsx
 * // Basic card
 * <Card>
 *   <h3>Title</h3>
 *   <p>Content here</p>
 * </Card>
 * 
 * // Card with image and footer
 * <Card 
 *   image="/hero.jpg" 
 *   imageAlt="Hero" 
 *   footer={<Button>Learn More</Button>}
 * >
 *   <h3>Featured</h3>
 *   <p>Description text</p>
 * </Card>
 * 
 * // Hoverable card
 * <Card hoverable clickable onClick={() => {}}>
 *   Clickable content
 * </Card>
 * ```
 */
export const Card = forwardRef<HTMLDivElement, CardProps>(
    (
        {
            variant = 'default',
            padding = 'md',
            hoverable = false,
            clickable = false,
            header,
            footer,
            image,
            imageAlt = '',
            children,
            style,
            onMouseEnter,
            onMouseLeave,
            ...props
        },
        ref
    ) => {
        const baseStyles: React.CSSProperties = {
            backgroundColor: colors.brand.white,
            border: '2px solid',
            borderColor: variant === 'outline' ? colors.brand.grey : colors.brand.black,
            boxShadow: variant === 'elevated' ? shadows.md : variant === 'default' ? shadows.sm : 'none',
            transition: transitions.normal,
            cursor: clickable ? 'pointer' : 'default',
            overflow: 'hidden',
            ...style,
        };

        const contentStyles: React.CSSProperties = {
            padding: paddingMap[padding],
        };

        const headerStyles: React.CSSProperties = {
            padding: paddingMap[padding],
            borderBottom: `2px solid ${colors.brand.greyLight}`,
        };

        const footerStyles: React.CSSProperties = {
            padding: paddingMap[padding],
            borderTop: `2px solid ${colors.brand.greyLight}`,
            backgroundColor: colors.brand.greyLight,
        };

        const imageStyles: React.CSSProperties = {
            width: '100%',
            height: 'auto',
            display: 'block',
            borderBottom: `2px solid ${colors.brand.black}`,
        };

        const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
            if (hoverable) {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = shadows.lg;
            }
            onMouseEnter?.(e);
        };

        const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
            if (hoverable) {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = variant === 'elevated' ? shadows.md : shadows.sm;
            }
            onMouseLeave?.(e);
        };

        return (
            <div
                ref={ref}
                style={baseStyles}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                {...props}
            >
                {image && <img src={image} alt={imageAlt} style={imageStyles} />}
                {header && <div style={headerStyles}>{header}</div>}
                <div style={contentStyles}>{children}</div>
                {footer && <div style={footerStyles}>{footer}</div>}
            </div>
        );
    }
);

Card.displayName = 'Card';

export default Card;
