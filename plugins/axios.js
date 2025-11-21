// plugins/axios.js
import axios from 'axios';

export default defineNuxtPlugin((nuxtApp) => {
  // Verificar si ya existe la instancia de axios
  if (nuxtApp.hasOwnProperty('$axios')) {
    return;
  }

  // Configuración base de Axios
  const runtimeConfig = useRuntimeConfig();

  const axiosInstance = axios.create({
    baseURL: runtimeConfig.public.apiBase,
    headers: {
      'Content-Type': 'application/json'
    },
    // Añadir timeout para evitar esperas infinitas
    timeout: 10000
  });
  
  // Interceptor para agregar el token de autenticación a todas las solicitudes
  axiosInstance.interceptors.request.use(config => {
    // Obtener token desde el store de Pinia
    const authStore = useAuthStore();
    const token = authStore.token;
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  // Interceptor para manejar errores de respuesta
  axiosInstance.interceptors.response.use(
    response => response,
    error => {
      // Si el error es 401 (no autorizado), limpiar autenticación y redirigir al login
      if (error.response && error.response.status === 401) {
        // Limpiar autenticación usando el store de Pinia
        const authStore = useAuthStore();
        authStore.clearAuth();
        
        // Redirigir a login
        if (process.client) {
          window.location.href = '/login';
        }
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