<template>
  <div :class="[ isDark ? 'bg-[#060621] text-white' : 'bg-white text-black', 'min-h-screen', 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8' ]">
    <div class="mb-4">
      <h2 class="text-2xl font-semibold mb-3">Pools de Staking Disponibles</h2>
    </div>

    <!-- Estadísticas del Usuario -->
    
  
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
            <nuxt-link :to="`/stakingv2/pools/${pool.id}`" class="inline-flex items-center justify-center w-full rounded-md bg-blue-600 text-white hover:bg-blue-700 px-4 py-2">
              <i class="fas fa-eye mr-2"></i>Ver Detalles
            </nuxt-link>
          </div>
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

// Layout p2p
setPageLayout('p2p')

// Tema dinámico
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
     
    }
  },

  async mounted() {
    await this.fetchData()
  },

  methods: {
    async fetchData() {
      try {
        this.loading = true
        const { data } = await this.$axios.get('staking/pools')
        
        this.activePools = data.data.activePools
    
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
    }
  },

  head() {
    return {
      title: 'Dashboard - Staking Platform'
    }
  }
}
</script>