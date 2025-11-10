<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'

// --- Cargar Scripts Externos ---
useHead({
  title: 'CryptoEx - Trading',
  script: [
    {
      src: 'https://unpkg.com/lightweight-charts@4.1.1/dist/lightweight-charts.standalone.production.js',
      body: true,
      async: true
    }
  ]
})

definePageMeta({
  layout: 'p2p'
});

// --- Estado (Refs) ---
const currentPair = ref({
  symbol: 'BTC/USDT',
  name: 'Bitcoin',
  base: 'BTC',
  price: '64,312.80',
  high24h: '65,120.00',
  low24h: '63,450.00',
  volume24h: '2,456'
});
const priceChange = ref(2.38); // Asumido desde la data original
const timeInterval = ref('1h');
const activeTab = ref('orderbook');
const tradeType = ref('limit');
const ordersTab = ref('open');

// Refs para los formularios de compra/venta
const buyPrice = ref('');
const buyAmount = ref('');
const sellPrice = ref('');
const sellAmount = ref('');
const balance = ref(1000.00); // Saldo de USDT
const cryptoBalance = ref(0.500000); // Saldo de la cripto (ej. BTC)

// --- Datos Estáticos (Refs) ---
const orderBook = ref({
  asks: [
    { price: '64318.5', amount: '0.5' },
    { price: '64318.0', amount: '1.2' },
    { price: '64317.2', amount: '0.8' },
    { price: '64316.9', amount: '2.5' },
    { price: '64316.5', amount: '1.0' },
    { price: '64315.0', amount: '3.0' },
    { price: '64314.8', amount: '0.7' },
    { price: '64314.2', amount: '1.1' },
    { price: '64313.5', amount: '0.9' },
    { price: '64313.0', amount: '2.2' },
  ],
  bids: [
    { price: '64312.8', amount: '1.5' },
    { price: '64312.5', amount: '0.6' },
    { price: '64312.0', amount: '2.0' },
    { price: '64311.7', amount: '1.1' },
    { price: '64311.2', amount: '0.8' },
    { price: '64310.5', amount: '3.5' },
    { price: '64310.0', amount: '1.3' },
    { price: '64309.6', amount: '0.4' },
    { price: '64309.1', amount: '1.7' },
    { price: '64308.5', amount: '2.1' },
  ]
});

const recentTrades = ref([
  { price: '64312.8', amount: '0.012', time: '14:30:05', side: 'buy' },
  { price: '64313.0', amount: '0.005', time: '14:30:03', side: 'sell' },
  { price: '64313.0', amount: '0.020', time: '14:30:02', side: 'sell' },
  { price: '64312.8', amount: '0.100', time: '14:30:01', side: 'buy' },
  { price: '64312.5', amount: '0.050', time: '14:29:58', side: 'buy' },
  { price: '64313.5', amount: '0.030', time: '14:29:55', side: 'sell' },
  { price: '64313.5', amount: '0.015', time: '14:29:54', side: 'sell' },
  { price: '64312.8', amount: '0.070', time: '14:29:50', side: 'buy' },
  { price: '64312.5', amount: '0.025', time: '14:29:48', side: 'buy' },
  { price: '64313.0', amount: '0.010', time: '14:29:47', side: 'sell' },
]);

const openOrders = ref([
  { id: 1, date: '14:25:10', pair: 'BTC/USDT', type: 'Límite', side: 'Compra', price: '64100.00', amount: '0.10', filled: 0, total: '6410.00' },
  { id: 2, date: '14:20:05', pair: 'BTC/USDT', type: 'Límite', side: 'Venta', price: '65500.00', amount: '0.05', filled: 0, total: '3275.00' },
]);

// --- Lógica del Gráfico ---
const chartContainer = ref(null);
let chart = null;
let candleSeries = null;
let resizeObserver = null;
let themeObserver = null;

// Datos de ejemplo para el gráfico
const chartData = [
    { time: '2023-10-01', open: 60000, high: 60500, low: 59800, close: 60200 },
    { time: '2023-10-02', open: 60200, high: 61000, low: 60100, close: 60800 },
    { time: '2023-10-03', open: 60800, high: 61500, low: 60700, close: 61200 },
    { time: '2023-10-04', open: 61200, high: 61300, low: 60500, close: 60700 },
    { time: '2023-10-05', open: 60700, high: 62000, low: 60600, close: 61900 },
    { time: '2023-10-06', open: 61900, high: 62500, low: 61800, close: 62200 },
    { time: '2023-10-07', open: 62200, high: 63000, low: 62100, close: 62800 },
    { time: '2023-10-08', open: 62800, high: 62900, low: 62000, close: 62100 },
    { time: '2023-10-09', open: 62100, high: 62400, low: 61500, close: 61800 },
    { time: '2023-10-10', open: 61800, high: 63000, low: 61700, close: 62900 },
    { time: '2023-10-11', open: 62900, high: 63500, low: 62800, close: 63200 },
    { time: '2023-10-12', open: 63200, high: 64000, low: 63100, close: 63800 },
    { time: '2023-10-13', open: 63800, high: 64200, low: 63500, close: 63700 },
    { time: '2023-10-14', open: 63700, high: 64500, low: 63600, close: 64300 },
    { time: '2023-10-15', open: 64300, high: 64400, low: 63800, close: 64100 },
    { time: '2023-10-16', open: 64100, high: 64800, low: 64000, close: 64700 },
    { time: '2023-10-17', open: 64700, high: 65200, low: 64500, close: 65100 },
    { time: '2023-10-18', open: 65100, high: 65500, low: 64800, close: 65000 },
    { time: '2023-10-19', open: 65000, high: 65100, low: 64200, close: 64300 },
    { time: '2023-10-20', open: 64300, high: 64500, low: 63800, close: 64200 },
];

/**
 * Devuelve las opciones de configuración del gráfico basadas
 * en si el modo claro está activo o no (detectado desde el body).
 */
function getChartOptions() {
  // Verificamos si el tema es oscuro (dark-mode) o si NO tiene light-mode
  // Esto asegura que detectemos correctamente el tema actual
  const isDark = document.body.classList.contains('dark-mode') || 
                !document.body.classList.contains('light-mode');
  
  return {
    layout: {
      background: { color: isDark ? '#2d3748' : '#FFFFFF' }, // bg-gray-800 o blanco
      textColor: isDark ? '#E2E8F0' : '#1a1a1a', // text-gray-200 o negro
    },
    grid: {
      vertLines: { color: isDark ? '#4A5568' : '#E5E5E5' }, // border-gray-700 o gris claro
      horzLines: { color: isDark ? '#4A5568' : '#E5E5E5' },
    },
    crosshair: {
      mode: LightweightCharts.CrosshairMode.Normal,
    },
    rightPriceScale: {
      borderColor: isDark ? '#4A5568' : '#E5E5E5',
    },
    timeScale: {
      borderColor: isDark ? '#4A5568' : '#E5E5E5',
    },
  };
}

/**
 * Inicializa el gráfico.
 */
function initChart() {
  // Espera a que el script se cargue si aún no está listo
  if (typeof LightweightCharts === 'undefined') {
    setTimeout(initChart, 100);
    return;
  }

  if (!chartContainer.value) return;

  chart = LightweightCharts.createChart(chartContainer.value, getChartOptions());

  candleSeries = chart.addCandlestickSeries({
    upColor: '#0ecb81',
    downColor: '#f6465d',
    borderDownColor: '#f6465d',
    borderUpColor: '#0ecb81',
    wickDownColor: '#f6465d',
    wickUpColor: '#0ecb81',
  });

  candleSeries.setData(chartData);
  chart.timeScale().fitContent();

  // Observador para el redimensionamiento del contenedor
  // Aplicamos un tamaño fijo inicial para evitar expansión continua
  const initialWidth = chartContainer.value.clientWidth;
  const initialHeight = 400; // Altura fija en píxeles
  chart.applyOptions({ width: initialWidth, height: initialHeight });
  
  resizeObserver = new ResizeObserver(entries => {
    // Solo actualizamos el ancho, mantenemos la altura fija
    const { width } = entries[0].contentRect;
    chart.applyOptions({ width });
  });
  resizeObserver.observe(chartContainer.value);

  // Observador para cambios de tema (clase en el body)
  themeObserver = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.attributeName === 'class') {
        // Aplicamos las nuevas opciones basadas en el tema actual
        const newOptions = getChartOptions();
        chart.applyOptions(newOptions);
        
        // Forzamos una actualización completa del gráfico
        candleSeries.applyOptions({
          upColor: '#0ecb81',
          downColor: '#f6465d',
          borderDownColor: '#f6465d',
          borderUpColor: '#0ecb81',
          wickDownColor: '#f6465d',
          wickUpColor: '#0ecb81',
        });
        
        // Redibujamos el gráfico
        chart.timeScale().fitContent();
      }
    }
  });
  themeObserver.observe(document.body, { attributes: true });
}

onMounted(async () => {
  // nextTick se asegura de que el ref 'chartContainer' esté asignado al DOM
  await nextTick();
  initChart();
});

onBeforeUnmount(() => {
  if (resizeObserver) {
    resizeObserver.disconnect();
  }
  if (themeObserver) {
    themeObserver.disconnect();
  }
  if (chart) {
    chart.remove();
    chart = null;
  }
});

// --- Métodos ---

function changeTimeInterval(interval) {
  timeInterval.value = interval;
  // Aquí iría la lógica para cargar nuevos datos del gráfico
  console.log('Intervalo cambiado a:', interval);
}

function cancelOrder(orderId) {
  openOrders.value = openOrders.value.filter(order => order.id !== orderId);
  console.log('Cancelar orden:', orderId);
}
</script>

<template>
  <!-- Contenedor raíz de la página con mejor espaciado y adaptabilidad -->
  <div class="min-h-screen pb-20 md:pb-0 max-w-screen-2xl mx-auto">

    <!-- Main Content Wrapper con mejor espaciado -->
    <div class="container mx-auto max-w-7xl px-2 sm:px-4 lg:px-6 flex-grow main-content">
      <!-- Trading Pair Info con diseño mejorado -->
      <div class="bg-gray-800 border border-gray-700 rounded-lg p-3 sm:p-4 my-3 md:my-4 shadow-lg">
        <div class="flex flex-wrap items-center justify-between mb-3">
          <div class="flex items-center gap-2">
            <h2 class="text-xl font-bold text-white">{{ currentPair.symbol }}</h2>
            <span class="text-xs text-gray-400 bg-gray-700 px-2 py-0.5 rounded-full">{{ currentPair.name }}</span>
          </div>
          <div class="flex items-center gap-2">
            <button class="text-gray-400 hover:text-white p-2 rounded-full hover:bg-gray-700 transition-colors duration-200">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
              </svg>
            </button>
            <button class="text-gray-400 hover:text-white p-2 rounded-full hover:bg-gray-700 transition-colors duration-200">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7"></path>
              </svg>
            </button>
          </div>
        </div>
        <div class="flex flex-wrap items-end gap-3 mb-4">
          <div class="text-3xl font-bold" :class="priceChange >= 0 ? 'price-up' : 'price-down'">
            ${{ currentPair.price }}
          </div>
          <div class="text-sm font-medium px-2 py-1 rounded" :class="priceChange >= 0 ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'">
            {{ priceChange >= 0 ? '+' : '' }}{{ priceChange }}%
          </div>
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
          <div class="bg-gray-700/50 p-2 rounded-lg">
            <div class="text-gray-400 mb-1">24h Alto</div>
            <div class="font-semibold text-white">${{ currentPair.high24h }}</div>
          </div>
          <div class="bg-gray-700/50 p-2 rounded-lg">
            <div class="text-gray-400 mb-1">24h Bajo</div>
            <div class="font-semibold text-white">${{ currentPair.low24h }}</div>
          </div>
          <div class="bg-gray-700/50 p-2 rounded-lg">
            <div class="text-gray-400 mb-1">24h Vol</div>
            <div class="font-semibold text-white">{{ currentPair.volume24h }}M</div>
          </div>
        </div>
      </div>

      <!-- Sección Principal: Gráfico y Libro de Órdenes con mejor organización -->
      <div class="dark:bg-gray-900 bg-white rounded-lg shadow-xl overflow-hidden mb-4">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-0 lg:gap-0.5">
          <!-- Gráfico - 2/3 ancho en desktop con mejor altura -->
          <div class="col-span-full lg:col-span-2 dark:bg-gray-800 bg-gray-100 rounded-lg overflow-hidden">
            <!-- Header del gráfico -->
            <div class="px-4 py-3 border-b dark:border-gray-700 border-gray-200 flex justify-between items-center dark:bg-gray-800/90 bg-gray-100/90 backdrop-blur-sm">
              <h2 class="font-bold dark:text-white text-gray-800">Gráfico BTC/USDT</h2>
              <div class="flex items-center space-x-2">
                <span class="text-sm dark:text-gray-300 text-gray-600">Vista: Velas</span>
              </div>
            </div>
            <div class="w-full h-[400px] sm:h-[450px] lg:h-[500px]">
              <!-- Filtros de Intervalo de Tiempo con mejor diseño -->
              <div class="p-2 border-b dark:border-gray-700 border-gray-200 flex space-x-2 overflow-x-auto scrollbar-hide dark:bg-gray-800/80 bg-gray-100/80 backdrop-blur-sm sticky top-0 z-10">
                <button @click="changeTimeInterval('1h')"
                  :class="{ 'bg-yellow-500 text-gray-900': timeInterval === '1h', 'dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 bg-gray-200 text-gray-700 hover:bg-gray-300': timeInterval !== '1h' }"
                  class="px-3 py-1 rounded text-xs font-medium whitespace-nowrap transition-colors duration-200">1H</button>
                <button @click="changeTimeInterval('4h')"
                  :class="{ 'bg-yellow-500 text-gray-900': timeInterval === '4h', 'dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 bg-gray-200 text-gray-700 hover:bg-gray-300': timeInterval !== '4h' }"
                  class="px-3 py-1 rounded text-xs font-medium whitespace-nowrap transition-colors duration-200">4H</button>
                <button @click="changeTimeInterval('1d')"
                  :class="{ 'bg-yellow-500 text-gray-900': timeInterval === '1d', 'dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 bg-gray-200 text-gray-700 hover:bg-gray-300': timeInterval !== '1d' }"
                  class="px-3 py-1 rounded text-xs font-medium whitespace-nowrap transition-colors duration-200">1D</button>
                <button @click="changeTimeInterval('1w')"
                  :class="{ 'bg-yellow-500 text-gray-900': timeInterval === '1w', 'dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 bg-gray-200 text-gray-700 hover:bg-gray-300': timeInterval !== '1w' }"
                  class="px-3 py-1 rounded text-xs font-medium whitespace-nowrap transition-colors duration-200">1W</button>
                <button @click="changeTimeInterval('1m')"
                  :class="{ 'bg-yellow-500 text-gray-900': timeInterval === '1m', 'dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 bg-gray-200 text-gray-700 hover:bg-gray-300': timeInterval !== '1m' }"
                  class="px-3 py-1 rounded text-xs font-medium whitespace-nowrap transition-colors duration-200">1M</button>
              </div>
              
              <!-- Contenedor del Gráfico (Solo Cliente) -->
              <ClientOnly>
                <div ref="chartContainer" class="w-full chart-container h-full" style="min-height: 400px;"></div>
                <template #fallback>
                  <div class="w-full chart-container h-full flex items-center justify-center bg-gray-800/50 backdrop-blur-sm" style="min-height: 400px;">
                    <div class="text-center">
                      <svg class="animate-spin h-8 w-8 text-yellow-500 mx-auto mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <div class="text-gray-300 font-medium">Cargando gráfico...</div>
                    </div>
                  </div>
                </template>
              </ClientOnly>
            </div>
          </div>

          <!-- Libro de Órdenes - 1/3 ancho en desktop -->
          <div class="col-span-full lg:col-span-1 dark:bg-gray-800 bg-gray-100 rounded-lg overflow-hidden shadow-lg flex flex-col h-[400px] sm:h-[450px] lg:h-[500px]">
            <!-- Header del libro de órdenes -->
            <div class="px-4 py-3 border-b dark:border-gray-700 border-gray-200 flex justify-between items-center dark:bg-gray-800/90 bg-gray-100/90 backdrop-blur-sm">
              <h2 class="font-bold dark:text-white text-gray-800">Libro de Mercado</h2>
              <div class="flex items-center space-x-2">
                <span class="text-sm dark:text-gray-300 text-gray-600">BTC/USDT</span>
              </div>
            </div>
            <!-- Pestañas Libro/Operaciones -->
            <div class="px-3 py-2 border-b dark:border-gray-700 border-gray-200 dark:bg-gray-800/90 bg-gray-100/90 backdrop-blur-sm sticky top-0 z-10">
              <div class="flex dark:bg-gray-700/80 bg-gray-300/80 rounded-lg p-0.5">
                <button @click="activeTab = 'orderbook'"
                  :class="activeTab === 'orderbook' ? 'bg-yellow-500 text-gray-900' : 'dark:text-gray-300 text-gray-700 dark:hover:text-white hover:text-gray-900'"
                  class="flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200">
                  Libro de Órdenes
                </button>
                <button @click="activeTab = 'trades'"
                  :class="activeTab === 'trades' ? 'bg-yellow-500 text-gray-900' : 'dark:text-gray-300 text-gray-700 dark:hover:text-white hover:text-gray-900'"
                  class="flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200">
                  Operaciones
                </button>
              </div>
            </div>

            <!-- Vista: Libro de Órdenes -->
            <div v-if="activeTab === 'orderbook'" class="flex-1 overflow-hidden flex flex-col">
              <div class="px-3 py-2 bg-gray-750 border-b border-gray-600">
                <div class="flex justify-between items-center text-xs font-medium text-gray-400 uppercase tracking-wide">
                  <span>Precio (USDT)</span>
                  <span>Cantidad</span>
                  <span>Total</span>
                </div>
              </div>
              
              <div class="flex-1 overflow-y-auto scrollbar-hide flex flex-col">
                <!-- Asks (Venta) -->
                <div class="py-1">
                  <div class="space-y-0.5">
                    <div v-for="(order) in orderBook.asks.slice(0, 10).reverse()" :key="'ask-' + order.price"
                      class="relative group">
                      <div class="flex justify-between items-center text-xs px-3 py-1 hover:bg-gray-700 cursor-pointer">
                        <span class="text-red-400 font-mono">{{ order.price }}</span>
                        <span class="text-gray-300 font-mono">{{ order.amount }}</span>
                        <span class="text-gray-400 font-mono">{{ (parseFloat(order.price) * parseFloat(order.amount)).toFixed(2) }}</span>
                      </div>
                      <div class="absolute inset-0 bg-red-500 bg-opacity-5"
                        :style="{ width: (order.amount / 10 * 100) + '%' }"></div>
                    </div>
                  </div>
                </div>

                <!-- Precio Actual -->
                <div class="py-2 px-3">
                  <div class="bg-gray-750 border border-gray-600 p-2 text-center">
                    <div class="text-sm font-mono font-bold" :class="priceChange >= 0 ? 'text-green-400' : 'text-red-400'">
                      {{ currentPair.price }}
                    </div>
                    <div class="text-xs" :class="priceChange >= 0 ? 'text-green-400' : 'text-red-400'">
                      {{ priceChange >= 0 ? '+' : '' }}{{ priceChange }}%
                    </div>
                  </div>
                </div>
                
                <!-- Bids (Compra) -->
                <div class="pb-1">
                  <div class="space-y-0.5">
                    <div v-for="(order) in orderBook.bids.slice(0, 10)" :key="'bid-' + order.price"
                      class="relative group">
                      <div class="flex justify-between items-center text-xs px-3 py-1 hover:bg-gray-700 cursor-pointer">
                        <span class="text-green-400 font-mono">{{ order.price }}</span>
                        <span class="text-gray-300 font-mono">{{ order.amount }}</span>
                        <span class="text-gray-400 font-mono">{{ (parseFloat(order.price) * parseFloat(order.amount)).toFixed(2) }}</span>
                      </div>
                      <div class="absolute inset-0 bg-green-500 bg-opacity-5"
                        :style="{ width: (order.amount / 10 * 100) + '%' }"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Vista: Operaciones Recientes -->
            <div v-if="activeTab === 'trades'" class="flex-1 overflow-hidden flex flex-col">
              <div class="px-3 py-2 bg-gray-750 border-b border-gray-600">
                <div class="flex justify-between items-center text-xs font-medium text-gray-400 uppercase tracking-wide">
                  <span>Precio</span>
                  <span>Cantidad</span>
                  <span>Hora</span>
                </div>
              </div>
              
              <div class="flex-1 overflow-y-auto scrollbar-hide py-1">
                <div class="space-y-0.5">
                  <div v-for="(trade, index) in recentTrades" :key="'trade-' + index"
                    class="group relative">
                    <div class="flex justify-between items-center text-xs px-3 py-1 hover:bg-gray-700 cursor-pointer">
                      <span class="font-mono"
                        :class="trade.side === 'buy' ? 'text-green-400' : 'text-red-400'">
                        {{ trade.price }}
                      </span>
                      <span class="text-gray-300 font-mono">{{ trade.amount }}</span>
                      <span class="text-gray-400 font-mono">{{ trade.time }}</span>
                    </div>
                    <div classs="absolute left-0 top-0 bottom-0 w-0.5"
                      :class="trade.side === 'buy' ? 'bg-green-400' : 'bg-red-400'"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Panel de Trading: Compra y Venta -->
      <div class="px-0 md:px-3 pb-3 md:pb-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          
          <!-- Panel de Compra -->
          <div class="col-span-full md:col-span-1 bg-gray-800 rounded-lg p-4 shadow-lg border border-gray-700">
            <div class="flex justify-between mb-3">
              <button @click="tradeType = 'limit'"
                :class="tradeType === 'limit' ? 'text-white font-semibold border-b-2 border-yellow-500' : 'text-gray-400'"
                class="text-sm pb-1 transition-all duration-200">Límite</button>
              <button @click="tradeType = 'market'"
                :class="tradeType === 'market' ? 'text-white font-semibold border-b-2 border-yellow-500' : 'text-gray-400'"
                class="text-sm pb-1 transition-all duration-200">Mercado</button>
              <button class="text-gray-400 text-sm pb-1 hover:text-gray-300 transition-colors duration-200">Stop-Limit</button>
            </div>
            <div class="space-y-3">
              <div>
                <label class="text-xs text-gray-300 font-medium block mb-1.5">Precio</label>
                <input v-model="buyPrice" type="number"
                  :disabled="tradeType === 'market'"
                  class="w-full bg-gray-700 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500/30 border border-gray-600 focus:border-yellow-500 transition-all duration-200"
                  :placeholder="tradeType === 'market' ? 'Mercado' : currentPair.price">
              </div>
              <div>
                <label class="text-xs text-gray-300 font-medium block mb-1.5">Cantidad</label>
                <input v-model="buyAmount" type="number"
                  class="w-full bg-gray-700 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500/30 border border-gray-600 focus:border-yellow-500 transition-all duration-200"
                  placeholder="0.00">
              </div>
              <div class="flex gap-1.5">
                <button @click="buyAmount = (balance / (tradeType === 'market' ? currentPair.price : buyPrice || currentPair.price)) * 0.25" class="flex-1 bg-gray-700 rounded-md py-1.5 text-xs font-medium hover:bg-gray-600 border border-gray-600 hover:border-gray-500 transition-all duration-200">25%</button>
                <button @click="buyAmount = (balance / (tradeType === 'market' ? currentPair.price : buyPrice || currentPair.price)) * 0.50" class="flex-1 bg-gray-700 rounded-md py-1.5 text-xs font-medium hover:bg-gray-600 border border-gray-600 hover:border-gray-500 transition-all duration-200">50%</button>
                <button @click="buyAmount = (balance / (tradeType === 'market' ? currentPair.price : buyPrice || currentPair.price)) * 0.75" class="flex-1 bg-gray-700 rounded-md py-1.5 text-xs font-medium hover:bg-gray-600 border border-gray-600 hover:border-gray-500 transition-all duration-200">75%</button>
                <button @click="buyAmount = (balance / (tradeType === 'market' ? currentPair.price : buyPrice || currentPair.price)) * 1.00" class="flex-1 bg-gray-700 rounded-md py-1.5 text-xs font-medium hover:bg-gray-600 border border-gray-600 hover:border-gray-500 transition-all duration-200">100%</button>
              </div>
              <div class="text-xs text-gray-300 bg-gray-700/50 p-2 rounded-md">
                <div class="flex justify-between">
                  <span>Disponible</span>
                  <span class="font-medium">{{ balance.toFixed(2) }} USDT</span>
                </div>
              </div>
              <button class="w-full bg-green-500 hover:bg-green-600 rounded-md py-2.5 font-semibold text-sm shadow-lg transition-all duration-200 flex items-center justify-center mt-2">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
                Comprar {{ currentPair.base }}
              </button>
            </div>
          </div>

          <!-- Panel de Venta -->
          <div class="col-span-full md:col-span-1 bg-gray-800 rounded-lg p-4 shadow-lg border border-gray-700">
            <div class="flex justify-between mb-3">
              <button @click="tradeType = 'limit'"
                :class="tradeType === 'limit' ? 'text-white font-semibold border-b-2 border-yellow-500' : 'text-gray-400'"
                class="text-sm pb-1 transition-all duration-200">Límite</button>
              <button @click="tradeType = 'market'"
                :class="tradeType === 'market' ? 'text-white font-semibold border-b-2 border-yellow-500' : 'text-gray-400'"
                class="text-sm pb-1 transition-all duration-200">Mercado</button>
              <button class="text-gray-400 text-sm pb-1 hover:text-gray-300 transition-colors duration-200">Stop-Limit</button>
            </div>
            <div class="space-y-3">
              <div>
                <label class="text-xs text-gray-300 font-medium block mb-1.5">Precio</label>
                <input v-model="sellPrice" type="number"
                  :disabled="tradeType === 'market'"
                  class="w-full bg-gray-700 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500/30 border border-gray-600 focus:border-yellow-500 transition-all duration-200"
                  :placeholder="tradeType === 'market' ? 'Mercado' : currentPair.price">
              </div>
              <div>
                <label class="text-xs text-gray-300 font-medium block mb-1.5">Cantidad</label>
                <input v-model="sellAmount" type="number"
                  class="w-full bg-gray-700 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500/30 border border-gray-600 focus:border-yellow-500 transition-all duration-200"
                  placeholder="0.00">
              </div>
              <div class="flex gap-1.5">
                <button @click="sellAmount = cryptoBalance * 0.25" class="flex-1 bg-gray-700 rounded-md py-1.5 text-xs font-medium hover:bg-gray-600 border border-gray-600 hover:border-gray-500 transition-all duration-200">25%</button>
                <button @click="sellAmount = cryptoBalance * 0.50" class="flex-1 bg-gray-700 rounded-md py-1.5 text-xs font-medium hover:bg-gray-600 border border-gray-600 hover:border-gray-500 transition-all duration-200">50%</button>
                <button @click="sellAmount = cryptoBalance * 0.75" class="flex-1 bg-gray-700 rounded-md py-1.5 text-xs font-medium hover:bg-gray-600 border border-gray-600 hover:border-gray-500 transition-all duration-200">75%</button>
                <button @click="sellAmount = cryptoBalance" class="flex-1 bg-gray-700 rounded-md py-1.5 text-xs font-medium hover:bg-gray-600 border border-gray-600 hover:border-gray-500 transition-all duration-200">100%</button>
              </div>
              <div class="text-xs text-gray-300 bg-gray-700/50 p-2 rounded-md">
                <div class="flex justify-between">
                  <span>Disponible</span>
                  <span class="font-medium">{{ cryptoBalance.toFixed(6) }} {{ currentPair.base }}</span>
                </div>
              </div>
              <button class="w-full bg-red-500 hover:bg-red-600 rounded-md py-2.5 font-semibold text-sm shadow-lg transition-all duration-200 flex items-center justify-center mt-2">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"></path>
                </svg>
                Vender {{ currentPair.base }}
              </button>
            </div>
          </div>
        </div>
        
        <!-- Órdenes Abiertas / Historial (Movido debajo del formulario) -->
        <div class="mt-4 bg-gray-800 rounded-lg p-3">
          <div class="flex border-b border-gray-700 mb-2">
            <button @click="ordersTab = 'open'"
              :class="ordersTab === 'open' ? 'border-yellow-400 text-white' : 'text-gray-400'"
              class="px-3 py-1.5 text-xs font-semibold border-b-2 border-transparent">
              Órdenes Abiertas ({{ openOrders.length }})
            </button>
            <button @click="ordersTab = 'history'"
              :class="ordersTab === 'history' ? 'border-yellow-400 text-white' : 'text-gray-400'"
              class="px-3 py-1.5 text-xs font-semibold border-b-2 border-transparent">
              Historial
            </button>
          </div>

          <!-- Pestaña: Órdenes Abiertas -->
          <div v-if="ordersTab === 'open'">
            <div v-if="openOrders.length === 0" class="text-center py-8 text-gray-400">
              <svg class="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z">
                </path>
              </svg>
              <p class="text-sm">No tienes órdenes abiertas</p>
            </div>
            
            <div v-else>
              <!-- Tabla Desktop -->
              <div class="hidden md:block overflow-x-auto">
                <table class="w-full text-xs">
                  <thead class="text-gray-400 border-b border-gray-700">
                    <tr>
                      <th class="text-left py-2 font-normal">Fecha</th>
                      <th class="text-left py-2 font-normal">Par</th>
                      <th class="text-left py-2 font-normal">Lado</th>
                      <th class="text-right py-2 font-normal">Precio</th>
                      <th class="text-right py-2 font-normal">Cantidad</th>
                      <th class="text-center py-2 font-normal">Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="order in openOrders" :key="order.id" class="border-b border-gray-700 hover:bg-gray-750">
                      <td class="py-3 text-gray-300">{{ order.date }}</td>
                      <td class="py-3">{{ order.pair }}</td>
                      <td class="py-3" :class="order.side === 'Compra' ? 'text-green-400' : 'text-red-400'">
                        {{ order.side }}
                      </td>
                      <td class="py-3 text-right text-gray-300">{{ order.price }}</td>
                      <td class="py-3 text-right text-gray-300">{{ order.amount }}</td>
                      <td class="py-3 text-center">
                        <button @click="cancelOrder(order.id)"
                          class="text-red-400 hover:text-red-300 text-xs px-2 py-1 border border-red-400 rounded hover:bg-red-400 hover:bg-opacity-10">
                          Cancelar
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <!-- Tarjetas Mobile -->
              <div class="md:hidden space-y-3">
                <div v-for="order in openOrders" :key="order.id" class="bg-gray-700 rounded-lg p-3">
                  <div class="flex justify-between items-start mb-2">
                    <div>
                      <span class="font-semibold">{{ order.pair }}</span>
                      <span class="text-xs text-gray-400 ml-2">{{ order.date }}</span>
                    </div>
                    <span class="text-xs px-2 py-1 rounded"
                      :class="order.side === 'Compra' ? 'bg-green-500 bg-opacity-20 text-green-400' : 'bg-red-500 bg-opacity-20 text-red-400'">
                      {{ order.side }}
                    </span>
                  </div>
                  <div class="grid grid-cols-2 gap-2 text-xs mb-3">
                    <div>
                      <div class="text-gray-400">Precio</div>
                      <div class="text-white">{{ order.price }}</div>
                    </div>
                    <div>
                      <div class="text-gray-400">Cantidad</div>
                      <div class="text-white">{{ order.amount }}</div>
                    </div>
                    <div>
                      <div class="text-gray-400">Ejecutado</div>
                      <div class="text-white">{{ order.filled }}%</div>
                    </div>
                    <div>
                      <div class="text-gray-400">Total</div>
                      <div class="text-white">{{ order.total }}</div>
                    </div>
                  </div>
                  <button @click="cancelOrder(order.id)"
                    class="w-full text-center text-red-400 hover:text-red-300 text-xs px-2 py-1.5 border border-red-400 rounded hover:bg-red-400 hover:bg-opacity-10">
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Pestaña: Historial -->
          <div v-if="ordersTab === 'history'">
            <div class="text-center py-8 text-gray-400">
              <svg class="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <p class="text-sm">No hay historial de órdenes</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
/* Estilos para el gráfico y elementos de trading */
.chart-container {
  position: relative;
  z-index: 1;
}

/* Estilos para los indicadores de precio */
.price-up {
  color: #0ecb81;
}

.price-down {
  color: #f6465d;
}

/* Ocultar scrollbar pero mantener funcionalidad */
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

/* Mobile optimizations */
@media (max-width: 768px) {
  body {
    padding-bottom: 80px;
    /* Space for bottom navigation */
  }

  .main-content {
    min-height: calc(100vh - 140px);
    /* Account for header and bottom nav */
  }

  .chart-container {
    height: 300px !important;
    min-height: 300px;
  }

  .mobile-chart-wrapper {
    height: 350px;
    overflow: hidden;
  }
}

/* Light Mode */
.light-mode {
  background-color: #f5f5f5;
  color: #1a1a1a;
}

.light-mode .bg-gray-900 {
  background-color: #f5f5f5 !important;
}

.light-mode .bg-gray-800 {
  background-color: #ffffff !important;
  border: 1px solid #e5e5e5;
}

.light-mode .bg-gray-700 {
  background-color: #f8f8f8 !important;
}

.light-mode .bg-gray-700\/50 {
  background-color: #f0f0f0 !important;
}

.light-mode .bg-gray-700\/30 {
  background-color: #f5f5f5 !important;
}

.light-mode .bg-gray-750 {
  background-color: #f0f0f0 !important;
}

.light-mode .text-white {
  color: #1a1a1a !important;
}

.light-mode .text-gray-300 {
  color: #666666 !important;
}

.light-mode .text-gray-400 {
  color: #999999 !important;
}

.light-mode .text-gray-500 {
  color: #aaaaaa !important;
}

.light-mode .border-gray-700 {
  border-color: #e5e5e5 !important;
}

.light-mode .border-gray-600 {
  border-color: #e0e0e0 !important;
}

.light-mode .hover\:bg-gray-600:hover {
  background-color: #e8e8e8 !important;
}

.light-mode .hover\:bg-gray-700:hover {
  background-color: #f0f0f0 !important;
}

.light-mode .hover\:bg-gray-750:hover {
  background-color: #f5f5f5 !important;
}

.light-mode .hover\:bg-gray-700\/30:hover {
  background-color: #f0f0f0 !important;
}

.light-mode .bg-green-900\/30 {
  background-color: rgba(220, 252, 231, 0.7) !important;
}

.light-mode .bg-red-900\/30 {
  background-color: rgba(254, 226, 226, 0.7) !important;
}

.light-mode .hover\:bg-red-900\/50:hover {
  background-color: rgba(254, 202, 202, 0.8) !important;
}

/* Toggle Switch (del layout original, mantenido por si acaso) */
.toggle-switch {
  position: relative;
  width: 48px;
  height: 24px;
  background-color: #4b5563;
  border-radius: 12px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.toggle-switch.active {
  background-color: #fbbf24;
}

.toggle-slider {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 20px;
  height: 20px;
  background-color: white;
  border-radius: 50%;
  transition: transform 0.3s;
}

.toggle-switch.active .toggle-slider {
  transform: translateX(24px);
}
</style>
