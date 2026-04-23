import { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Loader } from 'lucide-react';
import { ENDPOINTS } from '../../config/api';


export default function LexChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, text: '¡Hola! Soy el asistente de la Facultad de Ingeniería. ¿En qué puedo ayudarte?', isBot: true },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = { id: Date.now(), text: input, isBot: false };
    setMessages((p) => [...p, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const body = { mensaje: userMsg.text };
      if (sessionId) body.sessionId = sessionId;

      const res = await fetch(ENDPOINTS.CHATBOT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('idToken') || localStorage.getItem('token')}`,
        },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) throw new Error(data.error || 'Error al conectar con Lex');

      if (data.sessionId) setSessionId(data.sessionId);

      const botReply = data.respuesta || 'No entendí tu pregunta.';

      setMessages((p) => [...p, { id: Date.now() + 1, text: botReply, isBot: true }]);
    } catch {
      setMessages((p) => [...p, { id: Date.now() + 1, text: 'Error al conectar con el bot.', isBot: true }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen((v) => !v)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-[#1877f2] rounded-full shadow-xl flex items-center justify-center text-white hover:bg-[#1464d0] hover:scale-105 transition-all duration-200"
        title="Asistente Facultad de Ingeniería"
      >
        {isOpen ? <X size={22} /> : <Bot size={22} />}
      </button>

      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-80 h-96 bg-[#242526] border border-[#3e4042] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
          <div className="flex items-center gap-3 px-4 py-3 bg-[#1877f2]">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <Bot size={18} className="text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-white">Asistente FIUSAC</p>
              <p className="text-xs text-white/70">Amazon Lex</p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
            {messages.map((m) => (
              <div key={m.id} className={`flex ${m.isBot ? 'justify-start' : 'justify-end'}`}>
                <div
                  className={`max-w-xs px-3 py-2 rounded-xl text-sm ${m.isBot
                    ? 'bg-[#3a3b3c] text-[#e4e6eb] rounded-bl-sm'
                    : 'bg-[#1877f2] text-white rounded-br-sm'
                    }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-[#3a3b3c] px-3 py-2 rounded-xl flex items-center gap-2">
                  <Loader size={14} className="animate-spin text-[#8a8d91]" />
                  <span className="text-xs text-[#8a8d91]">Escribiendo...</span>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <form onSubmit={handleSend} className="flex gap-2 p-3 border-t border-[#3e4042]">
            <input
              type="text"
              placeholder="Escribe tu pregunta..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 bg-[#3a3b3c] border border-[#3e4042] rounded-full px-3 py-1.5 text-sm text-[#e4e6eb] placeholder:text-[#8a8d91] outline-none focus:border-[#1877f2] transition-colors"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="w-8 h-8 bg-[#1877f2] rounded-full flex items-center justify-center text-white disabled:opacity-40 hover:bg-[#1464d0] transition-colors"
            >
              <Send size={14} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
