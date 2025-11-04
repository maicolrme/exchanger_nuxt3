<template>
  <div class="min-h-screen bg-gray-900">
    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-16">
      <!-- Header -->
      <div class="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
        <div>
          <h1 class="text-2xl md:text-3xl font-bold text-white">Staking</h1>
          <p class="text-sm md:text-base text-gray-300 mt-1">Bloquea tus activos y recibe recompensas periódicas según el plan.</p>
        </div>
        <div class="flex items-center gap-3">
          <label for="staking-filter" class="text-gray-300 text-sm">Duración</label>
          <select
            id="staking-filter"
            v-model="durationFilter"
            class="bg-gray-800 text-gray-200 border border-gray-700 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
            aria-label="Filtrar planes por duración"
          >
            <option value="all">Todas</option>
            <option value="30">30 días</option>
            <option value="90">90 días</option>
            <option value="180">180 días</option>
          </select>
        </div>
      </div>

      <!-- Plans Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <article
          v-for="plan in filteredPlans"
          :key="plan.id"
          class="group rounded-xl border border-gray-800 bg-gray-850/50 hover:bg-gray-800 transition-colors shadow-sm"
        >
          <header class="px-5 pt-5">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="h-10 w-10 rounded-lg bg-gradient-to-br from-yellow-500 to-yellow-300 flex items-center justify-center text-gray-900 font-bold">
                  {{ plan.badge }}
                </div>
                <div>
                  <h2 class="text-white font-semibold">{{ plan.name }}</h2>
                  <p class="text-xs text-gray-400">Bloqueo: {{ plan.lockDays }} días</p>
                </div>
              </div>
              <div class="text-right">
                <div class="text-yellow-400 font-bold text-lg">{{ formatPercent(plan.apr) }} APR</div>
                <div class="text-xs text-gray-400">Recompensa: {{ plan.rewardsFrequency }}</div>
              </div>
            </div>
          </header>

          <div class="px-5 mt-4">
            <ul class="text-gray-300 text-sm space-y-2">
              <li class="flex items-center gap-2">
                <svg class="h-4 w-4 text-green-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fill-rule="evenodd" d="M16.704 5.29a1 1 0 010 1.42l-7.5 7.5a1 1 0 01-1.42 0l-3.5-3.5a1 1 0 111.42-1.42l2.79 2.79 6.79-6.79a1 1 0 011.42 0z" clip-rule="evenodd" />
                </svg>
                Mínimo depósito: <span class="font-medium ml-1">{{ formatCurrency(plan.minDeposit) }}</span>
              </li>
              <li class="flex items-center gap-2">
                <svg class="h-4 w-4 text-green-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fill-rule="evenodd" d="M16.704 5.29a1 1 0 010 1.42l-7.5 7.5a1 1 0 01-1.42 0l-3.5-3.5a1 1 0 111.42-1.42l2.79 2.79 6.79-6.79a1 1 0 011.42 0z" clip-rule="evenodd" />
                </svg>
                Activos soportados: <span class="font-medium ml-1">{{ plan.assets.join(', ') }}</span>
              </li>
              <li class="flex items-center gap-2">
                <svg class="h-4 w-4 text-green-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fill-rule="evenodd" d="M16.704 5.29a1 1 0 010 1.42l-7.5 7.5a1 1 0 01-1.42 0l-3.5-3.5a1 1 0 111.42-1.42l2.79 2.79 6.79-6.79a1 1 0 011.42 0z" clip-rule="evenodd" />
                </svg>
                Interés compuesto: <span class="font-medium ml-1">{{ plan.compound ? 'Sí' : 'No' }}</span>
              </li>
              <li class="flex items-center gap-2">
                <svg class="h-4 w-4 text-green-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fill-rule="evenodd" d="M16.704 5.29a1 1 0 010 1.42l-7.5 7.5a1 1 0 01-1.42 0l-3.5-3.5a1 1 0 111.42-1.42l2.79 2.79 6.79-6.79a1 1 0 011.42 0z" clip-rule="evenodd" />
                </svg>
                Penalidad por retiro anticipado: <span class="font-medium ml-1">{{ plan.earlyExitFee ? formatPercent(plan.earlyExitFee) : 'No' }}</span>
              </li>
            </ul>
          </div>

          <!-- Actions -->
          <div class="px-5 py-5 mt-2 flex items-center justify-between">
            <NuxtLink
              :to="`/staking/${plan.id}`"
              class="text-sm px-3 py-2 rounded-md border border-gray-700 text-gray-200 bg-gray-800 hover:bg-gray-750"
              aria-label="Ver detalles del plan"
            >
              Ver detalles
            </NuxtLink>

            <NuxtLink
              v-if="auth && auth.isAuthenticated"
              to="/wallet"
              class="text-sm px-4 py-2 rounded-md bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-semibold"
            >
              Comenzar staking
            </NuxtLink>
            <NuxtLink
              v-else
              to="/login"
              class="text-sm px-4 py-2 rounded-md bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-semibold"
            >
              Inicia sesión para participar
            </NuxtLink>
          </div>

          <!-- Details inline removidos: la navegación lleva al detalle del plan -->
        </article>
      </div>
    </section>
  </div>
  
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAuthStore } from '~/stores/auth'

definePageMeta({
  layout: 'p2p'
})

useHead({
  title: 'Staking'
})

const auth = useAuthStore()

const durationFilter = ref('all')
const expandedId = ref(null)

const plans = ref([
  {
    id: 1,
    badge: 'S',
    name: 'Starter',
    apr: 0.12,
    lockDays: 30,
    minDeposit: 50,
    rewardsFrequency: 'Diario',
    assets: ['USDT'],
    compound: true,
    earlyExitFee: 0.02,
    description: 'Ideal para comenzar con montos pequeños. Flexibilidad y recompensas diarias con interés compuesto.'
  },
  {
    id: 2,
    badge: 'C',
    name: 'Classic',
    apr: 0.18,
    lockDays: 90,
    minDeposit: 200,
    rewardsFrequency: 'Semanal',
    assets: ['USDT', 'BTC'],
    compound: true,
    earlyExitFee: 0.03,
    description: 'Plan intermedio con mejor APR y soporte para múltiples activos. Ideal para mantener por plazos medios.'
  },
  {
    id: 3,
    badge: 'P',
    name: 'Pro',
    apr: 0.24,
    lockDays: 180,
    minDeposit: 500,
    rewardsFrequency: 'Mensual',
    assets: ['BTC', 'ETH', 'USDT'],
    compound: true,
    earlyExitFee: 0.05,
    description: 'Mayor rendimiento para períodos largos. Recomendado para usuarios con visión de largo plazo.'
  }
])

const filteredPlans = computed(() => {
  if (durationFilter.value === 'all') return plans.value
  const days = Number(durationFilter.value)
  return plans.value.filter(p => p.lockDays === days)
})

function toggleDetails(id) {
  expandedId.value = expandedId.value === id ? null : id
}

function formatPercent(value) {
  return new Intl.NumberFormat('es-ES', { style: 'percent', minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(value)
}

function formatCurrency(value) {
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(value)
}

function estimatedReward(plan) {
  const principal = plan.minDeposit
  const apr = plan.apr
  const days = plan.lockDays
  const reward = principal * apr * (days / 365)
  return `${formatCurrency(reward)} aprox.`
}
</script>

<style scoped>
.bg-gray-850 { background-color: #1f2937; }
.bg-gray-750 { background-color: #2a3447; }
</style>