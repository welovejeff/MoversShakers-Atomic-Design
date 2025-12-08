import type { HTMLAttributes, ReactNode } from 'react';

export interface TabItem {
    /** Unique identifier */
    id: string;
    /** Tab label */
    label: string;
    /** Icon to display in tab */
    icon?: ReactNode;
    /** Tab content */
    content: ReactNode;
    /** Disabled state */
    disabled?: boolean;
}

export interface TabsProps extends HTMLAttributes<HTMLDivElement> {
    /** Tab items */
    tabs: TabItem[];
    /** Active tab id */
    activeTab?: string;
    /** Default active tab */
    defaultTab?: string;
    /** Callback when tab changes */
    onTabChange?: (tabId: string) => void;
    /** Tab variant */
    variant?: 'default' | 'pills' | 'underline';
    /** Full width tabs */
    fullWidth?: boolean;
}
