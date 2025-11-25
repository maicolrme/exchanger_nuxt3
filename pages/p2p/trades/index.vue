<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useP2pTrades } from '~/composables/useP2pTrades'
import SkeletonLoader from '~/components/p2p/SkeletonLoader.vue'

// --- Estado ---
const isLightMode = ref(false)
const currentTab = ref('active')

// --- Datos del Servidor ---
const { trades, loading, error, fetchTrades } = useP2pTrades()

onMounted(() => {
  fetchTrades()
})

// --- Datos ---
const tabs = [
  { id: 'active', name: 'Órdenes Activas' },
  { id: 'history', name: 'Historial' }
]

const activeOrders = computed(() => 
  trades.value.filter(t => t.status === 'Pendiente de pago' || t.status === 'En proceso' || t.status === 'En disputa')
)

const orderHistory = computed(() => 
  trades.value.filter(t => t.status === 'Completada' || t.status === 'Cancelada')
)

// --- Métodos ---
const toggleTheme = () => {
  isLightMode.value = !isLightMode.value
}

const getStatusClass = (status: string) => {
  const classes: Record<string, string> = {
    'Pendiente de pago': 'text-yellow-800 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-800/20',
    'En proceso': 'text-blue-800 bg-blue-100 dark:text-blue-400 dark:bg-blue-800/20',
    'Completada': 'text-green-800 bg-green-100 dark:text-green-400 dark:bg-green-800/20',
    'Cancelada': 'text-red-800 bg-red-100 dark:text-red-400 dark:bg-red-800/20'
  }
  return classes[status] || 'text-gray-800 bg-gray-100 dark:text-gray-400 dark:bg-gray-800/20'
}

const router = useRouter()

const viewOrder = (orderId: string) => {
  console.log('Redirigiendo al trade con ID:', orderId)
  router.push(`/p2p/trades/${orderId}`)
}
</script>

<template>
  <div>
    <!-- Contenedor Raíz que maneja el tema (simulando el body del ejemplo anterior) -->
    <div 
      class="min-h-screen transition-colors duration-300 font-sans"
      :class="[ isLightMode ? 'light-mode bg-gray-100 text-gray-900' : 'dark-mode bg-gray-900 text-white' ]"
    >
      
      <!-- Tabs Container (Sin Navbar encima) -->
      <div class="sticky top-0 z-40 shadow-md" :class="isLightMode ? 'bg-white border-b border-gray-200' : 'bg-gray-800 border-b border-gray-700'">
        <div class="max-w-7xl mx-auto px-6 ">
          <button 
            v-for="tab in tabs" 
            :key="tab.id"
            @click="currentTab = tab.id"
            class="py-4 px-6 text-base font-semibold transition-colors relative"
            :class="currentTab === tab.id 
              ? 'text-yellow-500' 
              : (isLightMode ? 'text-gray-500 hover:text-gray-900 hover:bg-gray-50' : 'text-gray-400 hover:text-white hover:bg-gray-700')"
          >
            {{ tab.name }}
            <!-- Active Indicator -->
            <div v-if="currentTab === tab.id" class="absolute bottom-0 left-0 w-full h-1 bg-yellow-500 rounded-t-full"></div>
          </button>
        </div>
      </div>

      <!-- Main Content Area -->
      <div class="max-w-7xl mx-auto px-6 py-8">
        
        <!-- Header de la Sección con Toggle de Tema -->
        <div class="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <h2 class="text-2xl font-bold">
            Listado de {{ currentTab === 'active' ? 'Órdenes Activas' : 'Historial de Órdenes' }}
          </h2>

          <!-- Toggle Switch (Reubicado aquí al quitar el navbar) -->
          
        </div>

        <!-- Desktop View: Table (Hidden on mobile) -->
        <div class="hidden md:block rounded-xl shadow-lg overflow-hidden border transition-colors" 
             :class="isLightMode ? 'bg-white border-gray-200' : 'bg-gray-800 border-gray-700'">
          <table class="w-full app-table">
            <thead>
              <tr :class="isLightMode ? 'bg-gray-50' : 'bg-gray-800/50'">
                <th>ID de Orden</th>
                <th>Tipo</th>
                <th>Cripto</th>
                <th>Cantidad</th>
                <th>Precio</th>
                <th>Total (EUR)</th>
                <th>Fecha</th>
                <th>Estado</th>
                <th>Contraparte</th>
                <th v-if="currentTab === 'active'">Acción</th>
              </tr>
            </thead>
            <tbody>
              <!-- Loading State -->
              <tr v-if="loading">
                <td :colspan="currentTab === 'active' ? 10 : 9" class="text-center">
                  <SkeletonLoader />
                </td>
              </tr>

              <!-- Error State -->
              <tr v-else-if="error">
                <td :colspan="currentTab === 'active' ? 10 : 9" class="text-center py-12 px-6 bg-red-50 dark:bg-red-800/20">
                  <p class="text-xl font-bold text-red-600 dark:text-red-400">¡Error!</p>
                  <p class="mt-2 text-red-500 dark:text-red-300">No se pudieron cargar los trades.</p>
                </td>
              </tr>

              <!-- No Data State -->
              <tr v-else-if="(currentTab === 'active' && activeOrders.length === 0) || (currentTab === 'history' && orderHistory.length === 0)">
                <td :colspan="currentTab === 'active' ? 10 : 9" class="text-center py-12">
                  <p class="text-xl font-semibold text-gray-500">No hay trades para mostrar.</p>
                </td>
              </tr>

              <!-- Data Rows -->
              <tr v-else v-for="order in currentTab === 'active' ? activeOrders : orderHistory" :key="order.id" 
                  class="transition-colors group" 
                  :class="isLightMode ? 'hover:bg-gray-50 border-t border-gray-100' : 'hover:bg-gray-700 border-t border-gray-700'">
                
                <td class="text-sm font-mono text-gray-400">{{ order.trade_number }}</td>
                <td class="font-bold" :class="order.type === 'buy' ? 'text-green-500' : 'text-red-500'">
                  {{ order.type === 'buy' ? 'COMPRA' : 'VENTA' }}
                </td>
                <td class="font-semibold">{{ order.crypto }}</td>
                <td>{{ order.amount }} {{ order.crypto }}</td>
                <td>{{ order.price }} {{ order.fiat }}</td>
                <td class="font-bold text-yellow-500">{{ order.total }} {{ order.fiat }}</td>
                <td class="text-sm text-gray-400">{{ order.date }}</td>
                <td>
                  <span class="text-xs font-medium px-3 py-1 rounded-full whitespace-nowrap" :class="getStatusClass(order.status)">
                    {{ order.status }}
                  </span>
                </td>
                <td>
                  <div class="flex items-center space-x-2">
                    <span class="font-semibold">{{ order.counterparty.name }}</span>
                    <span v-if="order.counterparty.is_verified" class="text-blue-500">✓</span>
                    <span class="text-xs text-gray-400">({{ order.counterparty.rating }})</span>
                  </div>
                </td>
                <td v-if="currentTab === 'active'">
                  <button @click="viewOrder(order.id)" class="bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-bold py-1.5 px-4 rounded-lg text-sm transition shadow-sm">
                    Ver
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Mobile View: Cards (Hidden on desktop) -->
        <div class="md:hidden space-y-4">
          <!-- Mobile Loading -->
          <div v-if="loading" class="py-8">
            <SkeletonLoader />
          </div>
          <!-- Mobile Error -->
          <div v-else-if="error" class="text-center py-12 px-6 bg-red-50 dark:bg-red-800/20 rounded-lg">
            <p class="text-xl font-bold text-red-600 dark:text-red-400">¡Error!</p>
            <p class="mt-2 text-red-500 dark:text-red-300">No se pudieron cargar los trades.</p>
          </div>
          <!-- Mobile No Data -->
          <div v-else-if="(currentTab === 'active' && activeOrders.length === 0) || (currentTab === 'history' && orderHistory.length === 0)" class="text-center py-12">
            <p class="text-xl font-semibold text-gray-500">No hay trades para mostrar.</p>
          </div>

          <div v-else v-for="order in currentTab === 'active' ? activeOrders : orderHistory" :key="order.id" 
               class="rounded-xl p-4 space-y-3 shadow-md border transition-colors" 
               :class="isLightMode ? 'bg-white border-gray-200' : 'bg-gray-800 border-gray-700'">
            
            <div class="flex justify-between items-center border-b pb-3 mb-2" :class="isLightMode ? 'border-gray-100' : 'border-gray-700'">
              <h3 class="font-bold text-lg" :class="order.type === 'buy' ? 'text-green-500' : 'text-red-500'">
                {{ order.type === 'buy' ? 'Compra' : 'Venta' }} {{ order.crypto }}
              </h3>
              <span class="text-xs font-medium px-3 py-1 rounded-full" :class="getStatusClass(order.status)">
                {{ order.status }}
              </span>
            </div>

            <div class="grid grid-cols-2 gap-2 text-sm">
              <div class="text-gray-400">Total</div>
              <div class="font-bold text-yellow-500 text-right">{{ order.total }} {{ order.fiat }}</div>
              
              <div class="text-gray-400">Cantidad</div>
              <div class="font-semibold text-right">{{ order.amount }} {{ order.crypto }}</div>

              <div class="text-gray-400">Fecha</div>
              <div class="text-right text-gray-500">{{ order.date.substring(5, 16) }}</div>
            </div>

            <button v-if="currentTab === 'active'" @click="viewOrder(order.id)" class="w-full mt-2 bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-bold py-2.5 rounded-lg transition shadow-sm">
              Ver detalles
            </button>
          </div>
        </div>
        
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Custom Scrollbar */
.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }

/* Table specific styles */
.app-table th {
  padding: 1rem 1.5rem;
  text-align: left;
  font-weight: 600;
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 0.05em;
  color: #9ca3af;
}

.app-table td {
  padding: 1rem 1.5rem;
}
</style>