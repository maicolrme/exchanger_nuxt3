import Pusher from 'pusher-js'
import { useAuthStore } from '~/stores/auth'

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig()
  const authStore = useAuthStore()

  // La instancia de Pusher se configura para usar el endpoint de autenticación.
  // El token se inyectará dinámicamente en las cabeceras.
  const pusher = new Pusher(config.public.pusher.key, {
    cluster: config.public.pusher.cluster,
    authEndpoint: `${config.public.apiUrl}/broadcasting/auth`,
    auth: {
      headers: {
        Authorization: `Bearer ${authStore.token}`,
        Accept: 'application/json',
      },
    },
  })

  // Observamos cambios en el token de autenticación.
  // Si el token cambia (ej. el usuario inicia sesión), actualizamos la cabecera de Pusher.
  watch(() => authStore.token, (newToken) => {
    console.log('Token de autenticación actualizado. Reconfigurando cabeceras de Pusher.')
    pusher.config.auth.headers.Authorization = `Bearer ${newToken}`
  })

  pusher.connection.bind('connected', () => {
    console.log('Pusher conectado exitosamente!')
  })

  pusher.connection.bind('error', (err) => {
    console.error('Error de conexión con Pusher:', err)
  })

  // Exponemos la instancia de Pusher y la función de desconexión a la aplicación Nuxt
  nuxtApp.provide('pusher', {
    instance: pusher,
    disconnect: () => {
      pusher.disconnect()
      console.log('Pusher desconectado.')
    }
  })
})