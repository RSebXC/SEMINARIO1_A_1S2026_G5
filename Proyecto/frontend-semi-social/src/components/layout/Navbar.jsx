import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Home, Users, MessageCircle, User, LogOut, Search, Bell } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../ui/Avatar';

const NAV_LINKS = [
  { to: '/',        icon: Home,          label: 'Inicio'  },
  { to: '/friends', icon: Users,         label: 'Amigos'  },
  { to: '/chat',    icon: MessageCircle, label: 'Chat'    },
  { to: '/profile', icon: User,          label: 'Perfil'  },
];

export default function Navbar() {
  const { user, fotoPerfil, logout } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 h-14 bg-[#242526] border-b border-[#3e4042] shadow-lg">
      <div className="max-w-6xl mx-auto h-full flex items-center justify-between px-4">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 flex-shrink-0">
          <div className="w-9 h-9 bg-[#1877f2] rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-base">S</span>
          </div>
          <span className="hidden sm:block text-white font-bold text-lg tracking-tight">
            Semi<span className="text-[#1877f2]">Social</span>
          </span>
        </Link>

        {/* Navegación central */}
        <div className="flex items-center gap-1">
          {NAV_LINKS.map(({ to, icon: Icon, label }) => {
            const active = location.pathname === to;
            return (
              <Link
                key={to}
                to={to}
                title={label}
                className={`
                  flex flex-col items-center justify-center w-12 h-12 sm:w-16 rounded-lg
                  transition-colors duration-150
                  ${active
                    ? 'text-[#1877f2] border-b-2 border-[#1877f2]'
                    : 'text-[#8a8d91] hover:bg-[#3a3b3c] hover:text-[#e4e6eb]'}
                `}
              >
                <Icon size={22} />
              </Link>
            );
          })}
        </div>

        {/* Acciones de usuario */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Botón de campana removido por falta de uso en los contratos */}

          <Link to="/profile" className="flex items-center gap-2 group">
            <Avatar src={fotoPerfil} name={user?.nombre || ''} size="sm" />
            <span className="hidden md:block text-sm font-medium text-[#e4e6eb] group-hover:text-[#1877f2] transition-colors max-w-24 truncate">
              {user?.nombre?.split(' ')[0] || 'Perfil'}
            </span>
          </Link>

          <button
            onClick={handleLogout}
            title="Cerrar sesión"
            className="w-9 h-9 rounded-full bg-[#3a3b3c] flex items-center justify-center text-[#8a8d91] hover:bg-[#f02849]/20 hover:text-[#f02849] transition-colors"
          >
            <LogOut size={17} />
          </button>
        </div>
      </div>
    </nav>
  );
}
