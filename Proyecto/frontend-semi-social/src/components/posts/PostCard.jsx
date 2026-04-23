import { useState } from 'react';
import { MessageCircle, Tag, ChevronDown, ChevronUp } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import Avatar from '../ui/Avatar';
import TranslateButton from './TranslateButton';
import CommentSection from './CommentSection';

function timeAgo(dateStr) {
  try {
    return formatDistanceToNow(new Date(dateStr), { addSuffix: true, locale: es });
  } catch {
    return dateStr || '';
  }
}


export default function PostCard({ post }) {
  const {
    id,
    autor,
    foto_autor,
    descripcion,
    imagen_url,
    etiquetas = [],
    fecha_creacion,
  } = post;

  const [showComments, setShowComments] = useState(false);
  const [commentCount, setCommentCount] = useState(0);

  return (
    <article className="bg-[#242526] rounded-xl border border-[#3e4042] overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-center gap-3 p-4">
        <Avatar src={foto_autor} name={autor || ''} size="md" />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-[#e4e6eb] truncate">{autor}</p>
          <p className="text-xs text-[#8a8d91]">{timeAgo(fecha_creacion)}</p>
        </div>
      </div>

      {/* Descripción */}
      {descripcion && (
        <div className="px-4 pb-2">
          <p className="text-sm text-[#e4e6eb] leading-relaxed whitespace-pre-wrap">{descripcion}</p>
          <TranslateButton originalText={descripcion} postId={id} />
        </div>
      )}

      {imagen_url && (
        <div className="bg-black">
          <img
            src={imagen_url}
            alt="Publicación"
            className="w-full max-h-[500px] object-contain"
            loading="lazy"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        </div>
      )}

      {etiquetas.length > 0 && (
        <div className="flex flex-wrap gap-1.5 px-4 pt-3">
          {etiquetas.map((tag, i) => (
            <span
              key={i}
              className="flex items-center gap-1 bg-[#3a3b3c] text-[#8a8d91] text-xs px-2 py-0.5 rounded-full border border-[#3e4042]"
            >
              <Tag size={9} /> {tag}
            </span>
          ))}
        </div>
      )}

      <div className="px-4 py-3 flex items-center justify-between border-t border-[#3e4042] mt-2">
        <span className="text-xs text-[#8a8d91]">
          {commentCount} comentario{commentCount !== 1 ? 's' : ''}
        </span>
        <button
          onClick={() => setShowComments((v) => !v)}
          className="flex items-center gap-1.5 text-sm text-[#8a8d91] hover:text-[#1877f2] transition-colors font-medium"
        >
          <MessageCircle size={16} />
          Comentar
          {showComments ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      </div>

      {showComments && (
        <div className="px-4 pb-4">
          <CommentSection postId={id} onCountChange={setCommentCount} />
        </div>
      )}
    </article>
  );
}
