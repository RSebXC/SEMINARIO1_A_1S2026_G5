import { useState, useEffect, useRef } from 'react';
import { Camera, Upload, Save, User, Mail, IdCard, Lock, Loader } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ENDPOINTS, S3_BASE } from '../config/api';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Alert from '../components/ui/Alert';
import Avatar from '../components/ui/Avatar';
import WebcamCapture from '../components/auth/WebcamCapture';

export default function ProfilePage() {
  const { user, fotoPerfil, updateFotoPerfil, updateUser } = useAuth();
  const fileRef = useRef(null);

  const [form, setForm] = useState({
    nombre: user?.nombre || '',
    dpi: user?.dpi || '',
    email: user?.email || '',
    password: '',
  });
  const [foto, setFoto] = useState(null);
  const [fotoPreview, setFotoPreview] = useState(null);
  const [photoMode, setPhotoMode] = useState('upload');
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(ENDPOINTS.PROFILE, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        const data = await res.json().catch(() => ({}));
        if (res.ok) {
          setForm({
            nombre: data.nombre_completo || user?.nombre || '',
            dpi: data.dpi || user?.dpi || '',
            email: data.email || user?.email || '',
            password: '',
          });
          if (data.foto_perfil_url) {
            updateFotoPerfil(data.foto_perfil_url);
          }
        }
      } catch {
        // Usar datos del contexto si falla
      } finally {
        setLoadingData(false);
      }
    };
    fetchProfile();
  }, []);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.password) { setErrorMsg('Debes ingresar tu contraseña para guardar cambios.'); return; }

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    const buildFormData = () => {
      const fd = new FormData();
      fd.append('password', form.password);
      fd.append('nombreCompleto', form.nombre);
      fd.append('dpi', form.dpi);
      if (foto) fd.append('foto', foto, 'foto_perfil.jpg');
      return fd;
    };

    try {
      const accessToken = localStorage.getItem('token');
      const idToken = localStorage.getItem('idToken');
      const tokenToUse = idToken || accessToken;

      let res = await fetch(ENDPOINTS.PROFILE, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${tokenToUse}` },
        body: buildFormData(),
      });

      if (!res.ok && idToken && idToken !== accessToken) {
        const bodyText = await res.text();
        if (bodyText.includes('Invalid') || res.status === 401) {
          res = await fetch(ENDPOINTS.PROFILE, {
            method: 'PUT',
            headers: { Authorization: `Bearer ${accessToken}` },
            body: buildFormData(),
          });
        } else {
          const data = JSON.parse(bodyText || '{}');
          throw new Error(data.message || data.error || `Error ${res.status}`);
        }
      }

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || data.error || `Error ${res.status}: ${JSON.stringify(data)}`);

      updateUser({ nombre: form.nombre, dpi: form.dpi });
      const nuevaFoto = data.fotoPerfil || data.foto_perfil_url;
      if (nuevaFoto) updateFotoPerfil(nuevaFoto);

      setSuccessMsg('¡Perfil actualizado correctamente!');
      setForm((p) => ({ ...p, password: '' }));
      setFoto(null);
      setFotoPreview(null);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className="flex justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <Loader size={32} className="animate-spin text-[#1877f2]" />
          <p className="text-sm text-[#b0b3b8]">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto pb-10">
      {/* Header de perfil */}
      <div className="bg-[#242526] rounded-xl border border-[#3e4042] p-6 mb-4">
        <div className="flex flex-col items-center gap-4">
          {/* Avatar grande */}
          <div className="relative">
            <Avatar
              src={fotoPreview || fotoPerfil}
              name={form.nombre}
              size="xl"
              className="ring-4 ring-[#1877f2]/30"
            />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="absolute bottom-0 right-0 w-8 h-8 bg-[#1877f2] rounded-full flex items-center justify-center shadow-lg hover:bg-[#1464d0] transition-colors"
            >
              <Camera size={15} className="text-white" />
            </button>
          </div>
          <div className="text-center">
            <h1 className="text-xl font-bold text-[#e4e6eb]">{form.nombre || 'Mi Perfil'}</h1>
            <p className="text-sm text-[#8a8d91]">{form.email}</p>
          </div>
        </div>
      </div>

      {/* Formulario de edición */}
      <div className="bg-[#242526] rounded-xl border border-[#3e4042] p-6">
        <h2 className="text-base font-semibold text-[#e4e6eb] mb-4">Editar información</h2>

        {successMsg && (
          <Alert type="success" message={successMsg} onClose={() => setSuccessMsg('')} autoDismiss={4000} />
        )}
        {errorMsg && (
          <Alert type="error" message={errorMsg} onClose={() => setErrorMsg('')} />
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-4">
          {/* Foto */}
          <div>
            <p className="text-sm font-medium text-[#b0b3b8] mb-2">Foto de perfil</p>
            <div className="flex rounded-xl bg-[#18191a] p-1 mb-3">
              {['upload', 'webcam'].map((m) => (
                <button
                  type="button" key={m} onClick={() => setPhotoMode(m)}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1 ${photoMode === m ? 'bg-[#1877f2] text-white' : 'text-[#8a8d91] hover:text-[#e4e6eb]'
                    }`}
                >
                  {m === 'upload' ? <><Upload size={12} /> Archivo</> : <><Camera size={12} /> Webcam</>}
                </button>
              ))}
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
            {photoMode === 'upload' ? (
              <Button type="button" variant="secondary" fullWidth onClick={() => fileRef.current?.click()}>
                <Upload size={16} />
                {foto ? 'Cambiar imagen seleccionada' : 'Seleccionar nueva foto'}
              </Button>
            ) : (
              <WebcamCapture onCapture={handleWebcam} onCancel={() => setPhotoMode('upload')} />
            )}
          </div>

          <Input label="Nombre completo" id="p-nombre" placeholder="Tu nombre" icon={User}
            value={form.nombre} onChange={set('nombre')} />

          <Input label="DPI" id="p-dpi" placeholder="DPI" icon={IdCard}
            value={form.dpi} onChange={set('dpi')} />

          <Input label="Correo electrónico" id="p-email" type="email" icon={Mail}
            value={form.email} disabled
            className="opacity-60 cursor-not-allowed" />

          <div className="border-t border-[#3e4042] pt-4">
            <Input label="Contraseña actual (requerida para guardar)" id="p-password"
              type="password" placeholder="••••••••" icon={Lock}
              value={form.password} onChange={set('password')} required />
          </div>

          <Button type="submit" loading={loading} fullWidth size="lg">
            <Save size={16} /> Guardar cambios
          </Button>
        </form>
      </div>
    </div>
  );
}
