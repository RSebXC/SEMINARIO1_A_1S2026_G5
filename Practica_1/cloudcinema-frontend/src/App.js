import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppProvider } from "./context/AppContext";

// Layouts
import ProtectedLayout from "./layouts/ProtectedLayout";

// Páginas públicas
import Login    from "./pages/Login/Login";
import Register from "./pages/Register/Register";

// Páginas privadas
import Gallery  from "./pages/Gallery/Gallery";
import Playlist from "./pages/Playlist/Playlist";
import Profile  from "./pages/Profile/Profile";

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          {/* Rutas públicas */}
          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Rutas protegidas — ProtectedLayout verifica el login */}
          <Route element={<ProtectedLayout />}>
            <Route path="/gallery"  element={<Gallery />} />
            <Route path="/playlist" element={<Playlist />} />
            <Route path="/profile"  element={<Profile />} />
          </Route>

          {/* Redireccion por defecto */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}