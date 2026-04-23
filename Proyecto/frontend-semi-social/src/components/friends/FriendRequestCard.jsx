import { Check, X } from 'lucide-react';
import Avatar from '../ui/Avatar';
import Button from '../ui/Button';

/**
 * Tarjeta de solicitud de amistad pendiente.
 * @param {{ id, nombre, fotoPerfil }} request
 * @param {(id, action) => void} onAction 
 * @param {boolean} loading
 */
export default function FriendRequestCard({ request, onAction, loading = false }) {
  const { id, nombre, fotoPerfil, email } = request;

  return (
    <div className="bg-[#242526] rounded-xl border border-[#3e4042] p-4 flex items-center gap-3">
      <Avatar src={fotoPerfil} name={nombre || ''} size="md" />
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm text-[#e4e6eb] truncate">{nombre}</p>
        {email && <p className="text-xs text-[#8a8d91] truncate">{email}</p>}
        <p className="text-xs text-[#8a8d91] mt-0.5">Quiere ser tu amigo</p>
      </div>
      <div className="flex gap-2 flex-shrink-0">
        <Button
          size="sm"
          variant="success"
          onClick={() => onAction(id, 'aceptar')}
          loading={loading}
          title="Aceptar"
        >
          <Check size={14} />
        </Button>
        <Button
          size="sm"
          variant="danger"
          onClick={() => onAction(id, 'rechazar')}
          loading={loading}
          title="Rechazar"
        >
          <X size={14} />
        </Button>
      </div>
    </div>
  );
}
