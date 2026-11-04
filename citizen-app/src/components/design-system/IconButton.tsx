import React from 'react';

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  'aria-label': string;
  variant?: 'primary' | 'saffron' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon: React.ReactNode;
}

export const IconButton: React.FC<IconButtonProps> = ({
  'aria-label': ariaLabel,
  variant = 'outline',
  size = 'md',
  icon,
  className = '',
  disabled,
  ...props
}) => {
  const sizeClasses = {
    sm: 'w-9 h-9 min-w-[36px] min-h-[36px] rounded-lg',
    md: 'w-11 h-11 min-w-[44px] min-h-[44px] rounded-xl',
    lg: 'w-12 h-12 min-w-[48px] min-h-[48px] rounded-xl',
  }[size];

  const variantClasses = {
    primary: 'bg-[#123B6D] hover:bg-[#183A6B] text-white shadow-sm focus-visible:ring-[#123B6D]',
    saffron: 'bg-[#F28C28] hover:bg-[#D66E14] text-white shadow-sm focus-visible:ring-[#F28C28]',
    secondary: 'bg-[#F0F5FA] hover:bg-[#E1EAF4] text-[#123B6D] border border-[#C3D5E9] focus-visible:ring-[#123B6D]',
    outline: 'bg-white hover:bg-[#F7F9FC] text-[#172033] border border-[#E4E7EC] hover:border-[#CBD5E1] shadow-sm focus-visible:ring-[#123B6D]',
    ghost: 'bg-transparent hover:bg-[#F0F5FA] text-[#123B6D] focus-visible:ring-[#123B6D]',
    danger: 'bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 focus-visible:ring-red-600',
  }[variant];

  return (
    <button
      aria-label={ariaLabel}
      title={ariaLabel}
      disabled={disabled}
      className={`inline-flex items-center justify-center transition-all select-none focus-visible:ring-2 focus-visible:ring-offset-2 outline-none touch-active disabled:opacity-50 disabled:cursor-not-allowed ${sizeClasses} ${variantClasses} ${className}`}
      {...props}
    >
      {icon}
    </button>
  );
};
