import { forwardRef } from 'react';
import type { SidebarProps, SidebarItem } from './Sidebar.types';
import { colors, shadows, transitions, typography } from '../../tokens';

/**
 * Sidebar navigation component.
 * 
 * @example
 * ```tsx
 * const items = [
 *   { id: 'dashboard', label: 'Dashboard', icon: <Home />, active: true },
 *   { id: 'projects', label: 'Projects', icon: <Folder />, badge: 5 },
 *   { id: 'settings', label: 'Settings', icon: <Settings /> },
 * ];
 * 
 * <Sidebar
 *   header={<Logo />}
 *   items={items}
 *   footer={<UserMenu />}
 * />
 * ```
 */
export const Sidebar = forwardRef<HTMLElement, SidebarProps>(
    (
        {
            items,
            header,
            footer,
            collapsed = false,
            width = '16rem',
            collapsedWidth = '4rem',
            style,
            ...props
        },
        ref
    ) => {
        const sidebarStyles: React.CSSProperties = {
            display: 'flex',
            flexDirection: 'column',
            width: collapsed ? collapsedWidth : width,
            height: '100%',
            backgroundColor: colors.brand.white,
            borderRight: '2px solid',
            borderColor: colors.brand.black,
            transition: transitions.normal,
            ...style,
        };

        const headerStyles: React.CSSProperties = {
            padding: collapsed ? '1rem 0.5rem' : '1.5rem 1rem',
            borderBottom: `2px solid ${colors.brand.greyLight}`,
        };

        const navStyles: React.CSSProperties = {
            flex: 1,
            overflow: 'auto',
            padding: '1rem 0',
        };

        const footerStyles: React.CSSProperties = {
            padding: collapsed ? '1rem 0.5rem' : '1rem',
            borderTop: `2px solid ${colors.brand.greyLight}`,
        };

        const getItemStyles = (item: SidebarItem): React.CSSProperties => ({
            display: 'flex',
            alignItems: 'center',
            gap: collapsed ? 0 : '0.75rem',
            padding: collapsed ? '0.75rem' : '0.75rem 1rem',
            fontFamily: typography.fontFamily.body,
            fontWeight: item.active ? typography.fontWeight.semibold : typography.fontWeight.normal,
            fontSize: '0.875rem',
            color: item.active ? colors.brand.black : colors.brand.greyDark,
            backgroundColor: item.active ? colors.brand.yellow : 'transparent',
            textDecoration: 'none',
            cursor: 'pointer',
            border: 'none',
            width: '100%',
            textAlign: 'left',
            transition: transitions.fast,
            justifyContent: collapsed ? 'center' : 'flex-start',
            boxShadow: item.active ? shadows.sm : 'none',
        });

        const renderItem = (item: SidebarItem) => (
            <a
                key={item.id}
                href={item.href}
                onClick={item.onClick}
                style={getItemStyles(item)}
                title={collapsed ? item.label : undefined}
                onMouseEnter={(e) => {
                    if (!item.active) {
                        e.currentTarget.style.backgroundColor = colors.brand.greyLight;
                    }
                }}
                onMouseLeave={(e) => {
                    if (!item.active) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                    }
                }}
            >
                {item.icon && <span style={{ flexShrink: 0 }}>{item.icon}</span>}
                {!collapsed && <span style={{ flex: 1 }}>{item.label}</span>}
                {!collapsed && item.badge !== undefined && (
                    <span
                        style={{
                            backgroundColor: colors.brand.yellow,
                            color: colors.brand.black,
                            fontSize: '0.75rem',
                            fontWeight: typography.fontWeight.bold,
                            padding: '0.125rem 0.5rem',
                            border: `1px solid ${colors.brand.black}`,
                        }}
                    >
                        {item.badge}
                    </span>
                )}
            </a>
        );

        return (
            <aside ref={ref} style={sidebarStyles} {...props}>
                {header && <div style={headerStyles}>{header}</div>}
                <nav style={navStyles}>{items.map(renderItem)}</nav>
                {footer && <div style={footerStyles}>{footer}</div>}
            </aside>
        );
    }
);

Sidebar.displayName = 'Sidebar';

export default Sidebar;
