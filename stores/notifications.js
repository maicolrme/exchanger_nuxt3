import { defineStore } from 'pinia'
import { useNuxtApp } from '#app'
import { useAuthStore } from './auth' // Importar el store de autenticación

export const useNotificationsStore = defineStore('notifications', {
  state: () => ({
    list: [],
    loading: false,
    error: null,
    unreadCount: 0,
    toasts: [], // Estado para notificaciones temporales (toasts)
  }),

  actions: {
    // Acción para añadir una notificación toast
    addNotification(notification) {
      const id = Date.now() + Math.random();
      this.toasts.push({ ...notification, id });

      // Eliminar la notificación después de 5 segundos
      setTimeout(() => {
        this.removeNotification(id);
      }, 5000);
    },

    // Acción para eliminar una notificación toast
    removeNotification(id) {
      this.toasts = this.toasts.filter(n => n.id !== id);
    },

    // Cargar notificaciones desde el servidor
    async fetchNotifications() {
      const { $axios } = useNuxtApp()
      this.loading = true
      this.error = null
      try {
        const response = await $axios.get('/notifications')
        this.list = response.data.data.map(this.toUiModel)
        this.updateUnreadCount()
      } catch (e) {
        console.error('Error fetching notifications:', e)
        this.error = e.response?.data?.message || 'Failed to load notifications'
      } finally {
        this.loading = false
      }
    },

    // Marcar una notificación como leída
    async markAsRead(notificationId) {
      const { $axios } = useNuxtApp()
      const notification = this.list.find(n => n.id === notificationId)
      if (notification && !notification.read) {
        try {
          await $axios.post(`/notifications/${notificationId}/read`)
          notification.read = true
          this.updateUnreadCount()
        } catch (e) {
          console.error(`Error marking notification ${notificationId} as read:`, e)
        }
      }
    },

    // Marcar todas como leídas
    async markAllRead() {
      const { $axios } = useNuxtApp()
      try {
        await $axios.post('/notifications/read-all')
        this.list.forEach(n => n.read = true)
        this.unreadCount = 0
      } catch (e) {
        console.error('Error marking all notifications as read:', e)
      }
    },

    // Eliminar una notificación (asumiendo endpoint DELETE /notifications/{id})
    async remove(notificationId) {
        const { $axios } = useNuxtApp();
        try {
            // No se espera respuesta del backend, se elimina localmente
            this.list = this.list.filter(n => n.id !== notificationId);
            this.updateUnreadCount();
        } catch (e) {
            console.error(`Error removing notification ${notificationId}:`, e);
            // Opcional: revertir si la llamada falla, aunque la documentación no lo pide
        }
    },


    // Limpiar todas las notificaciones (acción local)
    clearAll() {
      this.list = []
      this.unreadCount = 0
    },

    // Obtener el contador de no leídas
    async fetchUnreadCount() {
      const authStore = useAuthStore()
      if (!authStore.isAuthenticated) {
        this.unreadCount = 0
        return
      }

      const { $axios } = useNuxtApp()
      try {
        const response = await $axios.get('/notifications/unread-count')
        this.unreadCount = response.data.count
      } catch (e) {
        console.error('Error fetching unread count:', e)
        // Si el error es 401, podría ser que el token expiró.
        if (e.response && e.response.status === 401) {
          this.unreadCount = 0 // Resetea el contador si no está autorizado
        }
      }
    },

    // Helper para actualizar el contador localmente
    updateUnreadCount() {
      this.unreadCount = this.list.filter(n => !n.read).length
    },

    // Helper para mapear el modelo de la API al modelo de la UI
    toUiModel(apiNotif) {
      return {
        id: apiNotif.id,
        title: apiNotif.title,
        message: apiNotif.body,
        date: new Date(apiNotif.created_at).toLocaleString(),
        read: !!apiNotif.read_at,
        type: apiNotif.status || 'info', // 'info', 'success', 'warning'
        link: apiNotif.action_link
      }
    },

    toggleRead(notificationId) {
        const notification = this.list.find(n => n.id === notificationId);
        if (notification) {
            if (notification.read) {
                // Marcar como no leída (acción local, no hay endpoint para "unread")
                notification.read = false;
                this.updateUnreadCount();
            } else {
                // Marcar como leída (llamada a la API)
                this.markAsRead(notificationId);
            }
        }
    }
  }
})