// plugins/axios.js
import axios from 'axios';

export default defineNuxtPlugin((nuxtApp) => {
  // Verificar si ya existe la instancia de axios
  if (nuxtApp.hasOwnProperty('$axios')) {
    return;
  }

  // Configuración base de Axios
  const isDev = process.env.NODE_ENV === 'development';
  
  const axiosInstance = axios.create({
    baseURL: isDev ? 'http://exchanger.test/api' : 'https://api.cryptoex.com/api',
    headers: {
      'Content-Type': 'application/json'
    },
    // Añadir timeout para evitar esperas infinitas
    timeout: 10000
  });
  
  // Interceptor para agregar el token de autenticación a todas las solicitudes
  axiosInstance.interceptors.request.use(config => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  // Interceptor para manejar errores de respuesta
  axiosInstance.interceptors.response.use(
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
      axios: axiosInstance
    }
  };
});