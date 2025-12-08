import { forwardRef } from 'react';
import type { FooterProps } from './Footer.types';
import { colors, typography } from '../../tokens';

/**
 * Footer component for site-wide footer.
 * 
 * @example
 * ```tsx
 * const columns = [
 *   {
 *     title: 'Product',
 *     links: [
 *       { label: 'Features', href: '/features' },
 *       { label: 'Pricing', href: '/pricing' },
 *     ],
 *   },
 *   {
 *     title: 'Company',
 *     links: [
 *       { label: 'About', href: '/about' },
 *       { label: 'Careers', href: '/careers' },
 *     ],
 *   },
 * ];
 * 
 * <Footer
 *   logo={<span>BRAND</span>}
 *   description="Building the future of design systems."
 *   columns={columns}
 *   bottomContent={<span>© 2024 Brand. All rights reserved.</span>}
 * />
 * ```
 */
export const Footer = forwardRef<HTMLElement, FooterProps>(
    (
        {
            logo,
            description,
            columns = [],
            bottomContent,
            socialLinks,
            variant = 'full',
            style,
            ...props
        },
        ref
    ) => {
        const footerStyles: React.CSSProperties = {
            backgroundColor: colors.brand.black,
            color: colors.brand.white,
            padding: '3rem 2rem',
            borderTop: '4px solid',
            borderColor: colors.brand.yellow,
            ...style,
        };

        const containerStyles: React.CSSProperties = {
            maxWidth: '80rem',
            margin: '0 auto',
        };

        const topSectionStyles: React.CSSProperties = {
            display: variant === 'full' ? 'grid' : 'flex',
            gridTemplateColumns: variant === 'full' ? `2fr repeat(${columns.length}, 1fr)` : undefined,
            gap: '3rem',
            alignItems: variant === 'centered' ? 'center' : undefined,
            justifyContent: variant === 'centered' ? 'center' : undefined,
            flexDirection: variant === 'centered' ? 'column' : undefined,
            textAlign: variant === 'centered' ? 'center' : 'left',
            marginBottom: bottomContent ? '2rem' : 0,
        };

        const brandSectionStyles: React.CSSProperties = {
            maxWidth: variant === 'centered' ? '32rem' : undefined,
        };

        const logoStyles: React.CSSProperties = {
            fontFamily: typography.fontFamily.brand,
            fontWeight: typography.fontWeight.bold,
            fontSize: '1.5rem',
            letterSpacing: '0.1em',
            marginBottom: '1rem',
        };

        const descriptionStyles: React.CSSProperties = {
            fontFamily: typography.fontFamily.body,
            fontSize: '0.875rem',
            color: colors.brand.grey,
            lineHeight: 1.6,
            marginBottom: socialLinks ? '1.5rem' : 0,
        };

        const columnTitleStyles: React.CSSProperties = {
            fontFamily: typography.fontFamily.brand,
            fontWeight: typography.fontWeight.bold,
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            marginBottom: '1rem',
            color: colors.brand.yellow,
        };

        const linkStyles: React.CSSProperties = {
            fontFamily: typography.fontFamily.body,
            fontSize: '0.875rem',
            color: colors.brand.grey,
            textDecoration: 'none',
            display: 'block',
            marginBottom: '0.5rem',
            transition: 'color 0.2s',
        };

        const bottomStyles: React.CSSProperties = {
            borderTop: `2px solid ${colors.brand.greyDark}`,
            paddingTop: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: variant === 'centered' ? 'center' : 'space-between',
            fontSize: '0.875rem',
            color: colors.brand.grey,
        };

        return (
            <footer ref={ref} style={footerStyles} {...props}>
                <div style={containerStyles}>
                    <div style={topSectionStyles}>
                        {(logo || description) && (
                            <div style={brandSectionStyles}>
                                {logo && <div style={logoStyles}>{logo}</div>}
                                {description && <p style={descriptionStyles}>{description}</p>}
                                {socialLinks && <div>{socialLinks}</div>}
                            </div>
                        )}

                        {variant === 'full' &&
                            columns.map((column, index) => (
                                <div key={index}>
                                    <h4 style={columnTitleStyles}>{column.title}</h4>
                                    <nav>
                                        {column.links.map((link, linkIndex) => (
                                            <a
                                                key={linkIndex}
                                                href={link.href}
                                                style={linkStyles}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.color = colors.brand.yellow;
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.color = colors.brand.grey;
                                                }}
                                            >
                                                {link.label}
                                            </a>
                                        ))}
                                    </nav>
                                </div>
                            ))}
                    </div>

                    {bottomContent && <div style={bottomStyles}>{bottomContent}</div>}
                </div>
            </footer>
        );
    }
);

Footer.displayName = 'Footer';

export default Footer;
