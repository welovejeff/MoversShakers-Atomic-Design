import { forwardRef } from 'react';
import type { HeroProps } from './Hero.types';
import { colors, typography } from '../../tokens';

const backgroundStyles: Record<string, { bg: string; text: string }> = {
    dark: { bg: colors.brand.black, text: colors.brand.white },
    light: { bg: colors.brand.white, text: colors.brand.black },
    brand: { bg: colors.brand.yellow, text: colors.brand.black },
};

/**
 * Hero section component for landing pages.
 * 
 * @example
 * ```tsx
 * // Centered hero
 * <Hero
 *   title="Welcome to Our Platform"
 *   subtitle="Build amazing things with our tools"
 *   primaryAction={<Button variant="primary">Get Started</Button>}
 *   secondaryAction={<Button variant="outline">Learn More</Button>}
 *   background="dark"
 *   pattern
 * />
 * 
 * // Split layout with image
 * <Hero
 *   variant="split"
 *   title="Innovation Starts Here"
 *   subtitle="Transform your workflow"
 *   image="/hero-image.jpg"
 *   primaryAction={<Button>Start Free</Button>}
 * />
 * ```
 */
export const Hero = forwardRef<HTMLElement, HeroProps>(
    (
        {
            title,
            subtitle,
            variant = 'centered',
            background = 'dark',
            backgroundImage,
            primaryAction,
            secondaryAction,
            image,
            imageAlt = '',
            pattern = false,
            style,
            ...props
        },
        ref
    ) => {
        const bgStyle = backgroundStyles[background];

        const sectionStyles: React.CSSProperties = {
            position: 'relative',
            padding: variant === 'split' ? '0' : '5rem 2rem',
            backgroundColor: bgStyle.bg,
            color: bgStyle.text,
            backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            overflow: 'hidden',
            ...style,
        };

        const patternStyles: React.CSSProperties = {
            position: 'absolute',
            inset: 0,
            backgroundImage: 'radial-gradient(rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '20px 20px',
            pointerEvents: 'none',
        };

        const containerStyles: React.CSSProperties = {
            maxWidth: '80rem',
            margin: '0 auto',
            display: variant === 'split' ? 'flex' : 'block',
            alignItems: variant === 'split' ? 'center' : undefined,
        };

        const contentStyles: React.CSSProperties = {
            textAlign: variant === 'centered' ? 'center' : 'left',
            maxWidth: variant === 'split' ? '50%' : '48rem',
            margin: variant === 'centered' ? '0 auto' : undefined,
            padding: variant === 'split' ? '4rem 3rem' : undefined,
            position: 'relative',
            zIndex: 1,
        };

        const titleStyles: React.CSSProperties = {
            fontFamily: typography.fontFamily.brand,
            fontWeight: typography.fontWeight.bold,
            fontSize: '3.5rem',
            textTransform: 'uppercase',
            letterSpacing: '0.02em',
            lineHeight: 1.1,
            margin: 0,
            marginBottom: subtitle ? '1.5rem' : '2rem',
        };

        const subtitleStyles: React.CSSProperties = {
            fontFamily: typography.fontFamily.body,
            fontSize: '1.25rem',
            lineHeight: 1.6,
            marginBottom: '2rem',
            opacity: 0.9,
        };

        const actionsStyles: React.CSSProperties = {
            display: 'flex',
            gap: '1rem',
            justifyContent: variant === 'centered' ? 'center' : 'flex-start',
            flexWrap: 'wrap',
        };

        const imageContainerStyles: React.CSSProperties = {
            flex: 1,
            display: variant === 'split' ? 'block' : 'none',
        };

        const imageStyles: React.CSSProperties = {
            width: '100%',
            height: '100%',
            minHeight: '400px',
            objectFit: 'cover',
        };

        return (
            <section ref={ref} style={sectionStyles} {...props}>
                {pattern && <div style={patternStyles} />}
                <div style={containerStyles}>
                    <div style={contentStyles}>
                        <h1 style={titleStyles}>{title}</h1>
                        {subtitle && <p style={subtitleStyles}>{subtitle}</p>}
                        {(primaryAction || secondaryAction) && (
                            <div style={actionsStyles}>
                                {primaryAction}
                                {secondaryAction}
                            </div>
                        )}
                    </div>
                    {variant === 'split' && image && (
                        <div style={imageContainerStyles}>
                            <img src={image} alt={imageAlt} style={imageStyles} />
                        </div>
                    )}
                </div>
            </section>
        );
    }
);

Hero.displayName = 'Hero';

export default Hero;
