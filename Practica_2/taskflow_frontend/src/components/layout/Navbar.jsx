import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogOut, CheckCircle, FolderOpen, User } from 'lucide-react';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const navItem = (path, icon, label) => {
    const isActive = location.pathname.startsWith(path);
    return (
      <Link
        to={path}
        className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${isActive
          ? 'bg-blue-600 text-white font-medium'
          : 'text-gray-600 hover:bg-gray-100'
          }`}
      >
        {icon}
        {label}
      </Link>
    );
  };

  return (
    <nav className="fixed top-0 left-0 w-full bg-white border-b border-gray-200 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">

          <div className="flex items-center">
            <span className="text-xl font-bold text-gray-900 mr-8 tracking-wide">
              TaskFlow <span className="text-blue-600 font-extrabold">+</span> CloudDrive
            </span>

            <div className="hidden sm:ml-6 sm:flex sm:space-x-4">
              {navItem('/dashboard', <CheckCircle size={18} />, 'TaskFlow')}
              {navItem('/drive', <FolderOpen size={18} />, 'CloudDrive')}
            </div>
          </div>

          <div className="flex items-center gap-4">

            {user && (
              <div className="flex items-center gap-2">
                {user.profile_picture_url ? (
                  <img
                    src={user.profile_picture_url}
                    alt="Perfil"
                    className="w-9 h-9 rounded-full object-cover border border-gray-200 shadow-sm"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 border border-blue-200 shadow-sm" title={user.username}>
                    <User size={18} />
                  </div>
                )}
                <span className="text-sm font-semibold text-gray-700 hidden sm:block">
                  {user.username}
                </span>
              </div>
            )}

            <div className="h-6 w-px bg-gray-200 hidden sm:block"></div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-md transition-all"
            >
              <LogOut size={16} />
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
