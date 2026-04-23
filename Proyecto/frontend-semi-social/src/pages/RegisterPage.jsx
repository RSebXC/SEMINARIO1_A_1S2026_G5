import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, IdCard, Upload, Camera } from 'lucide-react';
import { ENDPOINTS } from '../config/api';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Alert from '../components/ui/Alert';
import WebcamCapture from '../components/auth/WebcamCapture';
import ConfirmModal from '../components/auth/ConfirmModal';

export default function RegisterPage() {
  const navigate = useNavigate();
  const fileRef = useRef(null);

  const [form, setForm] = useState({
    nombreCompleto: '',
    email: '',
    dpi: '',
    password: '',
    confirm: '',
  });
  const [foto, setFoto] = useState(null);
  const [fotoPreview, setFotoPreview] = useState(null);
  const [photoMode, setPhotoMode] = useState('upload');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);

  const set = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target.value }));

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFoto(file);
    setFotoPreview(URL.createObjectURL(file));
  };

  const handleWebcam = (blob) => {
    setFoto(blob);
    setFotoPreview(URL.createObjectURL(blob));
    setPhotoMode('upload');
  };

  const validate = () => {
    if (!form.nombreCompleto.trim()) return 'El nombre es obligatorio.';
    if (!form.email.trim()) return 'El correo es obligatorio.';
    if (!form.dpi.trim()) return 'El DPI es obligatorio.';
    if (form.password.length < 6) return 'La contraseña debe tener al menos 6 caracteres.';
    if (form.password !== form.confirm) return 'Las contraseñas no coinciden.';
    if (!foto) return 'La foto de perfil es obligatoria.';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) { setErrorMsg(err); return; }

    setLoading(true);
    setErrorMsg('');
    try {
      const formData = new FormData();
      formData.append('nombreCompleto', form.nombreCompleto);
      formData.append('email', form.email);
      formData.append('dpi', form.dpi);
      formData.append('password', form.password);
      formData.append('foto', foto, 'foto_perfil.jpg');

      const res = await fetch(ENDPOINTS.REGISTER, { method: 'POST', body: formData });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || data.error || 'Error al registrar');

      setShowConfirm(true);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmSuccess = () => {
    setShowConfirm(false);
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#18191a] flex items-center justify-center p-4 py-10">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-[#1877f2] rounded-full shadow-lg shadow-[#1877f2]/30 mb-4">
            <span className="text-white font-bold text-2xl">S</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Crear cuenta</h1>
          <p className="text-[#b0b3b8] text-sm mt-1">Únete a SemiSocial hoy</p>
        </div>

        {/* Card */}
        <div className="bg-[#242526] rounded-2xl border border-[#3e4042] p-6 shadow-2xl">
          {errorMsg && (
            <Alert type="error" message={errorMsg} onClose={() => setErrorMsg('')} />
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-3">
            {/* Foto de perfil */}
            <div>
              <p className="text-sm font-medium text-[#b0b3b8] mb-2">
                Foto de perfil <span className="text-[#f02849]">*</span>
              </p>

              {/* Preview */}
              {fotoPreview && (
                <div className="flex justify-center mb-3">
                  <img
                    src={fotoPreview}
                    alt="Preview"
                    className="w-24 h-24 rounded-full object-cover border-2 border-[#1877f2]"
                  />
                </div>
              )}

              {/* Tabs upload/webcam */}
              <div className="flex rounded-xl bg-[#18191a] p-1 mb-3">
                {['upload', 'webcam'].map((m) => (
                  <button
                    type="button"
                    key={m}
                    onClick={() => setPhotoMode(m)}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1 ${photoMode === m
                      ? 'bg-[#1877f2] text-white'
                      : 'text-[#8a8d91] hover:text-[#e4e6eb]'
                      }`}
                  >
                    {m === 'upload' ? <><Upload size={12} /> Subir archivo</> : <><Camera size={12} /> Webcam</>}
                  </button>
                ))}
              </div>

              {photoMode === 'upload' ? (
                <>
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
                  <Button
                    type="button"
                    variant="secondary"
                    fullWidth
                    onClick={() => fileRef.current?.click()}
                  >
                    <Upload size={16} />
                    {fotoPreview ? 'Cambiar imagen' : 'Seleccionar imagen'}
                  </Button>
                </>
              ) : (
                <WebcamCapture onCapture={handleWebcam} onCancel={() => setPhotoMode('upload')} />
              )}
            </div>

            <Input
              label="Nombre completo"
              id="reg-nombre"
              placeholder="Juan Pérez"
              icon={User}
              value={form.nombreCompleto}
              onChange={set('nombreCompleto')}
              required
            />
            <Input
              label="Correo electrónico"
              id="reg-email"
              type="email"
              placeholder="correo@ejemplo.com"
              icon={Mail}
              value={form.email}
              onChange={set('email')}
              required
            />
            <Input
              label="DPI"
              id="reg-dpi"
              placeholder="0000 00000 0101"
              icon={IdCard}
              value={form.dpi}
              onChange={set('dpi')}
              required
            />
            <Input
              label="Contraseña"
              id="reg-password"
              type="password"
              placeholder="Mínimo 6 caracteres"
              icon={Lock}
              value={form.password}
              onChange={set('password')}
              required
            />
            <Input
              label="Repetir contraseña"
              id="reg-confirm"
              type="password"
              placeholder="Repite tu contraseña"
              icon={Lock}
              value={form.confirm}
              onChange={set('confirm')}
              required
            />

            <Button type="submit" loading={loading} fullWidth size="lg">
              Crear cuenta
            </Button>
          </form>

          <div className="border-t border-[#3e4042] mt-6 pt-5 text-center">
            <p className="text-sm text-[#b0b3b8]">
              ¿Ya tienes cuenta?{' '}
              <Link to="/login" className="text-[#1877f2] font-semibold hover:underline">
                Inicia sesión
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Modal de confirmación de código */}
      <ConfirmModal
        isOpen={showConfirm}
        email={form.email}
        onSuccess={handleConfirmSuccess}
        onClose={() => setShowConfirm(false)}
      />
    </div>
  );
}
