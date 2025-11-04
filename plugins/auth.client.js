// plugins/auth.client.js
export default defineNuxtPlugin(async () => {
  const authStore = useAuthStore()
  
  // Inicializar el estado de autenticación automáticamente al cargar la aplicación
  await authStore.initializeAuth()
})