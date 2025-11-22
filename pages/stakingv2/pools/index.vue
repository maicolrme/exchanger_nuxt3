<template>
  <div class="min-h-screen bg-gray-900 text-gray-300">
    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-16">
      <!-- Header -->
      <div class="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
        <div>
          <h1 class="text-2xl md:text-3xl font-bold text-white">Pools de Staking</h1>
          <p class="text-sm md:text-base text-gray-300 mt-1">Invierte en nuestros pools y obtén rendimientos.</p>
        </div>
        <nuxt-link to="/stakingv2/my-positions" class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-gray-900 bg-yellow-500 hover:bg-yellow-400 font-semibold">
          Mis Posiciones
        </nuxt-link>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="flex flex-col items-center justify-center py-20">
        <div class="h-10 w-10 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
        <p class="text-gray-400 mt-4">Cargando pools...</p>
      </div>

      <!-- Plans Grid -->
      <div v-else-if="activePools.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <article
          v-for="pool in activePools"
          :key="pool.id"
          class="group rounded-xl border border-gray-800 bg-gray-850/50 hover:bg-gray-800 transition-colors shadow-sm flex flex-col"
        >
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

          <div class="px-5 mt-4 flex-grow">
            <ul class="text-gray-300 text-sm space-y-2">
              <li class="flex items-center gap-2">
                <svg class="h-4 w-4 text-green-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M16.704 5.29a1 1 0 010 1.42l-7.5 7.5a1 1 0 01-1.42 0l-3.5-3.5a1 1 0 111.42-1.42l2.79 2.79 6.79-6.79a1 1 0 011.42 0z" clip-rule="evenodd" /></svg>
                Inversión Mínima: <span class="font-medium ml-1">{{ formatNumber(pool.minimum_amount) }}</span>
              </li>
              <li class="flex items-center gap-2">
                <svg class="h-4 w-4 text-green-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M16.704 5.29a1 1 0 010 1.42l-7.5 7.5a1 1 0 01-1.42 0l-3.5-3.5a1 1 0 111.42-1.42l2.79 2.79 6.79-6.79a1 1 0 011.42 0z" clip-rule="evenodd" /></svg>
                Inversión Máxima: <span class="font-medium ml-1">{{ formatNumber(pool.maximum_amount) }}</span>
              </li>
              <li class="flex items-center gap-2">
                <svg class="h-4 w-4 text-green-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M16.704 5.29a1 1 0 010 1.42l-7.5 7.5a1 1 0 01-1.42 0l-3.5-3.5a1 1 0 111.42-1.42l2.79 2.79 6.79-6.79a1 1 0 011.42 0z" clip-rule="evenodd" /></svg>
                Total Invertido: <span class="font-medium ml-1">{{ formatNumber(pool.total_staked) }} {{ pool.cryptocurrency }}</span>
              </li>
            </ul>
          </div>

          <!-- Actions -->
          <div class="px-5 py-5 mt-2">
            <NuxtLink
              :to="`/stakingv2/pools/${pool.id}`"
              class="w-full text-center block bg-yellow-500 text-gray-900 rounded-md py-2 font-semibold hover:bg-yellow-400 transition-colors"
            >
              Ver Detalles y Stakear
            </NuxtLink>
          </div>
        </article>
      </div>
      
      <!-- No pools -->
      <div v-else class="text-center py-16 rounded-xl bg-gray-850/50 border border-dashed border-gray-700">
        <i class="fas fa-box-open fa-3x text-gray-600"></i>
        <h3 class="mt-4 text-lg font-semibold text-white">No hay pools disponibles</h3>
        <p class="mt-1 text-sm text-gray-400">Vuelve a consultar más tarde para ver nuevas oportunidades de staking.</p>
      </div>

    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useNuxtApp } from '#app'

useHead({ title: 'Pools de Staking V2' })

const { $axios, $store } = useNuxtApp()
const loading = ref(true)
const activePools = ref([])

const fetchData = async () => {
  try {
    loading.value = true
    const { data } = await $axios.get('staking/pools')
    if (data.success && data.data && data.data.activePools) {
      activePools.value = data.data.activePools
    } else {
      activePools.value = []
    }
  } catch (error) {
    $store.dispatch('alert/error', 'Error al cargar los pools de staking.')
  } finally {
    loading.value = false
  }
}

const formatNumber = (number, decimals = 2) => {
  const num = parseFloat(number)
  if (isNaN(num)) return '0'
  return num.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: 6,
  })
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.bg-gray-850 { background-color: #1f2937; }
</style>