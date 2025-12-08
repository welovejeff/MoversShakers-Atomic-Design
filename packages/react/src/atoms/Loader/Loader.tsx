import { forwardRef } from 'react';
import type { LoaderProps } from './Loader.types';
import { colors } from '../../tokens';

const sizeMap: Record<string, string> = {
    sm: '1rem',
    md: '1.5rem',
    lg: '2.5rem',
};

/**
 * Loader component for loading states.
 * 
 * @example
 * ```tsx
 * // Default spinner
 * <Loader />
 * 
 * // Large yellow loader
 * <Loader size="lg" color="#FFF000" />
 * 
 * // Dots variant
 * <Loader variant="dots" />
 * ```
 */
export const Loader = forwardRef<HTMLDivElement, LoaderProps>(
    (
        {
            size = 'md',
            variant = 'spinner',
            color = colors.brand.black,
            label = 'Loading...',
            style,
            ...props
        },
        ref
    ) => {
        const loaderSize = sizeMap[size];

        const containerStyles: React.CSSProperties = {
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            ...style,
        };

        if (variant === 'spinner') {
            return (
                <div ref={ref} style={containerStyles} role="status" aria-label={label} {...props}>
                    <svg
                        style={{
                            width: loaderSize,
                            height: loaderSize,
                            animation: 'spin 1s linear infinite',
                        }}
                        viewBox="0 0 24 24"
                        fill="none"
                    >
                        <circle
                            cx="12"
                            cy="12"
                            r="10"
                            stroke={color}
                            strokeWidth="3"
                            strokeOpacity="0.25"
                        />
                        <path
                            d="M12 2a10 10 0 0 1 10 10"
                            stroke={color}
                            strokeWidth="3"
                            strokeLinecap="round"
                        />
                    </svg>
                    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                </div>
            );
        }

        if (variant === 'dots') {
            const dotSize = size === 'sm' ? '0.375rem' : size === 'lg' ? '0.75rem' : '0.5rem';
            const dotStyle: React.CSSProperties = {
                width: dotSize,
                height: dotSize,
                borderRadius: '50%',
                backgroundColor: color,
            };

            return (
                <div
                    ref={ref}
                    style={{ ...containerStyles, gap: dotSize }}
                    role="status"
                    aria-label={label}
                    {...props}
                >
                    <span style={{ ...dotStyle, animation: 'bounce 1s ease-in-out 0s infinite' }} />
                    <span style={{ ...dotStyle, animation: 'bounce 1s ease-in-out 0.2s infinite' }} />
                    <span style={{ ...dotStyle, animation: 'bounce 1s ease-in-out 0.4s infinite' }} />
                    <style>{`@keyframes bounce { 0%, 80%, 100% { transform: scale(0); } 40% { transform: scale(1); } }`}</style>
                </div>
            );
        }

        // Pulse variant
        return (
            <div
                ref={ref}
                style={{
                    ...containerStyles,
                    width: loaderSize,
                    height: loaderSize,
                    borderRadius: '50%',
                    backgroundColor: color,
                    animation: 'pulse 1.5s ease-in-out infinite',
                }}
                role="status"
                aria-label={label}
                {...props}
            >
                <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }`}</style>
            </div>
        );
    }
);

Loader.displayName = 'Loader';

export default Loader;
