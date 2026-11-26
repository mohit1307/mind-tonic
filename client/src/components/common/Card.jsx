export default function Card({ children, className = '', hover = false, padding = true, ...props }) {
  return (
    <div
      className={`
        glass-card
        ${padding ? 'p-5' : ''}
        ${hover ? 'hover:border-accent-500/20 hover:shadow-glow-sm transition-all duration-300 cursor-pointer' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '' }) {
  return (
    <div className={`flex items-center justify-between mb-4 ${className}`}>
      {children}
    </div>
  );
}

export function CardTitle({ children, icon: Icon, className = '' }) {
  return (
    <h3 className={`flex items-center gap-2 text-sm font-semibold text-slate-200 ${className}`}>
      {Icon && <Icon className="w-4 h-4 text-accent-400" />}
      {children}
    </h3>
  );
}
