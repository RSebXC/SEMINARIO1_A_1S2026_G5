import { useState } from 'react';
import { Languages, ChevronDown } from 'lucide-react';
import { ENDPOINTS, LANGUAGES } from '../../config/api';

/**
 * Botón de traducción inline para texto de publicación o comentario.
 * @param {string} originalText  - Texto original a traducir
 * @param {string} postId        - ID de la publicación (para el endpoint)
 */
export default function TranslateButton({ originalText, postId }) {
  const [translated,   setTranslated]   = useState('');
  const [targetLang,   setTargetLang]   = useState('');
  const [loading,      setLoading]      = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [errorMsg,     setErrorMsg]     = useState('');

  const handleTranslate = async (langCode, langLabel) => {
    setShowDropdown(false);
    setLoading(true);
    setErrorMsg('');
    setTargetLang(langLabel);

    try {
      const res = await fetch(ENDPOINTS.TRANSLATE, {
        method:  'POST',
        headers: {
          'Content-Type':  'application/json',
          'Authorization': `Bearer ${localStorage.getItem('idToken') || localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          texto:          originalText,
          idiomaDestino:  langCode,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || 'Error al traducir');
      // El backend devuelve: { textoOriginal, textoTraducido, idiomaDestino }
      setTranslated(data.textoTraducido || '');
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-1">
      <div className="relative inline-block">
        <button
          onClick={() => setShowDropdown((v) => !v)}
          className="flex items-center gap-1 text-xs text-[#1877f2] hover:underline transition-colors"
        >
          <Languages size={13} />
          {loading ? 'Traduciendo...' : 'Traducir'}
          <ChevronDown size={12} />
        </button>

        {showDropdown && (
          <div className="absolute left-0 top-6 z-20 bg-[#3a3b3c] border border-[#3e4042] rounded-lg shadow-xl py-1 min-w-36">
            {LANGUAGES.map(({ code, label }) => (
              <button
                key={code}
                onClick={() => handleTranslate(code, label)}
                className="w-full text-left px-3 py-2 text-sm text-[#e4e6eb] hover:bg-[#3e4042] transition-colors"
              >
                {label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Texto traducido */}
      {translated && !loading && (
        <div className="mt-2 p-3 bg-[#1877f2]/10 border border-[#1877f2]/20 rounded-lg">
          <p className="text-xs text-[#8a8d91] mb-1 font-medium"><i className="bi bi-globe"></i> {targetLang}</p>
          <p className="text-sm text-[#e4e6eb]">{translated}</p>
          <button
            onClick={() => { setTranslated(''); setTargetLang(''); }}
            className="text-xs text-[#8a8d91] hover:text-[#e4e6eb] mt-1"
          >
            Ocultar
          </button>
        </div>
      )}

      {errorMsg && (
        <p className="text-xs text-[#f02849] mt-1">{errorMsg}</p>
      )}
    </div>
  );
}
