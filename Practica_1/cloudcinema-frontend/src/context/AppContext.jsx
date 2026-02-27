import { createContext, useContext, useState, useRef, useEffect } from "react";
import {
  getPlaylist,
  addToPlaylist    as apiAddToPlaylist,
  removeFromPlaylist as apiRemoveFromPlaylist,
} from "../services/api";

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem("user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [playlist, setPlaylist] = useState([]);
  const [toast,    setToast]    = useState(null);
  const toastId = useRef(0);

  // Cargar playlist desde el backend cuando haya usuario
  useEffect(() => {
    if (!user?.id) return;

    const fetchPlaylist = async () => {
      try {
        const data = await getPlaylist(); // sin userId — el backend usa el JWT
        setPlaylist(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error cargando playlist:", err);
      }
    };

    fetchPlaylist();
  }, [user?.id]);

  // ── Auth ──
  const login = (userData) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    setPlaylist([]);
    localStorage.removeItem("user");
  };

  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  // ── Playlist ──
  const addToPlaylist = async (movie) => {
    // Optimistic update
    setPlaylist((prev) => {
      if (prev.some((m) => m.id_pelicula === movie.id_pelicula)) return prev;
      return [{ ...movie, fecha_agregada: new Date().toISOString() }, ...prev];
    });

    try {
      await apiAddToPlaylist(user.id, movie.id_pelicula);
    } catch (err) {
      console.error("Error añadiendo a playlist:", err);
      setPlaylist((prev) => prev.filter((m) => m.id_pelicula !== movie.id_pelicula));
      showToast("No se pudo añadir a tu lista ⚠️", "❌");
    }
  };

  const removeFromPlaylist = async (id) => {
    const saved = playlist.find((m) => m.id_pelicula === id);

    // Optimistic update
    setPlaylist((prev) => prev.filter((m) => m.id_pelicula !== id));

    try {
      await apiRemoveFromPlaylist(user.id, id);
    } catch (err) {
      console.error("Error eliminando de playlist:", err);
      if (saved) setPlaylist((current) => [saved, ...current]);
      showToast("No se pudo eliminar de tu lista ⚠️", "❌");
    }
  };

  const inPlaylist = (id) => playlist.some((m) => m.id_pelicula === id);

  // ── Toast ──
  const showToast = (message, icon = "✅") => {
    toastId.current += 1;
    setToast({ message, icon, id: toastId.current });
    setTimeout(() => setToast(null), 3200);
  };

  return (
    <AppContext.Provider
      value={{
        user, login, logout, updateUser,
        playlist, addToPlaylist, removeFromPlaylist, inPlaylist,
        toast, showToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);