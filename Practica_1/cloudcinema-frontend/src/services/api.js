import axios from 'axios';

// CAMBIAR ESTE URL cuando tengan el Load Balancer
const API_URL = 'http://localhost:3000'; // Cambiar después al DNS del Load Balancer

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token si existe
api.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  if (user.id) {
    config.headers['user-id'] = user.id;
  }
  return config;
});

// Servicios de autenticación
export const register = async (userData) => {
  const response = await api.post('/register', userData);
  return response.data;
};

export const login = async (credentials) => {
  const response = await api.post('/login', credentials);
  return response.data;
};

// Servicios de películas
export const getMovies = async () => {
  const response = await api.get('/movies');
  return response.data;
};

// Servicios de playlist
export const getPlaylist = async (userId) => {
  const response = await api.get(`/playlist/${userId}`);
  return response.data;
};

export const addToPlaylist = async (userId, movieId) => {
  const response = await api.post('/playlist/add', { id_usuario: userId, id_pelicula: movieId });
  return response.data;
};

export const removeFromPlaylist = async (userId, movieId) => {
  const response = await api.delete('/playlist/remove', { 
    data: { id_usuario: userId, id_pelicula: movieId } 
  });
  return response.data;
};

// Servicios de perfil
export const updateProfile = async (profileData) => {
  const response = await api.put('/profile', profileData);
  return response.data;
};

// Convertir imagen a base64
export const imageToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = (error) => reject(error);
  });
};

export default api;