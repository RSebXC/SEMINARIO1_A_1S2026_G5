import { forwardRef } from 'react';


const Input = forwardRef(function Input(
  { label, error, icon: Icon, className = '', id, ...props },
  ref
) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-[#b0b3b8]">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8a8d91]">
            <Icon size={16} />
          </span>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`
            w-full bg-[#3a3b3c] border rounded-lg px-3 py-2.5 text-sm text-[#e4e6eb]
            placeholder:text-[#8a8d91] outline-none transition-colors duration-150
            focus:border-[#1877f2]
            ${error ? 'border-[#f02849]' : 'border-[#3e4042]'}
            ${Icon ? 'pl-9' : ''}
            ${className}
          `}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-[#f02849]">{error}</p>}
    </div>
  );
});

export default Input;
