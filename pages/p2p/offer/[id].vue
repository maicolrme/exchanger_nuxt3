<template>
  <div class="container mx-auto px-4 py-6 pb-32 md:pb-6">
    <div class="grid md:grid-cols-3 gap-6">
      <!-- Left Column - Ad Details -->
      <div class="md:col-span-2 space-y-6">
        <!-- Merchant Info Card -->
        <div class="bg-gray-800 rounded-lg p-6">
          <div class="flex items-start justify-between mb-4">
            <div class="flex items-center gap-4">
              <div class="w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center font-bold text-2xl text-gray-900">
                {{ ad.username.substring(0, 2).toUpperCase() }}
              </div>
              <div>
                <div class="flex items-center gap-2 mb-1">
                  <NuxtLink :to="`/p2p/user/${ad.username}`" 
                            class="text-xl font-bold hover:text-yellow-400 transition cursor-pointer">
                    {{ ad.username }}
                  </NuxtLink>
                  <svg v-if="ad.verified" class="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                  </svg>
                </div>
                <div class="flex gap-4 text-sm text-gray-400">
                  <span>{{ ad.trades }} operaciones</span>
                  <span class="text-green-500">{{ ad.completion }}% completadas</span>
                </div>
              </div>
            </div>
            <button class="text-gray-400 hover:text-white">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </button>
          </div>

          <div class="grid grid-cols-3 gap-4">
            <div class="bg-gray-700 rounded-lg p-3 text-center">
              <div class="text-2xl font-bold text-yellow-400">{{ ad.avgReleaseTime }}</div>
              <div class="text-xs text-gray-400 mt-1">Tiempo liberación</div>
            </div>
            <div class="bg-gray-700 rounded-lg p-3 text-center">
              <div class="text-2xl font-bold text-yellow-400">{{ ad.avgPayTime }}</div>
              <div class="text-xs text-gray-400 mt-1">Tiempo de pago</div>
            </div>
            <div class="bg-gray-700 rounded-lg p-3 text-center">
              <div class="text-2xl font-bold text-green-500">{{ ad.positiveRate }}%</div>
              <div class="text-xs text-gray-400 mt-1">Valoración</div>
            </div>
          </div>
        </div>

        <!-- Price Info -->
        <div class="bg-gray-800 rounded-lg p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-bold">Información del Precio</h3>
            <span class="px-3 py-1 bg-green-500 bg-opacity-20 text-green-500 rounded-full text-sm font-semibold">
              {{ ad.type === 'buy' ? 'Comprar' : 'Vender' }}
            </span>
          </div>
          
          <div class="grid md:grid-cols-2 gap-4 mb-4">
            <div class="bg-gradient-to-br from-yellow-400/10 to-yellow-600/5 border border-yellow-400/20 rounded-lg p-4">
              <div class="text-sm text-gray-400 mb-1">Precio</div>
              <div class="text-3xl font-bold">{{ ad.price }}</div>
              <div class="text-sm text-gray-400 mt-1">{{ ad.fiat }}</div>
            </div>
            <div class="bg-gradient-to-br from-yellow-400/10 to-yellow-600/5 border border-yellow-400/20 rounded-lg p-4">
              <div class="text-sm text-gray-400 mb-1">Disponible</div>
              <div class="text-3xl font-bold">{{ ad.available }}</div>
              <div class="text-sm text-gray-400 mt-1">{{ ad.crypto }}</div>
            </div>
          </div>

          <div class="bg-gray-700 rounded-lg p-4">
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm text-gray-400">Límites de la orden</span>
            </div>
            <div class="text-lg font-semibold">{{ ad.limits }}</div>
          </div>
        </div>

        <!-- Payment Methods -->
        <div class="bg-gray-800 rounded-lg p-6">
          <h3 class="text-lg font-bold mb-4">Métodos de Pago</h3>
          <div class="flex flex-wrap gap-3">
            <div v-for="method in ad.paymentMethods" :key="method" 
                 class="bg-gray-700 px-4 py-2 rounded-lg flex items-center gap-2">
              <svg class="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <span>{{ method }}</span>
            </div>
          </div>
        </div>

        <!-- Terms and Conditions -->
        <div class="bg-gray-800 rounded-lg p-6">
          <h3 class="text-lg font-bold mb-4">Términos y Condiciones</h3>
          <div class="bg-gray-700 rounded-lg p-4 space-y-3 text-sm text-gray-300">
            <p v-for="(term, index) in ad.terms" :key="index" class="flex gap-3">
              <span class="text-yellow-400 flex-shrink-0">•</span>
              <span>{{ term }}</span>
            </p>
          </div>
        </div>

        <!-- Reviews Section - Desktop -->
        <div class="hidden md:block bg-gray-800 rounded-lg p-6">
          <h3 class="text-lg font-bold mb-4">Reseñas Recientes</h3>
          <div class="space-y-4">
            <div v-for="review in ad.reviews" :key="review.id" 
                 class="bg-gray-700 rounded-lg p-4">
              <div class="flex items-center justify-between mb-2">
                <div class="flex items-center gap-2">
                  <div class="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center text-xs font-bold">
                    {{ review.user.substring(0, 2).toUpperCase() }}
                  </div>
                  <span class="font-semibold text-sm">{{ review.user }}</span>
                </div>
                <div class="flex items-center gap-1">
                  <svg v-for="i in 5" :key="i" 
                       class="w-4 h-4" 
                       :class="i <= review.rating ? 'text-yellow-400' : 'text-gray-600'"
                       fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                  </svg>
                </div>
              </div>
              <p class="text-sm text-gray-300">{{ review.comment }}</p>
              <div class="text-xs text-gray-400 mt-2">{{ review.date }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column - Trade Form -->
      <div class="md:col-span-1">
        <div class="bg-gray-800 rounded-lg p-6 sticky top-20">
          <h3 class="text-lg font-bold mb-4">Realizar Operación</h3>
          
          <div class="space-y-4 mb-6">
            <div>
              <label class="text-sm text-gray-400 block mb-2">Quiero gastar</label>
              <div class="relative">
                <input v-model="tradeAmount" type="number" 
                       @input="updateCalculation"
                       class="w-full bg-gray-700 rounded-lg pl-4 pr-16 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                       placeholder="100.00">
                <div class="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 font-semibold">
                  {{ ad.fiat }}
                </div>
              </div>
              <div class="text-xs text-gray-400 mt-1">
                Límites: {{ ad.limits }}
              </div>
            </div>

            <div class="flex items-center justify-center">
              <svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"></path>
              </svg>
            </div>

            <div>
              <label class="text-sm text-gray-400 block mb-2">Recibiré</label>
              <div class="relative">
                <input :value="receiveAmount" readonly
                       class="w-full bg-gray-700 rounded-lg pl-4 pr-16 py-3 text-gray-300">
                <div class="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 font-semibold">
                  {{ ad.crypto }}
                </div>
              </div>
            </div>
          </div>

          <!-- Quick Amount Buttons -->
          <div class="grid grid-cols-4 gap-2 mb-6">
            <button @click="setQuickAmount(100)" 
                    class="bg-gray-700 hover:bg-gray-600 rounded py-2 text-sm font-semibold transition">
              100
            </button>
            <button @click="setQuickAmount(500)" 
                    class="bg-gray-700 hover:bg-gray-600 rounded py-2 text-sm font-semibold transition">
              500
            </button>
            <button @click="setQuickAmount(1000)" 
                    class="bg-gray-700 hover:bg-gray-600 rounded py-2 text-sm font-semibold transition">
              1K
            </button>
            <button @click="setQuickAmount(5000)" 
                    class="bg-gray-700 hover:bg-gray-600 rounded py-2 text-sm font-semibold transition">
              5K
            </button>
          </div>

          <!-- Warning -->
          <div class="bg-yellow-500 bg-opacity-10 border border-yellow-500 rounded-lg p-4 mb-6">
            <div class="flex gap-3">
              <svg class="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
              </svg>
              <div class="text-xs">
                <div class="font-semibold text-yellow-500 mb-1">Importante</div>
                <p class="text-gray-300">Lee todos los términos antes de continuar. El tiempo de pago es de {{ ad.paymentTimeLimit }}.</p>
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="space-y-3">
            <button @click="confirmTrade" 
                    class="w-full bg-green-500 hover:bg-green-600 py-4 rounded-lg font-bold text-lg transition">
              {{ ad.type === 'buy' ? 'Comprar' : 'Vender' }} {{ ad.crypto }}
            </button>
            <button class="w-full bg-gray-700 hover:bg-gray-600 py-3 rounded-lg font-semibold transition">
              Chatear con el {{ ad.type === 'buy' ? 'Vendedor' : 'Comprador' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom Fixed Bar - Mobile -->
    <div class="fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700 p-4 md:hidden z-40">
      <div class="flex gap-3">
        <button class="flex-1 bg-gray-700 hover:bg-gray-600 py-3 rounded-lg font-semibold transition">
          Chat
        </button>
        <button @click="confirmTrade" 
                class="flex-1 bg-green-500 hover:bg-green-600 py-3 rounded-lg font-bold transition">
          {{ ad.type === 'buy' ? 'Comprar' : 'Vender' }} Ahora
        </button>
      </div>
    </div>

    <!-- Confirmation Modal -->
    <div v-if="showConfirmModal" @click="showConfirmModal = false" 
         class="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div @click.stop class="bg-gray-800 rounded-2xl p-6 max-w-md w-full mx-4">
        <div class="text-center mb-6">
          <div class="w-16 h-16 bg-yellow-500 bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
            </svg>
          </div>
          <h3 class="text-xl font-bold mb-2">Confirmar Operación</h3>
          <p class="text-gray-400 text-sm mb-4">
            Estás a punto de {{ ad.type === 'buy' ? 'comprar' : 'vender' }} {{ receiveAmount }} {{ ad.crypto }} por {{ tradeAmount }} {{ ad.fiat }}
          </p>
        </div>

        <div class="bg-gray-700 rounded-lg p-4 mb-6 space-y-2 text-sm">
          <div class="flex justify-between">
            <span class="text-gray-400">Precio:</span>
            <span>{{ ad.price }} {{ ad.fiat }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-400">Cantidad:</span>
            <span>{{ receiveAmount }} {{ ad.crypto }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-400">Total:</span>
            <span class="font-bold">{{ tradeAmount }} {{ ad.fiat }}</span>
          </div>
        </div>

        <div class="flex gap-3">
          <button @click="showConfirmModal = false" 
                  class="flex-1 bg-gray-700 hover:bg-gray-600 py-3 rounded-lg font-semibold transition">
            Cancelar
          </button>
          <button @click="processTrade" 
                  class="flex-1 bg-green-500 hover:bg-green-600 py-3 rounded-lg font-bold transition">
            Confirmar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Layout
definePageMeta({
  layout: 'p2p'
})

// Route params
const route = useRoute()
const router = useRouter()

// Data de ejemplo del anuncio
const ad = ref({
  id: route.params.id,
  username: 'CryptoTrader2024',
  verified: true,
  trades: 1247,
  completion: 98.5,
  avgReleaseTime: '2min',
  avgPayTime: '5min',
  positiveRate: 99.2,
  type: 'buy', // 'buy' o 'sell'
  price: '96,850.00',
  fiat: 'COP',
  available: '0.5432',
  crypto: 'USDT',
  limits: '50,000 - 500,000 COP',
  paymentTimeLimit: '15 minutos',
  paymentMethods: [
    'Bancolombia',
    'Nequi',
    'Daviplata',
    'PSE'
  ],
  terms: [
    'Pago únicamente por los métodos listados arriba.',
    'Después de realizar el pago, sube el comprobante y marca como pagado.',
    'El vendedor liberará las criptomonedas en un máximo de 15 minutos.',
    'No canceles la orden después de realizar el pago.',
    'Cualquier disputa será resuelta por el equipo de soporte.'
  ],
  reviews: [
    {
      id: 1,
      user: 'Usuario123',
      rating: 5,
      comment: 'Excelente vendedor, muy rápido y confiable. Recomendado 100%.',
      date: 'Hace 2 días'
    },
    {
      id: 2,
      user: 'Trader456',
      rating: 5,
      comment: 'Transacción perfecta, liberó los fondos inmediatamente después del pago.',
      date: 'Hace 1 semana'
    },
    {
      id: 3,
      user: 'Crypto789',
      rating: 4,
      comment: 'Buen vendedor, aunque tardó un poco más de lo esperado.',
      date: 'Hace 2 semanas'
    }
  ]
})

// Estados reactivos
const tradeAmount = ref(100000)
const showConfirmModal = ref(false)

// Computed
const receiveAmount = computed(() => {
  if (!tradeAmount.value) return '0.00'
  const price = parseFloat(ad.value.price.replace(/,/g, ''))
  return (tradeAmount.value / price).toFixed(4)
})

// Métodos
const updateCalculation = () => {
  // La calculación se hace automáticamente con el computed
}

const setQuickAmount = (amount) => {
  tradeAmount.value = amount
}

const confirmTrade = () => {
  if (!tradeAmount.value || tradeAmount.value <= 0) {
    alert('Por favor ingresa una cantidad válida')
    return
  }
  showConfirmModal.value = true
}

const processTrade = () => {
  showConfirmModal.value = false
  // Aquí irá la lógica para procesar la operación
  alert('Operación iniciada. Serás redirigido al chat de la operación.')
  // router.push('/p2p/orders')
}

// Meta tags
useHead({
  title: `Detalle del Anuncio - ${ad.value.username}`,
  meta: [
    { name: 'description', content: `Compra ${ad.value.crypto} con ${ad.value.fiat} de ${ad.value.username}` }
  ]
})
</script>

<style scoped>
.price-up {
  color: #0ecb81;
}

.price-down {
  color: #f6465d;
}
</style>