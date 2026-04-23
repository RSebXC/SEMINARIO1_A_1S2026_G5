import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import Avatar from '../ui/Avatar';
import TranslateButton from './TranslateButton';


function timeAgo(dateStr) {
  try {
    return formatDistanceToNow(new Date(dateStr), { addSuffix: true, locale: es });
  } catch {
    return '';
  }
}


export default function CommentItem({ comment }) {
  const { id, contenido, autor, fecha_creacion } = comment;

  return (
    <div className="flex gap-2">
      <Avatar src={null} name={autor || '?'} size="xs" />

      <div className="flex-1">
        <div className="inline-block bg-[#3a3b3c] rounded-2xl px-3 py-2 max-w-full">
          <p className="text-xs font-semibold text-[#e4e6eb]">{autor}</p>
          <p className="text-sm text-[#e4e6eb] break-words">{contenido}</p>
        </div>

        <div className="flex items-center gap-3 mt-0.5 px-1">
          <span className="text-xs text-[#8a8d91]">{timeAgo(fecha_creacion)}</span>
          {contenido && <TranslateButton originalText={contenido} postId={id} />}
        </div>
      </div>
    </div>
  );
}
