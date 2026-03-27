import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useFetch } from '../hooks/useFetch';
import { toast } from 'sonner';
import { API_URL } from '../utils/config';

export default function Login() {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const navigate = useNavigate();

  const { execute, loading } = useFetch('', {
    manual: true,
    requiresAuth: false
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.username || !formData.password) {
      toast.error('Completá ambos campos');
      return;
    }

    try {
      const resp = await execute(formData, {
        url: `${API_URL}/auth/login`,
        method: 'POST'
      });

      if (resp?.token) {
        localStorage.setItem('token', resp.token);
        localStorage.setItem('user', JSON.stringify(resp.user));
        toast.success(`Bienvenido de vuelta, ${resp.user.username}!`);
        navigate('/dashboard');
      }
    } catch (err) {
      toast.error(err.message || 'Credenciales inválidas');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg border border-gray-100">
        <div>
          <h2 className="mt-2 text-center text-3xl font-extrabold text-gray-900">
            Inicia Sesión
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Accedé a tus tareas en <span className="font-semibold text-blue-600">TaskFlow</span>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <input
                type="text"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Nombre de Usuario"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              />
            </div>
            <div>
              <input
                type="password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Contraseña"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 transition-colors shadow-md"
            >
              {loading ? 'Accediendo...' : 'Entrar a la plataforma'}
            </button>
          </div>
        </form>
        <p className="text-center text-sm text-gray-600">
          ¿No tienes cuenta?{' '}
          <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500 transition-colors">
            Regístrate aquí
          </Link>
        </p>
      </div>
    </div>
  );
}
