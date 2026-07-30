import React from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'warning';
type Size = 'sm' | 'md' | 'lg';

interface WpButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  isLoading?: boolean;
  loadingText?: string;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-[var(--color-primary-focus)] text-white hover:bg-[var(--color-primary-hover)] disabled:bg-[var(--color-gray-400)]',
  secondary:
    'bg-white text-[var(--color-gray-700)] border border-[var(--color-gray-300)] hover:bg-[var(--color-gray-50)] disabled:opacity-50',
  ghost:
    'bg-transparent text-[var(--color-primary-focus)] hover:bg-[var(--color-primary-light)] disabled:opacity-50',
  danger: 'bg-[var(--color-error)] text-white hover:bg-red-600 disabled:opacity-50',
  warning: 'bg-yellow-500 text-black hover:bg-yellow-600',
};

const sizeClasses: Record<Size, string> = {
  sm: 'px-3 py-2 text-sm gap-1.5',
  md: 'px-4 py-2 text-sm gap-2',
  lg: 'px-6 py-3 text-base gap-2',
};

export const WpButton = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  loadingText,
  fullWidth = false,
  leftIcon,
  rightIcon,
  children,
  disabled,
  className = '',
  ...props
}: WpButtonProps) => {
  return (
    <button
      disabled={disabled || isLoading}
      className={[
        'inline-flex items-center justify-center rounded-lg font-semibold transition-colors cursor-pointer disabled:cursor-not-allowed',
        variantClasses[variant],
        sizeClasses[size],
        fullWidth ? 'w-full' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {isLoading ? (
        <>
          <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          {loadingText ?? 'Loading...'}
        </>
      ) : (
        <>
          {leftIcon && <span className="flex items-center">{leftIcon}</span>}
          {children}
          {rightIcon && <span className="flex items-center">{rightIcon}</span>}
        </>
      )}
    </button>
  );
};
