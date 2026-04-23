import { useState, useEffect, useRef, useCallback } from 'react';
import { Send, Phone, MoreVertical } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ENDPOINTS } from '../../config/api';
import Avatar from '../ui/Avatar';
import MessageBubble from './MessageBubble';
import LoadingSpinner from '../ui/LoadingSpinner';

export default function ChatWindow({ friend }) {
  const { user } = useAuth();
  const bottomRef = useRef(null);

  const token = localStorage.getItem('idToken') || localStorage.getItem('token');
  let myId = null;
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      myId = payload.sub;
    } catch (e) { }
  }

  const [messages, setMessages] = useState([]);
  const [text,     setText]     = useState('');
  const [loading,  setLoading]  = useState(false);
  const [sending,  setSending]  = useState(false);

  const fetchMessages = useCallback(async (isPolling = false) => {
    if (!friend?.id) return;
    if (!isPolling) setLoading(true);
    try {
      const res  = await fetch(ENDPOINTS.MESSAGES(friend.id), {
        headers: { Authorization: `Bearer ${localStorage.getItem('idToken') || localStorage.getItem('token')}` },
      });
      const data = await res.json().catch(() => []);
      if (!res.ok) throw new Error(data.message || 'Error al cargar mensajes');
      
      const msgs = Array.isArray(data) ? data : data.mensajes || [];
      const sorted = msgs.sort((a, b) => new Date(a.fecha_creacion) - new Date(b.fecha_creacion));
      setMessages(sorted);
    } catch {
    } finally {
      setLoading(false);
    }
  }, [friend?.id, user?.nombre]);

  useEffect(() => { 
    fetchMessages(); 
    const interval = setInterval(() => fetchMessages(true), 3000);
    return () => clearInterval(interval);
  }, [fetchMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim() || sending) return;

    const optimistic = {
      id:        Date.now(),
      contenido: text,
      isOwn:     true,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);
    setText('');
    setSending(true);

    try {
      const res = await fetch(ENDPOINTS.SEND_MESSAGE, {
        method:  'POST',
        headers: {
          'Content-Type':  'application/json',
          'Authorization': `Bearer ${localStorage.getItem('idToken') || localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ receptorSub: friend.id, contenido: optimistic.contenido }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Error al enviar');
    } catch {
      setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
      setText(optimistic.contenido);
    } finally {
      setSending(false);
    }
  };

  if (!friend) return (
    <div className="flex-1 flex items-center justify-center bg-[#242526] rounded-xl border border-[#3e4042]">
      <div className="text-center text-[#8a8d91]">
        <i className="text-4xl mb-3 bi bi-chat-dots"></i>
        <p className="font-medium">Selecciona un amigo para chatear</p>
      </div>
    </div>
  );

  return (
    <div className="flex-1 flex flex-col bg-[#242526] rounded-xl border border-[#3e4042] overflow-hidden min-h-0">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-[#3e4042] bg-[#242526]">
        <Avatar src={friend.fotoPerfil} name={friend.nombre || ''} size="md" />
        <div className="flex-1">
          <p className="font-semibold text-sm text-[#e4e6eb]">{friend.nombre}</p>
          <p className="text-xs text-[#42b72a]">En línea</p>
        </div>
        <button className="p-2 rounded-full text-[#8a8d91] hover:bg-[#3a3b3c] transition-colors">
          <MoreVertical size={18} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
        {loading && <div className="flex justify-center py-4"><LoadingSpinner size="sm" /></div>}
        {messages.map((m, i) => (
          <MessageBubble key={m.id || i} message={m} isOwn={m.isOwn ?? (m.emisor_sub === myId)} />
        ))}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSend} className="flex items-center gap-2 px-4 py-3 border-t border-[#3e4042]">
        <input
          type="text"
          placeholder={`Mensaje a ${friend.nombre?.split(' ')[0]}...`}
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="flex-1 bg-[#3a3b3c] border border-[#3e4042] rounded-full px-4 py-2 text-sm text-[#e4e6eb] placeholder:text-[#8a8d91] outline-none focus:border-[#1877f2] transition-colors"
        />
        <button
          type="submit"
          disabled={!text.trim() || sending}
          className="w-10 h-10 bg-[#1877f2] rounded-full flex items-center justify-center text-white hover:bg-[#1464d0] disabled:opacity-40 transition-colors flex-shrink-0"
        >
          {sending ? <LoadingSpinner size="sm" /> : <Send size={16} />}
        </button>
      </form>
    </div>
  );
}
