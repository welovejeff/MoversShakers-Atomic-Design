import { forwardRef, useState } from 'react';
import type { AvatarProps } from './Avatar.types';
import { colors, typography } from '../../tokens';

const sizeMap: Record<string, { size: string; fontSize: string }> = {
    xs: { size: '1.5rem', fontSize: '0.625rem' },
    sm: { size: '2rem', fontSize: '0.75rem' },
    md: { size: '2.5rem', fontSize: '0.875rem' },
    lg: { size: '3rem', fontSize: '1rem' },
    xl: { size: '4rem', fontSize: '1.25rem' },
};

const statusColors: Record<string, string> = {
    online: colors.semantic.success,
    offline: colors.brand.grey,
    away: colors.semantic.warning,
    busy: colors.semantic.error,
};

/**
 * Avatar component for user profile images with fallback initials.
 * 
 * @example
 * ```tsx
 * // With image
 * <Avatar src="/user.jpg" alt="John Doe" />
 * 
 * // With initials fallback
 * <Avatar initials="JD" size="lg" />
 * 
 * // With status indicator
 * <Avatar src="/user.jpg" status="online" />
 * ```
 */
export const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
    (
        {
            size = 'md',
            src,
            alt = '',
            initials,
            status,
            style,
            ...props
        },
        ref
    ) => {
        const [imgError, setImgError] = useState(false);
        const { size: avatarSize, fontSize } = sizeMap[size];

        const containerStyles: React.CSSProperties = {
            position: 'relative',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: avatarSize,
            height: avatarSize,
            borderRadius: '50%',
            backgroundColor: colors.brand.greyLight,
            border: `2px solid ${colors.brand.black}`,
            overflow: 'hidden',
            fontFamily: typography.fontFamily.brand,
            fontWeight: typography.fontWeight.bold,
            fontSize,
            color: colors.brand.black,
            textTransform: 'uppercase',
            ...style,
        };

        const imgStyles: React.CSSProperties = {
            width: '100%',
            height: '100%',
            objectFit: 'cover',
        };

        const statusStyles: React.CSSProperties = {
            position: 'absolute',
            bottom: 0,
            right: 0,
            width: '25%',
            height: '25%',
            minWidth: '8px',
            minHeight: '8px',
            borderRadius: '50%',
            backgroundColor: status ? statusColors[status] : 'transparent',
            border: `2px solid ${colors.brand.white}`,
        };

        const showImage = src && !imgError;

        return (
            <div ref={ref} style={containerStyles}>
                {showImage ? (
                    <img
                        src={src}
                        alt={alt}
                        style={imgStyles}
                        onError={() => setImgError(true)}
                        {...props}
                    />
                ) : (
                    <span>{initials || alt.charAt(0).toUpperCase() || '?'}</span>
                )}
                {status && <span style={statusStyles} />}
            </div>
        );
    }
);

Avatar.displayName = 'Avatar';

export default Avatar;
