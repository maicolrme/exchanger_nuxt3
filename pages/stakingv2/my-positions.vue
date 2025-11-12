<template>
  <div :class="[ isDark ? 'bg-[#060621] text-white' : 'bg-white text-black', 'min-h-screen', 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8' ]">
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-2xl font-semibold mb-0 flex items-center">
        <i class="fas fa-wallet mr-2 text-blue-600"></i>
        Mis Posiciones de Staking
      </h2>
      <div>
        <nuxt-link to="/stakingv2" class="inline-flex items-center rounded-md bg-blue-600 text-white hover:bg-blue-700 px-4 py-2">
          <i class="fas fa-plus mr-2"></i>Nuevo Staking
        </nuxt-link>
      </div>
    </div>

    <!-- Resumen Rápido -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
      <div class="rounded-lg border shadow-sm p-4 text-center" :class="isDark ? 'bg-[#0b1022] border-[#1f2937] text-white' : 'bg-white border-gray-200 text-gray-900'">
        <i class="fas fa-coins text-2xl mb-2 text-blue-600"></i>
        <h6 class="text-sm text-gray-500">Total Invertido</h6>
        <h4 class="text-xl font-semibold">{{ formatNumber(summary.total_invested) }}</h4>
      </div>
      <div class="rounded-lg border shadow-sm p-4 text-center" :class="isDark ? 'bg-[#0b1022] border-[#1f2937] text-white' : 'bg-white border-gray-200 text-gray-900'">
        <i class="fas fa-trophy text-2xl mb-2 text-green-600"></i>
        <h6 class="text-sm text-gray-500">Recompensas Ganadas</h6>
        <h4 class="text-xl font-semibold">{{ formatNumber(summary.total_rewards) }}</h4>
      </div>
      <div class="rounded-lg border shadow-sm p-4 text-center" :class="isDark ? 'bg-[#0b1022] border-[#1f2937] text-white' : 'bg-white border-gray-200 text-gray-900'">
        <i class="fas fa-chart-line text-2xl mb-2 text-cyan-600"></i>
        <h6 class="text-sm text-gray-500">ROI Promedio</h6>
        <h4 class="text-xl font-semibold">{{ formatNumber(summary.average_roi, 2) }}%</h4>
      </div>
      <div class="rounded-lg border shadow-sm p-4 text-center" :class="isDark ? 'bg-[#0b1022] border-[#1f2937] text-white' : 'bg-white border-gray-200 text-gray-900'">
        <i class="fas fa-clock text-2xl mb-2 text-yellow-600"></i>
        <h6 class="text-sm text-gray-500">Posiciones Activas</h6>
        <h4 class="text-xl font-semibold">{{ summary.active_positions }}</h4>
      </div>
    </div>

    <!-- Filtros -->
    <div class="rounded-lg border shadow-sm mb-4" :class="isDark ? 'bg-[#0b1022] border-[#1f2937] text-white' : 'bg-white border-gray-200 text-gray-900'">
      <div class="p-4">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label for="status" class="text-sm">Estado:</label>
            <select v-model="filters.status" id="status" @change="applyFilters"
                    class="mt-1 block w-full rounded-md border px-3 py-2"
                    :class="isDark ? 'bg-[#0b1022] border-[#1f2937] text-white' : 'bg-white border-gray-300 text-gray-900'">
              <option value="">Todos</option>
              <option value="active">Activos</option>
              <option value="completed">Completados</option>
              <option value="withdrawn">Retirados</option>
            </select>
          </div>
          <div>
            <label for="cryptocurrency" class="text-sm">Crypto:</label>
            <select v-model="filters.cryptocurrency" id="cryptocurrency" @change="applyFilters"
                    class="mt-1 block w-full rounded-md border px-3 py-2"
                    :class="isDark ? 'bg-[#0b1022] border-[#1f2937] text-white' : 'bg-white border-gray-300 text-gray-900'">
              <option value="">Todas</option>
              <option v-for="crypto in cryptocurrencies" :key="crypto" :value="crypto">
                {{ crypto.toUpperCase() }}
              </option>
            </select>
          </div>
          <div>
            <label for="sort" class="text-sm">Ordenar:</label>
            <select v-model="filters.sort" id="sort" @change="applyFilters"
                    class="mt-1 block w-full rounded-md border px-3 py-2"
                    :class="isDark ? 'bg-[#0b1022] border-[#1f2937] text-white' : 'bg-white border-gray-300 text-gray-900'">
              <option value="newest">Más Recientes</option>
              <option value="oldest">Más Antiguos</option>
              <option value="amount_desc">Mayor Cantidad</option>
              <option value="amount_asc">Menor Cantidad</option>
              <option value="rewards_desc">Mayores Ganancias</option>
            </select>
          </div>
          <div class="flex items-end">
            <button v-if="hasActiveFilters" @click="clearFilters" class="inline-flex items-center justify-center rounded-md border px-4 py-2 w-full"
                    :class="isDark ? 'border-[#1f2937] text-white hover:bg-[#0b1022]' : 'border-gray-300 text-gray-700 hover:bg-gray-50'">
              <i class="fas fa-times mr-1"></i>Limpiar
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Posiciones -->
    <div v-if="positions.data && positions.data.length > 0">
      <!-- Vista de Cards para móvil -->
      <div class="block lg:hidden">
        <div v-for="position in positions.data" :key="position.id" class="rounded-lg border shadow-sm mb-3" :class="isDark ? 'bg-[#0b1022] border-[#1f2937] text-white' : 'bg-white border-gray-200 text-gray-900'">
          <div class="p-4">
            <div class="flex justify-between items-start mb-3">
              <div class="flex items-center">
                <div :class="`crypto-icon ${getCryptoIconClass(position.staking_pool.cryptocurrency)} mr-3`" style="width: 35px; height: 35px; font-size: 0.8rem;">
                  {{ position.staking_pool.cryptocurrency.substring(0, 2).toUpperCase() }}
                </div>
                <div>
                  <h6 class="font-semibold mb-0">{{ position.staking_pool.name }}</h6>
                  <small class="text-xs text-gray-500">{{ position.staking_pool.cryptocurrency.toUpperCase() }}</small>
                </div>
              </div>
              <span :class="statusBadgeClass(position.status)">
                {{ position.status.charAt(0).toUpperCase() + position.status.slice(1) }}
              </span>
            </div>

            <div class="grid grid-cols-2 gap-4 mb-3">
              <div>
                <small class="text-xs text-gray-500">Invertido:</small>
                <div class="font-semibold">{{ formatNumber(position.amount) }}</div>
              </div>
              <div>
                <small class="text-xs text-gray-500">Recompensas:</small>
                <div class="font-semibold text-green-600">{{ formatNumber(position.accumulated_rewards) }}</div>
              </div>
            </div>

            <!-- Progreso para posiciones activas -->
            <div v-if="position.status === 'active'" class="mb-3">
              <div class="flex justify-between mb-1">
                <small class="text-xs text-gray-500">Progreso:</small>
                <small class="text-xs text-gray-500">{{ getProgress(position) }}%</small>
              </div>
              <div class="w-full bg-gray-200 rounded h-2" :class="isDark ? 'bg-[#1f2937]' : 'bg-gray-200'">
                <div class="bg-green-600 h-2 rounded" :style="`width: ${getProgress(position)}%`"></div>
              </div>
            </div>

            <!-- Acciones -->
            <div class="mt-3">
              <button 
                v-if="position.status === 'active' && position.is_matured"
                @click="withdrawPosition(position)"
                class="inline-flex items-center justify-center w-full rounded-md bg-green-600 text-white hover:bg-green-700 px-4 py-2"
                :disabled="loading"
              >
                <i class="fas fa-coins mr-2"></i>
                Retirar {{ formatNumber(parseFloat(position.amount) + parseFloat(position.accumulated_rewards)) }}
              </button>
              
              <button 
                v-else-if="position.status === 'active'"
                class="inline-flex items-center justify-center w-full rounded-md bg-gray-300 text-gray-700 px-4 py-2" 
                disabled
              >
                <i class="fas fa-lock mr-2"></i>
                Disponible en {{ position.days_remaining }} días
              </button>
              
              <button 
                v-if="position.status === 'active'"
                @click="calculateRewards(position)"
                class="inline-flex items-center justify-center w-full rounded-md border px-4 py-2 mt-2"
                :class="isDark ? 'border-[#1f2937] text-white hover:bg-[#0b1022]' : 'border-gray-300 text-gray-700 hover:bg-gray-50'"
              >
                <i class="fas fa-calculator mr-2"></i>Ver Recompensas Pendientes
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Vista de Tabla para escritorio -->
      <div class="rounded-lg border shadow-sm hidden lg:block" :class="isDark ? 'bg-[#0b1022] border-[#1f2937] text-white' : 'bg-white border-gray-200 text-gray-900'">
        <div class="p-0">
          <div class="overflow-x-auto">
            <table class="min-w-full text-sm">
              <thead :class="isDark ? 'bg-[#111827] text-white' : 'bg-gray-50 text-gray-700'">
                <tr>
                  <th class="px-4 py-2 text-left">Pool</th>
                  <th class="px-4 py-2 text-left">Cantidad</th>
                  <th class="px-4 py-2 text-left">APR</th>
                  <th class="px-4 py-2 text-left">Progreso</th>
                  <th class="px-4 py-2 text-left">Recompensas</th>
                  <th class="px-4 py-2 text-left">ROI</th>
                  <th class="px-4 py-2 text-left">Estado</th>
                  <th class="px-4 py-2 text-left">Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="position in positions.data" :key="position.id">
                  <td>
                    <div class="flex items-center px-4 py-3">
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
                    <br><small class="text-xs text-gray-500">{{ formatDate(position.started_at) }}</small>
                  </td>
                  <td>
                    <span class="text-green-600 font-semibold">{{ position.staking_pool.annual_percentage_rate }}%</span>
                  </td>
                  <td>
                    <div v-if="position.status === 'active'" class="w-32 bg-gray-200 rounded h-2" :class="isDark ? 'bg-[#1f2937]' : 'bg-gray-200'">
                      <div class="bg-green-600 h-2 rounded" :style="`width: ${getProgress(position)}%`"></div>
                    </div>
                    <small class="text-xs text-gray-500">{{ getProgress(position) }}%</small>
                  </td>
                  <td class="text-green-600 font-semibold">
                    +{{ formatNumber(position.accumulated_rewards) }}
                  </td>
                  <td class="font-semibold text-green-600">
                    {{ getRoi(position) }}%
                  </td>
                  <td>
                    <span :class="statusBadgeClass(position.status)">
                      {{ position.status.charAt(0).toUpperCase() + position.status.slice(1) }}
                    </span>
                  </td>
                  <td>
                    <button 
                      v-if="position.status === 'active' && position.is_matured"
                      @click="withdrawPosition(position)"
                      class="inline-flex items-center rounded-md bg-green-600 text-white hover:bg-green-700 px-3 py-2 text-xs mb-1"
                      :disabled="loading"
                    >
                      <i class="fas fa-coins"></i>
                    </button>
                    
                    <button 
                      v-else-if="position.status === 'active'"
                      class="inline-flex items-center rounded-md bg-gray-300 text-gray-700 px-3 py-2 text-xs mb-1" 
                      disabled
                    >
                      <i class="fas fa-lock"></i>
                    </button>
                    
                    <br v-if="position.status === 'active'">
                    <button 
                      v-if="position.status === 'active'"
                      @click="calculateRewards(position)"
                      class="inline-flex items-center rounded-md border px-3 py-2 text-xs"
                      :class="isDark ? 'border-[#1f2937] text-white hover:bg-[#0b1022]' : 'border-gray-300 text-gray-700 hover:bg-gray-50'"
                    >
                      <i class="fas fa-calculator"></i>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Paginación -->
      <nav v-if="positions.last_page > 1" class="flex justify-center mt-4">
        <ul class="inline-flex items-center space-x-2">
          <li>
            <button class="rounded-md border px-3 py-1" @click="changePage(positions.current_page - 1)" :disabled="positions.current_page === 1"
                    :class="isDark ? 'border-[#1f2937] text-white disabled:opacity-50' : 'border-gray-300 text-gray-700 disabled:opacity-50'">
              Anterior
            </button>
          </li>
          <li v-for="page in getVisiblePages()" :key="page">
            <button class="rounded-md border px-3 py-1" @click="changePage(page)"
                    :class="[ isDark ? 'border-[#1f2937] text-white' : 'border-gray-300 text-gray-700', page === positions.current_page ? 'bg-blue-600 text-white border-blue-600' : '' ]">
              {{ page }}
            </button>
          </li>
          <li>
            <button class="rounded-md border px-3 py-1" @click="changePage(positions.current_page + 1)" :disabled="positions.current_page === positions.last_page"
                    :class="isDark ? 'border-[#1f2937] text-white disabled:opacity-50' : 'border-gray-300 text-gray-700 disabled:opacity-50'">
              Siguiente
            </button>
          </li>
        </ul>
      </nav>
    </div>

    <!-- Estado Vacío -->
    <div v-else-if="!loading" class="text-center py-10">
      <div class="mb-4">
        <i class="fas fa-wallet fa-5x text-gray-400 mb-3"></i>
        <h4 class="text-gray-500">No tienes posiciones de staking</h4>
        <p v-if="hasActiveFilters" class="text-gray-500 mb-4">
          No hay posiciones que coincidan con los filtros aplicados.
        </p>
        <p v-else class="text-gray-500 mb-4">
          Comienza a generar ingresos pasivos con nuestros pools de staking.
        </p>
        
        <button v-if="hasActiveFilters" @click="clearFilters" class="inline-flex items-center rounded-md border px-4 py-2 mr-2"
                :class="isDark ? 'border-[#1f2937] text-white hover:bg-[#0b1022]' : 'border-gray-300 text-gray-700 hover:bg-gray-50'">
          <i class="fas fa-times mr-2"></i>Limpiar Filtros
        </button>
        
        <nuxt-link to="/stakingv2" class="inline-flex items-center rounded-md bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 text-lg">
          <i class="fas fa-rocket mr-2"></i>Comenzar Ahora
        </nuxt-link>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex items-center justify-center py-10">
      <div class="h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
    </div>

    <!-- Modal de Recompensas -->
    <div class="modal fade" id="rewardsModal" tabindex="-1" role="dialog">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="px-4 py-3 bg-blue-600 text-white rounded-t">
            <h5 class="font-semibold">
              <i class="fas fa-calculator mr-2"></i>
              Cálculo de Recompensas
            </h5>
          </div>
          <div class="p-4">
            <div class="text-center">
              <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div class="rounded-lg border p-4" :class="isDark ? 'bg-[#0b1022] border-[#1f2937] text-white' : 'bg-white border-gray-200 text-gray-900'">
                  <h6 class="text-xs text-gray-500 mb-1">Pendientes</h6>
                  <h4 class="text-yellow-600 mb-0">{{ rewardsData.pending_rewards }}</h4>
                </div>
                <div class="rounded-lg border p-4" :class="isDark ? 'bg-[#0b1022] border-[#1f2937] text-white' : 'bg-white border-gray-200 text-gray-900'">
                  <h6 class="text-xs text-gray-500 mb-1">Acumuladas</h6>
                  <h4 class="text-green-600 mb-0">{{ rewardsData.accumulated_rewards }}</h4>
                </div>
                <div class="rounded-lg border p-4 bg-blue-600 text-white">
                  <h6 class="text-xs mb-1">Total</h6>
                  <h4 class="mb-0">{{ rewardsData.total_rewards }}</h4>
                </div>
              </div>
            </div>
          </div>
          <div class="px-4 py-3">
            <button type="button" class="inline-flex items-center rounded-md border px-4 py-2" data-dismiss="modal"
                    :class="isDark ? 'border-[#1f2937] text-white hover:bg-[#0b1022]' : 'border-gray-300 text-gray-700 hover:bg-gray-50'">
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

// Layout p2p
setPageLayout('p2p')

// Tema dinámico sincronizado con layout
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
  //middleware: 'auth',

  data() {
    return {
      loading: true,
      positions: { data: [] },
      summary: {
        total_invested: 0,
        total_rewards: 0,
        active_positions: 0,
        average_roi: 0
      },
      cryptocurrencies: [],
      filters: {
        status: '',
        cryptocurrency: '',
        sort: 'newest'
      },
      rewardsData: {
        pending_rewards: '0.00000000',
        accumulated_rewards: '0.00000000',
        total_rewards: '0.00000000'
      }
    }
  },

  computed: {
    hasActiveFilters() {
      return this.filters.status || this.filters.cryptocurrency || this.filters.sort !== 'newest'
    }
  },

  async mounted() {
    await this.fetchPositions()
  },

  methods: {
    async fetchPositions(page = 1) {
      try {
        this.loading = true
        
        const params = {
          page,
          per_page: 10,
          ...this.filters
        }

        const { data } = await this.$axios.get('/staking/my-positions', { params })
        
        this.positions = data.data.positions
        this.summary = data.data.summary
        this.cryptocurrencies = data.data.cryptocurrencies
      } catch (error) {
        this.$store.dispatch('alert/error', 'Error al cargar las posiciones')
        console.error('Error fetching positions:', error)
      } finally {
        this.loading = false
      }
    },

    async withdrawPosition(position) {
      if (!confirm('¿Estás seguro de que quieres retirar esta posición?')) {
        return
      }

      try {
        this.loading = true
        
        const { data } = await this.$axios.post(`/staking/positions/${position.id}/withdraw`)
        
        this.$store.dispatch('alert/success', data.message)
        await this.fetchPositions(this.positions.current_page)
      } catch (error) {
        this.$store.dispatch('alert/error', error.response?.data?.message || 'Error al retirar la posición')
      } finally {
        this.loading = false
      }
    },

    async calculateRewards(position) {
      try {
        const { data } = await this.$axios.get(`/staking/positions/${position.id}/rewards`)
        
        this.rewardsData = data.data
        $('#rewardsModal').modal('show')
      } catch (error) {
        this.$store.dispatch('alert/error', 'Error al calcular las recompensas')
      }
    },

    async applyFilters() {
      await this.fetchPositions(1)
    },

    async clearFilters() {
      this.filters = {
        status: '',
        cryptocurrency: '',
        sort: 'newest'
      }
      await this.fetchPositions(1)
    },

    async changePage(page) {
      if (page >= 1 && page <= this.positions.last_page) {
        await this.fetchPositions(page)
      }
    },

    getVisiblePages() {
      const current = this.positions.current_page
      const last = this.positions.last_page
      const delta = 2
      const range = []
      
      for (let i = Math.max(1, current - delta); i <= Math.min(last, current + delta); i++) {
        range.push(i)
      }
      
      return range
    },

    getProgress(position) {
      if (position.status !== 'active') return 100
      
      const start = new Date(position.started_at)
      const end = new Date(position.ends_at)
      const now = new Date()
      
      const total = end - start
      const elapsed = now - start
      
      return Math.min(100, Math.max(0, (elapsed / total) * 100)).toFixed(1)
    },

    getRoi(position) {
      const amount = parseFloat(position.amount)
      const rewards = parseFloat(position.accumulated_rewards)
      
      if (amount > 0) {
        return ((rewards / amount) * 100).toFixed(2)
      }
      return '0.00'
    },

    formatNumber(number, decimals = 6) {
      return parseFloat(number || 0).toFixed(decimals).replace(/\.?0+$/, '')
    },

    formatDate(dateString) {
      return new Date(dateString).toLocaleDateString('es-ES')
    },

    getCryptoIconClass(crypto) {
      const classes = {
        'BTC': 'bg-bitcoin',
        'ETH': 'bg-ethereum'
      }
      return classes[crypto?.toUpperCase()] || 'bg-crypto-default'
    },

    statusBadgeClass(status) {
      const base = 'inline-flex items-center rounded-full px-2 py-1 text-xs font-medium'
      switch (status) {
        case 'active':
          return `${base} bg-green-100 text-green-700`
        case 'completed':
          return `${base} bg-gray-100 text-gray-700`
        case 'withdrawn':
          return `${base} bg-red-100 text-red-700`
        default:
          return `${base} bg-gray-100 text-gray-700`
      }
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
      title: 'Mis Posiciones - Staking Platform'
    }
  }
}
</script>