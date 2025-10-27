<template>
  <div class="container-fluid trading-view">
    <div v-if="loading" class="loading-overlay">
      <div class="spinner-border text-light" role="status">
        <span class="visually-hidden">Cargando...</span>
      </div>
    </div>
    
    <div v-else>
      <!-- Encabezado del mercado -->
      <div class="market-header">
        <div class="market-title">
          <h2>
            <span class="market-icon" :style="{ backgroundColor: getCurrencyColor(marketInfo.base_currency) }">
              {{ marketInfo.base_currency.substring(0, 1) }}
            </span>
            {{ marketInfo.base_currency }}/{{ marketInfo.quote_currency }}
          </h2>
        </div>
        
        <div class="market-stats">
          <div class="stat-item">
            <span class="stat-label">Último precio</span>
            <span class="stat-value">{{ formatPrice(marketInfo.last_price) }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Cambio 24h</span>
            <span class="stat-value" :class="marketInfo.change_24h >= 0 ? 'text-success' : 'text-danger'">
              {{ formatPercentage(marketInfo.change_24h) }}
            </span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Máximo 24h</span>
            <span class="stat-value">{{ formatPrice(marketInfo.high_24h) }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Mínimo 24h</span>
            <span class="stat-value">{{ formatPrice(marketInfo.low_24h) }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Volumen 24h</span>
            <span class="stat-value">{{ formatVolume(marketInfo.volume_24h) }}</span>
          </div>
        </div>
      </div>
      
      <div class="row">
        <!-- Gráfico de precios -->
        <div class="col-lg-8">
          <div class="chart-container">
            <div class="chart-header">
              <h3>Gráfico de Precios</h3>
              <div class="chart-controls">
                <div class="btn-group btn-group-sm" role="group">
                  <button 
                    v-for="interval in chartIntervals" 
                    :key="interval.value" 
                    type="button" 
                    class="btn" 
                    :class="selectedInterval === interval.value ? 'btn-primary' : 'btn-outline-light'"
                    @click="changeInterval(interval.value)"
                  >
                    {{ interval.label }}
                  </button>
                </div>
              </div>
            </div>
            <div class="chart-body">
              <canvas id="priceChart"></canvas>
            </div>
          </div>
          
          <!-- Formularios de Compra y Venta -->
          <div class="row order-forms-container mt-4">
            <!-- Formulario de Compra -->
            <div class="col-md-6">
              <div class="order-panel buy-panel">
                <h3>Comprar {{ marketInfo.base_currency }}</h3>
                <form @submit.prevent="placeOrder('buy')">
                  <div class="form-group">
                    <label>Tipo de Orden</label>
                    <select class="form-select" v-model="buyOrder.type">
                      <option value="limit">Límite</option>
                      <option value="market">Mercado</option>
                      <option value="stop_loss">Stop Loss</option>
                    </select>
                  </div>
                  
                  <div class="form-group" v-if="buyOrder.type === 'limit' || buyOrder.type === 'stop_loss'">
                    <label for="buyPrice">Precio ({{ marketInfo.quote_currency }})</label>
                    <input type="number" class="form-control" id="buyPrice" v-model="buyOrder.price" step="0.00000001" min="0" required>
                  </div>
                  
                  <div class="form-group" v-if="buyOrder.type === 'stop_loss'">
                    <label for="buyStopPrice">Precio de Stop ({{ marketInfo.quote_currency }})</label>
                    <input type="number" class="form-control" id="buyStopPrice" v-model="buyOrder.stop_price" step="0.00000001" min="0" required>
                  </div>
                  
                  <div class="form-group">
                    <label for="buyAmount">Cantidad ({{ marketInfo.base_currency }})</label>
                    <input type="number" class="form-control" id="buyAmount" v-model="buyOrder.amount" step="0.00000001" min="0" required>
                  </div>
                  
                  <div class="form-group" v-if="buyOrder.type === 'limit'">
                    <label>Total ({{ marketInfo.quote_currency }})</label>
                    <input type="text" class="form-control" :value="calculateBuyTotal()" disabled>
                  </div>
                  
                  <div class="d-grid gap-2">
                    <button type="submit" class="btn btn-success">
                      Comprar {{ marketInfo.base_currency }}
                    </button>
                  </div>
                </form>
              </div>
            </div>
            
            <!-- Formulario de Venta -->
            <div class="col-md-6">
              <div class="order-panel sell-panel">
                <h3>Vender {{ marketInfo.base_currency }}</h3>
                <form @submit.prevent="placeOrder('sell')">
                  <div class="form-group">
                    <label>Tipo de Orden</label>
                    <select class="form-select" v-model="sellOrder.type">
                      <option value="limit">Límite</option>
                      <option value="market">Mercado</option>
                      <option value="stop_loss">Stop Loss</option>
                    </select>
                  </div>
                  
                  <div class="form-group" v-if="sellOrder.type === 'limit' || sellOrder.type === 'stop_loss'">
                    <label for="sellPrice">Precio ({{ marketInfo.quote_currency }})</label>
                    <input type="number" class="form-control" id="sellPrice" v-model="sellOrder.price" step="0.00000001" min="0" required>
                  </div>
                  
                  <div class="form-group" v-if="sellOrder.type === 'stop_loss'">
                    <label for="sellStopPrice">Precio de Stop ({{ marketInfo.quote_currency }})</label>
                    <input type="number" class="form-control" id="sellStopPrice" v-model="sellOrder.stop_price" step="0.00000001" min="0" required>
                  </div>
                  
                  <div class="form-group">
                    <label for="sellAmount">Cantidad ({{ marketInfo.base_currency }})</label>
                    <input type="number" class="form-control" id="sellAmount" v-model="sellOrder.amount" step="0.00000001" min="0" required>
                  </div>
                  
                  <div class="form-group" v-if="sellOrder.type === 'limit'">
                    <label>Total ({{ marketInfo.quote_currency }})</label>
                    <input type="text" class="form-control" :value="calculateSellTotal()" disabled>
                  </div>
                  
                  <div class="d-grid gap-2">
                    <button type="submit" class="btn btn-danger">
                      Vender {{ marketInfo.base_currency }}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
          
          <!-- Órdenes del usuario -->
          <div class="user-orders">
            <h3>Mis Órdenes</h3>
            
            <div v-if="!isAuthenticated" class="text-center p-3">
              <p>Inicia sesión para ver tus órdenes</p>
            </div>
            
            <div v-else>
              <div class="table-responsive">
                <table class="table custom-table">
                  <thead>
                    <tr>
                      <th>Tipo</th>
                      <th>Precio</th>
                      <th>Cantidad</th>
                      <th>Estado</th>
                      <th>Fecha</th>
                      <th>Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    <template v-for="order in [...userOpenOrders, ...userCompletedOrders]" :key="order.id">
                      <tr :class="[order.side === 'buy' ? 'buy-order' : 'sell-order', order.status === 'filled' || order.status === 'cancelled' ? 'completed-order' : '']">
                        <td>{{ order.side === 'buy' ? 'Compra' : 'Venta' }}</td>
                        <td>{{ formatPrice(order.price) }}</td>
                        <td>{{ formatAmount(order.amount) }}</td>
                        <td>
                          <span :class="getStatusClass(order.status)">
                            {{ translateStatus(order.status) }}
                          </span>
                        </td>
                        <td>{{ formatDate(order.created_at) }}</td>
                        <td>
                          <button 
                            v-if="order.status !== 'filled' && order.status !== 'cancelled'"
                            @click="cancelOrder(order.id)" 
                            class="btn btn-sm btn-outline-danger"
                          >
                            Cancelar
                          </button>
                        </td>
                      </tr>
                    </template>
                    <tr v-if="userOpenOrders.length === 0 && userCompletedOrders.length === 0">
                      <td colspan="6" class="text-center">No tienes órdenes</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
        
        <div class="col-lg-4">
          <!-- Libro de órdenes -->
          <div class="order-book">
            <h3>Libro de Órdenes</h3>
            
            <div class="sell-orders">
              <div class="order-header">
                <span>Precio ({{ marketInfo.quote_currency }})</span>
                <span>Cantidad ({{ marketInfo.base_currency }})</span>
                <span>Total ({{ marketInfo.quote_currency }})</span>
              </div>
              <div class="order-list">
                <div 
                  v-for="(order, index) in sellOrders" 
                  :key="'sell-' + index" 
                  class="order-item sell"
                  :style="{ opacity: 0.3 + (0.7 * (index + 1) / sellOrders.length) }"
                >
                  <span class="order-price">{{ formatPrice(order.price) }}</span>
                  <span class="order-amount">{{ formatAmount(order.amount) }}</span>
                  <span class="order-total">{{ formatPrice(order.price * order.amount) }}</span>
                  <div class="order-depth" :style="{ width: calculateDepth(order, sellOrders) + '%' }"></div>
                </div>
              </div>
            </div>
            
            <div class="spread">
              <span>Spread: {{ formatPrice(calculateSpread()) }} ({{ formatPercentage(calculateSpreadPercentage()) }})</span>
            </div>
            
            <div class="buy-orders">
              <div class="order-list">
                <div 
                  v-for="(order, index) in buyOrders" 
                  :key="'buy-' + index" 
                  class="order-item buy"
                  :style="{ opacity: 0.3 + (0.7 * (index + 1) / buyOrders.length) }"
                >
                  <span class="order-price">{{ formatPrice(order.price) }}</span>
                  <span class="order-amount">{{ formatAmount(order.amount) }}</span>
                  <span class="order-total">{{ formatPrice(order.price * order.amount) }}</span>
                  <div class="order-depth" :style="{ width: calculateDepth(order, buyOrders) + '%' }"></div>
                </div>
              </div>
              <div class="order-header">
                <span>Precio ({{ marketInfo.quote_currency }})</span>
                <span>Cantidad ({{ marketInfo.base_currency }})</span>
                <span>Total ({{ marketInfo.quote_currency }})</span>
              </div>
            </div>
          </div>
          
          <!-- Historial de transacciones -->
          <div class="transactions-container order-book">
            <h4>Historial de Transacciones</h4>
            <div class="order-list">
              <div class="order-header">
                <span>Precio</span>
                <span>Cantidad</span>
                <span>Fecha</span>
              </div>
              <div v-for="(tx, index) in transactions" 
                   :key="index" 
                   class="order-item" 
                   :class="tx.side === 'buy' ? 'buy' : 'sell'">
                <span class="order-price">{{ formatPrice(tx.price) }}</span>
                <span class="order-amount">{{ formatAmount(tx.amount) }}</span>
                <span>{{ formatDate(tx.timestamp) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useRoute } from 'vue-router';
import { useAuth } from '~/composables/useAuth';
import { useNuxtApp } from '#app';
import pusher from '~/plugins/pusher';
import Chart from 'chart.js/auto';

// Usar el composable de autenticación
const { user, isAuthenticated, loadUser } = useAuth();

// Obtener la instancia de axios desde el plugin
const { $axios } = useNuxtApp();

// Definir middleware de autenticación
definePageMeta({
  middleware: ['auth']
});

// Obtener el parámetro de la ruta
const route = useRoute();
const marketName = computed(() => route.params.market);

// Estado para los datos del mercado
const loading = ref(true);
const marketInfo = ref({});
const buyOrders = ref([]);
const sellOrders = ref([]);
const transactions = ref([]);
const userOpenOrders = ref([]);
const userCompletedOrders = ref([]);

// Estado para el gráfico
let priceChart = null;
const selectedInterval = ref('5m');
const chartIntervals = [
  { label: '1m', value: '1m' },
  { label: '5m', value: '5m' },
  { label: '15m', value: '15m' },
  { label: '1h', value: '1h' },
  { label: '4h', value: '4h' },
  { label: '1d', value: '1d' }
];

// Estado para la nueva orden
const newOrder = ref({
  market: '',
  side: 'buy',
  type: 'limit',
  price: '',
  amount: ''
});

// Estado para órdenes de compra y venta separadas
const buyOrder = ref({
  market: '',
  type: 'limit',
  price: '',
  amount: '',
  stop_price: ''
});

const sellOrder = ref({
  market: '',
  type: 'limit',
  price: '',
  amount: '',
  stop_price: ''
});

// Colores para las monedas
const currencyColors = {
  BTC: '#f7931a',
  ETH: '#627eea',
  BSC: '#f0b90b',
  USDT: '#26a17b',
  XRP: '#00aae4'
};

// Función para formatear precios
function formatPrice(price) {
  return new Intl.NumberFormat('es-ES', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 8
  }).format(price);
}

// Función para formatear cantidades
function formatAmount(amount) {
  return new Intl.NumberFormat('es-ES', {
    minimumFractionDigits: 8,
    maximumFractionDigits: 8
  }).format(amount);
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

// Función para formatear fechas
function formatDate(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleString();
}

// Función para traducir estados de órdenes
function translateStatus(status) {
  const statusMap = {
    'open': 'Abierta',
    'partially_filled': 'Parcialmente ejecutada',
    'filled': 'Ejecutada',
    'cancelled': 'Cancelada'
  };
  return statusMap[status] || status;
}

// Función para obtener color de la moneda
function getCurrencyColor(currency) {
  return currencyColors[currency] || '#00ff00';
}

// Función para calcular el spread
function calculateSpread() {
  if (sellOrders.value.length === 0 || buyOrders.value.length === 0) return 0;
  
  const lowestSell = sellOrders.value[sellOrders.value.length - 1].price;
  const highestBuy = buyOrders.value[0].price;
  
  return lowestSell - highestBuy;
}

// Función para calcular el porcentaje de spread
function calculateSpreadPercentage() {
  if (sellOrders.value.length === 0 || buyOrders.value.length === 0) return 0;
  
  const lowestSell = sellOrders.value[sellOrders.value.length - 1].price;
  const highestBuy = buyOrders.value[0].price;
  
  return ((lowestSell - highestBuy) / lowestSell) * 100;
}

// Función para calcular la profundidad de una orden
function calculateDepth(order, orders) {
  if (orders.length === 0) return 0;
  
  const maxVolume = Math.max(...orders.map(o => o.price * o.amount));
  const orderVolume = order.price * order.amount;
  
  return (orderVolume / maxVolume) * 100;
}

// Función para obtener información del mercado
async function fetchMarketInfo() {
  try {
    const response = await $axios.get(`/markets/${marketName.value}`);
    marketInfo.value = response.data;
    
    // Establecer el mercado en el formulario de nueva orden
    newOrder.value.market = marketName.value;
  } catch (error) {
    console.error('Error al obtener información del mercado:', error);
    
    // Datos de ejemplo en caso de error
    marketInfo.value = {
      id: 1,
      name: marketName.value,
      base_currency: marketName.value.substring(0, 3).toUpperCase(),
      quote_currency: marketName.value.substring(3).toUpperCase(),
      last_price: 50000,
      change_24h: 2.5,
      high_24h: 51000,
      low_24h: 49000,
      volume_24h: 1200000
    };
    
    // Establecer el mercado en el formulario de nueva orden
    newOrder.value.market = marketName.value;
  }
}
// Función para obtener órdenes del libro
async function fetchOrderBook() {
  try {
    const response = await $axios.get(`/markets/${marketName.value}`);
    
    // La respuesta tiene la estructura: { buyOrders: [...], sellOrders: [...] }
    const { buyOrders: buyOrdersData, sellOrders: sellOrdersData } = response.data;
    
    // Como el backend ya devuelve las órdenes ordenadas, solo las asignamos
    buyOrders.value = buyOrdersData || [];
    sellOrders.value = sellOrdersData || [];
    
    console.log('Órdenes cargadas:', {
      buyOrders: buyOrders.value.length,
      sellOrders: sellOrders.value.length
    });
    
  } catch (error) {
    console.error('Error al obtener libro de órdenes:', error);
    
    // Datos de ejemplo en caso de error
    buyOrders.value = [
      { id: 1, price: 49800, amount: 0.5, side: 'buy', total: 24900 },
      { id: 2, price: 49700, amount: 0.8, side: 'buy', total: 39760 },
      { id: 3, price: 49600, amount: 1.2, side: 'buy', total: 59520 },
      { id: 4, price: 49500, amount: 0.3, side: 'buy', total: 14850 },
      { id: 5, price: 49400, amount: 1.5, side: 'buy', total: 74100 }
    ];
    
    sellOrders.value = [
      { id: 6, price: 50200, amount: 0.4, side: 'sell', total: 20080 },
      { id: 7, price: 50300, amount: 0.7, side: 'sell', total: 35210 },
      { id: 8, price: 50400, amount: 1.0, side: 'sell', total: 50400 },
      { id: 9, price: 50500, amount: 0.2, side: 'sell', total: 10100 },
      { id: 10, price: 50600, amount: 0.9, side: 'sell', total: 45540 }
    ];
  }
}

// Función para obtener transacciones recientes
async function fetchTransactions() {
  try {
    const response = await $axios.get(`/markets/${marketName.value}/transactions`);
    transactions.value = response.data;
  } catch (error) {
    console.error('Error al obtener transacciones:', error);
    
    // Datos de ejemplo en caso de error
    transactions.value = [
      { price: 50100, amount: 0.2, side: 'buy', timestamp: new Date().getTime() - 60000 },
      { price: 50050, amount: 0.5, side: 'sell', timestamp: new Date().getTime() - 120000 },
      { price: 50200, amount: 0.3, side: 'buy', timestamp: new Date().getTime() - 180000 },
      { price: 50150, amount: 0.1, side: 'sell', timestamp: new Date().getTime() - 240000 },
      { price: 50250, amount: 0.4, side: 'buy', timestamp: new Date().getTime() - 300000 }
    ];
  }
}

// Función para obtener órdenes del usuario
async function fetchUserOrders() {
  try {
    const response = await $axios.get(`/orders/user/${marketName.value}`);
    
    // Verificar la estructura de la respuesta
    const orders = response.data.data || response.data;
    
    // Debug: mostrar la respuesta completa
    console.log('Respuesta del servidor:', response.data);
    console.log('Órdenes obtenidas:', orders);
    
    if (!Array.isArray(orders)) {
      throw new Error('Los datos recibidos no son un array');
    }
    
    // Filtrar órdenes abiertas (pendientes)
    userOpenOrders.value = orders.filter(order => {
      // Considerar como "abiertas" las órdenes que no están completamente llenas
      const isPartiallyFilled = parseFloat(order.filled_amount) < parseFloat(order.amount);
      const isNotCancelled = order.status !== 'cancelled';
      return (order.status === 'open' || order.status === 'pending' || isPartiallyFilled) && isNotCancelled;
    });
    
    // Filtrar órdenes completadas
    userCompletedOrders.value = orders.filter(order => {
      const isCompletelyFilled = parseFloat(order.filled_amount) >= parseFloat(order.amount);
      return order.status === 'filled' || order.status === 'cancelled' || isCompletelyFilled;
    });
    
    console.log('Órdenes abiertas:', userOpenOrders.value.length);
    console.log('Órdenes completadas:', userCompletedOrders.value.length);
    
  } catch (error) {
    console.error('Error al obtener órdenes del usuario:', error);
    
    // Datos de ejemplo en caso de error
    userOpenOrders.value = [
      { 
        id: 101, 
        market: marketName.value, 
        type: 'limit', 
        side: 'buy', 
        price: "49900.00000000", 
        amount: "0.20000000", 
        filled_amount: "0.00000000", 
        status: 'open',
        created_at: new Date().toISOString()
      }
    ];
    
    userCompletedOrders.value = [
      { 
        id: 102, 
        market: marketName.value, 
        type: 'market', 
        side: 'sell', 
        price: "50100.00000000", 
        amount: "0.10000000", 
        filled_amount: "0.10000000",
        status: 'filled',
        created_at: new Date().toISOString()
      }
    ];
  }
}

// Función para obtener datos del gráfico
async function fetchChartData() {
  try {
    const response = await $axios.get(`/candlesticks/${marketName.value}?interval=${selectedInterval.value}`);
    updateChart(response.data);
  } catch (error) {
    console.error('Error al obtener datos del gráfico:', error);
    
    // Datos de ejemplo en caso de error
    const now = new Date().getTime();
    const candlesticks = Array.from({ length: 30 }, (_, i) => {
      const timestamp = now - (i * 3600000);
      const open = 50000 + Math.random() * 1000 - 500;
      const close = open + Math.random() * 200 - 100;
      const high = Math.max(open, close) + Math.random() * 100;
      const low = Math.min(open, close) - Math.random() * 100;
      const volume = Math.random() * 10;
      
      return { timestamp, open, close, high, low, volume };
    }).reverse();
    
    updateChart(candlesticks);
  }
}

// Función para actualizar el gráfico
function updateChart(candlesticks) {
  const ctx = document.getElementById('priceChart');
  if (!ctx) return;
  
  const labels = candlesticks.map(candle => {
    const date = new Date(candle.timestamp);
    return date.toLocaleTimeString();
  });
  
  const data = {
    labels,
    datasets: [
      {
        label: `${marketInfo.value.base_currency}/${marketInfo.value.quote_currency}`,
        data: candlesticks.map(candle => candle.close),
        borderColor: '#00ff00',
        backgroundColor: 'rgba(0, 255, 0, 0.1)',
        borderWidth: 2,
        tension: 0.4
      }
    ]
  };
  
  if (priceChart) {
    priceChart.data = data;
    priceChart.update();
  } else {
    priceChart = new Chart(ctx, {
      type: 'line',
      data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: false,
            grid: {
              color: 'rgba(255, 255, 255, 0.1)'
            },
            ticks: {
              color: '#ffffff'
            }
          },
          x: {
            grid: {
              color: 'rgba(255, 255, 255, 0.1)'
            },
            ticks: {
              color: '#ffffff',
              maxRotation: 0,
              autoSkip: true,
              maxTicksLimit: 10
            }
          }
        },
        plugins: {
          legend: {
            labels: {
              color: '#ffffff'
            }
          },
          tooltip: {
            mode: 'index',
            intersect: false
          }
        },
        interaction: {
          mode: 'nearest',
          axis: 'x',
          intersect: false
        }
      }
    });
  }
}

// Función para cambiar el intervalo del gráfico
function changeInterval(interval) {
  selectedInterval.value = interval;
  fetchChartData();
}

// Función para colocar una orden
async function placeOrder(side) {
  try {
    const orderData = {
      market: marketName.value,
      side: side,
      type: side === 'buy' ? buyOrder.value.type : sellOrder.value.type,
      price: side === 'buy' ? buyOrder.value.price : sellOrder.value.price,
      amount: side === 'buy' ? buyOrder.value.amount : sellOrder.value.amount
    };
    
    // Añadir precio de stop si el tipo de orden es stop_loss
    if (orderData.type === 'stop_loss') {
      orderData.stop_price = side === 'buy' ? buyOrder.value.stop_price : sellOrder.value.stop_price;
    }
    
    const response = await $axios.post('/orders', orderData);
    console.log('Orden enviada:', response.data);
    
    // Actualizar órdenes del usuario
    await fetchUserOrders();
    
    // Resetear el formulario correspondiente
    if (side === 'buy') {
      buyOrder.value = {
        market: marketName.value,
        type: 'limit',
        price: '',
        amount: '',
        stop_price: ''
      };
    } else {
      sellOrder.value = {
        market: marketName.value,
        type: 'limit',
        price: '',
        amount: '',
        stop_price: ''
      };
    }
    
    // Mostrar mensaje de éxito
   // alert(`Orden de ${side === 'buy' ? 'compra' : 'venta'} colocada con éxito`);
  } catch (error) {
    console.error('Error al enviar orden:', error);
    alert('Error al colocar la orden. Por favor, inténtalo de nuevo.');
  }
}

// Función para calcular el total de compra
function calculateBuyTotal() {
  const price = parseFloat(buyOrder.value.price) || 0;
  const amount = parseFloat(buyOrder.value.amount) || 0;
  return formatPrice(price * amount);
}

// Función para calcular el total de venta
function calculateSellTotal() {
  const price = parseFloat(sellOrder.value.price) || 0;
  const amount = parseFloat(sellOrder.value.amount) || 0;
  return formatPrice(price * amount);
}

// Función para cancelar una orden
async function cancelOrder(orderId) {
  try {
    await $axios.delete(`/orders/${orderId}`);
    console.log('Orden cancelada:', orderId);
    
    // Actualizar órdenes del usuario
    await fetchUserOrders();
    
    // Mostrar mensaje de éxito
    alert('Orden cancelada con éxito');
  } catch (error) {
    console.error('Error al cancelar orden:', error);
    alert('Error al cancelar la orden. Por favor, inténtalo de nuevo.');
  }
}

// Configurar Pusher para actualizaciones en tiempo real
let channel;
function setupRealTimeUpdates() {
  channel = pusher.subscribe('exchanger');
  
  // Actualizar cuando se crea una nueva orden
  channel.bind('order.created', (data) => {
    if (data.market === marketName.value) {
     // fetchOrderBook();
      if (data.user_id === user.value.id) {
        fetchUserOrders();
      }
    }
  });
  
  // Actualizar cuando se actualiza una orden
  channel.bind('order.updated', (data) => {
    if (data.market === marketName.value) {
     // fetchOrderBook();
      if (data.user_id === user.value.id) {
        fetchUserOrders();
      }
    }
  });
  
  // Actualizar cuando se completa una transacción
  channel.bind('transaction.completed', (data) => {
    if (data.market === marketName.value) {
      fetchTransactions();
      fetchMarketInfo();
    }
  });
  
  // Actualizar cuando se actualiza el gráfico de precios
  channel.bind('candlestick.updated', (data) => {
    if (data.market === marketName.value && data.interval === selectedInterval.value) {
      fetchChartData();
    }
  });
}

// Inicializar datos al montar el componente
onMounted(async () => {
  try {
    // Cargar información del usuario si hay un token
    await loadUser();
    
    // Inicializar formularios con el mercado actual
    buyOrder.value.market = marketName.value;
    sellOrder.value.market = marketName.value;
    
    // Cargar datos del mercado
    await fetchMarketInfo();
    await fetchOrderBook();
    await fetchTransactions();
    
    if (isAuthenticated.value) {
      await fetchUserOrders();
    }
    
    // Inicializar y cargar datos del gráfico
    await fetchChartData();
    
    // Configurar actualizaciones en tiempo real
    setupRealTimeUpdates();
    
    loading.value = false;
  } catch (error) {
    console.error('Error al cargar datos:', error);
  } finally {
    loading.value = false;
  }
});

// Limpiar al desmontar el componente
onBeforeUnmount(() => {
  if (channel) {
    channel.unsubscribe();
  }
  
  if (priceChart) {
    priceChart.destroy();
    priceChart = null;
  }
});

// Añadir la función getStatusClass
function getStatusClass(status) {
  const statusClasses = {
    'open': 'text-warning',
    'pending': 'text-warning',
    'partially_filled': 'text-info',
    'filled': 'text-success',
    'cancelled': 'text-danger'
  };
  return statusClasses[status] || '';
}
</script>

<style scoped>
.trading-view {
  padding: 1rem 0;
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

/* Estilos para el encabezado del mercado */
.market-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background-color: #1e1e1e;
  border-radius: 10px;
  flex-wrap: wrap;
}

.market-title {
  display: flex;
  align-items: center;
}

.market-title h2 {
  display: flex;
  align-items: center;
  margin: 0;
  color: #ffffff;
}

.market-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 10px;
  font-weight: bold;
  color: #000;
  font-size: 1.2rem;
}

.market-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.stat-label {
  font-size: 0.8rem;
  color: #cccccc;
}

.stat-value {
  font-weight: bold;
  color: #ffffff;
}

/* Estilos para el gráfico */
.chart-container {
  background-color: #1e1e1e;
  border-radius: 10px;
  padding: 1rem;
  margin-bottom: 1.5rem;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.chart-header h3 {
  margin: 0;
  color: #00ff00;
}

.chart-body {
  height: 400px;
  position: relative;
}

/* Estilos para las transacciones */
.transactions-container {
  background-color: #1e1e1e;
  border-radius: 10px;
  padding: 1rem;
  margin-bottom: 1.5rem;
}

.transactions-container h3 {
  color: #00ff00;
  margin-bottom: 1rem;
}

.buy-tx td:first-child {
  color: #00ff00;
}

.sell-tx td:first-child {
  color: #ff0000;
}

/* Estilos para el panel de órdenes */
.order-panel {
  background-color: #1e1e1e;
  border-radius: 10px;
  padding: 1rem;
  margin-bottom: 1.5rem;
}

.order-panel h3 {
  color: #00ff00;
  margin-bottom: 1rem;
}

.form-group {
  margin-bottom: 1rem;
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

/* Estilos para el libro de órdenes */
.order-book {
  background-color: #1e1e1e;
  border-radius: 10px;
  padding: 1rem;
  margin-bottom: 1.5rem;
}

.order-book h3 {
  color: #00ff00;
  margin-bottom: 1rem;
}

.order-header {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  padding: 0.5rem 0;
  font-size: 0.8rem;
  color: #cccccc;
  border-bottom: 1px solid #333;
}

.order-list {
  max-height: 300px;
  overflow-y: auto;
}

.order-item {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  padding: 0.5rem 0;
  position: relative;
  z-index: 1;
}

.order-depth {
  position: absolute;
  top: 0;
  bottom: 0;
  right: 0;
  z-index: -1;
}

.sell .order-depth {
  background-color: rgba(255, 0, 0, 0.1);
}

.buy .order-depth {
  background-color: rgba(0, 255, 0, 0.1);
}

.order-price {
  font-weight: bold;
}

.sell .order-price {
  color: #ff0000;
}

.buy .order-price {
  color: #00ff00;
}

.spread {
  text-align: center;
  padding: 0.5rem 0;
  color: #cccccc;
  border-top: 1px solid #333;
  border-bottom: 1px solid #333;
  margin: 0.5rem 0;
}

/* Estilos para las órdenes del usuario */
.user-orders {
  background-color: #1e1e1e;
  border-radius: 10px;
  padding: 1rem;
  margin-top: 1.5rem;
}

.user-orders h3 {
  color: #00ff00;
  margin-bottom: 1rem;
  font-size: 1.1rem;
}

.custom-table {
  color: white;
  margin-bottom: 0;
  font-size: 0.9rem;
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

.text-warning {
  color: #ffc107 !important;
}

.text-info {
  color: #17a2b8 !important;
}

.text-success {
  color: #28a745 !important;
}

.text-danger {
  color: #dc3545 !important;
}

.btn-outline-danger {
  color: #dc3545;
  border-color: #dc3545;
  padding: 0.25rem 0.5rem;
  font-size: 0.8rem;
}

.btn-outline-danger:hover {
  background-color: #dc3545;
  color: white;
}

/* Estilos para los formularios de compra y venta */
.order-forms-container {
  margin-bottom: 2rem;
}

.buy-panel, .sell-panel {
  background-color: #1e1e1e;
  border-radius: 8px;
  padding: 1.5rem;
  height: 100%;
}

.buy-panel h3 {
  color: #28a745;
  margin-bottom: 1.5rem;
  font-size: 1.2rem;
  text-align: center;
}

.sell-panel h3 {
  color: #dc3545;
  margin-bottom: 1.5rem;
  font-size: 1.2rem;
  text-align: center;
}

.form-group {
  margin-bottom: 1rem;
}
</style>