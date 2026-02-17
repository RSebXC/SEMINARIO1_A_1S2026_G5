import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../../context/AppContext";
import "../Login/Login.css";   // comparte estilos auth
import "./Register.css";

export default function Register() {
  const { login } = useApp();
  const navigate   = useNavigate();

  const [form, setForm] = useState({
    nombre: "", email: "", password: "", confirm: "",
  });
  const [avatar, setAvatar]   = useState(
    "https://api.dicebear.com/7.x/lorelei/svg?seed=nuevo&backgroundColor=b6e3f4"
  );
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setAvatar(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirm) {
      setError("Las contraseñas no coinciden");
      return;
    }
    if (form.password.length < 4) {
      setError("La contraseña debe tener al menos 4 caracteres");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      login({
        id: Date.now(),
        nombre: form.nombre,
        email: form.email,
        foto_perfil: avatar,
      });
      navigate("/gallery");
    }, 1000);
  };

  return (
    <div className="auth-wrap">
      {/* Panel izquierdo */}
      <div className="auth-left">
        <div className="auth-left-bg" />
        <div className="auth-left-overlay" />
        <div className="auth-left-content">
          <p className="auth-left-eyebrow">Comienza gratis</p>
          <h1 className="auth-brand">
            CLOUD<span>CINEMA</span>
          </h1>
          <p className="auth-tagline">
            Crea tu cuenta y empieza a construir tu colección de cine favorita
            en cuestión de segundos.
          </p>
        </div>
      </div>

      {/* Panel derecho */}
      <div className="auth-right">
        <div className="auth-box auth-box--wide">
          <h2 className="auth-title">Crear Cuenta</h2>
          <p className="auth-subtitle">Es gratis y solo toma un momento</p>

          {error && <div className="error-msg">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form" noValidate>
            {/* Avatar */}
            <div className="avatar-upload-row">
              <img src={avatar} alt="preview" className="avatar-preview" />
              <label className="btn-upload">
                📷 Subir foto de perfil
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFile}
                  style={{ display: "none" }}
                />
              </label>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="nombre">Nombre completo</label>
              <input
                id="nombre" name="nombre" type="text"
                className="form-input" placeholder="Tu nombre completo"
                value={form.nombre} onChange={handleChange} required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="email">Correo electrónico</label>
              <input
                id="email" name="email" type="email"
                className="form-input" placeholder="tu@correo.com"
                value={form.email} onChange={handleChange} required
                autoComplete="email"
              />
            </div>

            <div className="register-row">
              <div className="form-group">
                <label className="form-label" htmlFor="password">Contraseña</label>
                <input
                  id="password" name="password" type="password"
                  className="form-input" placeholder="Mínimo 4 caracteres"
                  value={form.password} onChange={handleChange} required
                  autoComplete="new-password"
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="confirm">Confirmar contraseña</label>
                <input
                  id="confirm" name="confirm" type="password"
                  className="form-input" placeholder="Repite la contraseña"
                  value={form.confirm} onChange={handleChange} required
                  autoComplete="new-password"
                />
              </div>
            </div>

            <button type="submit" className="btn-main" disabled={loading}>
              {loading ? "Creando cuenta..." : "Crear Cuenta"}
            </button>
          </form>

          <p className="auth-switch">
            ¿Ya tienes cuenta?{" "}
            <button onClick={() => navigate("/login")} className="auth-switch-btn">
              Inicia sesión
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}