import { forwardRef } from 'react';

const Input = forwardRef(
  (
    {
      label,
      error,
      icon: Icon,
      className = '',
      type = 'text',
      ...props
    },
    ref
  ) => {
    return (
      <div className={`flex flex-col gap-1.5 ${className}`}>
        {label && (
          <label className="text-sm font-medium text-slate-300">
            {label}
          </label>
        )}
        <div className="relative">
          {Icon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Icon className="w-4 h-4 text-slate-500" />
            </div>
          )}
          <input
            ref={ref}
            type={type}
            className={`
              w-full bg-primary-900/50 border border-white/10 rounded-xl
              px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500
              focus:outline-none focus:ring-2 focus:ring-accent-500/50 focus:border-accent-500/50
              transition-all duration-200
              ${Icon ? 'pl-10' : ''}
              ${error ? 'border-danger-500/50 focus:ring-danger-500/50' : ''}
            `}
            {...props}
          />
        </div>
        {error && (
          <p className="text-xs text-danger-400 mt-0.5">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
