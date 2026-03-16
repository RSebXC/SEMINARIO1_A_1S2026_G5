import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFetch } from '../hooks/useFetch';
import { API_URL, SERVERLESS_URL } from '../utils/config';
import Navbar from '../components/layout/Navbar';
import { UploadCloud, File as FileIcon, Image as ImageIcon, Video, FileText, X } from 'lucide-react';
import { toast } from 'sonner';

export default function Drive() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [files, setFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);

  const { data, loading, execute: fetchFiles } = useFetch(`${API_URL}/files`, { requiresAuth: true });
  const { execute: saveFileToDB } = useFetch('', { manual: true, requiresAuth: true });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) navigate('/login');
  }, [navigate]);

  useEffect(() => {
    if (data) setFiles(data);
  }, [data]);

  const handleFileUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const toastId = toast.loading('Subiendo archivo al almacenamiento en la nube...');

    try {
      let finalUrl = "";

      // PASO 1: FLUJO SERVERLESS (Simulado o Real)
      if (SERVERLESS_URL === "MOCK") {
        // Simulamos el retraso de 2 segundos que tomaría subir S3 / Blob Storage
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Generar una URL falsa dependiendo del tipo de archivo para efectos visuales
        if (file.type.startsWith('image/')) {
          finalUrl = `https://picsum.photos/seed/${Math.random()}/800/600`;
        } else if (file.type.startsWith('video/')) {
          finalUrl = "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";
        } else {
          finalUrl = "https://pdfobject.com/pdf/sample-3pp.pdf"; // URL dummy público que permite iframes
        }
      } else {
        // TODO: Acá iría el fetch real hacia la función Lambda / Azure enviando el formData
        /*
        const formData = new FormData();
        formData.append('file', file);
        const serverlessRes = await fetch(SERVERLESS_URL, { method: 'POST', body: formData });
        const serverlessData = await serverlessRes.json();
        finalUrl = serverlessData.file_url;
        */
      }

      toast.loading('Registrando archivo en Base de Datos...', { id: toastId });

      const payload = {
        file_name: file.name,
        file_type: file.type || "application/octet-stream",
        file_url: finalUrl
      };

      const savedRecord = await saveFileToDB(payload, {
        url: `${API_URL}/files`,
        method: 'POST'
      });

      setFiles([savedRecord, ...files]);
      toast.success('¡Archivo subido exitosamente!', { id: toastId });

    } catch (err) {
      toast.error(err.message || 'Ocurrió un error al subir el archivo', { id: toastId });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const getFileIcon = (fileType) => {
    if (fileType.startsWith('image/')) return <ImageIcon size={48} className="text-blue-500" />;
    if (fileType.startsWith('video/')) return <Video size={48} className="text-purple-500" />;
    if (fileType === 'application/pdf') return <FileText size={48} className="text-red-500" />;
    return <FileIcon size={48} className="text-gray-500" />;
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight">Cloud Drive</h1>

          <button
            onClick={handleFileUploadClick}
            disabled={isUploading}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all font-semibold disabled:opacity-70 disabled:cursor-not-allowed transform hover:-translate-y-0.5"
          >
            {isUploading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <UploadCloud size={20} />
            )}
            {isUploading ? 'Subiendo...' : 'Subir Archivo'}
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        {loading && !files.length ? (
          <div className="flex justify-center mt-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : files.length === 0 ? (
          <div className="text-center bg-white rounded-2xl shadow-sm border border-gray-100 p-20 mt-8 flex flex-col items-center justify-center border-dashed border-2">
            <UploadCloud size={64} className="text-indigo-200 mb-4" />
            <p className="text-gray-500 font-medium text-xl">Tu unidad está vacía</p>
            <p className="text-gray-400 mt-2">Usa el botón "Subir Archivo" para guardar tus documentos, imágenes o videos en la nube.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {files.map((file) => (
              <div
                key={file.id}
                onClick={() => setPreviewFile(file)}
                className="bg-white rounded-xl shadow-sm border border-gray-200 hover:border-indigo-300 hover:shadow-md p-4 transition-all cursor-pointer flex flex-col items-center justify-center text-center group"
              >
                <div className="mb-4 transform group-hover:scale-110 transition-transform duration-300">
                  {getFileIcon(file.file_type)}
                </div>
                <h3 className="w-full text-sm font-medium text-gray-800 truncate" title={file.file_name}>
                  {file.file_name}
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(file.uploaded_at).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* File Preview Modal */}
      {previewFile && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex justify-center items-center z-[200] p-4 sm:p-8 transition-opacity">
          <button
            onClick={() => setPreviewFile(null)}
            className="absolute top-6 right-6 text-white/70 hover:text-white bg-black/50 p-2 rounded-full transition-colors z-[210] shadow-lg"
          >
            <X size={28} />
          </button>

          <div className="w-full max-w-5xl max-h-[90vh] flex flex-col items-center justify-center relative">
            <div className="bg-white/10 p-4 rounded-t-xl w-full text-center text-white truncate max-h-[8vh]">
              <span className="font-semibold text-lg">{previewFile.file_name}</span>
            </div>

            <div className="w-full h-[82vh] bg-black/50 rounded-b-xl flex items-center justify-center overflow-hidden">
              {previewFile.file_type.startsWith('image/') ? (
                <img src={previewFile.file_url} alt={previewFile.file_name} className="max-w-full max-h-full object-contain shadow-2xl" />
              ) : previewFile.file_type.startsWith('video/') ? (
                <video controls src={previewFile.file_url} className="max-w-full max-h-full shadow-2xl" autoPlay />
              ) : (
                <iframe src={previewFile.file_url} className="w-full h-full shadow-2xl bg-white" title={previewFile.file_name} />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
