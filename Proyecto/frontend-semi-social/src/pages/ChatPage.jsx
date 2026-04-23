import { useState, useEffect, useCallback } from 'react';
import { ENDPOINTS } from '../config/api';
import ChatSidebar from '../components/chat/ChatSidebar';
import ChatWindow from '../components/chat/ChatWindow';

export default function ChatPage() {
  const [friends, setFriends] = useState([]);
  const [activeFriend, setActiveFriend] = useState(null);


  const fetchFriends = useCallback(async () => {
    try {
      const res = await fetch(ENDPOINTS.FRIENDS, {
        headers: { Authorization: `Bearer ${localStorage.getItem('idToken') || localStorage.getItem('token')}` },
      });
      const data = await res.json().catch(() => []);

      const list = Array.isArray(data) ? data : data.amigos || [];
      const mapped = list.map(a => ({
        id: a.cognito_sub || a.id,
        nombre: a.nombre || a.nombre_completo,
        fotoPerfil: a.foto || a.foto_perfil_url,
        lastMessage: '',
      }));
      setFriends(mapped);
    } catch {
    }
  }, []);

  useEffect(() => { fetchFriends(); }, [fetchFriends]);

  return (
    <div className="pb-8">
      <h1 className="text-xl font-bold text-[#e4e6eb] mb-4">Chat</h1>

      <div className="flex gap-4" style={{ height: 'calc(100vh - 160px)' }}>
        <ChatSidebar
          friends={friends}
          activeId={activeFriend?.id}
          onSelect={setActiveFriend}
        />

        <ChatWindow friend={activeFriend} />
      </div>
    </div>
  );
}
