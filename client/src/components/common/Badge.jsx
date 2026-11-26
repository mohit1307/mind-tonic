const sizeClasses = {
  sm: 'px-2 py-0.5 text-2xs',
  md: 'px-2.5 py-1 text-xs',
  lg: 'px-3 py-1 text-sm',
};

const colorClasses = {
  accent: 'bg-accent-500/15 text-accent-400 border-accent-500/20',
  secondary: 'bg-secondary-500/15 text-secondary-400 border-secondary-500/20',
  success: 'bg-success-500/15 text-success-400 border-success-500/20',
  warning: 'bg-warning-500/15 text-warning-400 border-warning-500/20',
  danger: 'bg-danger-500/15 text-danger-400 border-danger-500/20',
  neutral: 'bg-slate-500/15 text-slate-400 border-slate-500/20',
};

export default function Badge({ children, color = 'accent', size = 'md', dot = false, className = '' }) {
  return (
    <span
      className={`
        inline-flex items-center gap-1.5 font-medium rounded-full border
        ${sizeClasses[size]}
        ${colorClasses[color]}
        ${className}
      `}
    >
      {dot && (
        <span className={`w-1.5 h-1.5 rounded-full bg-current`} />
      )}
      {children}
    </span>
  );
}
