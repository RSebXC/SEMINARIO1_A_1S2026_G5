export const API_BASE = 'http://semi1-g5-alb-473829343.us-east-1.elb.amazonaws.com';

export const S3_BASE = 'https://semi1-proyecto-g5-2026.s3.us-east-1.amazonaws.com';

export const ENDPOINTS = {
  REGISTER: `${API_BASE}/auth/registro`,
  CONFIRM: `${API_BASE}/auth/confirmar`,
  LOGIN: `${API_BASE}/auth/login`,
  LOGIN_FACIAL: `${API_BASE}/auth/login-facial`,

  PROFILE: `${API_BASE}/perfil`,

  POSTS: `${API_BASE}/publicaciones`,
  TAGS: `${API_BASE}/publicaciones/etiquetas`,
  IDIOMAS: `${API_BASE}/publicaciones/idiomas`,
  TRANSLATE: `${API_BASE}/publicaciones/traducir`,
  CHATBOT: `${API_BASE}/chatbot/mensaje`,

  USERS_LIST: `${API_BASE}/usuarios`,
  SEND_FRIEND_REQ: `${API_BASE}/usuarios/solicitud`,
  FRIEND_REQUESTS: `${API_BASE}/usuarios/solicitudes`,
  ACCEPT_FRIEND_REQ: (id) => `${API_BASE}/usuarios/solicitud/${id}`,
  FRIENDS: `${API_BASE}/usuarios/amigos`,

  MESSAGES: (friendId) => `${API_BASE}/mensajes/${friendId}`,
  SEND_MESSAGE: `${API_BASE}/mensajes/`
};

export const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'fr', label: 'Français' },
  { code: 'de', label: 'Deutsch' },
  { code: 'pt', label: 'Português' },
];
