<template>
  <div class="min-h-screen bg-gray-900">
    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-16">
      <!-- Breadcrumb / Header -->
      <div class="flex items-center justify-between mb-6">
        <nav aria-label="Breadcrumb" class="text-sm">
          <ol class="flex items-center gap-2 text-gray-400">
            <li><NuxtLink to="/staking" class="hover:text-white">Staking</NuxtLink></li>
            <li aria-hidden="true">/</li>
            <li class="text-white font-medium">{{ plan?.name || 'Detalle' }}</li>
          </ol>
        </nav>
        <div class="text-right">
          <p class="text-xs text-gray-400">Bloqueo</p>
          <p class="text-white font-semibold">{{ plan?.lockDays }} días</p>
        </div>
      </div>

      <!-- Title Bar -->
      <div class="rounded-xl border border-gray-800 bg-gray-850 px-6 py-5 mb-8">
        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div class="flex items-center gap-4">
            <div class="h-12 w-12 rounded-xl bg-gradient-to-br from-yellow-500 to-yellow-300 flex items-center justify-center text-gray-900 font-bold text-lg">
              {{ plan?.badge }}
            </div>
            <div>
              <h1 class="text-2xl font-bold text-white">{{ plan?.name }} – Plan de Staking</h1>
              <p class="text-sm text-gray-300">APR dinámico y recompensas {{ plan?.rewardsFrequency?.toLowerCase() }}</p>
            </div>
          </div>
          <div class="text-right">
            <p class="text-xs text-gray-400">APR</p>
            <p class="text-yellow-400 font-bold text-2xl">{{ formatPercent(plan?.apr) }}</p>
          </div>
        </div>
      </div>

      <!-- Content -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Form -->
        <div class="lg:col-span-2 space-y-6">
          <div class="rounded-xl border border-gray-800 bg-gray-850 p-6">
            <h2 class="text-white font-semibold text-lg">Participar en el plan</h2>
            <form @submit.prevent="onStart">
              <div class="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm text-gray-300 mb-1" for="asset">Activo</label>
                  <select id="asset" v-model="selectedAsset" class="w-full bg-gray-800 text-gray-200 border border-gray-700 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400">
                    <option v-for="asset in plan?.assets || []" :key="asset" :value="asset">{{ asset }}</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm text-gray-300 mb-1" for="amount">Monto</label>
                  <input id="amount" v-model.number="amount" type="number" min="0" step="0.0001" class="w-full bg-gray-800 text-gray-200 border border-gray-700 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400" placeholder="Ingrese monto" />
                  <p class="mt-1 text-xs" :class="isAmountValid ? 'text-gray-400' : 'text-red-400'">
                    Mínimo depósito: {{ formatCurrency(plan?.minDeposit) }}
                  </p>
                </div>
              </div>

              <div class="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div class="rounded-md bg-gray-800 p-3">
                  <p class="text-xs text-gray-400">Bloqueo</p>
                  <p class="text-white font-medium">{{ plan?.lockDays }} días</p>
                </div>
                <div class="rounded-md bg-gray-800 p-3">
                  <p class="text-xs text-gray-400">Recompensa estimada</p>
                  <p class="text-white font-medium">{{ estimatedTotal }}</p>
                </div>
                <div class="rounded-md bg-gray-800 p-3">
                  <p class="text-xs text-gray-400">Interés compuesto</p>
                  <p class="text-white font-medium">{{ plan?.compound ? 'Sí' : 'No' }}</p>
                </div>
              </div>

              <div class="mt-4 flex items-start gap-3">
                <input id="accept" type="checkbox" v-model="accepted" class="mt-1 h-4 w-4 rounded border-gray-700 bg-gray-800 text-yellow-500 focus:ring-yellow-400" />
                <label for="accept" class="text-sm text-gray-300">Acepto términos del plan y la penalidad por retiro anticipado {{ plan?.earlyExitFee ? '(' + formatPercent(plan?.earlyExitFee) + ')' : '' }}</label>
              </div>

              <div class="mt-6 flex flex-wrap gap-3">
                <button type="submit" :disabled="!canStart" class="px-4 py-2 rounded-md text-sm font-semibold"
                  :class="canStart ? 'bg-yellow-500 hover:bg-yellow-400 text-gray-900' : 'bg-gray-700 text-gray-400 cursor-not-allowed'">
                  Iniciar Staking
                </button>
                <NuxtLink to="/staking" class="px-4 py-2 rounded-md text-sm border border-gray-700 text-gray-200 hover:bg-gray-800">Volver</NuxtLink>
              </div>
            </form>
          </div>

          <!-- Features -->
          <div class="rounded-xl border border-gray-800 bg-gray-850 p-6">
            <h2 class="text-white font-semibold text-lg">Características del plan</h2>
            <ul class="mt-3 text-sm text-gray-300 space-y-2">
              <li class="flex items-center gap-2">
                <span class="h-4 w-4 bg-green-500 rounded-sm"></span>
                Pagos {{ plan?.rewardsFrequency?.toLowerCase() }} según APR
              </li>
              <li class="flex items-center gap-2">
                <span class="h-4 w-4 bg-green-500 rounded-sm"></span>
                Activos soportados: {{ (plan?.assets || []).join(', ') }}
              </li>
              <li class="flex items-center gap-2">
                <span class="h-4 w-4 bg-green-500 rounded-sm"></span>
                Interés compuesto: {{ plan?.compound ? 'Sí' : 'No' }}
              </li>
              <li class="flex items-center gap-2">
                <span class="h-4 w-4 bg-yellow-500 rounded-sm"></span>
                Penalidad por retiro anticipado: {{ plan?.earlyExitFee ? formatPercent(plan?.earlyExitFee) : 'No' }}
              </li>
            </ul>
          </div>
        </div>

        <!-- Summary -->
        <aside class="lg:col-span-1">
          <div class="rounded-xl border border-gray-800 bg-gray-850 p-6">
            <h3 class="text-white font-semibold">Resumen</h3>
            <dl class="mt-3 text-sm text-gray-300 space-y-2">
              <div class="flex justify-between">
                <dt>Plan</dt><dd class="text-white font-medium">{{ plan?.name }}</dd>
              </div>
              <div class="flex justify-between">
                <dt>APR</dt><dd class="text-yellow-400 font-semibold">{{ formatPercent(plan?.apr) }}</dd>
              </div>
              <div class="flex justify-between">
                <dt>Bloqueo</dt><dd class="text-white font-medium">{{ plan?.lockDays }} días</dd>
              </div>
              <div class="flex justify-between">
                <dt>Monto</dt><dd class="text-white font-medium">{{ formatCurrency(amount || 0) }}</dd>
              </div>
              <div class="flex justify-between">
                <dt>Estimado total</dt><dd class="text-green-400 font-semibold">{{ estimatedTotal }}</dd>
              </div>
            </dl>
            <p class="mt-4 text-xs text-gray-400">La estimación es informativa y puede variar según condiciones de mercado.</p>
          </div>
        </aside>
      </div>

      <!-- Fallback if plan not found -->
      <div v-if="!plan" class="mt-8 rounded-xl border border-gray-800 bg-gray-850 p-6">
        <p class="text-white font-medium">El plan solicitado no existe.</p>
        <NuxtLink to="/staking" class="mt-3 inline-block px-4 py-2 rounded-md text-sm border border-gray-700 text-gray-200 hover:bg-gray-800">Volver al listado</NuxtLink>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '~/stores/auth'


const auth = useAuthStore()
const route = useRoute()
const router = useRouter()

// Demo plans (deberían provenir de API en producción)
const plans = ref([
  { id: 1, badge: 'S', name: 'Starter', apr: 0.12, lockDays: 30, minDeposit: 50, rewardsFrequency: 'Diario', assets: ['USDT'], compound: true, earlyExitFee: 0.02, description: 'Ideal para comenzar con montos pequeños.' },
  { id: 2, badge: 'C', name: 'Classic', apr: 0.18, lockDays: 90, minDeposit: 200, rewardsFrequency: 'Semanal', assets: ['USDT', 'BTC'], compound: true, earlyExitFee: 0.03, description: 'Plan intermedio con mejor APR.' },
  { id: 3, badge: 'P', name: 'Pro', apr: 0.24, lockDays: 180, minDeposit: 500, rewardsFrequency: 'Mensual', assets: ['BTC', 'ETH', 'USDT'], compound: true, earlyExitFee: 0.05, description: 'Mayor rendimiento a largo plazo.' }
])

const id = computed(() => Number(route.params.id))
const plan = computed(() => plans.value.find(p => p.id === id.value))

useHead({ title: `Staking · ${plan.value?.name || 'Detalle'}` })

const selectedAsset = ref(plan.value?.assets?.[0] || 'USDT')
const amount = ref(plan.value?.minDeposit || 0)
const accepted = ref(false)

const isAmountValid = computed(() => (amount.value || 0) >= (plan.value?.minDeposit || 0))
const canStart = computed(() => !!plan.value && isAmountValid.value && accepted.value)

function formatPercent(value) {
  if (!value && value !== 0) return '-'
  return new Intl.NumberFormat('es-ES', { style: 'percent', minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(value)
}
function formatCurrency(value) {
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(value)
}
const estimatedTotal = computed(() => {
  if (!plan.value) return '-'
  const principal = amount.value || 0
  const apr = plan.value.apr
  const days = plan.value.lockDays
  const reward = principal * apr * (days / 365)
  return `${formatCurrency(reward)} aprox.`
})

function onStart() {
  if (!plan.value) return
  if (!auth || !auth.isAuthenticated) {
    router.push('/login')
    return
  }
  // En un escenario real, llamar API para crear la orden de staking
  router.push({ path: '/wallet', query: { staking: plan.value.id, asset: selectedAsset.value, amount: amount.value } })
}
</script>

<style scoped>
.bg-gray-850 { background-color: #1f2937; }
</style>