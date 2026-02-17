import { useApp } from "../context/AppContext";
import { Navigate, Outlet } from "react-router-dom";
import Navbar from "../components/Navbar/Navbar";
import Toast from "../components/Toast/Toast";

// Envuelve las rutas que requieren login
export default function ProtectedLayout() {
  const { user } = useApp();

  if (!user) return <Navigate to="/login" replace />;

  return (
    <>
      <Navbar />
      <Outlet />
      <Toast />
    </>
  );
}