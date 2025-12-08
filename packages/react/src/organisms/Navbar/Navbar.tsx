import { forwardRef } from 'react';
import type { NavbarProps } from './Navbar.types';
import { colors, typography, zIndex } from '../../tokens';

/**
 * Navbar component for site-wide navigation.
 * 
 * @example
 * ```tsx
 * const navItems = [
 *   { id: 'home', label: 'Home', href: '/', active: true },
 *   { id: 'about', label: 'About', href: '/about' },
 *   { id: 'contact', label: 'Contact', href: '/contact' },
 * ];
 * 
 * <Navbar
 *   logo={<span>BRAND</span>}
 *   items={navItems}
 *   actions={<Button size="sm">Sign In</Button>}
 *   sticky
 * />
 * ```
 */
export const Navbar = forwardRef<HTMLElement, NavbarProps>(
    (
        {
            logo,
            items = [],
            actions,
            sticky = false,
            variant = 'dark',
            style,
            ...props
        },
        ref
    ) => {
        const isDark = variant === 'dark';

        const navStyles: React.CSSProperties = {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1rem 1.5rem',
            backgroundColor: isDark ? colors.brand.black : colors.brand.white,
            borderBottom: '4px solid',
            borderColor: colors.brand.yellow,
            position: sticky ? 'sticky' : 'relative',
            top: sticky ? 0 : 'auto',
            zIndex: sticky ? zIndex.sticky : 'auto',
            ...style,
        };

        const logoStyles: React.CSSProperties = {
            fontFamily: typography.fontFamily.brand,
            fontWeight: typography.fontWeight.bold,
            fontSize: '1.5rem',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: isDark ? colors.brand.white : colors.brand.black,
            textDecoration: 'none',
        };

        const navListStyles: React.CSSProperties = {
            display: 'flex',
            alignItems: 'center',
            gap: '2rem',
            listStyle: 'none',
            margin: 0,
            padding: 0,
        };

        const getLinkStyles = (active: boolean): React.CSSProperties => ({
            fontFamily: typography.fontFamily.brand,
            fontWeight: typography.fontWeight.bold,
            fontSize: '0.875rem',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: active ? colors.brand.yellow : isDark ? colors.brand.white : colors.brand.black,
            textDecoration: 'none',
            cursor: 'pointer',
            transition: 'color 0.2s',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
        });

        return (
            <nav ref={ref} style={navStyles} {...props}>
                {logo && <div style={logoStyles}>{logo}</div>}

                {items.length > 0 && (
                    <ul style={navListStyles}>
                        {items.map((item) => (
                            <li key={item.id}>
                                <a
                                    href={item.href}
                                    onClick={item.onClick}
                                    style={getLinkStyles(!!item.active)}
                                    onMouseEnter={(e) => {
                                        if (!item.active) {
                                            e.currentTarget.style.color = colors.brand.yellow;
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!item.active) {
                                            e.currentTarget.style.color = isDark ? colors.brand.white : colors.brand.black;
                                        }
                                    }}
                                >
                                    {item.icon}
                                    {item.label}
                                </a>
                            </li>
                        ))}
                    </ul>
                )}

                {actions && <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>{actions}</div>}
            </nav>
        );
    }
);

Navbar.displayName = 'Navbar';

export default Navbar;
