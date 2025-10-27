// plugins/axios.js
import axios from 'axios';

export default defineNuxtPlugin(() => {
  // Configuración base de Axios
  axios.defaults.baseURL = 'https://exchanger.test/api';
  
  // Interceptor para agregar el token de autenticación a todas las solicitudes
  axios.interceptors.request.use(config => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    config.headers['Content-Type'] = 'application/json';
    return config;
  });

  // Interceptor para manejar errores de respuesta
  axios.interceptors.response.use(
    response => response,
    error => {
      // Si el error es 401 (no autorizado), redirigir al login
      if (error.response && error.response.status === 401) {
        // Eliminar token y redirigir a login
        localStorage.removeItem('auth_token');
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
  );

  return {
    provide: {
      axios: axios
    }
  };
});