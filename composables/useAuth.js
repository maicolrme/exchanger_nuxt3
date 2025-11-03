// composables/useAuth.js
export const useAuth = () => {
  const authStore = useAuthStore()

  return {
    // Estado reactivo del store
    user: computed(() => authStore.user),
    token: computed(() => authStore.token),
    loading: computed(() => authStore.loading),
    error: computed(() => authStore.error),
    isAuthenticated: computed(() => authStore.isAuthenticated),
    userName: computed(() => authStore.userName),
    userEmail: computed(() => authStore.userEmail),
    isVerified: computed(() => authStore.isVerified),

    // Acciones del store
    initializeAuth: authStore.initializeAuth,
    loadUser: authStore.loadUser,
    login: authStore.login,
    register: authStore.register,
    logout: authStore.logout,
    clearAuth: authStore.clearAuth,
    clearError: authStore.clearError
  }
}