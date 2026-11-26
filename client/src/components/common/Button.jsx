import { forwardRef } from 'react';

const variants = {
  primary:
    'bg-accent-500 hover:bg-accent-600 text-white shadow-glow-sm hover:shadow-glow',
  secondary:
    'bg-surface-light hover:bg-surface-lighter text-slate-200 border border-white/10',
  outline:
    'border border-accent-500/50 text-accent-400 hover:bg-accent-500/10',
  ghost:
    'text-slate-300 hover:text-white hover:bg-white/5',
  danger:
    'bg-danger-500 hover:bg-danger-600 text-white',
  success:
    'bg-success-500 hover:bg-success-600 text-white',
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm rounded-lg',
  md: 'px-5 py-2.5 text-sm rounded-xl',
  lg: 'px-7 py-3 text-base rounded-xl',
  xl: 'px-8 py-4 text-lg rounded-2xl',
  icon: 'p-2.5 rounded-xl',
};

const Button = forwardRef(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      className = '',
      disabled = false,
      loading = false,
      icon: Icon,
      iconRight: IconRight,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`
          inline-flex items-center justify-center gap-2 font-medium
          transition-all duration-200 ease-out
          focus:outline-none focus:ring-2 focus:ring-accent-500/50 focus:ring-offset-2 focus:ring-offset-primary-900
          disabled:opacity-50 disabled:cursor-not-allowed
          ${variants[variant]}
          ${sizes[size]}
          ${className}
        `}
        {...props}
      >
        {loading ? (
          <svg
            className="animate-spin h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        ) : Icon ? (
          <Icon className="w-4 h-4" />
        ) : null}
        {children}
        {IconRight && !loading && <IconRight className="w-4 h-4" />}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
