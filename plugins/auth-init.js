import { useAuthStore } from '~/stores/auth'

export default defineNuxtPlugin(async (nuxtApp) => {
  const authStore = useAuthStore(nuxtApp.$pinia)

  // Solo intentar cargar el usuario si hay un token y no hay usuario cargado
  // Esto se ejecutará tanto en el servidor (en la primera carga) como en el cliente
  if (authStore.token && !authStore.user) {
    await authStore.loadUser()
  }
})