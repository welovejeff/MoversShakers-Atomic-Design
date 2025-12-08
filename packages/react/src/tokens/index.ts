/**
 * Movers+Shakers Design System
 * Design Tokens - TypeScript
 */

// ========================
// BRAND COLORS
// ========================
export const colors = {
    brand: {
        yellow: '#FFF000',
        black: '#111111',
        white: '#FFFFFF',
        greyLight: '#F3F4F6',
        grey: '#9CA3AF',
        greyDark: '#333333',
    },
    semantic: {
        success: '#10B981',
        successLight: '#D1FAE5',
        error: '#EF4444',
        errorLight: '#FEE2E2',
        warning: '#F59E0B',
        warningLight: '#FEF3C7',
        info: '#3B82F6',
        infoLight: '#DBEAFE',
    },
} as const;

// ========================
// SHADOWS
// ========================
export const shadows = {
    sm: '2px 2px 0px 0px rgba(0, 0, 0, 1)',
    md: '4px 4px 0px 0px rgba(0, 0, 0, 1)',
    lg: '8px 8px 0px 0px rgba(0, 0, 0, 1)',
    yellowSm: '2px 2px 0px 0px #FFF000',
    yellowMd: '4px 4px 0px 0px #FFF000',
    yellowLg: '8px 8px 0px 0px #FFF000',
} as const;

// ========================
// SPACING
// ========================
export const spacing = {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
    '3xl': '4rem',
} as const;

// ========================
// TYPOGRAPHY
// ========================
export const typography = {
    fontFamily: {
        brand: "'Oswald', sans-serif",
        body: "'Inter', sans-serif",
        mono: "'Monaco', 'Menlo', monospace",
    },
    fontSize: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem',
        '5xl': '3rem',
        '6xl': '3.75rem',
    },
    fontWeight: {
        light: '300',
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
    },
} as const;

// ========================
// BORDERS
// ========================
export const borders = {
    radius: {
        none: '0',
        sm: '0.125rem',
        md: '0.25rem',
        lg: '0.5rem',
        full: '9999px',
    },
    width: {
        DEFAULT: '2px',
        thin: '1px',
        thick: '4px',
    },
} as const;

// ========================
// TRANSITIONS
// ========================
export const transitions = {
    fast: '150ms ease',
    normal: '200ms ease',
    slow: '300ms ease',
} as const;

// ========================
// Z-INDEX
// ========================
export const zIndex = {
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modalBackdrop: 1040,
    modal: 1050,
    popover: 1060,
    tooltip: 1070,
    toast: 1080,
} as const;

// Export all tokens as a single object
export const tokens = {
    colors,
    shadows,
    spacing,
    typography,
    borders,
    transitions,
    zIndex,
} as const;

export default tokens;
