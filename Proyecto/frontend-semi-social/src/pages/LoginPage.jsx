import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Camera, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ENDPOINTS } from '../config/api';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Alert from '../components/ui/Alert';
import WebcamCapture from '../components/auth/WebcamCapture';

export default function LoginPage() {
  const { login }  = useAuth();
  const navigate   = useNavigate();

  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [loading,  setLoading]  = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [mode,     setMode]     = useState('credentials');
  const [facialEmail, setFacialEmail] = useState('');
  const [facialLoading, setFacialLoading] = useState(false);
  const [showWebcam, setShowWebcam] = useState(false);

  const handleCredentials = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    try {
      const res  = await fetch(ENDPOINTS.LOGIN, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || data.error || 'Credenciales incorrectas');
      login(data);
      navigate('/');
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFacialCapture = async (blob) => {
    if (!facialEmail.trim()) {
      setErrorMsg('Ingresa tu correo antes de usar el reconocimiento facial.');
      setShowWebcam(false);
      return;
    }
    setShowWebcam(false);
    setFacialLoading(true);
    setErrorMsg('');
    try {
      const formData = new FormData();
      formData.append('email', facialEmail);
      formData.append('foto', blob, 'foto.jpg');

      const res  = await fetch(ENDPOINTS.LOGIN_FACIAL, {
        method: 'POST',
        body:   formData,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || data.error || 'No se reconoció el rostro');
      login(data);
      navigate('/');
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setFacialLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#18191a] flex items-center justify-center p-4">
      <div className="w-full max-w-4xl flex flex-col lg:flex-row items-center gap-10">

        <div className="flex-1 text-center lg:text-left">
          <div className="flex items-center gap-3 justify-center lg:justify-start mb-4">
            <div className="w-12 h-12 bg-[#1877f2] rounded-full flex items-center justify-center shadow-lg shadow-[#1877f2]/30">
              <span className="text-white font-bold text-2xl">S</span>
            </div>
            <h1 className="text-3xl font-bold text-white">
              Semi<span className="text-[#1877f2]">Social</span>
            </h1>
          </div>
          <p className="text-[#b0b3b8] text-lg leading-relaxed max-w-sm mx-auto lg:mx-0">
            Conecta con tus amigos, comparte momentos y mantén conversaciones en tiempo real.
          </p>
        </div>

        <div className="w-full max-w-sm">
          <div className="bg-[#242526] rounded-2xl border border-[#3e4042] p-6 shadow-2xl">
            <div className="flex rounded-xl bg-[#18191a] p-1 mb-6">
              {['credentials', 'facial'].map((m) => (
                <button
                  key={m}
                  onClick={() => { setMode(m); setErrorMsg(''); setShowWebcam(false); }}
                  className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors ${
                    mode === m
                      ? 'bg-[#1877f2] text-white shadow'
                      : 'text-[#8a8d91] hover:text-[#e4e6eb]'
                  }`}
                >
                  {m === 'credentials' ? 'Contraseña' : <><i className="bi bi-camera"></i> Facial</>}
                </button>
              ))}
            </div>

            {errorMsg && (
              <Alert
                type="error"
                message={errorMsg}
                onClose={() => setErrorMsg('')}
                autoDismiss={5000}
              />
            )}

            {mode === 'credentials' && (
              <form onSubmit={handleCredentials} className="flex flex-col gap-4 mt-4">
                <Input
                  label="Correo electrónico"
                  id="login-email"
                  type="email"
                  placeholder="correo@ejemplo.com"
                  icon={Mail}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <Input
                  label="Contraseña"
                  id="login-password"
                  type="password"
                  placeholder="••••••••"
                  icon={Lock}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <Button type="submit" loading={loading} fullWidth size="lg">
                  Iniciar sesión
                </Button>
              </form>
            )}

            {mode === 'facial' && !showWebcam && (
              <div className="flex flex-col gap-4 mt-4">
                <Input
                  label="Correo electrónico"
                  id="facial-email"
                  type="email"
                  placeholder="correo@ejemplo.com"
                  icon={Mail}
                  value={facialEmail}
                  onChange={(e) => setFacialEmail(e.target.value)}
                />
                <Button
                  fullWidth
                  size="lg"
                  onClick={() => { setErrorMsg(''); setShowWebcam(true); }}
                  loading={facialLoading}
                >
                  <Camera size={18} />
                  Iniciar reconocimiento facial
                </Button>
                <p className="text-xs text-[#8a8d91] text-center">
                  Ingresa tu correo y activa la cámara para identificarte.
                </p>
              </div>
            )}

            {mode === 'facial' && showWebcam && (
              <div className="mt-4">
                <WebcamCapture
                  onCapture={handleFacialCapture}
                  onCancel={() => setShowWebcam(false)}
                />
              </div>
            )}

            <div className="border-t border-[#3e4042] mt-6 pt-5 text-center">
              <p className="text-sm text-[#b0b3b8]">
                ¿No tienes cuenta?{' '}
                <Link to="/register" className="text-[#1877f2] font-semibold hover:underline">
                  Regístrate
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
