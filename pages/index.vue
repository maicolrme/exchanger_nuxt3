<template>
  <div class="container markets-container">
    <h1>Mercados Disponibles</h1>
    
    <!-- Filtros y Búsqueda -->
    <div class="filters-section">
      <div class="row align-items-center">
        <div class="col-md-6">
          <div class="input-group">
            <span class="input-group-text"><i class="bi bi-search"></i></span>
            <input 
              type="text" 
              class="form-control" 
              placeholder="Buscar mercado..." 
              v-model="searchQuery"
            >
          </div>
        </div>
        <div class="col-md-6 text-md-end mt-3 mt-md-0">
          <div class="btn-group" role="group">
            <button 
              v-for="filter in filters" 
              :key="filter.value" 
              type="button" 
              class="btn" 
              :class="activeFilter === filter.value ? 'btn-primary' : 'btn-outline-light'"
              @click="activeFilter = filter.value"
            >
              {{ filter.label }}
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Tabla de Mercados -->
    <div class="markets-table-container">
      <div v-if="loading" class="text-center p-5">
        <div class="spinner-border text-light" role="status">
          <span class="visually-hidden">Cargando...</span>
        </div>
      </div>
      
      <div v-else-if="filteredMarkets.length === 0" class="no-markets">
        <p>No se encontraron mercados que coincidan con tu búsqueda.</p>
      </div>
      
      <div v-else class="table-responsive">
        <table class="table custom-table">
          <thead>
            <tr>
              <th @click="sortBy('name')">Par
                <i v-if="sortKey === 'name'" class="bi" :class="sortDirection === 'asc' ? 'bi-arrow-up' : 'bi-arrow-down'"></i>
              </th>
              <th @click="sortBy('last_price')">Último Precio
                <i v-if="sortKey === 'last_price'" class="bi" :class="sortDirection === 'asc' ? 'bi-arrow-up' : 'bi-arrow-down'"></i>
              </th>
              <th @click="sortBy('change_24h')">Cambio 24h
                <i v-if="sortKey === 'change_24h'" class="bi" :class="sortDirection === 'asc' ? 'bi-arrow-up' : 'bi-arrow-down'"></i>
              </th>
              <th @click="sortBy('high_24h')">Máximo 24h
                <i v-if="sortKey === 'high_24h'" class="bi" :class="sortDirection === 'asc' ? 'bi-arrow-up' : 'bi-arrow-down'"></i>
              </th>
              <th @click="sortBy('low_24h')">Mínimo 24h
                <i v-if="sortKey === 'low_24h'" class="bi" :class="sortDirection === 'asc' ? 'bi-arrow-up' : 'bi-arrow-down'"></i>
              </th>
              <th @click="sortBy('volume_24h')">Volumen 24h
                <i v-if="sortKey === 'volume_24h'" class="bi" :class="sortDirection === 'asc' ? 'bi-arrow-up' : 'bi-arrow-down'"></i>
              </th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="market in filteredMarkets" :key="market.id">
              <td>
                <div class="market-name">
                  <span class="market-icon" :style="{ backgroundColor: getCurrencyColor(market.base_currency) }">
                    {{ market.base_currency.substring(0, 1) }}
                  </span>
                  <span>{{ market.base_currency }}/{{ market.quote_currency }}</span>
                </div>
              </td>
              <td>{{ formatPrice(market.last_price) }}</td>
              <td :class="market.change_24h >= 0 ? 'text-success' : 'text-danger'">
                {{ formatPercentage(market.change_24h) }}
              </td>
              <td>{{ formatPrice(market.high_24h) }}</td>
              <td>{{ formatPrice(market.low_24h) }}</td>
              <td>{{ formatVolume(market.volume_24h) }}</td>
              <td>
                <NuxtLink :to="`/trade/${market.name}`" class="btn btn-primary btn-sm">
                  Operar
                </NuxtLink>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    
    <!-- Estadísticas del Mercado -->
    <div class="market-stats">
      <div class="row">
        <div class="col-md-4">
          <div class="stats-card">
            <h3>Mercados Activos</h3>
            <div class="stats-value">{{ markets.length }}</div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="stats-card">
            <h3>Volumen Total 24h</h3>
            <div class="stats-value">{{ formatVolume(totalVolume) }} USDT</div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="stats-card">
            <h3>Mercado Más Activo</h3>
            <div class="stats-value">{{ mostActiveMarket }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useAuth } from '~/composables/useAuth';
import { useNuxtApp } from '#app';

// Usar el composable de autenticación
const { isAuthenticated } = useAuth();

// Obtener la instancia de axios desde el plugin
const { $axios } = useNuxtApp();

// Estado para los mercados
const markets = ref([]);
const loading = ref(true);
const searchQuery = ref('');
const activeFilter = ref('all');
const sortKey = ref('volume_24h');
const sortDirection = ref('desc');

// Filtros disponibles
const filters = [
  { label: 'Todos', value: 'all' },
  { label: 'USDT', value: 'USDT' },
  { label: 'BTC', value: 'BTC' },
  { label: 'ETH', value: 'ETH' }
];

// Colores para las monedas
const currencyColors = {
  BTC: '#f7931a',
  ETH: '#627eea',
  BSC: '#f0b90b',
  USDT: '#26a17b',
  XRP: '#00aae4'
};

// Filtrar y ordenar mercados
const filteredMarkets = computed(() => {
  let result = [...markets.value];
  
  // Aplicar filtro por moneda base o cotización
  if (activeFilter.value !== 'all') {
    result = result.filter(market => 
      market.base_currency === activeFilter.value || 
      market.quote_currency === activeFilter.value
    );
  }
  
  // Aplicar búsqueda
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(market => 
      market.name.toLowerCase().includes(query) ||
      market.base_currency.toLowerCase().includes(query) ||
      market.quote_currency.toLowerCase().includes(query)
    );
  }
  
  // Ordenar resultados
  result.sort((a, b) => {
    let valA = a[sortKey.value];
    let valB = b[sortKey.value];
    
    // Manejar ordenamiento de strings
    if (typeof valA === 'string') {
      valA = valA.toLowerCase();
      valB = valB.toLowerCase();
    }
    
    if (sortDirection.value === 'asc') {
      return valA > valB ? 1 : -1;
    } else {
      return valA < valB ? 1 : -1;
    }
  });
  
  return result;
});

// Calcular volumen total
const totalVolume = computed(() => {
  return markets.value.reduce((total, market) => total + market.volume_24h, 0);
});

// Determinar el mercado más activo
const mostActiveMarket = computed(() => {
  if (markets.value.length === 0) return 'N/A';
  
  const market = [...markets.value].sort((a, b) => b.volume_24h - a.volume_24h)[0];
  return `${market.base_currency}/${market.quote_currency}`;
});

// Función para formatear precios
function formatPrice(price) {
  return new Intl.NumberFormat('es-ES', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 8
  }).format(price);
}

// Función para formatear porcentajes
function formatPercentage(value) {
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
}

// Función para formatear volumen
function formatVolume(volume) {
  return new Intl.NumberFormat('es-ES', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(volume);
}

// Función para obtener color de la moneda
function getCurrencyColor(currency) {
  return currencyColors[currency] || '#00ff00';
}

// Función para cambiar el ordenamiento
function sortBy(key) {
  if (sortKey.value === key) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortKey.value = key;
    sortDirection.value = 'asc';
  }
}

// Función para obtener los mercados
async function fetchMarkets() {
  loading.value = true;
  try {
    const response = await $axios.get('/api/markets');
    
    // Agregar datos de ejemplo para la visualización
    markets.value = response.data.map(market => ({
      ...market,
      last_price: market.last_price || Math.random() * 50000,
      change_24h: market.change_24h || (Math.random() * 10 - 5),
      high_24h: market.high_24h || Math.random() * 55000,
      low_24h: market.low_24h || Math.random() * 45000,
      volume_24h: market.volume_24h || Math.random() * 1000000
    }));
  } catch (error) {
    console.error('Error al obtener mercados:', error);
    
    // Datos de ejemplo en caso de error
    markets.value = [
      { id: 1, name: 'BTC_USDT', base_currency: 'BTC', quote_currency: 'USDT', last_price: 50245.32, change_24h: 2.5, high_24h: 51000, low_24h: 49500, volume_24h: 1245678.45 },
      { id: 2, name: 'ETH_USDT', base_currency: 'ETH', quote_currency: 'USDT', last_price: 3245.67, change_24h: 1.8, high_24h: 3300, low_24h: 3200, volume_24h: 987654.32 },
      { id: 3, name: 'BSC_USDT', base_currency: 'BSC', quote_currency: 'USDT', last_price: 412.89, change_24h: -0.7, high_24h: 420, low_24h: 410, volume_24h: 456789.12 }
    ];
  } finally {
    loading.value = false;
  }
}

// Cargar datos al montar el componente
onMounted(async () => {
  await fetchMarkets();
});
</script>

<style scoped>
.markets-container {
  padding: 2rem 0;
}

.markets-container h1 {
  color: #00ff00;
  margin-bottom: 2rem;
}

/* Estilos para la sección de filtros */
.filters-section {
  margin-bottom: 2rem;
}

.input-group-text {
  background-color: #333;
  border-color: #444;
  color: #00ff00;
}

.form-control {
  background-color: #333;
  border-color: #444;
  color: #ffffff;
}

.form-control:focus {
  background-color: #333;
  border-color: #00ff00;
  color: #ffffff;
  box-shadow: 0 0 0 0.25rem rgba(0, 255, 0, 0.25);
}

/* Estilos para la tabla de mercados */
.markets-table-container {
  background-color: #1e1e1e;
  border-radius: 10px;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.custom-table {
  color: white;
}

.custom-table thead th {
  color: #fff;
  background-color: #444;
  border-bottom: none;
  cursor: pointer;
  user-select: none;
  position: relative;
}

.custom-table thead th:hover {
  background-color: #555;
}

.custom-table thead th i {
  margin-left: 5px;
  font-size: 0.8rem;
}

.custom-table tbody tr {
  background-color: #222;
}

.custom-table tbody tr:nth-child(even) {
  background-color: #333;
}

.custom-table tbody td {
  color: white;
  vertical-align: middle;
}

.market-name {
  display: flex;
  align-items: center;
}

.market-icon {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 10px;
  font-weight: bold;
  color: #000;
}

.text-success {
  color: #00ff00 !important;
}

.text-danger {
  color: #ff0000 !important;
}

.no-markets {
  text-align: center;
  padding: 3rem;
  color: #cccccc;
}

/* Estilos para las estadísticas del mercado */
.market-stats {
  margin-top: 3rem;
}

.stats-card {
  background-color: #1e1e1e;
  border-radius: 10px;
  padding: 1.5rem;
  height: 100%;
  text-align: center;
}

.stats-card h3 {
  color: #cccccc;
  font-size: 1rem;
  margin-bottom: 1rem;
}

.stats-value {
  font-size: 1.8rem;
  font-weight: bold;
  color: #00ff00;
}
</style>