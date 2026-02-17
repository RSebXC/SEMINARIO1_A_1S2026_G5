import { createContext, useContext, useState, useRef } from "react";

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [user, setUser]         = useState(null);
  const [playlist, setPlaylist] = useState([]);
  const [toast, setToast]       = useState(null);
  const toastId = useRef(0);

  const login = (userData) => setUser(userData);

  const logout = () => {
    setUser(null);
    setPlaylist([]);
  };

  const updateUser = (userData) => setUser(userData);

  const addToPlaylist = (movie) => {
    setPlaylist((prev) => {
      if (prev.some((m) => m.id_pelicula === movie.id_pelicula)) return prev;
      return [{ ...movie, fecha_agregada: new Date().toISOString() }, ...prev];
    });
  };

  const removeFromPlaylist = (id) => {
    setPlaylist((prev) => prev.filter((m) => m.id_pelicula !== id));
  };

  const inPlaylist = (id) => playlist.some((m) => m.id_pelicula === id);

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