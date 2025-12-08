import { forwardRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import type { ModalProps } from './Modal.types';
import { colors, shadows, typography, zIndex } from '../../tokens';

const sizeMap: Record<string, string> = {
    sm: '24rem',
    md: '32rem',
    lg: '48rem',
    xl: '64rem',
    full: '100%',
};

/**
 * Modal dialog component with backdrop and keyboard support.
 * 
 * @example
 * ```tsx
 * // Basic modal
 * const [open, setOpen] = useState(false);
 * 
 * <Button onClick={() => setOpen(true)}>Open Modal</Button>
 * 
 * <Modal 
 *   open={open} 
 *   onClose={() => setOpen(false)}
 *   title="Confirm Action"
 *   footer={
 *     <>
 *       <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
 *       <Button variant="primary">Confirm</Button>
 *     </>
 *   }
 * >
 *   Are you sure you want to proceed?
 * </Modal>
 * ```
 */
export const Modal = forwardRef<HTMLDivElement, ModalProps>(
    (
        {
            open,
            onClose,
            title,
            size = 'md',
            closeOnBackdrop = true,
            closeOnEscape = true,
            showCloseButton = true,
            footer,
            children,
            style,
            ...props
        },
        ref
    ) => {
        const handleKeyDown = useCallback(
            (e: KeyboardEvent) => {
                if (closeOnEscape && e.key === 'Escape') {
                    onClose();
                }
            },
            [closeOnEscape, onClose]
        );

        useEffect(() => {
            if (open) {
                document.addEventListener('keydown', handleKeyDown);
                document.body.style.overflow = 'hidden';
            }
            return () => {
                document.removeEventListener('keydown', handleKeyDown);
                document.body.style.overflow = '';
            };
        }, [open, handleKeyDown]);

        if (!open) return null;

        const backdropStyles: React.CSSProperties = {
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            zIndex: zIndex.modalBackdrop,
        };

        const modalStyles: React.CSSProperties = {
            position: 'relative',
            width: '100%',
            maxWidth: sizeMap[size],
            maxHeight: 'calc(100vh - 2rem)',
            backgroundColor: colors.brand.white,
            border: '2px solid',
            borderColor: colors.brand.black,
            boxShadow: shadows.lg,
            display: 'flex',
            flexDirection: 'column',
            zIndex: zIndex.modal,
            ...style,
        };

        const headerStyles: React.CSSProperties = {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1rem 1.5rem',
            borderBottom: `2px solid ${colors.brand.greyLight}`,
        };

        const titleStyles: React.CSSProperties = {
            fontFamily: typography.fontFamily.brand,
            fontWeight: typography.fontWeight.bold,
            fontSize: '1.25rem',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            margin: 0,
        };

        const closeButtonStyles: React.CSSProperties = {
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '0.5rem',
            fontSize: '1.5rem',
            lineHeight: 1,
            color: colors.brand.black,
        };

        const contentStyles: React.CSSProperties = {
            padding: '1.5rem',
            overflowY: 'auto',
            flex: 1,
        };

        const footerStyles: React.CSSProperties = {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: '0.75rem',
            padding: '1rem 1.5rem',
            borderTop: `2px solid ${colors.brand.greyLight}`,
            backgroundColor: colors.brand.greyLight,
        };

        const handleBackdropClick = (e: React.MouseEvent) => {
            if (closeOnBackdrop && e.target === e.currentTarget) {
                onClose();
            }
        };

        const modalContent = (
            <div style={backdropStyles} onClick={handleBackdropClick}>
                <div ref={ref} role="dialog" aria-modal="true" style={modalStyles} {...props}>
                    {(title || showCloseButton) && (
                        <div style={headerStyles}>
                            {title && <h2 style={titleStyles}>{title}</h2>}
                            {showCloseButton && (
                                <button
                                    type="button"
                                    style={closeButtonStyles}
                                    onClick={onClose}
                                    aria-label="Close modal"
                                >
                                    ×
                                </button>
                            )}
                        </div>
                    )}
                    <div style={contentStyles}>{children}</div>
                    {footer && <div style={footerStyles}>{footer}</div>}
                </div>
            </div>
        );

        return createPortal(modalContent, document.body);
    }
);

Modal.displayName = 'Modal';

export default Modal;
