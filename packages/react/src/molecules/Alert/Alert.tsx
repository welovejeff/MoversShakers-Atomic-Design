import { forwardRef } from 'react';
import type { AlertProps } from './Alert.types';
import { colors, typography } from '../../tokens';

const variantStyles: Record<string, { bg: string; border: string; text: string }> = {
    info: {
        bg: colors.semantic.infoLight,
        border: colors.semantic.info,
        text: colors.semantic.info,
    },
    success: {
        bg: colors.semantic.successLight,
        border: colors.semantic.success,
        text: colors.semantic.success,
    },
    warning: {
        bg: colors.semantic.warningLight,
        border: colors.semantic.warning,
        text: colors.semantic.warning,
    },
    error: {
        bg: colors.semantic.errorLight,
        border: colors.semantic.error,
        text: colors.semantic.error,
    },
};

/**
 * Alert component for notifications and messages.
 * 
 * @example
 * ```tsx
 * // Info alert
 * <Alert variant="info" title="Heads up">
 *   This is an informational message.
 * </Alert>
 * 
 * // Dismissible error alert
 * <Alert 
 *   variant="error" 
 *   title="Error" 
 *   dismissible 
 *   onDismiss={() => setShow(false)}
 * >
 *   Something went wrong.
 * </Alert>
 * 
 * // With action
 * <Alert variant="warning" action={<Button size="sm">Retry</Button>}>
 *   Connection lost.
 * </Alert>
 * ```
 */
export const Alert = forwardRef<HTMLDivElement, AlertProps>(
    (
        {
            variant = 'info',
            title,
            icon,
            dismissible = false,
            onDismiss,
            action,
            children,
            style,
            ...props
        },
        ref
    ) => {
        const variantStyle = variantStyles[variant];

        const containerStyles: React.CSSProperties = {
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.75rem',
            padding: '1rem',
            backgroundColor: variantStyle.bg,
            border: '2px solid',
            borderColor: variantStyle.border,
            ...style,
        };

        const iconContainerStyles: React.CSSProperties = {
            flexShrink: 0,
            color: variantStyle.text,
        };

        const contentStyles: React.CSSProperties = {
            flex: 1,
            minWidth: 0,
        };

        const titleStyles: React.CSSProperties = {
            fontFamily: typography.fontFamily.brand,
            fontWeight: typography.fontWeight.bold,
            fontSize: '0.875rem',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: variantStyle.text,
            marginBottom: children ? '0.25rem' : 0,
        };

        const bodyStyles: React.CSSProperties = {
            fontFamily: typography.fontFamily.body,
            fontSize: '0.875rem',
            color: colors.brand.black,
            lineHeight: 1.5,
        };

        const dismissStyles: React.CSSProperties = {
            flexShrink: 0,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '0.25rem',
            color: variantStyle.text,
            fontSize: '1.25rem',
            lineHeight: 1,
        };

        return (
            <div ref={ref} role="alert" style={containerStyles} {...props}>
                {icon && <div style={iconContainerStyles}>{icon}</div>}
                <div style={contentStyles}>
                    {title && <div style={titleStyles}>{title}</div>}
                    {children && <div style={bodyStyles}>{children}</div>}
                    {action && <div style={{ marginTop: '0.75rem' }}>{action}</div>}
                </div>
                {dismissible && (
                    <button
                        type="button"
                        style={dismissStyles}
                        onClick={onDismiss}
                        aria-label="Dismiss"
                    >
                        ×
                    </button>
                )}
            </div>
        );
    }
);

Alert.displayName = 'Alert';

export default Alert;
