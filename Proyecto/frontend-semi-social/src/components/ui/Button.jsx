/**
 * Botón reutilizable.
 * @param {'primary'|'secondary'|'danger'|'ghost'} variant
 * @param {'sm'|'md'|'lg'} size
 * @param {boolean} loading
 * @param {boolean} fullWidth
 */
export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  className = '',
  disabled,
  ...props
}) {
  const base = 'inline-flex items-center justify-center gap-2 font-semibold rounded-lg border-none cursor-pointer transition-all duration-150 select-none';

  const variants = {
    primary:   'bg-[#1877f2] text-white hover:bg-[#1464d0] disabled:opacity-60',
    secondary: 'bg-[#3a3b3c] text-[#e4e6eb] hover:bg-[#3e4042] disabled:opacity-60',
    danger:    'bg-[#f02849] text-white hover:bg-[#c81e3a] disabled:opacity-60',
    ghost:     'bg-transparent text-[#1877f2] hover:bg-[#1877f2]/10 disabled:opacity-60',
    success:   'bg-[#42b72a] text-white hover:bg-[#36a420] disabled:opacity-60',
  };

  const sizes = {
    sm: 'text-sm px-3 py-1.5',
    md: 'text-sm px-4 py-2.5',
    lg: 'text-base px-6 py-3',
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
      )}
      {children}
    </button>
  );
}
