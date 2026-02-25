import axios from 'axios';

const API_URL = 'http://54.165.29.42:3000/';

// URL base pública del bucket de imágenes
export const S3_IMAGES_BASE = 'https://practica1-images-g5.s3.us-east-1.amazonaws.com';

/**
 * Recibe el valor de foto_perfil que llega del backend y devuelve una URL usable.
 * Casos posibles:
 *   null / undefined / ""           → null (sin foto)
 *   "Fotos_Perfil/uuid.jpg"         → URL completa con S3_IMAGES_BASE
 *   "undefined/Fotos_Perfil/..."    → recorta el "undefined/" y construye bien
 *   "https://..."                   → ya es URL completa, se retorna tal cual
 */
export const resolvePhoto = (foto_perfil) => {
  if (!foto_perfil) return null;
  if (foto_perfil.startsWith('http')) {
    // Si contiene "undefined/" en la URL, lo limpiamos
    return foto_perfil.replace(/https?:\/\/[^/]+\/undefined\//, `${S3_IMAGES_BASE}/`);
  }
  // Es solo la key: "Fotos_Perfil/uuid.jpg"
  const cleanKey = foto_perfil.replace(/^undefined\//, '');
  return `${S3_IMAGES_BASE}/${cleanKey}`;
};

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor: adjunta token si existe en localStorage
api.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  if (user.id) {
    config.headers['user-id'] = user.id;
  }
  if (user.token) {
    config.headers['Authorization'] = `Bearer ${user.token}`;
  }
  return config;
});

// ─────────────────────────────────────────────
// AUTH
// ─────────────────────────────────────────────

export const register = async (userData) => {
  const formData = new FormData();
  formData.append('email',            userData.email);
  formData.append('password',         userData.password);
  formData.append('confirm_password', userData.confirm_password);
  formData.append('nombre_completo',  userData.nombre_completo);
  if (userData.foto_perfil instanceof File) {
    formData.append('foto_perfil', userData.foto_perfil);
  }
  const response = await api.post('/register', formData, {
    headers: { 'Content-Type': undefined },
  });
  const data = response.data;
  return { ...data, foto_perfil: resolvePhoto(data.foto_perfil) };
};

export const login = async (credentials) => {
  const response = await api.post('/login', credentials);
  const data = response.data;
  if (data.user?.foto_perfil) {
    data.user.foto_perfil = resolvePhoto(data.user.foto_perfil);
  }
  return data;
};

// ─────────────────────────────────────────────
// PELÍCULAS
// ─────────────────────────────────────────────

export const getMovies = async () => {
  const response = await api.get('/movies');
  return response.data.items ?? response.data;
};

// ─────────────────────────────────────────────
// PLAYLIST
// ─────────────────────────────────────────────

export const getPlaylist = async () => {
  const response = await api.get('/playlist');
  return response.data.items ?? response.data;
};

export const addToPlaylist = async (_userId, movieId) => {
  const response = await api.post('/playlist', { id_pelicula: movieId });
  return response.data;
};

export const removeFromPlaylist = async (_userId, movieId) => {
  const response = await api.delete(`/playlist/${movieId}`);
  return response.data;
};

// ─────────────────────────────────────────────
// PERFIL
// ─────────────────────────────────────────────

export const updateProfile = async (profileData) => {
  const isFormData = profileData instanceof FormData;
  const response = await api.put('/profile', profileData, {
    headers: isFormData ? { 'Content-Type': undefined } : {},
  });
  const data = response.data;
  if (data.foto_perfil) {
    data.foto_perfil = resolvePhoto(data.foto_perfil);
  }
  return data;
};

export const imageToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload  = () => resolve(reader.result.split(',')[1]);
    reader.onerror = (error) => reject(error);
  });
};

export default api;