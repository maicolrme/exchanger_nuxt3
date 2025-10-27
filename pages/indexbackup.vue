<template>
  <div id="app" class="container">
    <h1 class="text-center">Trading Exchanger</h1>
    <p class="text-center">Trade in real-time with other users</p>

    <!-- Gráfico de Precios -->
    <div class="chart-container">
      <canvas id="priceChart"></canvas>
    </div>

    <div class="row">
      <div class="col-md-4">
        <div class="order-card">
          <h5>Place an Order</h5>
          <form @submit.prevent="placeOrder">
            <div class="form-group">
              <label for="market">Select Market</label>
              <select class="form-control" v-model="newOrder.market" required>
                <option v-for="market in markets" :key="market.id" :value="market.name">
                  {{ market.base_currency }} / {{ market.quote_currency }}
                </option>
              </select>
            </div>

            <div class="form-group">
              <label for="orderSide">Order side</label>
              <select class="form-control" v-model="newOrder.side" required>
                <option value="buy">Buy</option>
                <option value="sell">Sell</option>
              </select>
            </div>

            <div class="form-group">
              <label for="orderType">Order Type</label>
              <select class="form-control" v-model="newOrder.type" required>
                <option value="limit">Limit</option>
                <option value="market">Market</option>
              </select>
            </div>

            <div class="form-group">
              <label for="amount">Amount</label>
              <input type="text" class="form-control" v-model="newOrder.amount" required>
            </div>
            <div class="form-group">
              <label for="price">Price</label>
              <input type="number" class="form-control" v-model="newOrder.price" min="1" required>
            </div>
            <button type="submit" class="btn btn-primary btn-block">Submit Order</button>
          </form>
        </div>
      </div>

      <div class="col-md-8">
        <!-- Tabla de órdenes de compra -->
        <div class="order-card">
          <h5>Buy Orders</h5>
          <div class="order-list">
            <table class="table custom-table">
              <thead>
                <tr>
                  <th>Price</th>
                  <th>Amount</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="order in buyOrders" :key="order.id">
                  <td>{{ order.price }}</td>
                  <td v-if="order.status === 'partially_filled'">
                    {{ order.amount - order.filled_amount }}
                  </td>
                  <td v-else>
                    {{ order.amount }}
                  </td>
                  <td>{{ (order.price * order.amount).toFixed(2) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Tabla de órdenes de venta -->
        <div class="order-card sell">
          <h5>Sell Orders</h5>
          <div class="order-list">
            <table class="table custom-table">
              <thead>
                <tr>
                  <th>Price</th>
                  <th>Amount</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="order in sellOrders" :key="order.id">
                  <td>{{ order.price }}</td>
                  <td v-if="order.status === 'partially_filled'">
                    {{ order.filled_amount }}
                  </td>
                  <td v-else>
                    {{ order.amount }}
                  </td>
                  <td>{{ (order.price * order.amount).toFixed(2) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Tabs for Open and Completed Orders -->
    <ul class="nav nav-tabs" id="orderTabs" role="tablist">
      <li class="nav-item">
        <a class="nav-link active" id="open-orders-tab" data-toggle="tab" href="#open-orders" role="tab">Open Orders</a>
      </li>
      <li class="nav-item">
        <a class="nav-link" id="completed-orders-tab" data-toggle="tab" href="#completed-orders" role="tab">Completed Orders</a>
      </li>
    </ul>
    <div class="tab-content" id="orderTabsContent">
      <div class="tab-pane fade show active" id="open-orders" role="tabpanel">
        <h5>Your Open Orders</h5>
        <table class="table custom-table">
          <thead>
            <tr>
              <th>Market</th>
              <th>Type</th>
              <th>Side</th>
              <th>Price</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="order in userOpenOrders" :key="order.id">
              <td>{{ order.market }}</td>
              <td>{{ order.type }}</td>
              <td>{{ order.side }}</td>
              <td>{{ order.price }}</td>
              <td>{{ order.amount }}</td>
              <td>{{ order.status }}</td>
              <td>
                <button @click="cancelOrder(order.id)" class="btn btn-sm btn-danger">Cancel</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="tab-pane fade" id="completed-orders" role="tabpanel">
        <h5>Your Completed Orders</h5>
        <table class="table custom-table">
          <thead>
            <tr>
              <th>Market</th>
              <th>Type</th>
              <th>Side</th>
              <th>Price</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="order in userCompletedOrders" :key="order.id">
              <td>{{ order.market }}</td>
              <td>{{ order.type }}</td>
              <td>{{ order.side }}</td>
              <td>{{ order.price }}</td>
              <td>{{ order.amount }}</td>
              <td>{{ order.status }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import Chart from 'chart.js/auto';
import { useAuth } from '~/composables/useAuth';
import { useNuxtApp } from '#app';

// Usar el composable de autenticación
const { user, isAuthenticated } = useAuth();

// Obtener pusher y axios desde el plugin
const { $pusher, $axios } = useNuxtApp();

// Definir middleware de autenticación
definePageMeta({
  middleware: ['auth']
});

// Estado para el formulario de nueva orden
const newOrder = ref({
  market: '',
  side: 'buy',
  type: 'limit',
  amount: '',
  price: ''
});

// Datos para los mercados
const markets = ref([]);

// Datos para órdenes
const buyOrders = ref([]);
const sellOrders = ref([]);
const userOpenOrders = ref([]);
const userCompletedOrders = ref([]);

// Función para obtener los mercados disponibles
async function fetchMarkets() {
  try {
    const response = await $axios.get('/markets');
    markets.value = response.data;
  } catch (error) {
    console.error('Error al obtener mercados:', error);
  }
}

// Función para obtener órdenes de compra y venta
async function fetchOrders(marketName = 'btcusdt') {
  try {
    const response = await $axios.get(`/markets/${marketName}/orders`);
    buyOrders.value = response.data.filter(order => order.side === 'buy');
    sellOrders.value = response.data.filter(order => order.side === 'sell');
  } catch (error) {
    console.error('Error al obtener órdenes:', error);
  }
}

// Función para obtener órdenes del usuario
async function fetchUserOrders() {
  try {
    const response = await $axios.get('/orders/user');
    userOpenOrders.value = response.data.filter(order => order.status !== 'filled' && order.status !== 'cancelled');
    userCompletedOrders.value = response.data.filter(order => order.status === 'filled' || order.status === 'cancelled');
  } catch (error) {
    console.error('Error al obtener órdenes del usuario:', error);
  }
}

// Función para colocar una orden
async function placeOrder() {
  try {
    const response = await $axios.post('/orders', newOrder.value);
    console.log('Orden enviada:', response.data);
    
    // Actualizar órdenes del usuario
    await fetchUserOrders();
    
    // Resetear el formulario
    newOrder.value = {
      market: '',
      side: 'buy',
      type: 'limit',
      amount: '',
      price: ''
    };
  } catch (error) {
    console.error('Error al enviar orden:', error);
  }
}

// Función para cancelar una orden
async function cancelOrder(orderId) {
  try {
    await $axios.delete(`/orders/${orderId}`);
    console.log('Orden cancelada:', orderId);
    
    // Actualizar órdenes del usuario
    await fetchUserOrders();
  } catch (error) {
    console.error('Error al cancelar orden:', error);
  }
}

// Variables para el gráfico
let priceChart = null;
const chartData = ref({
  labels: [],
  datasets: [{
    label: 'BTC/USDT Price',
    data: [],
    borderColor: '#00ff00',
    backgroundColor: 'rgba(0, 255, 0, 0.1)',
    borderWidth: 2,
    tension: 0.4
  }]
});

// Función para obtener datos del gráfico
async function fetchChartData(marketName = 'btcusdt', interval = '1h') {
  try {
    const response = await $axios.get(`/markets/${marketName}/candlesticks?interval=${interval}`);
    const candlesticks = response.data;
    
    chartData.value.labels = candlesticks.map(candle => {
      const date = new Date(candle.timestamp * 1000);
      return date.toLocaleTimeString();
    });
    
    chartData.value.datasets[0].data = candlesticks.map(candle => candle.close);
    
    // Actualizar el gráfico si ya existe
    if (priceChart) {
      priceChart.update();
    }
  } catch (error) {
    console.error('Error al obtener datos del gráfico:', error);
  }
}

// Configurar Pusher para actualizaciones en tiempo real
function setupRealTimeUpdates() {
  const channel = $pusher.subscribe('exchanger');
  
  // Actualizar cuando se crea una nueva orden
  channel.bind('order.created', (data) => {
    fetchOrders(data.market);
    if (data.user_id === user.value.id) {
      fetchUserOrders();
    }
  });
  
  // Actualizar cuando se actualiza una orden
  channel.bind('order.updated', (data) => {
    fetchOrders(data.market);
    if (data.user_id === user.value.id) {
      fetchUserOrders();
    }
  });
  
  // Actualizar cuando se actualiza el gráfico de precios
  channel.bind('candlestick.updated', (data) => {
    // Solo actualizar si es el mismo mercado que estamos viendo
    if (newOrder.value.market === data.market) {
      fetchChartData(data.market);
    }
  });
}

// Inicializar el gráfico de precios
onMounted(async () => {
  // Cargar datos iniciales
  await fetchMarkets();
  
  // Establecer mercado predeterminado
  if (markets.value.length > 0) {
    newOrder.value.market = markets.value[0].name;
  }
  
  // Cargar órdenes y datos del usuario
  await fetchOrders(newOrder.value.market);
  await fetchUserOrders();
  await fetchChartData(newOrder.value.market);
  
  // Configurar actualizaciones en tiempo real
  setupRealTimeUpdates();
  
  // Inicializar el gráfico
  const ctx = document.getElementById('priceChart');
  
  if (ctx) {
    priceChart = new Chart(ctx, {
      type: 'line',
      data: chartData.value,
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
              color: '#ffffff'
            }
          }
        },
        plugins: {
          legend: {
            labels: {
              color: '#ffffff'
            }
          }
        }
      }
    });
  }
});
</script>

<style scoped>
/* Estilos para las tablas */
.custom-table {
  color: white;
}

.custom-table thead th {
  color: #fff;
  background-color: #444;
}

.custom-table tbody tr {
  background-color: #222;
}

.custom-table tbody tr:nth-child(even) {
  background-color: #333;
}

.custom-table tbody td {
  color: white;
}

/* Estilos para las tarjetas de órdenes */
.order-card {
  background-color: #1e1e1e;
  padding: 15px;
  border-radius: 5px;
  margin-bottom: 15px;
}

.order-card h5 {
  color: #00ff00;
}

.order-card.sell h5 {
  color: #ff0000;
}

.order-list {
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid #444;
  padding: 10px;
  border-radius: 5px;
}

/* Estilos para las pestañas */
.tab-content {
  background-color: #1e1e1e;
  border-radius: 5px;
  padding: 15px;
  margin-top: 15px;
}

.nav-tabs .nav-link.active {
  background-color: #444;
  border-color: #444;
}

/* Estilos para el contenedor del gráfico */
.chart-container {
  position: relative;
  height: 400px;
  margin-bottom: 20px;
}
</style>