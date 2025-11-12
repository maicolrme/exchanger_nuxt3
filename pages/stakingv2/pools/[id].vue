<template>
  <div :class="[ isDark ? 'bg-[#060621] text-white' : 'bg-white text-black', 'min-h-screen', 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8' ]">
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6" v-if="!pageLoading">
      <div class="lg:col-span-2">
        <!-- Información del Pool -->
        <div class="rounded-lg border shadow-sm mb-4" :class="isDark ? 'bg-[#0b1022] border-[#1f2937] text-white' : 'bg-white border-gray-200 text-gray-900'">
          <div class="p-4 border-b" :class="isDark ? 'border-[#1f2937]' : 'border-gray-200'">
            <div class="flex items-center">
              <div :class="`crypto-icon ${getCryptoIconClass(pool.cryptocurrency)} mr-3`">
                {{ pool.cryptocurrency ? pool.cryptocurrency.substring(0, 2).toUpperCase() : '' }}
              </div>
              <div>
                <h4 class="mb-0 font-semibold">{{ pool.name }}</h4>
                <small class="text-xs text-gray-500">{{ pool.cryptocurrency ? pool.cryptocurrency.toUpperCase() : '' }} Staking Pool</small>
              </div>
            </div>
          </div>
          <div class="p-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div class="mb-3">
                  <label class="text-xs text-gray-500">RENDIMIENTO ANUAL (APR)</label>
                  <div class="text-2xl text-green-600 font-semibold">{{ pool.annual_percentage_rate }}%</div>
                </div>
                <div class="mb-3">
                  <label class="text-xs text-gray-500">PERÍODO DE BLOQUEO</label>
                  <div class="text-xl">{{ pool.lock_period_days }} días</div>
                </div>
              </div>
              <div>
                <div class="mb-3">
                  <label class="text-xs text-gray-500">CANTIDAD MÍNIMA</label>
                  <div class="text-xl">
                    {{ formatNumber(pool.minimum_amount) }} {{ pool.cryptocurrency ? pool.cryptocurrency.toUpperCase() : '' }}
                  </div>
                </div>
                <div v-if="pool.maximum_amount" class="mb-3">
                  <label class="text-xs text-gray-500">CANTIDAD MÁXIMA</label>
                  <div class="text-xl">
                    {{ formatNumber(pool.maximum_amount) }} {{ pool.cryptocurrency ? pool.cryptocurrency.toUpperCase() : '' }}
                  </div>
                </div>
              </div>
            </div>

            <div v-if="pool.description" class="rounded border p-3 mt-4" :class="isDark ? 'bg-[#111827] text-white border-[#1f2937]' : 'bg-blue-50 text-blue-700 border-blue-200'">
              <i class="fas fa-info-circle mr-2"></i>{{ pool.description }}
            </div>

            <div class="grid grid-cols-3 text-center mt-4" :class="isDark ? 'divide-[#1f2937]' : 'divide-gray-200'">
              <div>
                <div class="text-xl text-blue-600 font-semibold">{{ pool.active_positions_count || 0 }}</div>
                <small class="text-xs text-gray-500">Stakeholders</small>
              </div>
              <div>
                <div class="text-xl text-green-600 font-semibold">{{ formatNumber(pool.total_staked) }}</div>
                <small class="text-xs text-gray-500">Total Staked</small>
              </div>
              <div>
                <div class="text-xl text-cyan-600 font-semibold">{{ formatNumber(dailyRate) }}%</div>
                <small class="text-xs text-gray-500">Rendimiento Diario</small>
              </div>
            </div>
          </div>
        </div>

        <!-- Calculadora de Ganancias -->
        <div class="card">
          <div class="card-header">
            <h5 class="mb-0">
              <i class="fas fa-calculator mr-2"></i>
              Calculadora de Ganancias
            </h5>
          </div>
          <div class="card-body">
            <div class="form-group">
              <label>Cantidad a invertir</label>
              <div class="input-group">
                <input 
                  v-model="calcAmount" 
                  type="number" 
                  class="form-control" 
                  placeholder="0.00000000" 
                  step="0.00000001"
                >
                <div class="input-group-append">
                  <span class="input-group-text">{{ pool.cryptocurrency ? pool.cryptocurrency.toUpperCase() : '' }}</span>
                </div>
              </div>
            </div>
            
            <div class="row">
              <div class="col-md-4">
                <div class="text-center p-3 rounded" :class="isDark ? 'bg-[#111827] text-white' : 'bg-light'">
                  <div class="h6 text-muted mb-0">Ganancia Diaria</div>
                  <div class="h5 text-success">{{ formatNumber(dailyEarnings) }}</div>
                </div>
              </div>
              <div class="col-md-4">
                <div class="text-center p-3 rounded" :class="isDark ? 'bg-[#111827] text-white' : 'bg-light'">
                  <div class="h6 text-muted mb-0">Ganancia Total</div>
                  <div class="h5 text-success">{{ formatNumber(totalEarnings) }}</div>
                </div>
              </div>
              <div class="col-md-4">
                <div class="text-center p-3 rounded" :class="isDark ? 'bg-[#111827] text-white' : 'bg-light'">
                  <div class="h6 text-muted mb-0">Total Final</div>
                  <div class="h5 text-primary">{{ formatNumber(finalAmount) }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="lg:col-span-1">
        <!-- Formulario de Staking -->
        <div class="rounded-lg border shadow-sm" :class="isDark ? 'bg-[#0b1022] border-[#1f2937] text-white' : 'bg-white border-gray-200 text-gray-900'">
          <div class="px-4 py-3 rounded-t-lg bg-blue-600 text-white">
            <h5 class="mb-0 font-semibold">
              <i class="fas fa-plus-circle mr-2"></i>
              Hacer Staking
            </h5>
          </div>
          <div class="p-4">
            <form @submit.prevent="submitStaking">
              <div class="space-y-2">
                <label for="amount" class="text-sm">Cantidad</label>
                <div class="flex">
                  <input 
                    v-model="stakingForm.amount"
                    type="number" 
                    id="amount" 
                    placeholder="0.00000000" 
                    step="0.00000001"
                    :min="pool.minimum_amount"
                    :max="pool.maximum_amount"
                    required
                    class="flex-1 px-3 py-2 rounded-l-md border focus:outline-none focus:ring-2"
                    :class="[ isDark ? 'bg-[#0b1022] border-[#1f2937] text-white placeholder-gray-400 focus:ring-blue-500' : 'bg-white border-gray-300 text-gray-900 focus:ring-blue-500', errors.amount ? 'border-red-500 focus:ring-red-500' : '' ]"
                  >
                  <span class="px-3 py-2 rounded-r-md border border-l-0" :class="isDark ? 'bg-[#0b1022] border-[#1f2937] text-gray-300' : 'bg-gray-50 border-gray-300 text-gray-700'">{{ pool.cryptocurrency ? pool.cryptocurrency.toUpperCase() : '' }}</span>
                </div>
                <div v-if="errors.amount" class="text-red-600 text-sm mt-1">{{ errors.amount }}</div>
                <small class="text-xs text-gray-500">
                  Mín: {{ formatNumber(pool.minimum_amount) }}
                  <span v-if="pool.maximum_amount"> - Máx: {{ formatNumber(pool.maximum_amount) }}</span>
                  {{ pool.cryptocurrency ? pool.cryptocurrency.toUpperCase() : '' }}
                </small>
              </div>

              <div class="rounded border p-3 mt-3" :class="isDark ? 'bg-[#111827] text-yellow-200 border-[#1f2937]' : 'bg-yellow-50 text-yellow-700 border-yellow-200'">
                <i class="fas fa-lock mr-2"></i>
                <small>
                  Tus fondos estarán bloqueados por <strong>{{ pool.lock_period_days }} días</strong>.
                  No podrás retirarlos hasta que termine este período.
                </small>
              </div>

              <button 
                type="submit" 
                class="inline-flex items-center justify-center w-full rounded-md bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 text-lg disabled:opacity-50"
                :disabled="loading || !stakingForm.amount"
              >
                <i v-if="loading" class="fas fa-spinner fa-spin mr-2"></i>
                <i v-else class="fas fa-rocket mr-2"></i>
                {{ loading ? 'Procesando...' : 'Iniciar Staking' }}
              </button>
            </form>
          </div>
        </div>

        <!-- Información Adicional -->
        <div class="rounded-lg border shadow-sm mt-4" :class="isDark ? 'bg-[#0b1022] border-[#1f2937] text-white' : 'bg-white border-gray-200 text-gray-900'">
          <div class="p-4 border-b" :class="isDark ? 'border-[#1f2937]' : 'border-gray-200'">
            <h6 class="mb-0 font-semibold">
              <i class="fas fa-info-circle mr-2"></i>
              ¿Cómo Funciona?
            </h6>
          </div>
          <div class="p-4">
            <div class="text-sm text-gray-500">
              <div class="mb-2">
                <i class="fas fa-check text-green-600 mr-2"></i>
                Deposita tu {{ pool.cryptocurrency ? pool.cryptocurrency.toUpperCase() : '' }} por {{ pool.lock_period_days }} días
              </div>
              <div class="mb-2">
                <i class="fas fa-check text-green-600 mr-2"></i>
                Gana {{ pool.annual_percentage_rate }}% anual ({{ formatNumber(dailyRate) }}% diario)
              </div>
              <div class="mb-2">
                <i class="fas fa-check text-green-600 mr-2"></i>
                Las recompensas se calculan automáticamente
              </div>
              <div>
                <i class="fas fa-check text-green-600 mr-2"></i>
                Retira capital + ganancias al finalizar
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <nuxt-link to="/stakingv2" class="inline-flex items-center rounded-md border px-4 py-2 mt-3" :class="isDark ? 'border-[#1f2937] text-white hover:bg-[#0b1022]' : 'border-gray-300 text-gray-700 hover:bg-gray-50'">
      <i class="fas fa-arrow-left mr-2"></i>Volver al Dashboard
    </nuxt-link>

    <!-- Loading -->
    <div v-if="pageLoading" class="flex flex-col items-center justify-center py-10">
      <div class="h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      <p class="text-gray-500 mt-3">Cargando información del pool...</p>
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
  //middleware: 'auth',

  data() {
    return {
      pageLoading: true,
      loading: false,
      pool: {},
      stakingForm: {
        amount: ''
      },
      calcAmount: 0,
      errors: {}
    }
  },

  computed: {
    dailyRate() {
      return parseFloat(this.pool.annual_percentage_rate || 0) / 365
    },
    
    dailyEarnings() {
      const amount = parseFloat(this.calcAmount) || 0
      return amount * (this.dailyRate / 100)
    },
    
    totalEarnings() {
      return this.dailyEarnings * (this.pool.lock_period_days || 0)
    },
    
    finalAmount() {
      return parseFloat(this.calcAmount || 0) + this.totalEarnings
    }
  },

  watch: {
    calcAmount() {
      this.stakingForm.amount = this.calcAmount
    },
    
    'stakingForm.amount'() {
      this.calcAmount = this.stakingForm.amount
    }
  },

  async mounted() {
    await this.fetchPool()
  },

  methods: {
    async fetchPool() {
      try {
        this.pageLoading = true
        const { data } = await this.$axios.get(`/staking/pools/${this.$route.params.id}`)
        
        if (data.success) {
          this.pool = data.data
        } else {
          throw new Error('Pool no encontrado')
        }
      } catch (error) {
        this.$store.dispatch('alert/error', 'Error al cargar el pool')
        this.$router.push('/staking')
      } finally {
        this.pageLoading = false
      }
    },

    async submitStaking() {
      try {
        this.loading = true
        this.errors = {}

        const { data } = await this.$axios.post(`/staking/pools/${this.pool.id}/stake`, {
          amount: this.stakingForm.amount
        })

        if (data.success) {
          this.$store.dispatch('alert/success', data.message)
          this.$router.push('/staking')
        }
      } catch (error) {
        if (error.response?.status === 422) {
          this.errors = error.response.data.errors || {}
        } else {
          this.$store.dispatch('alert/error', error.response?.data?.message || 'Error al crear el staking')
        }
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
        'ETH': 'bg-ethereum',
        'USDT': 'bg-usdt'
      }
      return classes[crypto?.toUpperCase()] || 'bg-crypto-default'
    }
  },

  head() {
    return {
      title: `${this.pool.name || 'Pool'} - Staking Platform`,
      meta: [
        { hid: 'description', name: 'description', content: `Detalles del pool de staking ${this.pool.name || ''}` }
      ]
    }
  }
}
</script>