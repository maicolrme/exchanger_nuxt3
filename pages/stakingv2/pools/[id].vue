<template>
  <div class="min-h-screen bg-gray-900 text-gray-300">
    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-16">
      <div v-if="pool && !pageLoading">
        <!-- Back Button -->
        <nuxt-link to="/stakingv2" class="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" /></svg>
          Volver a los Pools
        </nuxt-link>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Left Column: Pool Info & Calculator -->
          <div class="lg:col-span-2 space-y-6">
            <!-- Pool Info -->
            <div class="rounded-xl border border-gray-800 bg-gray-850/50">
              <header class="p-5 border-b border-gray-800">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-3">
                    <div class="h-12 w-12 rounded-lg bg-gradient-to-br from-yellow-500 to-yellow-300 flex items-center justify-center text-gray-900 font-bold text-lg">
                      {{ pool.cryptocurrency ? pool.cryptocurrency.substring(0, 3).toUpperCase() : '' }}
                    </div>
                    <div>
                      <h1 class="text-xl font-bold text-white">{{ pool.name }}</h1>
                      <p class="text-sm text-gray-400">{{ pool.cryptocurrency ? pool.cryptocurrency.toUpperCase() : '' }} Staking Pool</p>
                    </div>
                  </div>
                  <div class="text-right">
                    <div class="text-2xl font-bold text-green-400">{{ pool.annual_percentage_rate }}%</div>
                    <p class="text-sm text-gray-400">APR</p>
                  </div>
                </div>
              </header>
              <div class="p-5 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                <div>
                  <p class="text-sm text-gray-400">Bloqueo</p>
                  <p class="text-lg font-semibold text-white">{{ pool.lock_period_days }} días</p>
                </div>
                <div>
                  <p class="text-sm text-gray-400">Inversión Mínima</p>
                  <p class="text-lg font-semibold text-white">{{ formatNumber(pool.minimum_amount) }}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-400">Total Staked</p>
                  <p class="text-lg font-semibold text-white">{{ formatNumber(pool.total_staked) }}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-400">Stakeholders</p>
                  <p class="text-lg font-semibold text-white">{{ pool.active_positions_count || 0 }}</p>
                </div>
              </div>
              <div v-if="pool.description" class="px-5 pb-5">
                  <p class="text-sm text-gray-400 bg-gray-800 p-3 rounded-md"><i class="fas fa-info-circle mr-2"></i>{{ pool.description }}</p>
              </div>
            </div>

            <!-- Calculator -->
            <div class="rounded-xl border border-gray-800 bg-gray-850/50 p-5">
              <h2 class="text-lg font-semibold text-white mb-4">Calculadora de Ganancias</h2>
              <div class="flex flex-col sm:flex-row items-end gap-4">
                <div class="flex-grow w-full">
                  <label for="calc-amount" class="text-sm text-gray-400">Cantidad a invertir</label>
                  <div class="relative mt-1">
                    <input v-model="calcAmount" id="calc-amount" type="number" placeholder="0.00" class="w-full bg-gray-900 border-gray-700 rounded-md py-2 pl-3 pr-16 text-white focus:ring-2 focus:ring-yellow-400">
                    <span class="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400">{{ pool.cryptocurrency ? pool.cryptocurrency.toUpperCase() : '' }}</span>
                  </div>
                </div>
              </div>
              <div class="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                <div class="bg-gray-800 p-3 rounded-lg">
                  <p class="text-sm text-gray-400">Ganancia Diaria</p>
                  <p class="text-md font-semibold text-green-400">+{{ formatNumber(dailyEarnings) }}</p>
                </div>
                <div class="bg-gray-800 p-3 rounded-lg">
                  <p class="text-sm text-gray-400">Ganancia Total</p>
                  <p class="text-md font-semibold text-green-400">+{{ formatNumber(totalEarnings) }}</p>
                </div>
                <div class="bg-gray-800 p-3 rounded-lg">
                  <p class="text-sm text-gray-400">Balance Final</p>
                  <p class="text-md font-semibold text-white">{{ formatNumber(finalAmount) }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Right Column: Staking Form -->
          <div class="lg:col-span-1">
            <div class="rounded-xl border border-gray-800 bg-gray-850/50 p-5 sticky top-6">
              <h2 class="text-lg font-semibold text-white mb-4">Iniciar Staking</h2>
              <form @submit.prevent="submitStaking">
                <div class="space-y-4">
                  <div>
                    <label for="amount" class="text-sm text-gray-400">Cantidad</label>
                    <div class="relative mt-1">
                      <input v-model="stakingForm.amount" id="amount" type="number" :placeholder="`Mín. ${pool.minimum_amount}`" :min="pool.minimum_amount" :max="pool.maximum_amount" required class="w-full bg-gray-900 border-gray-700 rounded-md py-2 pl-3 pr-16 text-white focus:ring-2 focus:ring-yellow-400" :class="{'border-red-500': errors.amount}">
                      <span class="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400">{{ pool.cryptocurrency ? pool.cryptocurrency.toUpperCase() : '' }}</span>
                    </div>
                    <p v-if="errors.amount" class="text-red-500 text-xs mt-1">{{ errors.amount }}</p>
                  </div>
                  <div class="text-xs text-gray-400 bg-gray-800 p-3 rounded-md">
                    <i class="fas fa-lock mr-2"></i> Tus fondos estarán bloqueados por <strong>{{ pool.lock_period_days }} días</strong>. No podrás retirarlos hasta que termine el período.
                  </div>
                  <button type="submit" :disabled="loading || !stakingForm.amount" class="w-full py-3 rounded-md bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                    <span v-if="loading"><i class="fas fa-spinner fa-spin mr-2"></i>Procesando...</span>
                    <span v-else>Confirmar Staking</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="pageLoading" class="flex flex-col items-center justify-center py-20">
        <div class="h-10 w-10 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
        <p class="text-gray-400 mt-4">Cargando información del pool...</p>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useNuxtApp } from '#app'

const route = useRoute()
const router = useRouter()
const { $axios, $store } = useNuxtApp()

const pageLoading = ref(true)
const loading = ref(false)
const pool = ref(null)
const stakingForm = ref({ amount: '' })
const calcAmount = ref(0)
const errors = ref({})

useHead(() => ({
  title: pool.value ? `${pool.value.name} - Staking V2` : 'Staking V2'
}))

const dailyRate = computed(() => parseFloat(pool.value?.annual_percentage_rate || 0) / 365)
const dailyEarnings = computed(() => (parseFloat(calcAmount.value) || 0) * (dailyRate.value / 100))
const totalEarnings = computed(() => dailyEarnings.value * (pool.value?.lock_period_days || 0))
const finalAmount = computed(() => (parseFloat(calcAmount.value) || 0) + totalEarnings.value)

watch(calcAmount, (newVal) => {
  stakingForm.value.amount = newVal
})

watch(() => stakingForm.value.amount, (newVal) => {
  calcAmount.value = newVal
})

async function fetchPool() {
  try {
    pageLoading.value = true
    const { data } = await $axios.get(`/staking/pools/${route.params.id}`)
    if (data.success) {
      pool.value = data.data
    } else {
      throw new Error('Pool no encontrado')
    }
  } catch (error) {
    $store.dispatch('alert/error', 'Error al cargar el pool')
    router.push('/stakingv2')
  } finally {
    pageLoading.value = false
  }
}

async function submitStaking() {
  try {
    loading.value = true
    errors.value = {}
    const { data } = await $axios.post(`/staking/pools/${pool.value.id}/stake`, {
      amount: stakingForm.value.amount
    })
    if (data.success) {
      $store.dispatch('alert/success', data.message)
      router.push('/stakingv2/my-positions')
    } else {
        throw new Error(data.message || 'Error al procesar el staking')
    }
  } catch (error) {
    if (error.response?.status === 422 && error.response.data.errors) {
      errors.value.amount = error.response.data.errors.amount?.[0]
    } else {
      $store.dispatch('alert/error', error.response?.data?.message || 'Ocurrió un error inesperado')
    }
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
  })
}

onMounted(() => {
  fetchPool()
})
</script>

<style scoped>
.bg-gray-850 { background-color: #1f2937; }
</style>