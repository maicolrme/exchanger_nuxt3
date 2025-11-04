// stores/notifications.js
import { defineStore } from 'pinia'

export const useNotificationsStore = defineStore('notifications', {
  state: () => ({
    list: []
  }),

  getters: {
    unreadCount: (state) => state.list.filter(n => !n.read).length,
  },

  actions: {
    seedInitial() {
      if (this.list.length > 0) return
      this.list = [
        { id: 1, title: 'Depósito confirmado', message: 'Tu depósito en USDT se ha confirmado.', type: 'success', date: 'Hoy, 10:15', read: false },
        { id: 2, title: 'Nuevo mensaje de soporte', message: 'Tienes una respuesta del equipo de soporte.', type: 'info', date: 'Ayer, 18:40', read: true },
        { id: 3, title: 'Verifica tu identidad', message: 'Completa la verificación KYC para ampliar límites.', type: 'warning', date: 'Ayer, 09:22', read: false },
        { id: 4, title: 'Orden completada', message: 'Tu orden #12345 se completó exitosamente.', type: 'success', date: '11/02, 14:05', read: true },
      ]
    },
    toggleRead(id) {
      const idx = this.list.findIndex(n => n.id === id)
      if (idx !== -1) {
        this.list[idx].read = !this.list[idx].read
      }
    },
    markAllRead() {
      this.list = this.list.map(n => ({ ...n, read: true }))
    },
    clearAll() {
      this.list = []
    },
    remove(id) {
      this.list = this.list.filter(n => n.id !== id)
    },
    add(notification) {
      const nextId = this.list.length ? Math.max(...this.list.map(n => n.id)) + 1 : 1
      this.list.unshift({ id: nextId, read: false, date: new Date().toLocaleString(), ...notification })
    }
  },

  // Persistir lista de notificaciones
  persist: {
    pick: ['list']
  }
})