/**
 * Burbuja de mensaje individual.
 * @param {{ contenido, isOwn, createdAt }} message
 * @param {boolean} isOwn
 */
export default function MessageBubble({ message, isOwn }) {
  const { contenido, createdAt } = message;

  const time = createdAt
    ? new Date(createdAt).toLocaleTimeString('es-GT', { hour: '2-digit', minute: '2-digit' })
    : '';

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`
          max-w-xs lg:max-w-sm px-4 py-2 rounded-2xl text-sm
          ${isOwn
            ? 'bg-[#1877f2] text-white rounded-br-sm'
            : 'bg-[#3a3b3c] text-[#e4e6eb] rounded-bl-sm'}
        `}
      >
        <p className="break-words leading-relaxed">{contenido}</p>
        <p className={`text-xs mt-1 ${isOwn ? 'text-white/70' : 'text-[#8a8d91]'} text-right`}>
          {time}
        </p>
      </div>
    </div>
  );
}
