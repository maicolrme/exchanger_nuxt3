<template>
  <div class="min-h-screen pb-24 md:pb-6">
    <!-- Profile Header -->
    <section class="bg-gradient-to-br from-yellow-500 to-yellow-600 py-8 md:py-12">
      <div class="container mx-auto px-4">
        <div class="flex flex-col md:flex-row items-center md:items-start gap-6">
          <div class="w-24 h-24 md:w-32 md:h-32 bg-gradient-to-br from-gray-900 to-gray-800 rounded-full flex items-center justify-center font-bold text-4xl md:text-5xl text-white border-4 border-white shadow-xl">
            {{ profile.username.substring(0, 2).toUpperCase() }}
          </div>
          <div class="flex-1 text-center md:text-left">
            <div class="flex items-center justify-center md:justify-start gap-3 mb-2">
              <h2 class="text-3xl md:text-4xl font-bold text-gray-900">{{ profile.username }}</h2>
              <svg v-if="profile.verified" class="w-7 h-7 text-gray-900" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
              </svg>
            </div>
            <div class="flex flex-wrap justify-center md:justify-start gap-4 text-gray-900 mb-4">
              <span class="flex items-center gap-1">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                Miembro desde {{ profile.memberSince }}
              </span>
              <span class="flex items-center gap-1">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"></path>
                </svg>
                Última vez en línea: {{ profile.lastOnline }}
              </span>
            </div>
            <div class="flex flex-wrap justify-center md:justify-start gap-3">
              <button @click="sendMessage" class="px-6 py-2 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition">
                Enviar Mensaje
              </button>
              <button @click="blockUser" class="px-6 py-2 bg-white text-gray-900 rounded-lg font-semibold hover:bg-gray-100 transition">
                Bloquear Usuario
              </button>
              <button @click="reportUser" class="px-6 py-2 bg-white text-gray-900 rounded-lg font-semibold hover:bg-gray-100 transition">
                Reportar
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Main Content -->
    <div class="container mx-auto px-4 py-6">
      <!-- Stats Overview -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div class="stat-card bg-gradient-to-br from-yellow-400/10 to-yellow-600/5 border border-yellow-400/20 rounded-lg p-4">
          <div class="text-3xl md:text-4xl font-bold text-yellow-400 mb-1">{{ profile.totalTrades }}</div>
          <div class="text-sm text-gray-400">Total Operaciones</div>
        </div>
        <div class="stat-card bg-gradient-to-br from-green-400/10 to-green-600/5 border border-green-400/20 rounded-lg p-4">
          <div class="text-3xl md:text-4xl font-bold text-green-400 mb-1">{{ profile.completionRate }}%</div>
          <div class="text-sm text-gray-400">Tasa Completitud</div>
        </div>
        <div class="stat-card bg-gradient-to-br from-yellow-400/10 to-yellow-600/5 border border-yellow-400/20 rounded-lg p-4">
          <div class="text-3xl md:text-4xl font-bold text-yellow-400 mb-1">{{ profile.avgReleaseTime }}</div>
          <div class="text-sm text-gray-400">Tiempo Promedio</div>
        </div>
        <div class="stat-card bg-gradient-to-br from-green-400/10 to-green-600/5 border border-green-400/20 rounded-lg p-4">
          <div class="text-3xl md:text-4xl font-bold text-green-400 mb-1">{{ profile.positiveRate }}%</div>
          <div class="text-sm text-gray-400">Reseñas Positivas</div>
        </div>
      </div>

      <div class="grid md:grid-cols-3 gap-6">
        <!-- Left Column -->
        <div class="md:col-span-2 space-y-6">
          <!-- Trading Stats -->
          <div class="bg-gray-800 rounded-lg p-6">
            <h3 class="text-xl font-bold mb-4">Estadísticas de Trading</h3>
            <div class="grid md:grid-cols-2 gap-6">
              <div>
                <h4 class="text-sm font-semibold text-gray-400 mb-3">Últimos 30 días</h4>
                <div class="space-y-3">
                  <div>
                    <div class="flex justify-between text-sm mb-1">
                      <span class="text-gray-400">Operaciones completadas</span>
                      <span class="font-bold">{{ profile.stats.last30Days.completed }}</span>
                    </div>
                  </div>
                  <div>
                    <div class="flex justify-between text-sm mb-1">
                      <span class="text-gray-400">Como comprador</span>
                      <span class="font-bold">{{ profile.stats.last30Days.asBuyer }}</span>
                    </div>
                  </div>
                  <div>
                    <div class="flex justify-between text-sm mb-1">
                      <span class="text-gray-400">Como vendedor</span>
                      <span class="font-bold">{{ profile.stats.last30Days.asSeller }}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <h4 class="text-sm font-semibold text-gray-400 mb-3">Histórico Total</h4>
                <div class="space-y-3">
                  <div>
                    <div class="flex justify-between text-sm mb-1">
                      <span class="text-gray-400">Primera operación</span>
                      <span class="font-bold">{{ profile.stats.firstTrade }}</span>
                    </div>
                  </div>
                  <div>
                    <div class="flex justify-between text-sm mb-1">
                      <span class="text-gray-400">Socios únicos</span>
                      <span class="font-bold">{{ profile.stats.uniquePartners }}</span>
                    </div>
                  </div>
                  <div>
                    <div class="flex justify-between text-sm mb-1">
                      <span class="text-gray-400">Volumen total</span>
                      <span class="font-bold">${{ profile.stats.totalVolume }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Performance Metrics -->
          <div class="bg-gray-800 rounded-lg p-6">
            <h3 class="text-xl font-bold mb-4">Métricas de Rendimiento</h3>
            <div class="space-y-4">
              <div>
                <div class="flex justify-between text-sm mb-2">
                  <span class="text-gray-400">Tiempo promedio de liberación</span>
                  <span class="font-bold text-yellow-400">{{ profile.avgReleaseTime }}</span>
                </div>
                <div class="h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div class="h-full bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full" :style="{width: '95%'}"></div>
                </div>
              </div>
              <div>
                <div class="flex justify-between text-sm mb-2">
                  <span class="text-gray-400">Tiempo promedio de pago</span>
                  <span class="font-bold text-yellow-400">{{ profile.avgPayTime }}</span>
                </div>
                <div class="h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div class="h-full bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full" :style="{width: '88%'}"></div>
                </div>
              </div>
              <div>
                <div class="flex justify-between text-sm mb-2">
                  <span class="text-gray-400">Tasa de respuesta</span>
                  <span class="font-bold text-green-400">{{ profile.responseRate }}%</span>
                </div>
                <div class="h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div class="h-full bg-gradient-to-r from-green-400 to-green-500 rounded-full" :style="{width: profile.responseRate + '%'}"></div>
                </div>
              </div>
              <div>
                <div class="flex justify-between text-sm mb-2">
                  <span class="text-gray-400">Satisfacción del cliente</span>
                  <span class="font-bold text-green-400">{{ profile.satisfaction }}%</span>
                </div>
                <div class="h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div class="h-full bg-gradient-to-r from-green-400 to-green-500 rounded-full" :style="{width: profile.satisfaction + '%'}"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Reviews -->
          <div class="bg-gray-800 rounded-lg p-6">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-xl font-bold">Reseñas ({{ profile.reviews.length }})</h3>
              <select v-model="reviewFilter" class="bg-gray-700 rounded px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500">
                <option value="all">Todas</option>
                <option value="positive">Positivas</option>
                <option value="negative">Negativas</option>
              </select>
            </div>
            <div class="space-y-4">
              <div v-for="review in filteredReviews" :key="review.id" 
                   class="bg-gray-700 rounded-lg p-4">
                <div class="flex items-start justify-between mb-3">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center text-sm font-bold">
                      {{ review.user.substring(0, 2).toUpperCase() }}
                    </div>
                    <div>
                      <div class="font-semibold">{{ review.user }}</div>
                      <div class="text-xs text-gray-400">{{ review.date }}</div>
                    </div>
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
                <p class="text-sm text-gray-300 mb-2">{{ review.comment }}</p>
                <div class="flex items-center gap-4 text-xs text-gray-400">
                  <span class="flex items-center gap-1">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
                    </svg>
                    {{ review.amount }} {{ review.crypto }}
                  </span>
                  <span>{{ review.type }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Column -->
        <div class="space-y-6">
          <!-- Quick Actions -->
          <div class="bg-gray-800 rounded-lg p-6">
            <h3 class="text-lg font-bold mb-4">Acciones Rápidas</h3>
            <div class="space-y-3">
              <button @click="sendMessage" class="w-full bg-yellow-500 hover:bg-yellow-600 text-gray-900 py-3 rounded-lg font-semibold transition">
                Enviar Mensaje
              </button>
              <button @click="viewOffers" class="w-full bg-gray-700 hover:bg-gray-600 py-3 rounded-lg font-semibold transition">
                Ver Anuncios Activos
              </button>
              <button @click="blockUser" class="w-full bg-red-500 hover:bg-red-600 py-3 rounded-lg font-semibold transition">
                Bloquear Usuario
              </button>
            </div>
          </div>

          <!-- Trust Score -->
          <div class="bg-gray-800 rounded-lg p-6">
            <h3 class="text-lg font-bold mb-4">Puntuación de Confianza</h3>
            <div class="text-center mb-4">
              <div class="text-4xl font-bold text-yellow-400 mb-2">{{ profile.trustScore }}/100</div>
              <div class="text-sm text-gray-400">Basado en {{ profile.totalTrades }} operaciones</div>
            </div>
            <div class="space-y-3">
              <div class="flex justify-between text-sm">
                <span class="text-gray-400">Verificación de identidad</span>
                <span class="text-green-400">✓ Verificado</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-gray-400">Verificación de teléfono</span>
                <span class="text-green-400">✓ Verificado</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-gray-400">Verificación de email</span>
                <span class="text-green-400">✓ Verificado</span>
              </div>
            </div>
          </div>

          <!-- Payment Methods -->
          <div class="bg-gray-800 rounded-lg p-6">
            <h3 class="text-lg font-bold mb-4">Métodos de Pago Preferidos</h3>
            <div class="space-y-2">
              <div v-for="method in profile.paymentMethods" :key="method" 
                   class="bg-gray-700 px-3 py-2 rounded-lg flex items-center gap-2">
                <svg class="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                </svg>
                <span class="text-sm">{{ method }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Report Modal -->
    <div v-if="showReportModal" @click="showReportModal = false" 
         class="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div @click.stop class="bg-gray-800 rounded-2xl p-6 max-w-md w-full mx-4">
        <div class="text-center mb-6">
          <div class="w-16 h-16 bg-red-500 bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
            </svg>
          </div>
          <h3 class="text-xl font-bold mb-2">Reportar Usuario</h3>
          <p class="text-gray-400 text-sm mb-4">
            ¿Por qué quieres reportar a {{ profile.username }}?
          </p>
        </div>

        <div class="space-y-3 mb-6">
          <label class="flex items-center gap-3 cursor-pointer">
            <input type="radio" v-model="reportReason" value="fraud" class="text-yellow-500">
            <span class="text-sm">Actividad fraudulenta</span>
          </label>
          <label class="flex items-center gap-3 cursor-pointer">
            <input type="radio" v-model="reportReason" value="spam" class="text-yellow-500">
            <span class="text-sm">Spam o contenido inapropiado</span>
          </label>
          <label class="flex items-center gap-3 cursor-pointer">
            <input type="radio" v-model="reportReason" value="harassment" class="text-yellow-500">
            <span class="text-sm">Acoso o comportamiento abusivo</span>
          </label>
          <label class="flex items-center gap-3 cursor-pointer">
            <input type="radio" v-model="reportReason" value="other" class="text-yellow-500">
            <span class="text-sm">Otro motivo</span>
          </label>
        </div>

        <div class="flex gap-3">
          <button @click="showReportModal = false" 
                  class="flex-1 bg-gray-700 hover:bg-gray-600 py-3 rounded-lg font-semibold transition">
            Cancelar
          </button>
          <button @click="submitReport" 
                  class="flex-1 bg-red-500 hover:bg-red-600 py-3 rounded-lg font-bold transition">
            Reportar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Layout


// Route params
const route = useRoute()
const router = useRouter()

// Estados reactivos
const reviewFilter = ref('all')
const showReportModal = ref(false)
const reportReason = ref('')

// Datos de ejemplo del perfil de usuario
const profile = ref({
  username: route.params.username || 'CryptoTrader2024',
  verified: true,
  memberSince: 'Enero 2022',
  lastOnline: 'Hace 5 minutos',
  totalTrades: 1247,
  completionRate: 98.5,
  avgReleaseTime: '2min',
  avgPayTime: '5min',
  positiveRate: 99.2,
  responseRate: 96,
  satisfaction: 98,
  trustScore: 95,
  stats: {
    last30Days: {
      completed: 45,
      asBuyer: 22,
      asSeller: 23
    },
    firstTrade: 'Enero 2022',
    uniquePartners: 234,
    totalVolume: '2,450,000'
  },
  paymentMethods: [
    'Bancolombia',
    'Nequi',
    'Daviplata',
    'PSE',
    'PayPal'
  ],
  reviews: [
    {
      id: 1,
      user: 'Usuario123',
      rating: 5,
      comment: 'Excelente comerciante, muy rápido y confiable. Recomendado 100%. La transacción se completó sin problemas.',
      date: 'Hace 2 días',
      amount: '500.00',
      crypto: 'USDT',
      type: 'Compra'
    },
    {
      id: 2,
      user: 'Trader456',
      rating: 5,
      comment: 'Transacción perfecta, liberó los fondos inmediatamente después del pago. Muy profesional.',
      date: 'Hace 1 semana',
      amount: '1,200.00',
      crypto: 'USDT',
      type: 'Venta'
    },
    {
      id: 3,
      user: 'Crypto789',
      rating: 4,
      comment: 'Buen comerciante, aunque tardó un poco más de lo esperado. Pero al final todo salió bien.',
      date: 'Hace 2 semanas',
      amount: '300.00',
      crypto: 'BTC',
      type: 'Compra'
    },
    {
      id: 4,
      user: 'BitcoinFan',
      rating: 5,
      comment: 'Increíble experiencia de trading. Muy comunicativo y transparente en todo el proceso.',
      date: 'Hace 3 semanas',
      amount: '800.00',
      crypto: 'USDT',
      type: 'Venta'
    },
    {
      id: 5,
      user: 'CryptoNewbie',
      rating: 5,
      comment: 'Perfecto para principiantes. Me ayudó mucho durante mi primera transacción P2P.',
      date: 'Hace 1 mes',
      amount: '150.00',
      crypto: 'USDT',
      type: 'Compra'
    },
    {
      id: 6,
      user: 'TraderPro',
      rating: 3,
      comment: 'La transacción se completó pero hubo algunos retrasos en la comunicación.',
      date: 'Hace 1 mes',
      amount: '2,000.00',
      crypto: 'BTC',
      type: 'Venta'
    }
  ]
})

// Computed
const filteredReviews = computed(() => {
  if (reviewFilter.value === 'all') return profile.value.reviews
  if (reviewFilter.value === 'positive') return profile.value.reviews.filter(r => r.rating >= 4)
  if (reviewFilter.value === 'negative') return profile.value.reviews.filter(r => r.rating < 4)
  return profile.value.reviews
})

// Métodos
const sendMessage = () => {
  // Aquí iría la lógica para enviar mensaje
  alert(`Enviando mensaje a ${profile.value.username}`)
}

const blockUser = () => {
  // Aquí iría la lógica para bloquear usuario
  if (confirm(`¿Estás seguro de que quieres bloquear a ${profile.value.username}?`)) {
    alert(`Usuario ${profile.value.username} bloqueado`)
  }
}

const reportUser = () => {
  showReportModal.value = true
}

const submitReport = () => {
  if (!reportReason.value) {
    alert('Por favor selecciona un motivo para el reporte')
    return
  }
  
  // Aquí iría la lógica para enviar el reporte
  alert(`Reporte enviado contra ${profile.value.username} por: ${reportReason.value}`)
  showReportModal.value = false
  reportReason.value = ''
}

const viewOffers = () => {
  // Redirigir a la página P2P con filtro del usuario
  navigateTo('/p2p')
}

// Meta tags
useHead({
  title: `Perfil de ${profile.value.username} - CryptoEx`,
  meta: [
    { name: 'description', content: `Perfil del comerciante ${profile.value.username} en CryptoEx P2P` }
  ]
})
</script>

<style scoped>
.stat-card {
  background: linear-gradient(135deg, rgba(251, 191, 36, 0.1) 0%, rgba(245, 158, 11, 0.05) 100%);
  border: 1px solid rgba(251, 191, 36, 0.2);
}

.price-up {
  color: #0ecb81;
}

.price-down {
  color: #f6465d;
}
</style>