import { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useFetch } from '../hooks/useFetch';
import { toast } from 'sonner';
import { API_URL, SERVERLESS_URL } from '../utils/config';
import { UploadCloud } from 'lucide-react';

export default function Register() {
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [profileImage, setProfileImage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const { execute, loading } = useFetch('', { 
    manual: true,
    requiresAuth: false
  });

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setProfileImage(file);
    } else if (file) {
      toast.error("Por favor, selecciona una imagen válida.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.username || !formData.email || !formData.password) {
      toast.error('Revisa los campos obligatorios');
      return;
    }

    setIsUploading(true);
    let finalProfileUrl = "";
    const toastId = toast.loading('Procesando registro...');

    try {
      // PASO 1: Subir imagen si existe utilizando el flujo Serverless
      if (profileImage) {
        toast.loading('Subiendo imagen de perfil a la nube...', { id: toastId });
        
        if (SERVERLESS_URL === "MOCK") {
          // Simulamos el retraso de subida al Bucket / Blob Storage
          await new Promise(resolve => setTimeout(resolve, 2000));
          finalProfileUrl = `https://picsum.photos/seed/${formData.username}/200/200`;
        } else {
          // TODO: Fetch real hacia Lambda / Azure (Listos para cuando integren!)
          /*
          const imgData = new FormData();
          imgData.append('file', profileImage);
          const serverlessRes = await fetch(SERVERLESS_URL, { method: 'POST', body: imgData });
          const resJson = await serverlessRes.json();
          finalProfileUrl = resJson.file_url;
          */
        }
      }

      // PASO 2: Registrar usuario en nuestro backend MySQL enviándole la URL final
      toast.loading('Creando cuenta en la base de datos...', { id: toastId });
      
      const payload = {
        ...formData,
        profile_picture_url: finalProfileUrl || null
      };

      await execute(payload, { 
        url: `${API_URL}/auth/register`, 
        method: 'POST' 
      });
      
      toast.success('Cuenta creada! Ahora debés iniciar sesión.', { id: toastId });
      navigate('/login');
    } catch (err) {
      toast.error(err.message || 'El usuario o correo ya existe', { id: toastId });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg border border-gray-100">
        <div>
          <h2 className="mt-2 text-center text-3xl font-extrabold text-gray-900">
            Crea tu cuenta libre
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Unite a la comunidad de TaskFlow
          </p>
        </div>
        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          <input
            type="text"
            required
            className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
            placeholder="Nombre de Usuario (Obligatorio)"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
          />
          <input
            type="email"
            required
            className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
            placeholder="Correo Electrónico (Obligatorio)"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
          <input
            type="password"
            required
            className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
            placeholder="Contraseña (Obligatorio)"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          />
          
          <div className="pt-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Foto de Perfil (Opcional)</label>
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 rounded-md p-4 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors"
            >
              <UploadCloud className="mx-auto h-8 w-8 text-gray-400 mb-2" />
              <span className="text-sm text-gray-600 font-medium truncate px-2 block">
                {profileImage ? profileImage.name : "Subir imagen desde equipo"}
              </span>
              <p className="text-xs text-gray-400 mt-1">Sube directo a S3/Blob Serverless</p>
              <input 
                type="file" 
                ref={fileInputRef}
                accept="image/*"
                onChange={handleImageChange}
                className="hidden" 
              />
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading || isUploading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 transition-colors shadow-md"
            >
              {loading || isUploading ? 'Procesando...' : 'Registrarme ahora'}
            </button>
          </div>
        </form>
        <div className="flex justify-center mt-4">
          <Link to="/login" className="text-sm font-medium text-gray-500 hover:text-gray-900 underline underline-offset-2">
            Volver atrás
          </Link>
        </div>
      </div>
    </div>
  );
}
