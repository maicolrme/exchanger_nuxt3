<template>
  <div class="orders-history-container">
    <div class="container-fluid">
      <!-- Encabezado -->
      <div class="page-header">
        <h2>Historial de Órdenes</h2>
        <div class="header-controls">
          <div class="search-box">
            <input 
              type="text" 
              class="form-control" 
              v-model="searchQuery" 
              placeholder="Buscar por mercado..."
            >
          </div>
          <div class="filter-controls">
            <select class="form-select" v-model="selectedMarket">
              <option value="">Todos los mercados</option>
              <option v-for="market in availableMarkets" :key="market" :value="market">
                {{ market }}
              </option>
            </select>
            <select class="form-select" v-model="selectedStatus">
              <option value="">Todos los estados</option>
              <option value="open">Abiertas</option>
              <option value="partially_filled">Parcialmente ejecutadas</option>
              <option value="filled">Ejecutadas</option>
              <option value="cancelled">Canceladas</option>
            </select>
            <select class="form-select" v-model="selectedType">
              <option value="">Todos los tipos</option>
              <option value="limit">Límite</option>
              <option value="market">Mercado</option>
              <option value="stop_loss">Stop Loss</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Tabla de órdenes -->
      <div class="orders-table-container">
        <div class="table-responsive">
          <table class="table custom-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Mercado</th>
                <th>Tipo</th>
                <th>Lado</th>
                <th>Precio</th>
                <th>Cantidad</th>
                <th>Ejecutado</th>
                <th>Total</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="order in filteredOrders" :key="order.id" :class="getOrderRowClass(order)">
                <td>{{ formatDate(order.created_at) }}</td>
                <td>
                  <router-link :to="'/trade/' + order.market" class="market-link">
                    {{ order.market }}
                  </router-link>
                </td>
                <td>{{ translateOrderType(order.type) }}</td>
                <td>
                  <span :class="order.side === 'buy' ? 'text-success' : 'text-danger'">
                    {{ order.side === 'buy' ? 'Compra' : 'Venta' }}
                  </span>
                </td>
                <td>{{ formatPrice(order.price) }}</td>
                <td>{{ formatAmount(order.amount) }}</td>
                <td>{{ formatAmount(order.filled_amount) }}</td>
                <td>{{ formatPrice(order.price * order.amount) }}</td>
                <td>
                  <span :class="getStatusClass(order.status)">
                    {{ translateStatus(order.status) }}
                  </span>
                </td>
                <td>
                  <div class="action-buttons">
                    <button 
                      v-if="order.status === 'open' || order.status === 'partially_filled'"
                      @click="cancelOrder(order.id)" 
                      class="btn btn-sm btn-outline-danger"
                    >
                      Cancelar
                    </button>
                    <button 
                      v-if="order.status === 'filled'"
                      @click="viewOrderDetails(order)" 
                      class="btn btn-sm btn-outline-info"
                    >
                      Detalles
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="filteredOrders.length === 0">
                <td colspan="10" class="text-center no-orders">
                  No se encontraron órdenes
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Paginación -->
      <div class="pagination-container">
        <div class="pagination-info">
          Mostrando {{ paginationInfo.start }} - {{ paginationInfo.end }} de {{ paginationInfo.total }}
        </div>
        <div class="pagination-controls">
          <button 
            class="btn btn-outline-light" 
            :disabled="currentPage === 1"
            @click="changePage(currentPage - 1)"
          >
            Anterior
          </button>
          <span class="page-info">Página {{ currentPage }} de {{ totalPages }}</span>
          <button 
            class="btn btn-outline-light" 
            :disabled="currentPage === totalPages"
            @click="changePage(currentPage + 1)"
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useAuth } from '~/composables/useAuth';
import { useNuxtApp } from '#app';

// Definir middleware de autenticación
definePageMeta({
  middleware: ['auth']
});

// Usar el composable de autenticación
const { user, isAuthenticated } = useAuth();

// Obtener la instancia de axios
const { $axios } = useNuxtApp();

// Estado
const orders = ref([]);
const loading = ref(true);
const searchQuery = ref('');
const selectedMarket = ref('');
const selectedStatus = ref('');
const selectedType = ref('');
const currentPage = ref(1);
const itemsPerPage = 20;

// Computed properties
const availableMarkets = computed(() => {
  const markets = new Set(orders.value.map(order => order.market));
  return Array.from(markets).sort();
});

const filteredOrders = computed(() => {
  let filtered = orders.value;

  // Aplicar filtros
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(order => 
      order.market.toLowerCase().includes(query)
    );
  }

  if (selectedMarket.value) {
    filtered = filtered.filter(order => order.market === selectedMarket.value);
  }

  if (selectedStatus.value) {
    filtered = filtered.filter(order => order.status === selectedStatus.value);
  }

  if (selectedType.value) {
    filtered = filtered.filter(order => order.type === selectedType.value);
  }

  // Aplicar paginación
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return filtered.slice(start, end);
});

const totalPages = computed(() => {
  return Math.ceil(orders.value.length / itemsPerPage);
});

const paginationInfo = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage + 1;
  const end = Math.min(start + itemsPerPage - 1, orders.value.length);
  return {
    start,
    end,
    total: orders.value.length
  };
});

// Funciones
async function fetchOrders() {
  try {
    loading.value = true;
    // Obtener órdenes abiertas y completadas
    const [openResponse, completedResponse] = await Promise.all([
      $axios.get('/api/orders/open'),
      $axios.get('/api/orders/completed')
    ]);

    // Combinar las órdenes
    orders.value = [
      ...(openResponse.data.data || openResponse.data),
      ...(completedResponse.data.data || completedResponse.data)
    ];

    console.log('Órdenes obtenidas:', orders.value);
  } catch (error) {
    console.error('Error al obtener órdenes:', error);
    // Datos de ejemplo en caso de error
    orders.value = [
      {
        id: 1,
        market: 'BTC_USDT',
        type: 'limit',
        side: 'buy',
        price: '50000',
        amount: '0.1',
        filled_amount: '0.1',
        status: 'filled',
        created_at: new Date().toISOString()
      },
      {
        id: 2,
        market: 'ETH_USDT',
        type: 'market',
        side: 'sell',
        price: '3000',
        amount: '1',
        filled_amount: '1',
        status: 'filled',
        created_at: new Date().toISOString()
      }
    ];
  } finally {
    loading.value = false;
  }
}

function formatDate(date) {
  return new Date(date).toLocaleString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function formatPrice(price) {
  return Number(price).toFixed(8);
}

function formatAmount(amount) {
  return Number(amount).toFixed(8);
}

function translateOrderType(type) {
  const types = {
    'limit': 'Límite',
    'market': 'Mercado',
    'stop_loss': 'Stop Loss'
  };
  return types[type] || type;
}

function translateStatus(status) {
  const statuses = {
    'open': 'Abierta',
    'partially_filled': 'Parcialmente ejecutada',
    'filled': 'Ejecutada',
    'cancelled': 'Cancelada'
  };
  return statuses[status] || status;
}

function getStatusClass(status) {
  const classes = {
    'open': 'text-warning',
    'partially_filled': 'text-info',
    'filled': 'text-success',
    'cancelled': 'text-danger'
  };
  return classes[status] || '';
}

function getOrderRowClass(order) {
  return {
    'buy-order': order.side === 'buy',
    'sell-order': order.side === 'sell',
    'completed-order': order.status === 'filled' || order.status === 'cancelled'
  };
}

async function cancelOrder(orderId) {
  try {
    await $axios.delete(`/orders/${orderId}`);
    await fetchOrders();
  } catch (error) {
    console.error('Error al cancelar orden:', error);
  }
}

function viewOrderDetails(order) {
  // Implementar vista de detalles de la orden
  console.log('Ver detalles de orden:', order);
}

function changePage(page) {
  currentPage.value = page;
}

// Inicialización
onMounted(async () => {
  if (isAuthenticated.value) {
    await fetchOrders();
  }
});
</script>

<style scoped>
.orders-history-container {
  padding: 2rem 0;
}

.page-header {
  margin-bottom: 2rem;
}

.page-header h2 {
  color: #fff;
  margin-bottom: 1rem;
}

.header-controls {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.search-box {
  flex: 1;
  min-width: 200px;
}

.filter-controls {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.filter-controls .form-select {
  min-width: 150px;
}

.orders-table-container {
  background-color: #1e1e1e;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1.5rem;
}

.custom-table {
  color: white;
  margin-bottom: 0;
}

.custom-table thead th {
  background-color: #2a2a2a;
  border-bottom: 1px solid #3a3a3a;
  color: #ccc;
  font-weight: 500;
  padding: 0.75rem;
}

.custom-table tbody td {
  padding: 0.75rem;
  vertical-align: middle;
  border-bottom: 1px solid #3a3a3a;
}

.buy-order {
  background-color: rgba(40, 167, 69, 0.05);
}

.sell-order {
  background-color: rgba(220, 53, 69, 0.05);
}

.completed-order {
  opacity: 0.7;
}

.market-link {
  color: #00ff00;
  text-decoration: none;
}

.market-link:hover {
  text-decoration: underline;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.no-orders {
  padding: 2rem;
  color: #888;
}

.pagination-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
}

.pagination-info {
  color: #888;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.page-info {
  color: #888;
}

.form-control, .form-select {
  background-color: #2a2a2a;
  border: 1px solid #3a3a3a;
  color: #fff;
}

.form-control:focus, .form-select:focus {
  background-color: #2a2a2a;
  border-color: #4a4a4a;
  box-shadow: 0 0 0 0.2rem rgba(255, 255, 255, 0.1);
}

.btn-outline-light {
  color: #fff;
  border-color: #fff;
}

.btn-outline-light:hover {
  background-color: #fff;
  color: #000;
}

.btn-outline-danger {
  color: #dc3545;
  border-color: #dc3545;
}

.btn-outline-danger:hover {
  background-color: #dc3545;
  color: #fff;
}

.btn-outline-info {
  color: #17a2b8;
  border-color: #17a2b8;
}

.btn-outline-info:hover {
  background-color: #17a2b8;
  color: #fff;
}

.text-success {
  color: #28a745 !important;
}

.text-danger {
  color: #dc3545 !important;
}

.text-warning {
  color: #ffc107 !important;
}

.text-info {
  color: #17a2b8 !important;
}
</style> 