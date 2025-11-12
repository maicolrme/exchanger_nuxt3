<template>
  <div :class="[ isDark ? 'bg-[#060621] text-white' : 'bg-white text-black', 'min-h-screen', 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8' ]">
    <div class="mb-4">
      <h2 class="text-2xl font-semibold mb-3 flex items-center">
        <i class="fas fa-chart-line mr-2 text-blue-600"></i>
        Dashboard de Staking
      </h2>
    </div>

    <!-- Estadísticas del Usuario -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
      <div class="rounded-lg border shadow-sm p-4" :class="isDark ? 'bg-[#0b1022] border-[#1f2937] text-white' : 'bg-white border-gray-200 text-gray-900'">
        <div class="flex justify-between items-center">
          <div>
            <h6 class="text-sm text-gray-500 mb-0">Total en Staking</h6>
            <h4 class="text-blue-600 text-xl font-semibold">{{ formatNumber(userStats.total_staked) }}</h4>
          </div>
          <div class="text-blue-600">
            <i class="fas fa-coins text-2xl"></i>
          </div>
        </div>
      </div>
      <div class="rounded-lg border shadow-sm p-4" :class="isDark ? 'bg-[#0b1022] border-[#1f2937] text-white' : 'bg-white border-gray-200 text-gray-900'">
        <div class="flex justify-between items-center">
          <div>
            <h6 class="text-sm text-gray-500 mb-0">Recompensas Totales</h6>
            <h4 class="text-green-600 text-xl font-semibold">{{ formatNumber(userStats.total_rewards) }}</h4>
          </div>
          <div class="text-green-600">
            <i class="fas fa-trophy text-2xl"></i>
          </div>
        </div>
      </div>
      <div class="rounded-lg border shadow-sm p-4" :class="isDark ? 'bg-[#0b1022] border-[#1f2937] text-white' : 'bg-white border-gray-200 text-gray-900'">
        <div class="flex justify-between items-center">
          <div>
            <h6 class="text-sm text-gray-500 mb-0">Posiciones Activas</h6>
            <h4 class="text-cyan-600 text-xl font-semibold">{{ userStats.active_positions }}</h4>
          </div>
          <div class="text-cyan-600">
            <i class="fas fa-wallet text-2xl"></i>
          </div>
        </div>
      </div>
    </div>

    <!-- Pools Disponibles -->
    <div class="mb-4">
      <h4 class="text-xl font-semibold mb-3 flex items-center">
        <i class="fas fa-swimming-pool mr-2"></i>
        Pools de Staking Disponibles
      </h4>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div v-for="pool in activePools" :key="pool.id" class="">
        <div class="h-full rounded-lg border shadow-sm" :class="isDark ? 'bg-[#0b1022] border-[#1f2937] text-white' : 'bg-white border-gray-200 text-gray-900'">
          <div class="p-4 border-b" :class="isDark ? 'border-[#1f2937]' : 'border-gray-200'">
            <div class="flex items-center">
              <div :class="`crypto-icon ${getCryptoIconClass(pool.cryptocurrency)} mr-3`">
                {{ pool.cryptocurrency.substring(0, 2).toUpperCase() }}
              </div>
              <div>
                <h5 class="mb-0 font-semibold">{{ pool.name }}</h5>
                <small class="text-xs text-gray-500">{{ pool.cryptocurrency.toUpperCase() }}</small>
              </div>
            </div>
          </div>
          <div class="p-4">
            <div class="space-y-2">
              <div class="flex justify-between">
                <span class="text-gray-500">APR</span>
                <span class="font-semibold text-green-600">{{ pool.annual_percentage_rate }}%</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500">Período</span>
                <span>{{ pool.lock_period_days }} días</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500">Mín/Máx</span>
                <span class="text-sm">
                  {{ formatNumber(pool.minimum_amount) }}
                  <span v-if="pool.maximum_amount">/ {{ formatNumber(pool.maximum_amount) }}</span>
                  {{ pool.cryptocurrency.toUpperCase() }}
                </span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500">Total Staked</span>
                <span class="font-semibold">{{ formatNumber(pool.total_staked) }}</span>
              </div>
            </div>
            <p v-if="pool.description" class="text-gray-500 text-sm mt-3">{{ pool.description }}</p>
          </div>
          <div class="p-4 border-t" :class="isDark ? 'border-[#1f2937]' : 'border-gray-200'">
            <nuxt-link :to="`/staking/pools/${pool.id}`" class="inline-flex items-center justify-center w-full rounded-md bg-blue-600 text-white hover:bg-blue-700 px-4 py-2">
              <i class="fas fa-eye mr-2"></i>Ver Detalles
            </nuxt-link>
          </div>
        </div>
      </div>
    </div>

    <!-- Posiciones Activas del Usuario -->
    <div v-if="userActivePositions.length > 0" class="mt-5">
      <h4 class="text-xl font-semibold mb-3 flex items-center">
        <i class="fas fa-list mr-2"></i>
        Tus Posiciones Activas Recientes
      </h4>
      <div class="rounded-lg border shadow-sm" :class="isDark ? 'bg-[#0b1022] border-[#1f2937] text-white' : 'bg-white border-gray-200 text-gray-900'">
        <div class="overflow-x-auto">
          <table class="min-w-full text-sm">
            <thead :class="isDark ? 'bg-[#111827] text-white' : 'bg-gray-50 text-gray-700'">
              <tr>
                <th class="px-4 py-2 text-left">Pool</th>
                <th class="px-4 py-2 text-left">Cantidad</th>
                <th class="px-4 py-2 text-left">APR</th>
                <th class="px-4 py-2 text-left">Días Restantes</th>
                <th class="px-4 py-2 text-left">Recompensas</th>
                <th class="px-4 py-2 text-left">Estado</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="position in userActivePositions" :key="position.id" class="border-t" :class="isDark ? 'border-[#1f2937]' : 'border-gray-200'">
                <td class="px-4 py-3">
                  <div class="flex items-center">
                    <div :class="`crypto-icon ${getCryptoIconClass(position.staking_pool.cryptocurrency)} mr-2`" style="width: 30px; height: 30px; font-size: 0.75rem;">
                      {{ position.staking_pool.cryptocurrency.substring(0, 2).toUpperCase() }}
                    </div>
                    <div>
                      <div class="font-semibold">{{ position.staking_pool.name }}</div>
                      <small class="text-xs text-gray-500">{{ position.staking_pool.cryptocurrency.toUpperCase() }}</small>
                    </div>
                  </div>
                </td>
                <td class="px-4 py-3 font-semibold">
                  {{ formatNumber(position.amount) }}
                  <small class="text-xs text-gray-500 block">{{ position.staking_pool.cryptocurrency.toUpperCase() }}</small>
                </td>
                <td class="px-4 py-3">
                  <span class="text-green-600 font-semibold">{{ position.staking_pool.annual_percentage_rate }}%</span>
                </td>
                <td class="px-4 py-3">
                  <span v-if="position.days_remaining > 0" class="inline-flex items-center rounded px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800">
                    {{ position.days_remaining }} días
                  </span>
                  <span v-else class="inline-flex items-center rounded px-2 py-1 text-xs font-medium bg-green-100 text-green-800">Disponible</span>
                </td>
                <td class="px-4 py-3 text-green-600 font-semibold">
                  +{{ formatNumber(position.accumulated_rewards) }}
                </td>
                <td class="px-4 py-3">
                  <span :class="statusBadgeClass(position.status)">
                    {{ position.status.charAt(0).toUpperCase() + position.status.slice(1) }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="text-center p-4 border-t" :class="isDark ? 'border-[#1f2937]' : 'border-gray-200'">
          <nuxt-link to="/stakingv2/my-positions" class="inline-flex items-center rounded-md border px-4 py-2" :class="isDark ? 'border-[#1f2937] text-white hover:bg-[#0b1022]' : 'border-gray-300 text-gray-700 hover:bg-gray-50'">
            <i class="fas fa-list mr-2"></i>Ver Todas las Posiciones
          </nuxt-link>
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex items-center justify-center py-10">
      <div class="h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

// Establecer layout p2p para Nuxt 3
setPageLayout('p2p')

// Sincronización de tema con el layout (observa clase 'light-mode' en contenedor del layout)
const isLightMode = ref(false)
const isDark = computed(() => !isLightMode.value)
let themeObserver = null

onMounted(() => {
  if (process.client) {
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme) {
      isLightMode.value = savedTheme === 'light'
    }

    const rootEl = document.querySelector('.app-layout')
    if (rootEl) {
      isLightMode.value = rootEl.classList.contains('light-mode')
      themeObserver = new MutationObserver((mutations) => {
        for (const m of mutations) {
          if (m.type === 'attributes' && m.attributeName === 'class') {
            isLightMode.value = rootEl.classList.contains('light-mode')
          }
        }
      })
      themeObserver.observe(rootEl, { attributes: true, attributeFilter: ['class'] })
    }
  }
})

onUnmounted(() => {
  if (themeObserver) {
    themeObserver.disconnect()
    themeObserver = null
  }
})
</script>

<script>
export default {
 // layout: 'default',
 // middleware: 'auth',
  
  data() {
    return {
      loading: true,
      activePools: [],
      userActivePositions: [],
      userStats: {
        total_staked: 0,
        total_rewards: 0,
        active_positions: 0
      }
    }
  },

  async mounted() {
    await this.fetchData()
  },

  methods: {
    async fetchData() {
      try {
        this.loading = true
        const { data } = await this.$axios.get('staking')
        
        this.activePools = data.data.activePools
        this.userActivePositions = data.data.userActivePositions
        this.userStats = data.data.userStats
      } catch (error) {
        this.$store.dispatch('alert/error', 'Error al cargar los datos')
        console.error('Error fetching staking data:', error)
      } finally {
        this.loading = false
      }
    },

    formatNumber(number, decimals = 6) {
      return parseFloat(number || 0).toFixed(decimals).replace(/\.?0+$/, '')
    },

    getCryptoIconClass(crypto) {
      const classes = {
        'BTC': 'bg-bitcoin',
        'ETH': 'bg-ethereum'
      }
      return classes[crypto.toUpperCase()] || 'bg-crypto-default'
    },

    getStatusClass(status) {
      const classes = {
        'active': 'success',
        'completed': 'info',
        'withdrawn': 'secondary'
      }
      return classes[status] || 'secondary'
    },

    statusBadgeClass(status) {
      const tw = {
        'active': 'inline-flex items-center rounded px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800',
        'completed': 'inline-flex items-center rounded px-2 py-1 text-xs font-medium bg-green-100 text-green-800',
        'withdrawn': 'inline-flex items-center rounded px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800'
      }
      return tw[status] || 'inline-flex items-center rounded px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800'
    }
  },

  head() {
    return {
      title: 'Dashboard - Staking Platform'
    }
  }
}
</script>