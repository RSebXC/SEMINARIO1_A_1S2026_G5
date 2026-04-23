import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

const VARIANTS = {
  success: { icon: CheckCircle, bg: 'bg-[#42b72a]/15', border: 'border-[#42b72a]/30', text: 'text-[#42b72a]' },
  error: { icon: XCircle, bg: 'bg-[#f02849]/15', border: 'border-[#f02849]/30', text: 'text-[#f02849]' },
  warning: { icon: AlertTriangle, bg: 'bg-[#f7b928]/15', border: 'border-[#f7b928]/30', text: 'text-[#f7b928]' },
  info: { icon: Info, bg: 'bg-[#1877f2]/15', border: 'border-[#1877f2]/30', text: 'text-[#1877f2]' },
};

/**
 * Alerta de notificación.
 * @param {'success'|'error'|'warning'|'info'} type
 * @param {number} autoDismiss  
 */
export default function Alert({ type = 'info', message, onClose, autoDismiss = 0 }) {
  const { icon: Icon, bg, border, text } = VARIANTS[type] || VARIANTS.info;

  useEffect(() => {
    if (!autoDismiss || !onClose) return;
    const t = setTimeout(onClose, autoDismiss);
    return () => clearTimeout(t);
  }, [autoDismiss, onClose]);

  if (!message) return null;

  return (
    <div className={`flex items-start gap-3 rounded-lg border px-4 py-3 ${bg} ${border}`}>
      <Icon size={18} className={`flex-shrink-0 mt-0.5 ${text}`} />
      <p className={`text-sm flex-1 ${text}`}>{message}</p>
      {onClose && (
        <button onClick={onClose} className={`flex-shrink-0 ${text} opacity-70 hover:opacity-100`}>
          <X size={15} />
        </button>
      )}
    </div>
  );
}
