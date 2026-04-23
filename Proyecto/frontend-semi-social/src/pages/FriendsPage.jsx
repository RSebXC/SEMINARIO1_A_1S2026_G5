import { useState, useEffect, useCallback } from 'react';
import { Users, UserCheck, RefreshCw } from 'lucide-react';
import { ENDPOINTS } from '../config/api';
import UserCard from '../components/friends/UserCard';
import FriendRequestCard from '../components/friends/FriendRequestCard';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Alert from '../components/ui/Alert';

const TABS = [
  { id: 'discover', label: 'Descubrir personas', icon: Users },
  { id: 'requests', label: 'Solicitudes', icon: UserCheck },
];

export default function FriendsPage() {
  const [tab, setTab] = useState('discover');
  const [users, setUsers] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionId, setActionId] = useState(null);
  const [alertMsg, setAlertMsg] = useState({ type: 'info', text: '' });


  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(ENDPOINTS.USERS_LIST, {
        headers: { Authorization: `Bearer ${localStorage.getItem('idToken') || localStorage.getItem('token')}` },
      });
      const data = await res.json().catch(() => []);
      if (!res.ok) throw new Error(data.message || 'Error al cargar personas');

      const list = Array.isArray(data) ? data : data.usuarios || [];
      const mapped = list.map(u => ({
        id: u.cognito_sub || u.id,
        nombre: u.nombre_completo || u.nombre,
        email: u.email,
        fotoPerfil: u.foto_perfil_url || u.foto,
      }));
      setUsers(mapped);
    } catch {
      setAlertMsg({ type: 'error', text: 'Error al cargar usuarios' });
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(ENDPOINTS.FRIEND_REQUESTS, {
        headers: { Authorization: `Bearer ${localStorage.getItem('idToken') || localStorage.getItem('token')}` },
      });
      const data = await res.json().catch(() => []);
      if (!res.ok) throw new Error(data.message || 'Error al cargar solicitudes');

      const list = Array.isArray(data) ? data : data.solicitudes || [];
      const mapped = list.map(r => ({
        id: r.id || r.solicitud_id,
        nombre: r.nombre_completo || r.nombre || r.solicitante_nombre,
        email: r.email,
        fotoPerfil: r.foto_perfil_url || r.foto || r.solicitante_foto,
      }));
      setRequests(mapped);
    } catch {
      setAlertMsg({ type: 'error', text: 'Error al cargar solicitudes' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (tab === 'discover') fetchUsers();
    else fetchRequests();
  }, [tab, fetchUsers, fetchRequests]);

  const handleAddFriend = async (userId) => {
    setActionId(userId);
    try {
      const res = await fetch(ENDPOINTS.SEND_FRIEND_REQ, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('idToken') || localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ receptorSub: userId }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || data.mensaje || 'Error al enviar solicitud');
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      setAlertMsg({ type: 'success', text: 'Solicitud enviada' });
    } catch (err) {
      setAlertMsg({ type: 'error', text: err.message });
    } finally {
      setActionId(null);
    }
  };

  const handleRequestAction = async (requestId, action) => {
    setActionId(requestId);
    try {
      const res = await fetch(ENDPOINTS.ACCEPT_FRIEND_REQ(requestId), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('idToken') || localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ accion: action }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || data.mensaje || 'Error');
      setRequests((prev) => prev.filter((r) => r.id !== requestId));
      setAlertMsg({
        type: action === 'aceptar' ? 'success' : 'info',
        text: action === 'aceptar' ? 'Amigo aceptado' : 'Solicitud rechazada',
      });
    } catch (err) {
      setAlertMsg({ type: 'error', text: err.message });
    } finally {
      setActionId(null);
    }
  };

  const currentList = tab === 'discover' ? users : requests;

  return (
    <div className="flex flex-col gap-4 pb-8">
      <h1 className="text-xl font-bold text-[#e4e6eb]">Personas y amigos</h1>

      {/* Tabs */}
      <div className="flex gap-2 bg-[#242526] p-1 rounded-xl border border-[#3e4042]">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-lg transition-colors ${tab === id
              ? 'bg-[#1877f2] text-white'
              : 'text-[#8a8d91] hover:text-[#e4e6eb] hover:bg-[#3a3b3c]'
              }`}
          >
            <Icon size={16} /> {label}
            {id === 'requests' && requests.length > 0 && (
              <span className="bg-[#f02849] text-white text-xs rounded-full px-1.5 py-0.5 min-w-5 text-center">
                {requests.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Alerta */}
      {alertMsg.text && (
        <Alert
          type={alertMsg.type}
          message={alertMsg.text}
          onClose={() => setAlertMsg({ type: 'info', text: '' })}
          autoDismiss={3000}
        />
      )}

      {/* Recarga */}
      <div className="flex justify-between items-center">
        <p className="text-sm text-[#8a8d91]">
          {currentList.length} {tab === 'discover' ? 'personas' : 'solicitudes'}
        </p>
        <button
          onClick={() => tab === 'discover' ? fetchUsers() : fetchRequests()}
          disabled={loading}
          className="flex items-center gap-1 text-sm text-[#8a8d91] hover:text-[#1877f2] transition-colors disabled:opacity-40"
        >
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} /> Actualizar
        </button>
      </div>

      {/* Lista */}
      {loading ? (
        <div className="flex justify-center py-12"><LoadingSpinner size="lg" /></div>
      ) : currentList.length === 0 ? (
        <div className="text-center py-16">
          <i className={`text-4xl mb-3 bi ${tab === 'discover' ? 'bi-emoji-sunglasses' : 'bi-inbox'}`}></i>
          <p className="text-[#b0b3b8] font-medium">
            {tab === 'discover' ? '¡Ya conoces a todos!' : 'No tienes solicitudes pendientes'}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {tab === 'discover'
            ? users.map((u) => (
              <UserCard key={u.id} user={u} sending={actionId === u.id} onAdd={handleAddFriend} />
            ))
            : requests.map((r) => (
              <FriendRequestCard key={r.id} request={r} loading={actionId === r.id} onAction={handleRequestAction} />
            ))
          }
        </div>
      )}
    </div>
  );
}
