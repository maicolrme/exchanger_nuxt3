<script setup>
import { onMounted, computed, ref } from 'vue'
import { useNotificationsStore } from '@/stores/notifications'
//import { Button } from '@/components/ui/button'
//import { MoreHorizontal, Trash2, Check, Mail, X, Loader } from 'lucide-vue-next'
import { useRouter } from 'vue-router'

definePageMeta({ layout: 'p2p' })

const notificationsStore = useNotificationsStore()
const router = useRouter()
const activeFilter = ref('all')

// Cargar notificaciones al montar el componente
onMounted(() => {
  notificationsStore.fetchNotifications()
})

const filteredNotifications = computed(() => {
  if (activeFilter.value === 'unread') return notificationsStore.list.filter(n => !n.read)
  if (activeFilter.value === 'alerts') return notificationsStore.list.filter(n => n.type === 'warning')
  return notificationsStore.list
})

const unreadCount = computed(() => notificationsStore.unreadCount)
const isLoading = computed(() => notificationsStore.loading)
const error = computed(() => notificationsStore.error)

const handleAction = (notification) => {
  if (notification.link) {
    router.push(notification.link)
  }
  if (!notification.read) {
    notificationsStore.markAsRead(notification.id)
  }
}

const getIcon = (type) => {
  switch (type) {
    case 'success':
      return 'text-green-500'
    case 'warning':
      return 'text-red-500'
    case 'info':
    default:
      return 'text-yellow-400'
  }
}
</script>

<template>
  <div class="w-full">
    <div class="max-w-5xl mx-auto px-4">
      <!-- Encabezado -->
      <div class="bg-gray-800 border border-gray-700 rounded-lg p-4 mb-6">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-xl font-semibold text-white">Notificaciones</h2>
            <p v-if="unreadCount > 0" class="text-sm text-gray-400">Tienes {{ unreadCount }} notificaciones no leídas.</p>
            <p v-else class="text-sm text-gray-400">No tienes notificaciones nuevas.</p>
          </div>
          <div class="flex items-center gap-2">
            <button @click="notificationsStore.markAllRead()" :disabled="unreadCount === 0 || isLoading" class="text-xs px-3 py-1.5 bg-gray-700 text-white rounded font-semibold hover:bg-gray-600 disabled:opacity-50">
              Marcar todas como leídas
            </button>
            <button @click="notificationsStore.clearAll()" :disabled="filteredNotifications.length === 0 || isLoading" class="text-xs px-3 py-1.5 bg-gray-700 text-white rounded font-semibold hover:bg-gray-600 disabled:opacity-50">
              Limpiar
            </button>
          </div>
        </div>
      </div>

      <!-- Filtros -->
      <div class="bg-gray-800 border border-gray-700 rounded-lg p-3 mb-4 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <button @click="activeFilter = 'all'" class="px-3 py-1.5 rounded transition"
                  :class="activeFilter === 'all' ? 'bg-yellow-500 text-gray-900 font-semibold' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'">
            Todas
          </button>
          <button @click="activeFilter = 'unread'" class="px-3 py-1.5 rounded transition"
                  :class="activeFilter === 'unread' ? 'bg-yellow-500 text-gray-900 font-semibold' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'">
            No leídas
          </button>
          <button @click="activeFilter = 'alerts'" class="px-3 py-1.5 rounded transition"
                  :class="activeFilter === 'alerts' ? 'bg-yellow-500 text-gray-900 font-semibold' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'">
            Alertas
          </button>
        </div>
        <div class="text-sm text-gray-400">Total: {{ filteredNotifications.length }}</div>
      </div>

      <!-- Estado de carga -->
      <div v-if="isLoading" class="text-center py-12">
        <Loader class="w-12 h-12 mx-auto animate-spin text-gray-400" />
        <p class="mt-4 text-gray-500">Cargando notificaciones...</p>
      </div>

      <!-- Estado de error -->
      <div v-else-if="error" class="text-center py-12 text-red-500">
        <X class="w-12 h-12 mx-auto" />
        <h2 class="mt-4 text-xl font-semibold">Error al cargar</h2>
        <p>{{ error }}</p>
      </div>

      <!-- Lista de notificaciones -->
      <div v-else-if="filteredNotifications.length > 0" class="space-y-3">
        <div v-for="n in filteredNotifications" :key="n.id" 
             class="bg-gray-800 border border-gray-700 rounded-lg p-4 flex items-start gap-3 cursor-pointer hover:bg-gray-700/50"
             :class="{ 'opacity-60': n.read }"
             @click="handleAction(n)">
          <div class="mt-1">
            <svg v-if="n.type === 'info'" class="w-6 h-6" :class="getIcon(n.type)" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20 10 10 0 000-20z"/>
            </svg>
            <svg v-else-if="n.type === 'success'" class="w-6 h-6" :class="getIcon(n.type)" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
            </svg>
            <svg v-else-if="n.type === 'warning'" class="w-6 h-6" :class="getIcon(n.type)" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M10.29 3.86l-7.4 12.84A2 2 0 004.59 20h14.82a2 2 0 001.7-3.3L13.7 3.86a2 2 0 00-3.42 0z"/>
            </svg>
            <svg v-else class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20 10 10 0 000-20z"/>
            </svg>
          </div>
          <div class="flex-1">
            <div class="flex items-center justify-between">
              <h3 class="text-white font-medium">
                {{ n.title }}
                <span v-if="!n.read" class="ml-2 text-xs px-2 py-0.5 bg-yellow-500 text-gray-900 rounded">Nuevo</span>
              </h3>
              <div class="text-xs text-gray-400">{{ n.date }}</div>
            </div>
            <p class="text-sm text-gray-300 mt-1">{{ n.message }}</p>
            <div class="mt-3 flex items-center gap-2">
              <button @click.stop="notificationsStore.toggleRead(n.id)" class="text-xs px-3 py-1.5 bg-gray-700 text-white rounded hover:bg-gray-600">
                {{ n.read ? 'Marcar como no leída' : 'Marcar como leída' }}
              </button>
              <button @click.stop="notificationsStore.remove(n.id)" class="text-xs px-3 py-1.5 bg-gray-700 text-white rounded hover:bg-gray-600">Eliminar</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Estado vacío -->
      <div v-else class="bg-gray-800 border border-gray-700 rounded-lg p-6 text-center">
        <Mail class="w-16 h-16 mx-auto text-gray-400" />
        <h2 class="mt-4 text-xl font-semibold text-white">Todo al día</h2>
        <p class="text-gray-300">No hay notificaciones para mostrar.</p>
      </div>
    </div>
  </div>
</template>