import { NavLink } from 'react-router-dom';
import { Home, Users, MessageCircle, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../ui/Avatar';

const LINKS = [
  { to: '/',        icon: Home,          label: 'Inicio'         },
  { to: '/friends', icon: Users,         label: 'Amigos'         },
  { to: '/chat',    icon: MessageCircle, label: 'Chat'           },
  { to: '/profile', icon: User,          label: 'Mi Perfil'      },
];

export default function Sidebar() {
  const { user, fotoPerfil } = useAuth();

  return (
    <aside className="hidden lg:flex flex-col gap-1 w-64 flex-shrink-0 pt-4">
      {/* Usuario logueado */}
      <NavLink
        to="/profile"
        className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#3a3b3c] transition-colors group"
      >
        <Avatar src={fotoPerfil} name={user?.nombre || ''} size="md" />
        <span className="font-semibold text-sm text-[#e4e6eb] group-hover:text-[#1877f2] truncate">
          {user?.nombre || 'Mi Perfil'}
        </span>
      </NavLink>

      <div className="border-t border-[#3e4042] my-1" />

      {/* Links de navegación */}
      {LINKS.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          className={({ isActive }) => `
            flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors text-sm font-medium
            ${isActive
              ? 'bg-[#1877f2]/15 text-[#1877f2]'
              : 'text-[#e4e6eb] hover:bg-[#3a3b3c]'}
          `}
        >
          <Icon size={20} />
          {label}
        </NavLink>
      ))}
    </aside>
  );
}
