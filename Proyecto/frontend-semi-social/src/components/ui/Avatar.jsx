import { S3_BASE } from '../../config/api';

/**
 * @param {string} src 
 * @param {string} name 
 * @param {'xs'|'sm'|'md'|'lg'|'xl'} size
 */
export default function Avatar({ src, name = '', size = 'md', className = '' }) {
  const sizes = {
    xs: 'w-7 h-7 text-xs',
    sm: 'w-9 h-9 text-sm',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-lg',
    xl: 'w-20 h-20 text-2xl',
  };

  const buildSrc = (rawSrc) => {
    if (!rawSrc) return null;
    if (rawSrc.startsWith('http')) return rawSrc;
    return `${S3_BASE}/${rawSrc}`;
  };

  const initials = name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const imgSrc = buildSrc(src);

  return (
    <div
      className={`
        ${sizes[size]} rounded-full overflow-hidden flex-shrink-0
        bg-[#1877f2] flex items-center justify-center font-bold text-white
        ${className}
      `}
    >
      {imgSrc ? (
        <img
          src={imgSrc}
          alt={name}
          className="w-full h-full object-cover"
          onError={(e) => { e.target.style.display = 'none'; }}
        />
      ) : (
        <span>{initials || '?'}</span>
      )}
    </div>
  );
}
