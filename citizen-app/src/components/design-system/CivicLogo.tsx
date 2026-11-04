import React from 'react';

export interface CivicLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'full' | 'icon-only' | 'badge';
  subtitle?: string;
  portalTag?: string;
  className?: string;
}

export const CivicLogo: React.FC<CivicLogoProps> = ({
  size = 'md',
  variant = 'full',
  subtitle,
  portalTag,
  className = '',
}) => {
  const logoHeights = {
    sm: 'h-7 sm:h-8',
    md: 'h-9 sm:h-10',
    lg: 'h-11 sm:h-12',
    xl: 'h-14 sm:h-16',
  }[size];

  return (
    <div className={`flex items-center space-x-2.5 sm:space-x-3 shrink-0 ${className}`}>
      {/* Official CivicOS Final Logo PNG */}
      <img
        src="/assets/civicos/logo/civicos-logo.png"
        alt="CivicOS"
        className={`${logoHeights} w-auto object-contain shrink-0 select-none`}
      />

      {variant !== 'icon-only' && (portalTag || subtitle) && (
        <div className="flex flex-col leading-tight">
          {portalTag && (
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#F0F5FA] text-[#123B6D] border border-[#C3D5E9] w-fit">
              {portalTag}
            </span>
          )}
          {subtitle && (
            <p className="text-xs text-[#667085] font-medium tracking-normal mt-0.5 hidden sm:block">
              {subtitle}
            </p>
          )}
        </div>
      )}
    </div>
  );
};
