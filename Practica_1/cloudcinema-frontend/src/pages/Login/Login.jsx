import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../../context/AppContext";
import { MOCK_USER } from "../../data/mockData";
import "./Login.css";

export default function Login() {
  const { login } = useApp();
  const navigate   = useNavigate();

  const [form, setForm]     = useState({ email: "", password: "" });
  const [error, setError]   = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Simula llamada al backend
    setTimeout(() => {
  if (
    (form.email === "rodrigo@cloudcinema.gt" && form.password === "1234") ||
    (form.email === "sergio@cloudcinema.gt" && form.password === "1234") ||
    (form.email === "moises@cloudcinema.gt" && form.password === "1234")
  ) {
    login(MOCK_USER);
    navigate("/gallery");
  } else {
    setError(
      "Credenciales incorrectas. Prueba:\n rodrigo@cloudcinema.gt / 1234"
    );
    setLoading(false);
  }
}, 900);

  };

  return (
    <div className="auth-wrap">
      {/* Panel izquierdo decorativo */}
      <div className="auth-left">
        <div className="auth-left-bg" />
        <div className="auth-left-overlay" />
        <div className="auth-left-content">
          <p className="auth-left-eyebrow">Bienvenido de vuelta</p>
          <h1 className="auth-brand">
            CLOUD<span>CINEMA</span>
          </h1>
          <p className="auth-tagline">
            Tu plataforma de cine en la nube. Explora, colecciona y disfruta
            sin interrupciones.
          </p>
        </div>
      </div>

      {/* Panel derecho – formulario */}
      <div className="auth-right">
        <div className="auth-box">
          <h2 className="auth-title">Iniciar Sesión</h2>
          <p className="auth-subtitle">
            Accede a tu cuenta para ver tu catálogo
          </p>

          {error && <div className="error-msg">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form" noValidate>
            <div className="form-group">
              <label className="form-label" htmlFor="email">
                Correo electrónico
              </label>
              <input
                id="email"
                name="email"
                type="email"
                className="form-input"
                placeholder="tu@correo.com"
                value={form.email}
                onChange={handleChange}
                required
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password">
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                required
                autoComplete="current-password"
              />
            </div>

            <button type="submit" className="btn-main" disabled={loading}>
              {loading ? "Verificando..." : "Iniciar Sesión"}
            </button>
          </form>

          <p className="auth-switch">
            ¿No tienes cuenta?{" "}
            <button onClick={() => navigate("/register")} className="auth-switch-btn">
              Regístrate aquí
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}