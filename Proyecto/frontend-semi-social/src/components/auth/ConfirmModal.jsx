import { useState } from 'react';
import { MailCheck } from 'lucide-react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';
import Alert from '../ui/Alert';
import { ENDPOINTS } from '../../config/api';

export default function ConfirmModal({ isOpen, email, onSuccess, onClose }) {
  const [codigo, setCodigo] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!codigo.trim()) return;

    setLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch(ENDPOINTS.CONFIRM, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, codigo }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.message || data.error || 'Código incorrecto');
      }

      onSuccess();
    } catch (err) {
      setErrorMsg(err.message || 'Error al confirmar. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Verificar correo electrónico">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col items-center gap-2 py-2">
          <div className="w-14 h-14 bg-[#1877f2]/15 rounded-full flex items-center justify-center">
            <MailCheck size={28} className="text-[#1877f2]" />
          </div>
          <p className="text-sm text-[#b0b3b8] text-center">
            Te enviamos un código a <strong className="text-[#e4e6eb]">{email}</strong>.
            Ingrésalo para activar tu cuenta.
          </p>
        </div>

        {errorMsg && (
          <Alert type="error" message={errorMsg} onClose={() => setErrorMsg('')} />
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Código de verificación"
            id="confirm-code"
            placeholder="Ej: 123456"
            value={codigo}
            onChange={(e) => setCodigo(e.target.value)}
            maxLength={10}
            autoFocus
          />
          <Button type="submit" loading={loading} fullWidth disabled={!codigo.trim()}>
            Verificar cuenta
          </Button>
        </form>
      </div>
    </Modal>
  );
}
