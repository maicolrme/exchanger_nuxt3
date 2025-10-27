// middleware/guest.js

export default defineNuxtRouteMiddleware((to, from) => {
  // Verificar si hay un token en localStorage
  if (process.client) {
    const token = localStorage.getItem('auth_token');
    if (token) {
      // Si hay token, redirigir a la página principal
      return navigateTo('/');
    }
  }
});