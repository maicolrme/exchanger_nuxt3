// stores/auth.js
import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: null,
    loading: false,
    error: null
  }),

  getters: {
    isAuthenticated: (state) => !!state.user && !!state.token,
    userName: (state) => state.user?.name || null,
    userEmail: (state) => state.user?.email || null,
    isVerified: (state) => state.user?.verified || false
  },

  actions: {
    // Inicializar el store
    async initializeAuth() {
      // Si tenemos token pero no usuario, cargar usuario
      if (this.token && !this.user) {
        await this.loadUser()
      }
    },

    // Cargar datos del usuario desde el servidor
    async loadUser() {
      if (!this.token) return

      this.loading = true
      this.error = null

      try {
        const { $axios } = useNuxtApp()
        const response = await $axios.get('/user')
        this.user = response.data
      } catch (error) {
        console.error('Error al cargar usuario:', error)
        this.clearAuth()
        this.error = 'Sesión expirada. Por favor inicie sesión nuevamente.'
      } finally {
        this.loading = false
      }
    },

    // Iniciar sesión
    async login(email, password) {
      this.loading = true
      this.error = null

      try {
        const { $axios } = useNuxtApp()
        const response = await $axios.post('/login', { email, password })

        if (response.data.token) {
          this.token = response.data.token
          this.user = response.data.user
          
          console.log('Usuario autenticado:', this.user)
          return true
        } else {
          throw new Error('Respuesta inválida del servidor')
        }
      } catch (error) {
        console.error('Error de inicio de sesión:', error)
        if (!error.response) {
          this.error = 'Error de conexión. Verifique su conexión a internet.'
        } else {
          this.error = error.response?.data?.message || 'Error al iniciar sesión. Verifique sus credenciales.'
        }
        return false
      } finally {
        this.loading = false
      }
    },

    // Registrar usuario
    async register(name, email, password, password_confirmation) {
      this.loading = true
      this.error = null

      try {
        const { $axios } = useNuxtApp()
        const response = await $axios.post('/register', {
          name,
          email,
          password,
          password_confirmation
        })

        if (response.data.success && response.data.token) {
          this.token = response.data.token
          this.user = response.data.user
          
          return true
        } else {
          throw new Error('Respuesta inválida del servidor')
        }
      } catch (error) {
        console.error('Error de registro:', error)
        this.error = error.response?.data?.message || 'Error al registrar usuario.'
        return false
      } finally {
        this.loading = false
      }
    },

    // Cerrar sesión
    async logout() {
      this.loading = true
      this.error = null

      try {
        const { $axios } = useNuxtApp()
        await $axios.post('/logout')
      } catch (error) {
        console.error('Error al cerrar sesión:', error)
      } finally {
        this.clearAuth()
        this.loading = false
      }
    },

    // Limpiar datos de autenticación
    clearAuth() {
      this.user = null
      this.token = null
      this.error = null
    },

    // Limpiar errores
    clearError() {
      this.error = null
    }
  },

  // Configuración específica de persistencia
  persist: {
    pick: ['user', 'token'], // Solo persistir user y token, no loading ni error
  }
})