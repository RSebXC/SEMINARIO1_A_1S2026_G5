import { useState } from "react";
import { useApp } from "../../context/AppContext";
import { MOCK_MOVIES } from "../../data/mockData";
import "./Profile.css";

export default function Profile() {
  const { user, updateUser, playlist, showToast } = useApp();

  const [form, setForm] = useState({
    nombre:      user.nombre,
    passwordAct: "",
    passwordNew: "",
  });
  const [avatar,   setAvatar]   = useState(user.foto_perfil);
  const [editing,  setEditing]  = useState(false);
  const [success,  setSuccess]  = useState(false);
  const [error,    setError]    = useState("");

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

    if (!form.passwordAct) {
      setError("Debes ingresar tu contraseña actual para guardar cambios");
      return;
    }

    // Aquí iría la llamada al backend real
    updateUser({ ...user, nombre: form.nombre, foto_perfil: avatar });
    setSuccess(true);
    setEditing(false);
    setForm((prev) => ({ ...prev, passwordAct: "", passwordNew: "" }));
    showToast("Perfil actualizado correctamente 🎉");
    setTimeout(() => setSuccess(false), 4000);
  };

  const totalDisponibles = MOCK_MOVIES.filter(
    (m) => m.estado === "Disponible"
  ).length;

  return (
    <main className="profile-page">
      <div className="profile-wrap">

        {/* ── TARJETA HERO ── */}
        <div className="profile-hero-card">
          {/* Avatar con botón editar foto */}
          <div className="avatar-container">
            <img src={avatar} alt={user.nombre} className="profile-avatar" />
            {editing && (
              <label className="avatar-edit-btn" title="Cambiar foto">
                ✏️
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFile}
                  style={{ display: "none" }}
                />
              </label>
            )}
          </div>

          <div className="profile-hero-info">
            <h1 className="profile-name">{user.nombre}</h1>
            <p className="profile-email">{user.email}</p>

            <div className="profile-stats">
              <div className="stat-item">
                <span className="stat-num">{playlist.length}</span>
                <span className="stat-label">En mi lista</span>
              </div>
              <div className="stat-divider" />
              <div className="stat-item">
                <span className="stat-num">{totalDisponibles}</span>
                <span className="stat-label">Disponibles</span>
              </div>
              <div className="stat-divider" />
              <div className="stat-item">
                <span className="stat-num">12</span>
                <span className="stat-label">Total títulos</span>
              </div>
            </div>
          </div>

          {!editing && (
            <button
              className="btn-edit-trigger"
              onClick={() => setEditing(true)}
            >
              ✏️ Editar perfil
            </button>
          )}
        </div>

        {/* ── FORMULARIO EDICIÓN ── */}
        <div className="profile-form-card">
          <h2 className="form-card-title">
            {editing ? "Editar Información" : "Información de Cuenta"}
          </h2>

          {success && (
            <div className="success-msg">✅ Cambios guardados correctamente</div>
          )}
          {error && (
            <div className="error-msg">⚠️ {error}</div>
          )}

          {editing ? (
            <form onSubmit={handleSubmit} className="profile-form" noValidate>
              <div className="profile-form-row">
                <div className="form-group">
                  <label className="form-label" htmlFor="nombre">
                    Nombre completo
                  </label>
                  <input
                    id="nombre" name="nombre" type="text"
                    className="form-input"
                    value={form.nombre} onChange={handleChange} required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Correo electrónico</label>
                  <input
                    type="email"
                    className="form-input"
                    value={user.email}
                    disabled
                  />
                  <small className="form-hint">El correo no se puede modificar</small>
                </div>
              </div>

              <div className="profile-form-row">
                <div className="form-group">
                  <label className="form-label" htmlFor="passwordAct">
                    Contraseña actual <span className="required">*</span>
                  </label>
                  <input
                    id="passwordAct" name="passwordAct" type="password"
                    className="form-input"
                    placeholder="Requerida para guardar cambios"
                    value={form.passwordAct} onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="passwordNew">
                    Nueva contraseña
                  </label>
                  <input
                    id="passwordNew" name="passwordNew" type="password"
                    className="form-input"
                    placeholder="Opcional – dejar vacío si no cambias"
                    value={form.passwordNew} onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-save">
                  Guardar Cambios
                </button>
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => {
                    setEditing(false);
                    setError("");
                    setAvatar(user.foto_perfil);
                    setForm({
                      nombre: user.nombre,
                      passwordAct: "",
                      passwordNew: "",
                    });
                  }}
                >
                  Cancelar
                </button>
              </div>
            </form>
          ) : (
            /* Vista solo lectura */
            <div className="profile-readonly">
              <div className="readonly-row">
                <div className="readonly-field">
                  <span className="readonly-label">Nombre</span>
                  <span className="readonly-value">{user.nombre}</span>
                </div>
                <div className="readonly-field">
                  <span className="readonly-label">Correo</span>
                  <span className="readonly-value">{user.email}</span>
                </div>
              </div>
              <div className="readonly-row">
                <div className="readonly-field">
                  <span className="readonly-label">Contraseña</span>
                  <span className="readonly-value">••••••••</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}