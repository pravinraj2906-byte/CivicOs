import React from 'react';

export interface AvatarProps {
  name: string;
  role?: string;
  size?: 'sm' | 'md' | 'lg';
  department?: string;
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  name,
  role,
  size = 'md',
  department,
  className = '',
}) => {
  const initials = (name || 'Citizen')
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base font-bold',
  }[size];

  return (
    <div className={`flex items-center space-x-2.5 ${className}`}>
      <div
        className={`${sizeClasses} rounded-full bg-[#123B6D] text-white flex items-center justify-center font-bold shadow-xs border border-white flex-shrink-0`}
        aria-label={`Avatar for ${name}`}
      >
        {initials}
      </div>
      {(role || department) && (
        <div className="flex flex-col leading-tight">
          <span className="text-xs font-bold text-[#172033] truncate max-w-[140px]">{name}</span>
          <span className="text-[11px] text-[#667085] font-medium truncate max-w-[140px]">
            {department || role}
          </span>
        </div>
      )}
    </div>
  );
};
