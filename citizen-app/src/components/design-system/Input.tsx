import React from 'react';
import { AlertCircle } from 'lucide-react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({
  label,
  helperText,
  error,
  leftIcon,
  rightIcon,
  required,
  className = '',
  id,
  ...props
}, ref) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-semibold text-[#172033] select-none"
        >
          {label} {required && <span className="text-[#F28C28] font-bold" aria-hidden="true">*</span>}
        </label>
      )}

      <div className="relative flex items-center">
        {leftIcon && (
          <div className="absolute left-3.5 flex items-center pointer-events-none text-[#667085]">
            {leftIcon}
          </div>
        )}

        <input
          ref={ref}
          id={inputId}
          required={required}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-help` : undefined}
          className={`w-full min-h-[48px] px-3.5 py-2.5 rounded-button bg-white text-[#172033] placeholder-[#98A2B3] text-sm sm:text-base border transition-all outline-none ${
            leftIcon ? 'pl-10.5' : ''
          } ${rightIcon ? 'pr-10.5' : ''} ${
            error
              ? 'border-red-400 focus:border-red-600 focus:ring-2 focus:ring-red-100'
              : 'border-[#E4E7EC] hover:border-[#CBD5E1] focus:border-[#123B6D] focus:ring-2 focus:ring-[#F0F5FA]'
          } ${className}`}
          {...props}
        />

        {rightIcon && (
          <div className="absolute right-3.5 flex items-center text-[#667085]">
            {rightIcon}
          </div>
        )}
      </div>

      {error ? (
        <div id={`${inputId}-error`} className="flex items-center space-x-1.5 text-xs text-red-600 font-medium pt-0.5" role="alert">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      ) : helperText ? (
        <p id={`${inputId}-help`} className="text-xs text-[#667085] pt-0.5">
          {helperText}
        </p>
      ) : null}
    </div>
  );
});

Input.displayName = 'Input';
