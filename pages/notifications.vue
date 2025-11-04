<template>
  <div class="w-full">
    <div class="max-w-5xl mx-auto px-4">
      <!-- Encabezado -->
      <div class="bg-gray-800 border border-gray-700 rounded-lg p-4 mb-6">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-xl font-semibold text-white">Notificaciones</h2>
            <p class="text-sm text-gray-400">Mantente al día con tus eventos y alertas.</p>
          </div>
          <div class="flex items-center gap-2">
            <button @click="markAllRead" class="text-xs px-3 py-1.5 bg-gray-700 text-white rounded font-semibold hover:bg-gray-600">Marcar todas como leídas</button>
            <button @click="clearAll" class="text-xs px-3 py-1.5 bg-gray-700 text-white rounded font-semibold hover:bg-gray-600">Limpiar</button>
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

      <!-- Lista de notificaciones -->
      <div class="space-y-3">
        <div v-for="n in filteredNotifications" :key="n.id" class="bg-gray-800 border border-gray-700 rounded-lg p-4 flex items-start gap-3">
          <div class="mt-1">
            <!-- Icono por tipo -->
            <svg v-if="n.type === 'info'" class="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20 10 10 0 000-20z"/>
            </svg>
            <svg v-else-if="n.type === 'success'" class="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
            </svg>
            <svg v-else-if="n.type === 'warning'" class="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
              <button @click="toggleRead(n)" class="text-xs px-3 py-1.5 bg-gray-700 text-white rounded hover:bg-gray-600">
                {{ n.read ? 'Marcar como no leída' : 'Marcar como leída' }}
              </button>
              <button @click="removeNotification(n.id)" class="text-xs px-3 py-1.5 bg-gray-700 text-white rounded hover:bg-gray-600">Eliminar</button>
            </div>
          </div>
        </div>

        <!-- Estado vacío -->
        <div v-if="filteredNotifications.length === 0" class="bg-gray-800 border border-gray-700 rounded-lg p-6 text-center">
          <p class="text-gray-300">No hay notificaciones para mostrar.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'p2p' })

const activeFilter = ref('all')

const notifStore = useNotificationsStore()

onMounted(() => {
  // Semilla inicial si no hay datos
  notifStore.seedInitial()
})

const filteredNotifications = computed(() => {
  if (activeFilter.value === 'unread') return notifStore.list.filter(n => !n.read)
  if (activeFilter.value === 'alerts') return notifStore.list.filter(n => n.type === 'warning')
  return notifStore.list
})

const toggleRead = (n) => {
  notifStore.toggleRead(n.id)
}

const markAllRead = () => {
  notifStore.markAllRead()
}

const clearAll = () => {
  notifStore.clearAll()
}

const removeNotification = (id) => {
  notifStore.remove(id)
}
</script>

<style scoped>
/* Sin estilos específicos: usamos el sistema de colores del layout p2p */
</style>