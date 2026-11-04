import React from 'react';
import { AlertCircle, ChevronDown } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  helperText?: string;
  error?: string;
  options: SelectOption[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(({
  label,
  helperText,
  error,
  options,
  required,
  className = '',
  id,
  ...props
}, ref) => {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label
          htmlFor={selectId}
          className="block text-sm font-semibold text-[#172033] select-none"
        >
          {label} {required && <span className="text-[#F28C28] font-bold" aria-hidden="true">*</span>}
        </label>
      )}

      <div className="relative flex items-center">
        <select
          ref={ref}
          id={selectId}
          required={required}
          aria-invalid={!!error}
          aria-describedby={error ? `${selectId}-error` : helperText ? `${selectId}-help` : undefined}
          className={`w-full min-h-[48px] px-3.5 py-2.5 pr-10 rounded-button bg-white text-[#172033] text-sm sm:text-base border transition-all appearance-none outline-none cursor-pointer ${
            error
              ? 'border-red-400 focus:border-red-600 focus:ring-2 focus:ring-red-100'
              : 'border-[#E4E7EC] hover:border-[#CBD5E1] focus:border-[#123B6D] focus:ring-2 focus:ring-[#F0F5FA]'
          } ${className}`}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <div className="absolute right-3.5 flex items-center pointer-events-none text-[#667085]">
          <ChevronDown className="w-4 h-4" />
        </div>
      </div>

      {error ? (
        <div id={`${selectId}-error`} className="flex items-center space-x-1.5 text-xs text-red-600 font-medium pt-0.5" role="alert">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      ) : helperText ? (
        <p id={`${selectId}-help`} className="text-xs text-[#667085] pt-0.5">
          {helperText}
        </p>
      ) : null}
    </div>
  );
});

Select.displayName = 'Select';
