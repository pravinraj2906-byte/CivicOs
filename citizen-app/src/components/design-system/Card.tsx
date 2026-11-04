import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'interactive' | 'elevated' | 'accent-navy' | 'accent-saffron' | 'accent-green';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding = 'md',
  className = '',
  ...props
}) => {
  const baseClasses = 'bg-white rounded-card transition-all';

  const paddingClasses = {
    none: 'p-0',
    sm: 'p-3 sm:p-4',
    md: 'p-4 sm:p-5',
    lg: 'p-5 sm:p-6',
    xl: 'p-6 sm:p-8',
  }[padding];

  const variantClasses = {
    default: 'border border-[#E4E7EC] shadow-card',
    interactive: 'border border-[#E4E7EC] shadow-card hover:shadow-card-hover hover:border-[#C3D5E9] cursor-pointer touch-active',
    elevated: 'border border-[#E4E7EC] shadow-elevated',
    'accent-navy': 'border-l-4 border-l-[#123B6D] border-y border-r border-[#E4E7EC] shadow-card',
    'accent-saffron': 'border-l-4 border-l-[#F28C28] border-y border-r border-[#E4E7EC] shadow-card',
    'accent-green': 'border-l-4 border-l-[#168447] border-y border-r border-[#E4E7EC] shadow-card',
  }[variant];

  return (
    <div className={`${baseClasses} ${paddingClasses} ${variantClasses} ${className}`} {...props}>
      {children}
    </div>
  );
};
