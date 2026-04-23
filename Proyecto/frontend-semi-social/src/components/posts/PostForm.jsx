import { useState, useRef } from 'react';
import { Image, X, Send } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ENDPOINTS } from '../../config/api';
import Avatar from '../ui/Avatar';
import Button from '../ui/Button';
import Alert from '../ui/Alert';

/**
 * Formulario para crear una nueva publicación.
 * @param {() => void} onCreated 
 */
export default function PostForm({ onCreated }) {
  const { user, fotoPerfil } = useAuth();

  const [descripcion, setDescripcion] = useState('');
  const [imagen, setImagen] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fileRef = useRef(null);

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImagen(file);
    setPreview(URL.createObjectURL(file));
  };

  const clearImage = () => {
    setImagen(null);
    setPreview(null);
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!imagen) { setErrorMsg('La imagen es obligatoria para publicar.'); return; }

    setLoading(true);
    setErrorMsg('');
    try {
      const formData = new FormData();
      formData.append('descripcion', descripcion);
      formData.append('imagen', imagen);

      const res = await fetch(ENDPOINTS.POSTS, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: formData,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || data.error || 'Error al publicar');

      setDescripcion('');
      clearImage();
      onCreated?.();
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#242526] rounded-xl border border-[#3e4042] p-4">
      {errorMsg && (
        <Alert type="error" message={errorMsg} onClose={() => setErrorMsg('')} />
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        {/* Input superior */}
        <div className="flex items-start gap-3">
          <Avatar src={fotoPerfil} name={user?.nombre || ''} size="md" />
          <textarea
            placeholder={`¿Qué estás pensando, ${user?.nombre?.split(' ')[0] || 'usuario'}?`}
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            rows={3}
            className="flex-1 bg-[#3a3b3c] text-[#e4e6eb] placeholder:text-[#8a8d91] rounded-xl px-4 py-2.5 text-sm resize-none outline-none focus:ring-1 focus:ring-[#1877f2] transition-all"
          />
        </div>

        {/* Preview de imagen */}
        {preview && (
          <div className="relative rounded-xl overflow-hidden bg-black max-h-64">
            <img src={preview} alt="Preview" className="w-full max-h-64 object-contain" />
            <button
              type="button"
              onClick={clearImage}
              className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1 hover:bg-black/80 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Acciones */}
        <div className="flex items-center justify-between pt-1 border-t border-[#3e4042]">
          <div className="flex gap-2">
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-[#45bd62] hover:bg-[#45bd62]/10 transition-colors"
            >
              <Image size={18} />
              <span className="hidden sm:inline">Foto</span>
            </button>
          </div>
          <Button type="submit" loading={loading} size="sm" disabled={!imagen}>
            <Send size={15} /> Publicar
          </Button>
        </div>
      </form>
    </div>
  );
}
