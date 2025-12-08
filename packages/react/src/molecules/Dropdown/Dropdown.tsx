import { forwardRef, useState, useRef, useEffect, useCallback } from 'react';
import type { DropdownProps, DropdownItem } from './Dropdown.types';
import { colors, shadows, transitions, typography, zIndex } from '../../tokens';

/**
 * Dropdown menu component with keyboard navigation.
 * 
 * @example
 * ```tsx
 * const items = [
 *   { id: 'edit', label: 'Edit', icon: <Edit /> },
 *   { id: 'duplicate', label: 'Duplicate', icon: <Copy /> },
 *   { id: 'delete', label: 'Delete', icon: <Trash />, divider: true },
 * ];
 * 
 * <Dropdown
 *   trigger={<Button>Actions</Button>}
 *   items={items}
 *   onSelect={(item) => console.log(item.id)}
 * />
 * ```
 */
export const Dropdown = forwardRef<HTMLDivElement, DropdownProps>(
    (
        {
            trigger,
            items,
            onSelect,
            align = 'left',
            open: controlledOpen,
            onOpenChange,
            style,
            ...props
        },
        ref
    ) => {
        const [internalOpen, setInternalOpen] = useState(false);
        const internalRef = useRef<HTMLDivElement>(null);
        const menuRef = useRef<HTMLDivElement>(null);

        const isControlled = controlledOpen !== undefined;
        const isOpen = isControlled ? controlledOpen : internalOpen;

        const setOpen = useCallback(
            (value: boolean) => {
                if (!isControlled) {
                    setInternalOpen(value);
                }
                onOpenChange?.(value);
            },
            [isControlled, onOpenChange]
        );

        const handleClickOutside = useCallback(
            (e: MouseEvent) => {
                if (internalRef.current && !internalRef.current.contains(e.target as Node)) {
                    setOpen(false);
                }
            },
            [setOpen]
        );

        const handleKeyDown = useCallback(
            (e: KeyboardEvent) => {
                if (e.key === 'Escape') {
                    setOpen(false);
                }
            },
            [setOpen]
        );

        useEffect(() => {
            if (isOpen) {
                document.addEventListener('mousedown', handleClickOutside);
                document.addEventListener('keydown', handleKeyDown);
            }
            return () => {
                document.removeEventListener('mousedown', handleClickOutside);
                document.removeEventListener('keydown', handleKeyDown);
            };
        }, [isOpen, handleClickOutside, handleKeyDown]);

        const containerStyles: React.CSSProperties = {
            position: 'relative',
            display: 'inline-block',
            ...style,
        };

        const menuStyles: React.CSSProperties = {
            position: 'absolute',
            top: '100%',
            marginTop: '0.25rem',
            [align === 'right' ? 'right' : 'left']: 0,
            minWidth: '12rem',
            backgroundColor: colors.brand.white,
            border: '2px solid',
            borderColor: colors.brand.black,
            boxShadow: shadows.md,
            zIndex: zIndex.dropdown,
            opacity: isOpen ? 1 : 0,
            visibility: isOpen ? 'visible' : 'hidden',
            transform: isOpen ? 'translateY(0)' : 'translateY(-0.5rem)',
            transition: transitions.fast,
        };

        const itemStyles: React.CSSProperties = {
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.625rem 1rem',
            fontFamily: typography.fontFamily.body,
            fontSize: '0.875rem',
            color: colors.brand.black,
            cursor: 'pointer',
            border: 'none',
            background: 'none',
            width: '100%',
            textAlign: 'left',
            transition: transitions.fast,
        };

        const handleItemClick = (item: DropdownItem) => {
            if (!item.disabled) {
                onSelect?.(item);
                setOpen(false);
            }
        };

        return (
            <div ref={(node) => {
                internalRef.current = node;
                if (typeof ref === 'function') ref(node);
                else if (ref) ref.current = node;
            }} style={containerStyles} {...props}>
                <div
                    onClick={() => setOpen(!isOpen)}
                    aria-haspopup="menu"
                    aria-expanded={isOpen}
                >
                    {trigger}
                </div>
                <div ref={menuRef} role="menu" style={menuStyles}>
                    {items.map((item) => (
                        <div key={item.id}>
                            <button
                                role="menuitem"
                                style={{
                                    ...itemStyles,
                                    opacity: item.disabled ? 0.5 : 1,
                                    cursor: item.disabled ? 'not-allowed' : 'pointer',
                                }}
                                disabled={item.disabled}
                                onClick={() => handleItemClick(item)}
                                onMouseEnter={(e) => {
                                    if (!item.disabled) {
                                        e.currentTarget.style.backgroundColor = colors.brand.yellow;
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                }}
                            >
                                {item.icon && <span style={{ flexShrink: 0 }}>{item.icon}</span>}
                                <span>{item.label}</span>
                            </button>
                            {item.divider && (
                                <div
                                    style={{
                                        height: '2px',
                                        backgroundColor: colors.brand.greyLight,
                                        margin: '0.25rem 0',
                                    }}
                                />
                            )}
                        </div>
                    ))}
                </div>
            </div>
        );
    }
);

Dropdown.displayName = 'Dropdown';

export default Dropdown;
