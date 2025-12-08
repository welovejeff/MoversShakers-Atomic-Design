import { useState, useCallback, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { colors, shadows, transitions, typography, zIndex } from '../tokens';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
    id: string;
    message: string;
    type: ToastType;
    duration: number;
}

interface ToastOptions {
    duration?: number;
}

const typeStyles: Record<ToastType, { bg: string; border: string; icon: string }> = {
    success: { bg: colors.semantic.successLight, border: colors.semantic.success, icon: '✓' },
    error: { bg: colors.semantic.errorLight, border: colors.semantic.error, icon: '✕' },
    warning: { bg: colors.semantic.warningLight, border: colors.semantic.warning, icon: '⚠' },
    info: { bg: colors.semantic.infoLight, border: colors.semantic.info, icon: 'ℹ' },
};

/**
 * Hook for toast notifications.
 * 
 * @example
 * ```tsx
 * function App() {
 *   const { toast, ToastContainer } = useToast();
 * 
 *   return (
 *     <>
 *       <Button onClick={() => toast.success('Saved!')}>
 *         Save
 *       </Button>
 *       <ToastContainer />
 *     </>
 *   );
 * }
 * ```
 */
export function useToast() {
    const [toasts, setToasts] = useState<Toast[]>([]);
    const idRef = useRef(0);

    const addToast = useCallback((message: string, type: ToastType, options: ToastOptions = {}) => {
        const id = `toast-${++idRef.current}`;
        const duration = options.duration ?? 4000;

        setToasts((prev) => [...prev, { id, message, type, duration }]);

        if (duration > 0) {
            setTimeout(() => {
                setToasts((prev) => prev.filter((t) => t.id !== id));
            }, duration);
        }

        return id;
    }, []);

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const toast = {
        success: (message: string, options?: ToastOptions) => addToast(message, 'success', options),
        error: (message: string, options?: ToastOptions) => addToast(message, 'error', options),
        warning: (message: string, options?: ToastOptions) => addToast(message, 'warning', options),
        info: (message: string, options?: ToastOptions) => addToast(message, 'info', options),
    };

    const ToastContainer = () => {
        const [mounted, setMounted] = useState(false);

        useEffect(() => {
            setMounted(true);
        }, []);

        if (!mounted) return null;

        const containerStyles: React.CSSProperties = {
            position: 'fixed',
            bottom: '1.5rem',
            right: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
            zIndex: zIndex.toast,
        };

        const toastStyles = (type: ToastType): React.CSSProperties => ({
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.875rem 1rem',
            backgroundColor: typeStyles[type].bg,
            border: '2px solid',
            borderColor: typeStyles[type].border,
            boxShadow: shadows.md,
            fontFamily: typography.fontFamily.body,
            fontSize: '0.875rem',
            color: colors.brand.black,
            minWidth: '16rem',
            maxWidth: '24rem',
            animation: 'slideIn 0.2s ease-out',
        });

        const iconStyles = (type: ToastType): React.CSSProperties => ({
            fontWeight: 'bold',
            color: typeStyles[type].border,
        });

        return createPortal(
            <div style={containerStyles}>
                <style>{`@keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }`}</style>
                {toasts.map((t) => (
                    <div key={t.id} style={toastStyles(t.type)}>
                        <span style={iconStyles(t.type)}>{typeStyles[t.type].icon}</span>
                        <span style={{ flex: 1 }}>{t.message}</span>
                        <button
                            style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                padding: '0.25rem',
                                fontSize: '1rem',
                                color: colors.brand.grey,
                                transition: transitions.fast,
                            }}
                            onClick={() => removeToast(t.id)}
                            aria-label="Dismiss"
                        >
                            ×
                        </button>
                    </div>
                ))}
            </div>,
            document.body
        );
    };

    return { toast, ToastContainer, toasts, removeToast };
}

export default useToast;
