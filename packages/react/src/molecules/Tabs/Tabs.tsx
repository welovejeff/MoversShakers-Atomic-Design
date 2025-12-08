import { forwardRef, useState } from 'react';
import type { TabsProps } from './Tabs.types';
import { colors, shadows, transitions, typography } from '../../tokens';

/**
 * Tabs component for tabbed content navigation.
 * 
 * @example
 * ```tsx
 * const tabs = [
 *   { id: 'overview', label: 'Overview', content: <OverviewPanel /> },
 *   { id: 'settings', label: 'Settings', content: <SettingsPanel /> },
 *   { id: 'history', label: 'History', content: <HistoryPanel />, disabled: true },
 * ];
 * 
 * <Tabs tabs={tabs} defaultTab="overview" onTabChange={(id) => console.log(id)} />
 * 
 * // Pills variant
 * <Tabs tabs={tabs} variant="pills" />
 * 
 * // Full width tabs
 * <Tabs tabs={tabs} fullWidth />
 * ```
 */
export const Tabs = forwardRef<HTMLDivElement, TabsProps>(
    (
        {
            tabs,
            activeTab: controlledActiveTab,
            defaultTab,
            onTabChange,
            variant = 'default',
            fullWidth = false,
            style,
            ...props
        },
        ref
    ) => {
        const [internalActiveTab, setInternalActiveTab] = useState(
            defaultTab || tabs[0]?.id
        );

        const isControlled = controlledActiveTab !== undefined;
        const activeTabId = isControlled ? controlledActiveTab : internalActiveTab;

        const handleTabClick = (tabId: string) => {
            if (!isControlled) {
                setInternalActiveTab(tabId);
            }
            onTabChange?.(tabId);
        };

        const containerStyles: React.CSSProperties = {
            ...style,
        };

        const tabListStyles: React.CSSProperties = {
            display: 'flex',
            gap: variant === 'pills' ? '0.5rem' : 0,
            borderBottom: variant === 'underline' ? `2px solid ${colors.brand.greyLight}` : 'none',
            marginBottom: '1rem',
        };

        const getTabStyles = (isActive: boolean, disabled: boolean): React.CSSProperties => {
            const base: React.CSSProperties = {
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: variant === 'pills' ? '0.5rem 1rem' : '0.75rem 1.25rem',
                fontFamily: typography.fontFamily.brand,
                fontWeight: typography.fontWeight.bold,
                fontSize: '0.875rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                cursor: disabled ? 'not-allowed' : 'pointer',
                opacity: disabled ? 0.5 : 1,
                border: 'none',
                background: 'none',
                transition: transitions.normal,
                flex: fullWidth ? 1 : 'initial',
                justifyContent: fullWidth ? 'center' : 'flex-start',
            };

            if (variant === 'default') {
                return {
                    ...base,
                    backgroundColor: isActive ? colors.brand.yellow : colors.brand.greyLight,
                    color: colors.brand.black,
                    border: '2px solid',
                    borderColor: colors.brand.black,
                    borderBottom: isActive ? 'none' : `2px solid ${colors.brand.black}`,
                    marginBottom: isActive ? '-2px' : 0,
                    boxShadow: isActive ? shadows.sm : 'none',
                };
            }

            if (variant === 'pills') {
                return {
                    ...base,
                    backgroundColor: isActive ? colors.brand.yellow : 'transparent',
                    color: colors.brand.black,
                    border: '2px solid',
                    borderColor: isActive ? colors.brand.black : 'transparent',
                    boxShadow: isActive ? shadows.sm : 'none',
                };
            }

            // underline variant
            return {
                ...base,
                color: isActive ? colors.brand.black : colors.brand.grey,
                borderBottom: isActive ? `3px solid ${colors.brand.yellow}` : '3px solid transparent',
                marginBottom: '-2px',
            };
        };

        const contentStyles: React.CSSProperties = {
            border: variant === 'default' ? '2px solid' : 'none',
            borderColor: colors.brand.black,
            padding: variant === 'default' ? '1.25rem' : 0,
            backgroundColor: variant === 'default' ? colors.brand.white : 'transparent',
        };

        const activeContent = tabs.find((tab) => tab.id === activeTabId)?.content;

        return (
            <div ref={ref} style={containerStyles} {...props}>
                <div role="tablist" style={tabListStyles}>
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            role="tab"
                            aria-selected={tab.id === activeTabId}
                            aria-controls={`tabpanel-${tab.id}`}
                            disabled={tab.disabled}
                            style={getTabStyles(tab.id === activeTabId, !!tab.disabled)}
                            onClick={() => !tab.disabled && handleTabClick(tab.id)}
                        >
                            {tab.icon}
                            {tab.label}
                        </button>
                    ))}
                </div>
                <div
                    role="tabpanel"
                    id={`tabpanel-${activeTabId}`}
                    style={contentStyles}
                >
                    {activeContent}
                </div>
            </div>
        );
    }
);

Tabs.displayName = 'Tabs';

export default Tabs;
