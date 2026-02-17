import { useNavigate, useLocation } from "react-router-dom";
import { useApp } from "../../context/AppContext";
import "./Navbar.css";

export default function Navbar() {
  const { user, logout } = useApp();
  const navigate  = useNavigate();
  const location  = useLocation();
  const isActive  = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <span className="nav-brand" onClick={() => navigate("/gallery")}>
        CLOUD<span>CINEMA</span>
      </span>

      <div className="nav-links">
        <button
          className={`nav-link ${isActive("/gallery") ? "active" : ""}`}
          onClick={() => navigate("/gallery")}
        >
          Inicio
        </button>
        <button
          className={`nav-link ${isActive("/playlist") ? "active" : ""}`}
          onClick={() => navigate("/playlist")}
        >
          Mi Lista
        </button>
      </div>

      <div className="nav-right">
        <button
          className="nav-avatar-btn"
          onClick={() => navigate("/profile")}
        >
          <img
            src={user?.foto_perfil || "https://via.placeholder.com/32"}
            alt={user?.nombre}
            className="nav-avatar"
          />
          <span className="nav-username">
            {user?.nombre?.split(" ")[0]}
          </span>
        </button>

        <button className="btn-logout" onClick={handleLogout}>
          Salir
        </button>
      </div>
    </nav>
  );
}