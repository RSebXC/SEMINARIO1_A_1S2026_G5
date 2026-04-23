import { useRef, useEffect, useCallback, useState } from 'react';
import { Camera, RefreshCw } from 'lucide-react';
import Button from '../ui/Button';

/**
 * Componente de captura por webcam.
 * @param {(blob: Blob) => void} onCapture
 * @param {() => void} onCancel
 */
export default function WebcamCapture({ onCapture, onCancel }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const [preview, setPreview] = useState(null);
  const [ready, setReady] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    let active = true;
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: 'user' }, audio: false })
      .then((stream) => {
        if (!active) { stream.getTracks().forEach(t => t.stop()); return; }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => setReady(true);
        }
      })
      .catch(() => setErrorMsg('No se pudo acceder a la cámara. Verifica los permisos.'));

    return () => {
      active = false;
      streamRef.current?.getTracks().forEach(t => t.stop());
    };
  }, []);

  const takePicture = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);

    canvas.toBlob((blob) => {
      if (!blob) return;
      setPreview(URL.createObjectURL(blob));
      streamRef.current?.getTracks().forEach(t => t.stop());
    }, 'image/jpeg', 0.9);
  }, []);

  const retake = useCallback(() => {
    setPreview(null);
    setReady(false);
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: 'user' }, audio: false })
      .then((stream) => {
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => setReady(true);
        }
      });
  }, []);

  const confirmPhoto = useCallback(() => {
    const canvas = canvasRef.current;
    canvas?.toBlob((blob) => blob && onCapture(blob), 'image/jpeg', 0.9);
  }, [onCapture]);

  if (errorMsg) {
    return (
      <div className="flex flex-col items-center gap-4 p-6 text-center">
        <p className="text-[#f02849] text-sm">{errorMsg}</p>
        <Button variant="secondary" onClick={onCancel}>Cancelar</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-full max-w-sm aspect-video bg-black rounded-xl overflow-hidden">
        {!preview ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
        ) : (
          <img src={preview} alt="Preview" className="w-full h-full object-cover" />
        )}
        {!preview && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-40 h-40 rounded-full border-2 border-dashed border-white/50" />
          </div>
        )}
      </div>

      <canvas ref={canvasRef} className="hidden" />

      <div className="flex gap-3 w-full max-w-sm">
        {!preview ? (
          <>
            <Button variant="secondary" fullWidth onClick={onCancel}>
              Cancelar
            </Button>
            <Button fullWidth onClick={takePicture} disabled={!ready}>
              <Camera size={16} /> Capturar
            </Button>
          </>
        ) : (
          <>
            <Button variant="secondary" fullWidth onClick={retake}>
              <RefreshCw size={16} /> Repetir
            </Button>
            <Button fullWidth onClick={confirmPhoto}>
              <Camera size={16} /> Usar foto
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
