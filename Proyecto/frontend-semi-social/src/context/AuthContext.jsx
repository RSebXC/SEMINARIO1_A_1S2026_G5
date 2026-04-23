// @refresh reset
import { createContext, useContext, useState, useCallback } from 'react';
import { ENDPOINTS } from '../config/api';

const AuthContext = createContext(null);


export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('user')) || null; }
    catch { return null; }
  });
  const [fotoPerfil, setFotoPerfil] = useState(
    () => localStorage.getItem('fotoPerfil') || null
  );

  const isAuthenticated = Boolean(token);

  const fetchAndStoreProfile = useCallback(async (tk, idTk) => {
    try {
      const tokenToUse = idTk || tk;
      console.log("Haciendo GET /perfil con token:", tokenToUse);

      const res = await fetch(ENDPOINTS.PROFILE, {
        headers: { Authorization: `Bearer ${tokenToUse}` },
      });
      const data = await res.json().catch(() => ({}));

      console.log("Respuesta de GET /perfil:", res.status, data);

      if (res.ok) {
        const userData = {
          id: data.id || null,
          nombre: data.nombre_completo || data.nombre || '',
          email: data.email || '',
          dpi: data.dpi || '',
        };
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        if (data.foto_perfil_url) {
          localStorage.setItem('fotoPerfil', data.foto_perfil_url);
          setFotoPerfil(data.foto_perfil_url);
        }
      } else {
        console.error("El backend rechazó el token en GET /perfil:", data);
      }
    } catch (err) {
      console.error("Error al llamar a GET /perfil:", err);
    }
  }, []);


  const login = useCallback(async (responseData) => {
    const tk = responseData.AccessToken || responseData.accessToken || responseData.token;
    const idTk = responseData.IdToken || responseData.idToken || '';

    const fp = responseData.fotoPerfil || null;

    localStorage.setItem('token', tk);
    localStorage.setItem('idToken', idTk);

    if (fp) {
      localStorage.setItem('fotoPerfil', fp);
      setFotoPerfil(fp);
    }

    setToken(tk);

    await fetchAndStoreProfile(tk, idTk || tk);
  }, [fetchAndStoreProfile]);
  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('idToken');
    localStorage.removeItem('fotoPerfil');
    localStorage.removeItem('user');
    setToken(null);
    setFotoPerfil(null);
    setUser(null);
  }, []);

  const updateFotoPerfil = useCallback((url) => {
    localStorage.setItem('fotoPerfil', url);
    setFotoPerfil(url);
  }, []);

  const updateUser = useCallback((data) => {
    const updated = { ...user, ...data };
    localStorage.setItem('user', JSON.stringify(updated));
    setUser(updated);
  }, [user]);

  return (
    <AuthContext.Provider value={{
      token,
      user,
      fotoPerfil,
      isAuthenticated,
      login,
      logout,
      updateFotoPerfil,
      updateUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
}
