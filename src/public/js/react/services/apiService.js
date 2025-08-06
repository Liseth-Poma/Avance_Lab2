// public/js/react/services/apiService.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://jsonplaceholder.typicode.com',
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para manejar errores globalmente
api.interceptors.response.use(
  response => response,
  error => {
    console.error('Error en la API:', error);
    return Promise.reject(error);
  }
);

// Servicios para usuarios (simularemos perfiles de chat)
export const userService = {
  // Obtener todos los usuarios
  getUsers: () => api.get('/users'),
  
  // Obtener usuario por ID
  getUserById: (id) => api.get(`/users/${id}`),
  
  // Crear nuevo usuario
  createUser: (user) => api.post('/users', user),
  
  // Actualizar usuario
  updateUser: (id, user) => api.put(`/users/${id}`, user),
  
  // Eliminar usuario
  deleteUser: (id) => api.delete(`/users/${id}`)
};

// Servicios para posts (simularemos mensajes del chat)
export const messageService = {
  // Obtener mensajes/posts
  getMessages: () => api.get('/posts'),
  
  // Obtener mensajes por usuario
  getMessagesByUser: (userId) => api.get(`/posts?userId=${userId}`),
  
  // Crear nuevo mensaje
  createMessage: (message) => api.post('/posts', message),
  
  // Actualizar mensaje
  updateMessage: (id, message) => api.put(`/posts/${id}`, message),
  
  // Eliminar mensaje
  deleteMessage: (id) => api.delete(`/posts/${id}`)
};

// Servicio para comentarios (podrían ser respuestas a mensajes)
export const commentService = {
  getComments: () => api.get('/comments'),
  getCommentsByPost: (postId) => api.get(`/comments?postId=${postId}`),
  createComment: (comment) => api.post('/comments', comment),
  updateComment: (id, comment) => api.put(`/comments/${id}`, comment),
  deleteComment: (id) => api.delete(`/comments/${id}`)
};

export default api;