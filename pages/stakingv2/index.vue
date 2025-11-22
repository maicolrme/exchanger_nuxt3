<template>
  <div class="min-h-screen bg-gray-900 text-gray-300">
    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-16">
      <!-- Header -->
      <div class="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
        <div>
          <h1 class="text-2xl md:text-3xl font-bold text-white">Staking V2</h1>
          <p class="text-sm md:text-base text-gray-300 mt-1">Bloquea tus activos y recibe recompensas periódicas.</p>
        </div>
        <div class="flex items-center gap-3">
            <nuxt-link to="/stakingv2/my-positions" class="text-sm px-4 py-2 rounded-md bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-semibold">
                <i class="fas fa-wallet mr-2"></i>Mis Posiciones
            </nuxt-link>
        </div>
      </div>

      <!-- User Stats -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div class="bg-gray-850/50 rounded-lg border border-gray-800 p-4">
          <div class="flex justify-between items-center">
            <div>
              <h6 class="text-sm text-gray-400 mb-0">Total en Staking</h6>
              <h4 class="text-yellow-400 text-xl font-semibold">{{ formatNumber(userStats.total_staked) }}</h4>
            </div>
            <div class="text-yellow-400">
              <i class="fas fa-coins text-2xl"></i>
            </div>
          </div>
        </div>
        <div class="bg-gray-850/50 rounded-lg border border-gray-800 p-4">
          <div class="flex justify-between items-center">
            <div>
              <h6 class="text-sm text-gray-400 mb-0">Recompensas Totales</h6>
              <h4 class="text-green-400 text-xl font-semibold">{{ formatNumber(userStats.total_rewards) }}</h4>
            </div>
            <div class="text-green-400">
              <i class="fas fa-trophy text-2xl"></i>
            </div>
          </div>
        </div>
        <div class="bg-gray-850/50 rounded-lg border border-gray-800 p-4">
          <div class="flex justify-between items-center">
            <div>
              <h6 class="text-sm text-gray-400 mb-0">Posiciones Activas</h6>
              <h4 class="text-cyan-400 text-xl font-semibold">{{ userStats.active_positions }}</h4>
            </div>
            <div class="text-cyan-400">
              <i class="fas fa-wallet text-2xl"></i>
            </div>
          </div>
        </div>
      </div>

      <!-- Staking Pools -->
      <h2 class="text-xl font-semibold text-white mb-4">Pools de Staking Disponibles</h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <article v-for="pool in activePools" :key="pool.id" class="group rounded-xl border border-gray-800 bg-gray-850/50 hover:bg-gray-800 transition-colors shadow-sm">
          <header class="px-5 pt-5">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="h-10 w-10 rounded-lg bg-gradient-to-br from-yellow-500 to-yellow-300 flex items-center justify-center text-gray-900 font-bold">
                  {{ pool.cryptocurrency.substring(0, 3).toUpperCase() }}
                </div>
                <div>
                  <h2 class="text-white font-semibold">{{ pool.name }}</h2>
                  <p class="text-xs text-gray-400">Bloqueo: {{ pool.lock_period_days }} días</p>
                </div>
              </div>
              <div class="text-right">
                <div class="text-yellow-400 font-bold text-lg">{{ pool.annual_percentage_rate }}% APR</div>
              </div>
            </div>
          </header>

          <div class="px-5 mt-4">
            <ul class="text-gray-300 text-sm space-y-2">
                <li class="flex justify-between">
                    <span class="text-gray-400">Mínimo:</span>
                    <span class="font-medium">{{ formatNumber(pool.minimum_amount) }} {{ pool.cryptocurrency.toUpperCase() }}</span>
                </li>
                <li class="flex justify-between" v-if="pool.maximum_amount">
                    <span class="text-gray-400">Máximo:</span>
                    <span class="font-medium">{{ formatNumber(pool.maximum_amount) }} {{ pool.cryptocurrency.toUpperCase() }}</span>
                </li>
                <li class="flex justify-between">
                    <span class="text-gray-400">Total Staked:</span>
                    <span class="font-medium">{{ formatNumber(pool.total_staked) }}</span>
                </li>
            </ul>
            <p v-if="pool.description" class="text-gray-400 text-sm mt-3">{{ pool.description }}</p>
          </div>

          <div class="px-5 py-5 mt-2 flex items-center justify-end">
            <nuxt-link :to="`/stakingv2/pools/${pool.id}`" class="text-sm px-4 py-2 rounded-md bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-semibold">
              Ver Detalles
            </nuxt-link>
          </div>
        </article>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="flex items-center justify-center py-10">
        <div class="h-8 w-8 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useNuxtApp } from '#app'

useHead({
  title: 'Staking V2'
})

const { $axios, $store } = useNuxtApp()

const loading = ref(true)
const activePools = ref([])
const userStats = ref({
  total_staked: 0,
  total_rewards: 0,
  active_positions: 0
})

async function fetchData() {
  try {
    loading.value = true
    const { data } = await $axios.get('staking')
    
    activePools.value = data.data.activePools
    userStats.value = data.data.userStats
  } catch (error) {
    $store.dispatch('alert/error', 'Error al cargar los datos')
    console.error('Error fetching staking data:', error)
  } finally {
    loading.value = false
  }
}

function formatNumber(number, decimals = 6) {
  const num = parseFloat(number || 0)
  if (isNaN(num)) return '0'
  return num.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: decimals,
  }).replace(/\.?0+$/, '')
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.bg-gray-850 { background-color: #1f2937; }
</style>