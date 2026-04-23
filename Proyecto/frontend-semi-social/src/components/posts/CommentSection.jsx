import { useState, useEffect, useCallback } from 'react';
import { Send } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ENDPOINTS } from '../../config/api';
import Avatar from '../ui/Avatar';
import CommentItem from './CommentItem';
import LoadingSpinner from '../ui/LoadingSpinner';

/**
 *
 * @param {string|number} postId
 * @param {(count: number) => void} onCountChange 
 */
export default function CommentSection({ postId, onCountChange }) {
  const { user, fotoPerfil } = useAuth();

  const [comments, setComments] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchComments = useCallback(async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch(`${ENDPOINTS.POSTS}/${postId}/comentarios`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      const data = await res.json().catch(() => []);
      if (!res.ok) throw new Error(data.message || 'Error al cargar comentarios');
      const lista = Array.isArray(data) ? data : [];
      setComments(lista);
      onCountChange?.(lista.length);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => { fetchComments(); }, [fetchComments]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    setSending(true);
    setErrorMsg('');
    try {
      const res = await fetch(`${ENDPOINTS.POSTS}/${postId}/comentarios`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ contenido: text }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || 'Error al comentar');

      setComments((prev) => {
        const updated = [
          ...prev,
          {
            id: data.id || Date.now(),
            contenido: text,
            autor: user?.nombre || 'Yo',
            fecha_creacion: new Date().toISOString(),
            ...data,
          },
        ];
        onCountChange?.(updated.length);
        return updated;
      });
      setText('');
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col gap-3 pt-3 border-t border-[#3e4042]">
      {/* Estado de carga */}
      {loading && (
        <div className="flex justify-center py-2">
          <LoadingSpinner size="sm" text="Cargando comentarios..." />
        </div>
      )}

      {/* Lista de comentarios */}
      {!loading && comments.length === 0 && (
        <p className="text-xs text-[#8a8d91] text-center py-1">Sé el primero en comentar</p>
      )}
      {!loading && comments.map((c, i) => (
        <CommentItem key={c.id || i} comment={c} />
      ))}

      {errorMsg && <p className="text-xs text-[#f02849]">{errorMsg}</p>}

      {/* Input nuevo comentario */}
      <form onSubmit={handleSend} className="flex items-center gap-2">
        <Avatar src={fotoPerfil} name={user?.nombre || ''} size="xs" />
        <div className="flex-1 flex items-center bg-[#3a3b3c] rounded-full px-3 py-1.5 gap-2">
          <input
            type="text"
            placeholder="Escribe un comentario..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="flex-1 bg-transparent text-sm text-[#e4e6eb] placeholder:text-[#8a8d91] outline-none"
          />
          <button
            type="submit"
            disabled={!text.trim() || sending}
            className="text-[#1877f2] disabled:opacity-40 hover:text-[#1464d0] transition-colors"
          >
            {sending ? <LoadingSpinner size="sm" /> : <Send size={15} />}
          </button>
        </div>
      </form>
    </div>
  );
}
