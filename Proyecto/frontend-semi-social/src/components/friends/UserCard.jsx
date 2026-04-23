import { UserPlus, Loader } from 'lucide-react';
import Avatar from '../ui/Avatar';
import Button from '../ui/Button';

/**
 * Tarjeta de usuario no-amigo con botón "Agregar amigo".
 * @param {{ id, nombre, fotoPerfil, email }} user
 * @param {boolean} sending
 * @param {(id) => void} onAdd
 */
export default function UserCard({ user, sending = false, onAdd }) {
  const { id, nombre, fotoPerfil, email } = user;

  return (
    <div className="bg-[#242526] rounded-xl border border-[#3e4042] p-4 flex items-center gap-3">
      <Avatar src={fotoPerfil} name={nombre || ''} size="md" />
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm text-[#e4e6eb] truncate">{nombre}</p>
        {email && <p className="text-xs text-[#8a8d91] truncate">{email}</p>}
      </div>
      <Button
        size="sm"
        onClick={() => onAdd(id)}
        loading={sending}
        className="flex-shrink-0"
      >
        <UserPlus size={14} />
        Agregar
      </Button>
    </div>
  );
}
