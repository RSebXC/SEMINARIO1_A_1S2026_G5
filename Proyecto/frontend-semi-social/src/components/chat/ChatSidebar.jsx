import Avatar from '../ui/Avatar';

/**
 * Lista de amigos en el sidebar de chat.
 * @param {Array}  friends      
 * @param {string|null} activeId
 * @param {(friend) => void} onSelect
 */
export default function ChatSidebar({ friends = [], activeId, onSelect }) {
  return (
    <div className="w-72 flex-shrink-0 bg-[#242526] border border-[#3e4042] rounded-xl overflow-hidden flex flex-col">
      <div className="p-4 border-b border-[#3e4042]">
        <h2 className="font-semibold text-sm text-[#e4e6eb]">Mensajes</h2>
      </div>

      <div className="flex-1 overflow-y-auto">
        {friends.length === 0 ? (
          <div className="p-6 text-center text-[#8a8d91] text-sm">
            <i className="text-2xl mb-2 bi bi-chat-dots"></i>
            <p>Sin amigos aún.<br />Agrega amigos para chatear.</p>
          </div>
        ) : (
          friends.map((f) => (
            <button
              key={f.id}
              onClick={() => onSelect(f)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-[#3a3b3c] ${activeId === f.id ? 'bg-[#1877f2]/15 border-r-2 border-[#1877f2]' : ''
                }`}
            >
              <div className="relative">
                <Avatar src={f.fotoPerfil} name={f.nombre || ''} size="md" />
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#42b72a] rounded-full border-2 border-[#242526]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#e4e6eb] truncate">{f.nombre}</p>
                <p className="text-xs text-[#8a8d91] truncate">{f.lastMessage || 'Inicia una conversación'}</p>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
