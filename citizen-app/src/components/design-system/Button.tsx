import React from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'saffron' | 'secondary' | 'outline' | 'ghost' | 'success' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  className = '',
  disabled,
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-semibold rounded-button transition-all select-none focus-visible:ring-2 focus-visible:ring-offset-2 outline-none touch-active disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none active:scale-[0.98]';

  const sizeClasses = {
    sm: 'text-xs px-3.5 py-2 min-h-[40px] space-x-1.5',
    md: 'text-sm px-4.5 py-2.5 min-h-[48px] space-x-2',
    lg: 'text-base px-6 py-3 min-h-[52px] space-x-2.5',
  }[size];

  const variantClasses = {
    // Primary Navy (#123B6D)
    primary: 'bg-[#123B6D] hover:bg-[#183A6B] text-white shadow-sm hover:shadow-md focus-visible:ring-[#123B6D]',
    // Action Saffron (#F28C28)
    saffron: 'bg-[#F28C28] hover:bg-[#D66E14] text-white shadow-sm hover:shadow-md focus-visible:ring-[#F28C28] font-bold',
    // Secondary Soft Navy
    secondary: 'bg-[#F0F5FA] hover:bg-[#E1EAF4] text-[#123B6D] border border-[#C3D5E9] focus-visible:ring-[#123B6D]',
    // Clean Outline
    outline: 'bg-white hover:bg-[#F7F9FC] text-[#172033] border border-[#E4E7EC] hover:border-[#CBD5E1] shadow-sm focus-visible:ring-[#123B6D]',
    // Ghost
    ghost: 'bg-transparent hover:bg-[#F0F5FA] text-[#123B6D] focus-visible:ring-[#123B6D]',
    // Civic Green (#168447)
    success: 'bg-[#168447] hover:bg-[#15803D] text-white shadow-sm hover:shadow-md focus-visible:ring-[#168447] font-bold',
    // Danger
    danger: 'bg-red-600 hover:bg-red-700 text-white shadow-sm hover:shadow-md focus-visible:ring-red-600',
  }[variant];

  return (
    <button
      className={`${baseClasses} ${sizeClasses} ${variantClasses} ${fullWidth ? 'w-full' : ''} ${className}`}
      disabled={disabled || isLoading}
      aria-busy={isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />
          <span>{children}</span>
        </>
      ) : (
        <>
          {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
          <span>{children}</span>
          {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
        </>
      )}
    </button>
  );
};
