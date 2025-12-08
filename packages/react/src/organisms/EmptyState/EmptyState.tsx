import { forwardRef } from 'react';
import type { EmptyStateProps } from './EmptyState.types';
import { colors, typography } from '../../tokens';

const sizeConfig = {
    sm: { iconSize: '3rem', titleSize: '1rem', descSize: '0.875rem', padding: '2rem' },
    md: { iconSize: '4rem', titleSize: '1.25rem', descSize: '1rem', padding: '3rem' },
    lg: { iconSize: '5rem', titleSize: '1.5rem', descSize: '1.125rem', padding: '4rem' },
};

/**
 * EmptyState component for no data, errors, or first-time user states.
 * 
 * @example
 * ```tsx
 * // No results
 * <EmptyState
 *   icon={<SearchX size={48} />}
 *   title="No results found"
 *   description="Try adjusting your search or filters"
 *   action={<Button>Clear filters</Button>}
 * />
 * 
 * // First-time user
 * <EmptyState
 *   icon={<Inbox size={48} />}
 *   title="Your inbox is empty"
 *   description="Messages from your team will appear here"
 *   size="lg"
 * />
 * ```
 */
export const EmptyState = forwardRef<HTMLDivElement, EmptyStateProps>(
    (
        {
            title,
            description,
            icon,
            action,
            secondaryAction,
            size = 'md',
            style,
            ...props
        },
        ref
    ) => {
        const config = sizeConfig[size];

        const containerStyles: React.CSSProperties = {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            padding: config.padding,
            ...style,
        };

        const iconStyles: React.CSSProperties = {
            color: colors.brand.grey,
            marginBottom: '1.5rem',
            fontSize: config.iconSize,
        };

        const titleStyles: React.CSSProperties = {
            fontFamily: typography.fontFamily.brand,
            fontWeight: typography.fontWeight.bold,
            fontSize: config.titleSize,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: colors.brand.black,
            margin: 0,
            marginBottom: description ? '0.75rem' : '1.5rem',
        };

        const descriptionStyles: React.CSSProperties = {
            fontFamily: typography.fontFamily.body,
            fontSize: config.descSize,
            color: colors.brand.grey,
            maxWidth: '24rem',
            lineHeight: 1.6,
            marginBottom: '1.5rem',
        };

        const actionsStyles: React.CSSProperties = {
            display: 'flex',
            gap: '0.75rem',
            flexWrap: 'wrap',
            justifyContent: 'center',
        };

        return (
            <div ref={ref} style={containerStyles} {...props}>
                {icon && <div style={iconStyles}>{icon}</div>}
                <h3 style={titleStyles}>{title}</h3>
                {description && <p style={descriptionStyles}>{description}</p>}
                {(action || secondaryAction) && (
                    <div style={actionsStyles}>
                        {action}
                        {secondaryAction}
                    </div>
                )}
            </div>
        );
    }
);

EmptyState.displayName = 'EmptyState';

export default EmptyState;
