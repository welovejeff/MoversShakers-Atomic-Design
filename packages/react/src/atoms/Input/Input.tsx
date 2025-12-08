import { forwardRef, useId } from 'react';
import type { InputProps } from './Input.types';
import { colors, shadows, transitions, typography } from '../../tokens';

const sizeStyles: Record<string, { padding: string; fontSize: string }> = {
    sm: { padding: '0.375rem 0.75rem', fontSize: '0.875rem' },
    md: { padding: '0.625rem 1rem', fontSize: '1rem' },
    lg: { padding: '0.875rem 1.25rem', fontSize: '1.125rem' },
};

/**
 * Input component with label, helper text, and error states.
 * 
 * @example
 * ```tsx
 * // Basic input
 * <Input label="Email" placeholder="Enter email" />
 * 
 * // With error
 * <Input label="Password" type="password" error="Password is required" />
 * 
 * // With icons
 * <Input startIcon={<Search />} placeholder="Search..." />
 * ```
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
    (
        {
            size = 'md',
            label,
            helperText,
            error,
            startIcon,
            endIcon,
            fullWidth = false,
            disabled,
            style,
            id: providedId,
            ...props
        },
        ref
    ) => {
        const generatedId = useId();
        const id = providedId || generatedId;
        const hasError = Boolean(error);

        const containerStyles: React.CSSProperties = {
            display: 'flex',
            flexDirection: 'column',
            gap: '0.375rem',
            width: fullWidth ? '100%' : 'auto',
        };

        const labelStyles: React.CSSProperties = {
            fontFamily: typography.fontFamily.brand,
            fontWeight: typography.fontWeight.bold,
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: hasError ? colors.semantic.error : colors.brand.black,
        };

        const inputWrapperStyles: React.CSSProperties = {
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
        };

        const inputStyles: React.CSSProperties = {
            fontFamily: typography.fontFamily.body,
            ...sizeStyles[size],
            paddingLeft: startIcon ? '2.5rem' : sizeStyles[size].padding.split(' ')[1],
            paddingRight: endIcon ? '2.5rem' : sizeStyles[size].padding.split(' ')[1],
            width: '100%',
            border: '2px solid',
            borderColor: hasError ? colors.semantic.error : colors.brand.black,
            backgroundColor: disabled ? colors.brand.greyLight : colors.brand.white,
            color: colors.brand.black,
            boxShadow: shadows.sm,
            transition: transitions.normal,
            outline: 'none',
            ...(disabled && { opacity: 0.5, cursor: 'not-allowed' }),
            ...style,
        };

        const iconStyles: React.CSSProperties = {
            position: 'absolute',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '2rem',
            color: hasError ? colors.semantic.error : colors.brand.grey,
            pointerEvents: 'none',
        };

        const helperStyles: React.CSSProperties = {
            fontSize: '0.75rem',
            color: hasError ? colors.semantic.error : colors.brand.grey,
        };

        return (
            <div style={containerStyles}>
                {label && (
                    <label htmlFor={id} style={labelStyles}>
                        {label}
                    </label>
                )}
                <div style={inputWrapperStyles}>
                    {startIcon && <span style={{ ...iconStyles, left: '0.5rem' }}>{startIcon}</span>}
                    <input
                        ref={ref}
                        id={id}
                        disabled={disabled}
                        style={inputStyles}
                        aria-invalid={hasError}
                        aria-describedby={error || helperText ? `${id}-helper` : undefined}
                        {...props}
                    />
                    {endIcon && <span style={{ ...iconStyles, right: '0.5rem' }}>{endIcon}</span>}
                </div>
                {(error || helperText) && (
                    <span id={`${id}-helper`} style={helperStyles}>
                        {error || helperText}
                    </span>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';

export default Input;
