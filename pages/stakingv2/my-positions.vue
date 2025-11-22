<template>
  <div class="min-h-screen bg-gray-900 text-gray-300">
    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-16">
      <!-- Header -->
      <header class="mb-8">
        <div class="flex justify-between items-center">
          <div>
            <h1 class="text-3xl font-bold text-white">Mis Posiciones de Staking</h1>
            <p class="text-gray-400">Aquí puedes ver y gestionar tus posiciones de staking activas y completadas.</p>
          </div>
          <nuxt-link to="/stakingv2" class="inline-flex items-center gap-2 text-sm bg-yellow-500 text-gray-900 font-bold py-2 px-4 rounded-lg hover:bg-yellow-400 transition-colors">
            <i class="fas fa-layer-group"></i>
            Ver Pools de Staking
          </nuxt-link>
        </div>
      </header>

      <!-- Loading -->
      <div v-if="loading" class="flex flex-col items-center justify-center py-20">
        <div class="h-10 w-10 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
        <p class="text-gray-400 mt-4">Cargando tus posiciones...</p>
      </div>

      <!-- Content -->
      <div v-if="!loading">
        <!-- Tabs -->
        <div class="mb-6 border-b border-gray-800">
          <nav class="-mb-px flex space-x-6" aria-label="Tabs">
            <button @click="filter = 'active'" :class="[filter === 'active' ? 'border-yellow-400 text-white' : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500', 'whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm']">
              Activas
            </button>
            <button @click="filter = 'completed'" :class="[filter === 'completed' ? 'border-yellow-400 text-white' : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500', 'whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm']">
              Completadas
            </button>
          </nav>
        </div>

        <!-- Positions List -->
        <div v-if="filteredPositions.length > 0" class="space-y-4">
          <div v-for="position in filteredPositions" :key="position.id" class="rounded-xl border border-gray-800 bg-gray-850/50 overflow-hidden">
            <div class="p-5">
              <div class="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div class="flex items-center gap-4">
                  <div class="h-10 w-10 rounded-lg bg-gradient-to-br from-yellow-500 to-yellow-300 flex items-center justify-center text-gray-900 font-bold text-sm">
                    {{ position.pool.cryptocurrency.substring(0, 3).toUpperCase() }}
                  </div>
                  <div>
                    <h3 class="text-lg font-bold text-white">{{ position.pool.name }}</h3>
                    <p class="text-sm text-gray-400">{{ position.pool.cryptocurrency.toUpperCase() }}</p>
                  </div>
                </div>
                <div class="text-right">
                  <p class="text-sm text-gray-400">Cantidad Invertida</p>
                  <p class="text-xl font-semibold text-white">{{ formatNumber(position.amount) }}</p>
                </div>
              </div>
            </div>
            <div class="bg-gray-800 px-5 py-3 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div>
                <p class="text-xs text-gray-400">Ganancia Estimada</p>
                <p class="text-md font-semibold text-green-400">+{{ formatNumber(position.estimated_earnings) }}</p>
              </div>
              <div>
                <p class="text-xs text-gray-400">Fecha de Inicio</p>
                <p class="text-md font-semibold text-white">{{ formatDate(position.start_date) }}</p>
              </div>
              <div>
                <p class="text-xs text-gray-400">Fecha de Finalización</p>
                <p class="text-md font-semibold text-white">{{ formatDate(position.end_date) }}</p>
              </div>
              <div>
                <p class="text-xs text-gray-400">Estado</p>
                <span :class="statusClass(position.status)" class="px-2 py-1 text-xs font-medium rounded-full">
                  {{ position.status.charAt(0).toUpperCase() + position.status.slice(1) }}
                </span>
              </div>
            </div>
            <div v-if="position.status === 'active'" class="p-4 bg-gray-850/50">
                <div class="text-sm text-gray-400">Progreso</div>
                <div class="w-full bg-gray-700 rounded-full h-2.5 mt-1">
                    <div class="bg-yellow-400 h-2.5 rounded-full" :style="{ width: position.progress + '%' }"></div>
                </div>
                <div class="text-xs text-right mt-1 text-gray-500">{{ position.progress.toFixed(2) }}% completado</div>
            </div>
          </div>
        </div>

        <!-- No Positions -->
        <div v-else class="text-center py-16 rounded-xl bg-gray-850/50 border border-dashed border-gray-700">
          <i class="fas fa-box-open fa-3x text-gray-600"></i>
          <h3 class="mt-4 text-lg font-semibold text-white">No hay posiciones {{ filter === 'active' ? 'activas' : 'completadas' }}</h3>
          <p class="mt-1 text-sm text-gray-400">Parece que aún no tienes ninguna posición de staking aquí.</p>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useNuxtApp } from '#app'

const { $axios, $store } = useNuxtApp()

const loading = ref(true)
const positions = ref([])
const filter = ref('active') // 'active' or 'completed'

useHead({ title: 'Mis Posiciones - Staking V2' })

const filteredPositions = computed(() => {
  return positions.value.filter(p => p.status === filter.value)
})

async function fetchPositions() {
  try {
    loading.value = true
    const { data } = await $axios.get('/staking/my-positions')
    if (data.success) {
      positions.value = data.data.map(pos => ({
        ...pos,
        progress: calculateProgress(pos.start_date, pos.end_date)
      }))
    }
  } catch (error) {
    $store.dispatch('alert/error', 'Error al cargar tus posiciones de staking.')
  } finally {
    loading.value = false
  }
}

function calculateProgress(start, end) {
    const startDate = new Date(start).getTime()
    const endDate = new Date(end).getTime()
    const now = new Date().getTime()

    if (now >= endDate) return 100
    if (now <= startDate) return 0

    const totalDuration = endDate - startDate
    const elapsedDuration = now - startDate
    
    return (elapsedDuration / totalDuration) * 100
}

function formatNumber(number, decimals = 6) {
  const num = parseFloat(number || 0)
  if (isNaN(num)) return '0'
  return num.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: decimals,
  })
}

function formatDate(dateString) {
  if (!dateString) return 'N/A'
  const options = { year: 'numeric', month: 'short', day: 'numeric' }
  return new Date(dateString).toLocaleDateString('es-ES', options)
}

function statusClass(status) {
  const classes = {
    active: 'bg-green-900 text-green-300',
    completed: 'bg-blue-900 text-blue-300',
    cancelled: 'bg-red-900 text-red-300',
  }
  return classes[status] || 'bg-gray-700 text-gray-300'
}

onMounted(() => {
  fetchPositions()
})
</script>

<style scoped>
.bg-gray-850 { background-color: #1f2937; }
</style>