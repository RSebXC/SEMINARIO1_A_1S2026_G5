import { useState } from 'react';
import { Search, Tag } from 'lucide-react';

/**
 * Barra de filtro por etiquetas (Rekognition).
 * @param {string[]} tags      
 * @param {string}   active     
 * @param {(tag: string) => void} onChange
 */
export default function TagFilter({ tags = [], active = '', onChange }) {
  const [search, setSearch] = useState('');

  const filtered = ['Todos', ...tags].filter((t) =>
    t.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-[#242526] rounded-xl border border-[#3e4042] p-3 flex flex-col gap-3">
      {/* Buscador */}
      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8a8d91]" />
        <input
          type="text"
          placeholder="Buscar etiqueta..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-[#3a3b3c] border border-[#3e4042] rounded-lg pl-8 pr-3 py-2 text-sm text-[#e4e6eb] placeholder:text-[#8a8d91] outline-none focus:border-[#1877f2] transition-colors"
        />
      </div>

      {/* Chips de etiquetas */}
      <div className="flex flex-wrap gap-2">
        {filtered.map((tag) => {
          const isActive = tag === 'Todos' ? active === '' : active === tag;
          return (
            <button
              key={tag}
              onClick={() => onChange(tag === 'Todos' ? '' : tag)}
              className={`
                flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium
                transition-colors duration-150 border
                ${isActive
                  ? 'bg-[#1877f2] text-white border-[#1877f2]'
                  : 'bg-[#3a3b3c] text-[#b0b3b8] border-[#3e4042] hover:border-[#1877f2] hover:text-[#1877f2]'}
              `}
            >
              {tag !== 'Todos' && <Tag size={10} />}
              {tag}
            </button>
          );
        })}
        {filtered.length === 0 && (
          <p className="text-xs text-[#8a8d91]">Sin resultados para "{search}"</p>
        )}
      </div>
    </div>
  );
}
