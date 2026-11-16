import { InputHTMLAttributes, forwardRef } from "react";

interface AuthInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helperText?: string;
}

const AuthInput = forwardRef<HTMLInputElement, AuthInputProps>(
  ({ label, error, helperText, id, className = "", ...props }, ref) => {
    const inputId = id || props.name;

    return (
      <div className="space-y-1.5 w-full">
        <label
          htmlFor={inputId}
          className="block text-xs sm:text-sm font-semibold text-[#242136]"
        >
          {label}
        </label>
        <div className="relative">
          <input
            id={inputId}
            ref={ref}
            className={`w-full px-3.5 py-2.5 rounded-xl text-sm text-[#242136] bg-white border transition-all duration-150 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:bg-gray-50 disabled:cursor-not-allowed ${
              error
                ? "border-red-400 focus:border-red-500 focus:ring-red-200"
                : "border-purple-200/90 hover:border-[#7543DF]/50 focus:border-[#7543DF] focus:ring-[#7543DF]/20"
            } ${className}`}
            aria-invalid={Boolean(error)}
            aria-describedby={
              error
                ? `${inputId}-error`
                : helperText
                ? `${inputId}-helper`
                : undefined
            }
            {...props}
          />
        </div>
        {error && (
          <p id={`${inputId}-error`} className="text-xs text-red-600 font-medium">
            {error}
          </p>
        )}
        {!error && helperText && (
          <p id={`${inputId}-helper`} className="text-xs text-[#64607D]">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

AuthInput.displayName = "AuthInput";

export default AuthInput;
