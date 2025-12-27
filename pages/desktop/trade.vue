<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useOrders } from '~/composables/useOrders';

// Props
const props = defineProps<{
  market?: string;
}>();

// Composable de órdenes
const {
  openOrders,
  orderHistory,
  loading: loadingOrders,
  error: ordersError,
  fetchAllOrders,
  cancelOrder: cancelOrderApi,
  openOrdersCount
} = useOrders();

// --- Estado Reactivo ---
const isDark = ref(true);
const selectedPair = computed(() => props.market || 'BTC/USDT');
const baseCurrency = computed(() => selectedPair.value.split('/')[0]); // BTC
const quoteCurrency = computed(() => selectedPair.value.split('/')[1]); // USDT
// Balance states
const balances = ref<Record<string, number>>({});
const loadingBalance = ref(false);

// Datos de Mercado (Ticker)
const currentPrice = ref(0);
const priceChange = ref(0); // Porcentaje
const priceChangeValue = ref(0); // Valor absoluto (opcional)
const high24h = ref(0);
const low24h = ref(0);
const volume24h = ref('0');
const marketIcon = ref(''); // Para el icono de la moneda base

// Configuración de vista
const orderbookView = ref('both');
const timeframe = ref('15m');
const timeframes = ref(['15m', '1H', '4H', '1D', '1W']);
const candleCount = ref(30);
const loadingCandles = ref(false);
const candlesError = ref<string | null>(null);
const candleData = ref<Array<{ open: number; high: number; low: number; close: number }>>([]);

// Orderbook States
const buyOrders = ref<any[]>([]);
const sellOrders = ref<any[]>([]);
const tickerInterval = ref<NodeJS.Timer | null>(null);



// --- Nueva función: Obtener balance ---
async function fetchBalance(currency: string) {
  try {
    const { $axios } = useNuxtApp();
    const response = await $axios.get(`/wallet/balance/${currency}`);
    
    if (response.data && response.data.available !== undefined) {
      balances.value[currency] = Number(response.data.available);
    }
  } catch (error) {
    console.error(`Error cargando balance de ${currency}:`, error);
    balances.value[currency] = 0;
  }
}

// --- Nueva función: Cargar ambos balances ---
async function fetchBalances() {
  loadingBalance.value = true;
  try {
    await Promise.all([
      fetchBalance(baseCurrency.value),
      fetchBalance(quoteCurrency.value)
    ]);
  } finally {
    loadingBalance.value = false;
  }
}




// --- 1. NUEVA FUNCIÓN: Obtener datos del Mercado (Ticker) ---
async function fetchMarketTicker() {
  try {
    const { $axios } = useNuxtApp();
    // Convertir BTC/USDT a BTC_USDT
    const marketParam = selectedPair.value.replace(/\//g, '_');
    
    // Llamada al endpoint: api/market/BTC_USDT
    // Nota: Asumo que tu axios baseURL ya apunta a /api o similar. 
    // Si no, ajusta la ruta a `/api/market/${marketParam}`
    const response = await $axios.get(`market/${marketParam}`);
    
    if (response.data && response.data.success) {
      const data = response.data.data;

      // Mapeo directo de tus datos JSON a las variables reactivas
      currentPrice.value = Number(data.current_price);
      priceChange.value = Number(data.price_change_percentage_24h);
      
      // La API devuelve strings para estos valores, usamos parseFloat
      high24h.value = parseFloat(data.max_price); // maps to max_price
      low24h.value = parseFloat(data.min_price); // maps to min_price
      volume24h.value = parseFloat(data.volume_24h).toFixed(2);
      
      marketIcon.value = data.base_coin_icon;

      // Actualizar título de la pestaña del navegador
      document.title = `${formatNumber(currentPrice.value)} | ${selectedPair.value}`;
    }
  } catch (error) {
    console.error('Error cargando ticker de mercado:', error);
  }
}

// --- 2. Orderbook (Lógica anterior mantenida) ---
function processOrderbookData(orders: number[][], type: 'buy' | 'sell', maxVolume: number) {
  return orders.map(order => {
    const price = order[0];
    const amount = order[1];
    return {
      price: price,
      amount: amount,
      total: (amount / maxVolume) * 100, 
      totalValue: formatNumber(price * amount) 
    };
  });
}

async function fetchOrderBook() {
  try {
    const { $axios } = useNuxtApp();
    const marketParam = selectedPair.value.replace(/\//g, '_');
    const response = await $axios.get(`/trading/orderbook/${marketParam}`);
    const data = response.data; 

    if (data && data.bids && data.asks) {
      const visibleBids = data.bids.slice(0, 20);
      const visibleAsks = data.asks.slice(0, 20);
      const maxBidVol = Math.max(...visibleBids.map((o: number[]) => o[1]), 0.0001);
      const maxAskVol = Math.max(...visibleAsks.map((o: number[]) => o[1]), 0.0001);
      const globalMax = Math.max(maxBidVol, maxAskVol);

      buyOrders.value = processOrderbookData(data.bids.sort((a,b)=>b[0]-a[0]), 'buy', globalMax);
      sellOrders.value = processOrderbookData(data.asks.sort((a,b)=>a[0]-b[0]), 'sell', globalMax);
    }
  } catch (error) {
    console.error('Error cargando orderbook:', error);
  }
}

// --- Funciones Auxiliares ---
function mapIntervalToApi(interval: string): string {
  const map: Record<string, string> = { '15m': '15m', '1H': '1h', '4H': '4h', '1D': '1d', '1W': '1w' };
  return map[interval] || '1h';
}

function formatNumber(num: number) {
  if (num === null || num === undefined || isNaN(num)) return '0.00';
  return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// --- 3. Fetch de Velas (Candles) ---
// NOTA: He eliminado la parte que sobrescribía currentPrice/high24h 
// para respetar los datos que vienen del endpoint /market/
async function fetchCandles() {
  if (!selectedPair.value) return;
  loadingCandles.value = true;
  candlesError.value = null;
  
  try {
    const { $axios } = useNuxtApp();
    const apiInterval = mapIntervalToApi(timeframe.value);
    const marketWithUnderscore = selectedPair.value.replace(/\//g, '_');
    
    const response = await $axios.get(`/candles/${marketWithUnderscore}`, {
        params: { interval: apiInterval, limit: 100 }
    });
    
    if (response.data.success && response.data.candles) {
      const candles = response.data.candles.map((candle: any) => ({
        open: parseFloat(candle.open),
        high: parseFloat(candle.high),
        low: parseFloat(candle.low),
        close: parseFloat(candle.close),
        time: candle.time
      })).sort((a: any, b: any) => a.time - b.time);
      
      candleData.value = candles;
    }
  } catch (error: any) {
    console.error('Error candles:', error);
    candlesError.value = 'Error al cargar gráfico';
  } finally {
    loadingCandles.value = false;
  }
}

// --- Lógica de Órdenes (Formulario) ---
const ordersTab = ref('open'); 
const orderType = ref('buy'); 
const priceType = ref('limit'); 
const orderPrice = ref(0); 
const orderAmount = ref(0);

// --- Computadas ---
const availableBalance = computed(() => {
  const currency = orderType.value === 'buy' ? quoteCurrency.value : baseCurrency.value;
  return balances.value[currency] || 0;
});

const orderTotal = computed(() => {
  const price = priceType.value === 'limit' ? orderPrice.value : currentPrice.value;
  return orderAmount.value * price;
});

const displayBuyOrders = computed(() => buyOrders.value.slice(0, 15));
const displaySellOrders = computed(() => sellOrders.value.slice(0, 15).reverse()); 

// Computadas para Gráfico
const chartMinPrice = computed(() => {
  if (candleData.value.length === 0) return 0;
  // Usamos los datos de las velas para el eje Y del gráfico
  return Math.min(...candleData.value.slice(0, candleCount.value).map(c => c.low)) * 0.99;
});

const chartMaxPrice = computed(() => {
  if (candleData.value.length === 0) return 100;
  return Math.max(...candleData.value.slice(0, candleCount.value).map(c => c.high)) * 1.01;
});

const priceRange = computed(() => Math.max(chartMaxPrice.value - chartMinPrice.value, 1));

const visibleCandles = computed(() => {
  if (candleData.value.length === 0) return [];
  const data = candleData.value.slice(0, candleCount.value).reverse();
  const width = 800 / (data.length || 1);
  const scaleY = (val: number) => 400 - ((val - chartMinPrice.value) / priceRange.value) * 400;

  return data.map((candle, index) => {
    const openY = scaleY(candle.open);
    const closeY = scaleY(candle.close);
    return {
      x: (index + 0.5) * width,
      width: width * 0.7,
      highY: scaleY(candle.high),
      lowY: scaleY(candle.low),
      bodyY: Math.min(openY, closeY),
      bodyHeight: Math.max(Math.abs(openY - closeY), 1),
      color: candle.open > candle.close ? '#ef4444' : '#22c55e'
    };
  });
});

const currentPriceY = computed(() => {
  // Nota: currentPrice viene del endpoint /market/, chartMinPrice de /candles/
  // Puede haber una pequeñísima discrepancia temporal, pero es aceptable.
  return 400 - ((currentPrice.value - chartMinPrice.value) / priceRange.value) * 400;
});

// --- Métodos de Interacción ---
function setAmountPercent(percent: number) {
  const balance = availableBalance.value;
  const price = priceType.value === 'limit' ? orderPrice.value : currentPrice.value;
  if (price > 0) {
      orderAmount.value = orderType.value === 'buy' 
        ? (balance * (percent / 100)) / price 
        : balance * (percent / 100);
  }
}

async function placeOrder() {
  try {
    const { $axios } = useNuxtApp();
    const marketParam = selectedPair.value.replace(/\//g, '_');
    
    await $axios.post('/trading/orders', {
      market: marketParam,
      type: priceType.value,
      side: orderType.value,
      amount: orderAmount.value,
      price: priceType.value === 'limit' ? orderPrice.value : undefined
    });
    
    await fetchAllOrders();
    fetchOrderBook(); // Recargar orderbook
    fetchBalances() // Agregar esta línea
    orderAmount.value = 0;
  } catch (error: any) {
    alert(error.response?.data?.message || 'Error al crear la orden');
  }
}

async function cancelOrder(orderId: string) {
  if(await cancelOrderApi(orderId)) {
    await fetchAllOrders();
      fetchBalances() // Agregar esta línea
    fetchOrderBook();
  }
}

// Watchers
watch(() => props.market, () => {
  fetchCandles();
  fetchOrderBook();
  fetchBalances(); // Agregar esta línea
  fetchMarketTicker();
});
watch(timeframe, fetchCandles);

// --- Ciclo de Vida ---
onMounted(async () => {
  // Carga inicial de todo
  await Promise.all([
      fetchMarketTicker(),
      fetchCandles(), 
      fetchAllOrders(),
      fetchOrderBook(),
      fetchBalances() // Agregar esta línea
  ]);

  // Si el precio de la orden es 0, poner el precio actual
  if(orderPrice.value === 0 && currentPrice.value > 0) {
    orderPrice.value = currentPrice.value;
  }

  // Polling: Actualizar datos cada 3 segundos
  tickerInterval.value = setInterval(() => {
    fetchMarketTicker();
    fetchOrderBook();
   // fetchBalances(); // Agregar esta línea
  }, 3000);
});

onUnmounted(() => {
    if(tickerInterval.value) clearInterval(tickerInterval.value);
});

useHead({ title: 'CryptoEx - Pro Trading' });
</script>




<template>
  <div>
    <header :class="isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'" class="border-b transition-colors duration-300">
     

      <div :class="isDark ? 'bg-gray-750 border-gray-700' : 'bg-gray-100 border-gray-200'" class="px-4 md:px-6 lg:px-8 py-1 border-t flex items-center justify-between max-w-screen-2xl mx-auto">
        <div class="flex items-center space-x-8">
          <div>
            <div :class="priceChange >= 0 ? 'text-green-500' : 'text-red-500'" class="font-extrabold text-xl flex items-center">
              {{ formatNumber(currentPrice) }}
              <svg v-if="priceChange >= 0" class="w-5 h-5 ml-2" fill="currentColor" viewBox="0 0 20 20">
                <path d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z"/>
              </svg>
              <svg v-else class="w-5 h-5 ml-2" fill="currentColor" viewBox="0 0 20 20">
                <path d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z"/>
              </svg>
            </div>
            <div :class="isDark ? 'text-gray-400' : 'text-gray-600'" class="text-sm">≈ ${{ formatNumber(currentPrice) }}</div>
          </div>
          <div :class="priceChange >= 0 ? 'bg-green-500 bg-opacity-10' : 'bg-red-500 bg-opacity-10'" class="px-3 py-2 rounded-lg">
            <div :class="priceChange >= 0 ? 'text-green-500' : 'text-red-500'" class="font-bold text-base">
              {{ priceChange >= 0 ? '+' : '' }}{{ priceChange.toFixed(2) }}%
            </div>
            <div :class="isDark ? 'text-gray-400' : 'text-gray-600'" class="text-xs">Cambio 24h</div>
          </div>
          <div class="grid grid-cols-3 gap-4">
            <div>
              <div :class="isDark ? 'text-gray-400' : 'text-gray-600'" class="text-xs mb-1">24h Alto</div>
              <div :class="isDark ? 'text-white' : 'text-gray-900'" class="font-bold">{{ formatNumber(high24h) }}</div>
            </div>
            <div>
              <div :class="isDark ? 'text-gray-400' : 'text-gray-600'" class="text-xs mb-1">24h Bajo</div>
              <div :class="isDark ? 'text-white' : 'text-gray-900'" class="font-bold">{{ formatNumber(low24h) }}</div>
            </div>
            <div>
              <div :class="isDark ? 'text-gray-400' : 'text-gray-600'" class="text-xs mb-1">Vol 24h</div>
              <div :class="isDark ? 'text-white' : 'text-gray-900'" class="font-bold">{{ volume24h }}</div>
            </div>
          </div>
        </div>
      </div>
    </header>

    <div :class="isDark ? 'bg-gray-900' : 'bg-gray-50'" class="main-container flex-1 min-h-0 grid grid-cols-12 gap-2 md:gap-3 p-2 md:p-3 max-w-screen-2xl mx-auto">
      
      <div class="col-span-12 lg:col-span-4 xl:col-span-3 2xl:col-span-3 flex flex-col min-h-0 space-y-3 order-3 lg:order-1">
        <div :class="isDark ? 'bg-gray-800' : 'bg-white'" class="rounded-lg flex-1 flex flex-col">
          <div :class="isDark ? 'bg-gray-750 border-gray-700' : 'bg-gray-100 border-gray-200'" class="px-3 py-2 border-b">
            <div class="flex items-center justify-between">
              <h3 :class="isDark ? 'text-white' : 'text-gray-900'" class="font-bold">Libro de Órdenes</h3>
              <div class="flex space-x-2">
                <button @click="orderbookView = 'both'" :class="orderbookView === 'both' ? 'text-yellow-500' : (isDark ? 'text-gray-400' : 'text-gray-600')" class="text-xs font-semibold">Ambos</button>
                <button @click="orderbookView = 'sell'" :class="orderbookView === 'sell' ? 'text-red-500' : (isDark ? 'text-gray-400' : 'text-gray-600')" class="text-xs font-semibold">Venta</button>
                <button @click="orderbookView = 'buy'" :class="orderbookView === 'buy' ? 'text-green-500' : (isDark ? 'text-gray-400' : 'text-gray-600')" class="text-xs font-semibold">Compra</button>
              </div>
            </div>
          </div>

          <div :class="isDark ? 'bg-gray-750 text-gray-400' : 'bg-gray-100 text-gray-600'" class="px-3 py-2 grid grid-cols-3 text-xs font-bold">
            <div>Precio(USDT)</div>
            <div class="text-right">Cantidad</div>
            <div class="text-right">Total</div>
          </div>

          <div class="flex-1 overflow-y-auto scrollbar-thin">
            <div v-if="orderbookView === 'both' || orderbookView === 'sell'" class="px-4 py-1">
              <div v-for="order in displaySellOrders" :key="'sell-' + order.price" class="grid grid-cols-3 text-xs py-1 relative hover:bg-opacity-20" :class="isDark ? 'hover:bg-red-500' : 'hover:bg-red-100'">
                <div class="absolute inset-0 bg-red-900 opacity-10" :style="{ width: order.total + '%' }"></div>
                <div class="text-red-500 relative z-10 font-bold">{{ formatNumber(order.price) }}</div>
                <div :class="isDark ? 'text-white' : 'text-gray-900'" class="text-right relative z-10 font-semibold">{{ order.amount }}</div>
                <div :class="isDark ? 'text-gray-400' : 'text-gray-600'" class="text-right relative z-10">{{ order.totalValue }}</div>
              </div>
            </div>

            <div :class="isDark ? 'bg-gray-750' : 'bg-gray-100'" class="px-3 py-2 my-1">
              <div class="flex items-center justify-center">
                <span :class="priceChange >= 0 ? 'text-green-500' : 'text-red-500'" class="font-extrabold text-xl">{{ formatNumber(currentPrice) }}</span>
              </div>
            </div>

            <div v-if="orderbookView === 'both' || orderbookView === 'buy'" class="px-4 py-1">
              <div v-for="order in displayBuyOrders" :key="'buy-' + order.price" class="grid grid-cols-3 text-xs py-1 relative hover:bg-opacity-20" :class="isDark ? 'hover:bg-green-500' : 'hover:bg-green-100'">
                <div class="absolute inset-0 bg-green-900 opacity-10" :style="{ width: order.total + '%' }"></div>
                <div class="text-green-500 relative z-10 font-bold">{{ formatNumber(order.price) }}</div>
                <div :class="isDark ? 'text-white' : 'text-gray-900'" class="text-right relative z-10 font-semibold">{{ order.amount }}</div>
                <div :class="isDark ? 'text-gray-400' : 'text-gray-600'" class="text-right relative z-10">{{ order.totalValue }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="col-span-12 lg:col-span-8 xl:col-span-6 2xl:col-span-6 flex flex-col min-h-0 space-y-3 order-1">
        <div :class="isDark ? 'bg-gray-800' : 'bg-white'" class="rounded-lg flex-1 flex flex-col">
          <div class="px-3 py-2 flex items-center justify-between">
            <div class="flex space-x-2">
              <button 
                v-for="tf in timeframes" 
                :key="tf"
                @click="timeframe = tf"
                :class="timeframe === tf ? 'bg-yellow-500 text-gray-900' : (isDark ? 'bg-gray-700 text-gray-400 hover:bg-gray-600' : 'bg-gray-200 text-gray-600 hover:bg-gray-300')"
                class="px-2 py-1 rounded text-sm font-bold transition-colors">
                {{ tf }}
              </button>
            </div>
            <div class="flex space-x-2">
              <button @click="candleCount = Math.max(10, candleCount - 10)" :class="isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'" class="px-2 py-1 rounded text-sm font-bold transition-colors">-</button>
              <button @click="candleCount = Math.min(50, candleCount + 10)" :class="isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'" class="px-2 py-1 rounded text-sm font-bold transition-colors">+</button>
            </div>
          </div>

          <div :class="isDark ? 'bg-gray-900' : 'bg-gray-50'" class="flex-1 p-3 relative">
            <!-- Loading State -->
            <div v-if="loadingCandles" class="absolute inset-0 flex items-center justify-center">
              <div class="text-center">
                <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div>
                <p :class="isDark ? 'text-gray-400' : 'text-gray-600'" class="mt-2 text-sm">Cargando datos...</p>
              </div>
            </div>
            
            <!-- Error State -->
            <div v-else-if="candlesError" class="absolute inset-0 flex items-center justify-center">
              <div class="text-center p-4">
                <p class="text-red-500 text-sm font-semibold">{{ candlesError }}</p>
                <button 
                  @click="fetchCandles" 
                  class="mt-2 px-4 py-2 bg-yellow-500 text-gray-900 rounded-lg font-semibold hover:bg-yellow-600 transition-colors">
                  Reintentar
                </button>
              </div>
            </div>
            
            <!-- Chart -->
            <svg v-else width="100%" height="100%" viewBox="0 0 800 400" preserveAspectRatio="xMidYMid meet">
              <line v-for="i in 5" :key="'hgrid-' + i" 
                x1="0" 
                :y1="(400 / 5) * i" 
                x2="800" 
                :y2="(400 / 5) * i" 
                :stroke="isDark ? '#374151' : '#e5e7eb'" 
                stroke-width="1"/>
              
              <line v-for="i in 8" :key="'vgrid-' + i" 
                :x1="(800 / 8) * i" 
                y1="0" 
                :x2="(800 / 8) * i" 
                y2="400" 
                :stroke="isDark ? '#374151' : '#e5e7eb'" 
                stroke-width="1"/>
              
              <!-- Empty State -->
              <g v-if="visibleCandles.length === 0">
                <text 
                  x="400" 
                  y="200" 
                  text-anchor="middle" 
                  :fill="isDark ? '#9ca3af' : '#6b7280'" 
                  font-size="16">
                  No hay datos disponibles
                </text>
              </g>
              
              <!-- Candles -->
              <g v-for="(candle, index) in visibleCandles" :key="'candle-' + index">
                <line 
                  :x1="candle.x" 
                  :y1="candle.highY" 
                  :x2="candle.x" 
                  :y2="candle.lowY" 
                  :stroke="candle.color" 
                  stroke-width="2"/>
                
                <rect 
                  :x="candle.x - candle.width / 2" 
                  :y="candle.bodyY" 
                  :width="candle.width" 
                  :height="candle.bodyHeight" 
                  :fill="candle.color"/>
              </g>

              <!-- Current Price Line -->
              <line 
                v-if="visibleCandles.length > 0"
                x1="0" 
                :y1="currentPriceY" 
                x2="800" 
                :y2="currentPriceY" 
                stroke="#fbbf24" 
                stroke-width="3" 
                stroke-dasharray="10,5"/>
              
              <rect 
                v-if="visibleCandles.length > 0"
                x="730" 
                :y="currentPriceY - 15" 
                width="65" 
                height="30" 
                fill="#fbbf24" 
                rx="4"/>
              <text 
                v-if="visibleCandles.length > 0"
                x="762" 
                :y="currentPriceY + 5" 
                text-anchor="middle" 
                fill="#1a1a1a" 
                font-size="14" 
                font-weight="bold">
                {{ formatNumber(currentPrice) }}
              </text>
            </svg>
          </div>
        </div>

        <div :class="isDark ? 'bg-gray-800' : 'bg-white'" class="rounded-lg" style="height: 200px;">
          <div class="px-3 py-2 flex space-x-4 border-b" :class="isDark ? 'border-gray-700' : 'border-gray-200'">
            <button 
              @click="ordersTab = 'open'" 
              :class="ordersTab === 'open' ? 'text-yellow-500 border-b-2 border-yellow-500' : (isDark ? 'text-gray-400' : 'text-gray-600')"
              class="pb-2 font-bold transition-colors">
              Órdenes Abiertas ({{ openOrdersCount }})
            </button>
            <button 
              @click="ordersTab = 'history'" 
              :class="ordersTab === 'history' ? 'text-yellow-500 border-b-2 border-yellow-500' : (isDark ? 'text-gray-400' : 'text-gray-600')"
              class="pb-2 font-bold transition-colors">
              Historial
            </button>
          </div>

          <div class="overflow-y-auto scrollbar-thin" style="height: calc(200px - 40px);">
            <!-- Loading State -->
            <div v-if="loadingOrders" class="px-4 py-12 text-center">
              <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div>
              <p :class="isDark ? 'text-gray-400' : 'text-gray-600'" class="mt-2 text-sm">Cargando órdenes...</p>
            </div>
            
            <!-- Error State -->
            <div v-else-if="ordersError" class="px-4 py-12 text-center">
              <p class="text-red-500 text-sm font-semibold">{{ ordersError }}</p>
              <button 
                @click="fetchAllOrders" 
                class="mt-2 px-4 py-2 bg-yellow-500 text-gray-900 rounded-lg font-semibold hover:bg-yellow-600 transition-colors">
                Reintentar
              </button>
            </div>
            
            <!-- Orders Content -->
            <div v-else>
            <div v-if="ordersTab === 'open'">
              <div v-if="openOrders.length === 0" class="px-4 py-12 text-center">
                <svg class="w-16 h-16 mx-auto mb-3" :class="isDark ? 'text-gray-700' : 'text-gray-300'" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" clip-rule="evenodd"/>
                </svg>
                <p :class="isDark ? 'text-gray-400' : 'text-gray-600'" class="font-semibold">No hay órdenes abiertas</p>
              </div>
              <table v-else class="w-full">
                <thead :class="isDark ? 'bg-gray-750' : 'bg-gray-100'">
                  <tr class="text-xs font-bold" :class="isDark ? 'text-gray-400' : 'text-gray-600'">
                    <th class="px-4 py-2 text-left">Par</th>
                    <th class="px-4 py-2 text-left">Tipo</th>
                    <th class="px-4 py-2 text-right">Precio</th>
                    <th class="px-4 py-2 text-right">Cantidad</th>
                    <th class="px-4 py-2 text-right">Total</th>
                    <th class="px-4 py-2 text-right">Llenado</th>
                    <th class="px-4 py-2 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody :class="isDark ? 'divide-gray-700' : 'divide-gray-200'" class="divide-y">
                  <tr v-for="order in openOrders" :key="order.id" :class="isDark ? 'hover:bg-gray-750' : 'hover:bg-gray-50'" class="text-sm">
                    <td class="px-4 py-3">
                      <div class="flex items-center space-x-2">
                        <span :class="isDark ? 'text-white' : 'text-gray-900'" class="font-bold">{{ order.pair }}</span>
                        <span :class="order.type === 'buy' ? 'bg-green-500' : 'bg-red-500'" class="text-white text-xs px-2 py-0.5 rounded font-semibold">
                          {{ order.type === 'buy' ? 'Compra' : 'Venta' }}
                        </span>
                      </div>
                    </td>
                    <td class="px-4 py-3">
                      <span :class="isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'" class="text-xs px-2 py-1 rounded font-semibold">
                        {{ order.orderType }}
                      </span>
                    </td>
                    <td :class="isDark ? 'text-white' : 'text-gray-900'" class="px-4 py-3 text-right font-bold">{{ formatNumber(order.price) }}</td>
                    <td :class="isDark ? 'text-white' : 'text-gray-900'" class="px-4 py-3 text-right font-semibold">{{ order.amount }}</td>
                    <td :class="isDark ? 'text-white' : 'text-gray-900'" class="px-4 py-3 text-right font-semibold">{{ formatNumber(order.total) }}</td>
                    <td class="px-4 py-3 text-right">
                      <div class="flex items-center justify-end space-x-2">
                        <div class="w-20 h-2 bg-gray-700 rounded-full overflow-hidden">
                          <div class="h-full bg-yellow-500" :style="{ width: order.filled + '%' }"></div>
                        </div>
                        <span :class="isDark ? 'text-gray-400' : 'text-gray-600'" class="text-xs font-bold">{{ order.filled }}%</span>
                      </div>
                    </td>
                    <td class="px-4 py-3 text-right">
                      <button @click="cancelOrder(order.oid)" class="text-red-500 hover:text-red-400 text-xs font-bold px-3 py-1 rounded-lg bg-red-500 bg-opacity-10 hover:bg-opacity-20 transition-colors">
                        Cancelar
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div v-if="ordersTab === 'history'">
              <div v-if="orderHistory.length === 0" class="px-4 py-12 text-center">
                <svg class="w-16 h-16 mx-auto mb-3" :class="isDark ? 'text-gray-700' : 'text-gray-300'" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"/>
                </svg>
                <p :class="isDark ? 'text-gray-400' : 'text-gray-600'" class="font-semibold">Sin historial</p>
              </div>
              <table v-else class="w-full">
                <thead :class="isDark ? 'bg-gray-750' : 'bg-gray-100'">
                  <tr class="text-xs font-bold" :class="isDark ? 'text-gray-400' : 'text-gray-600'">
                    <th class="px-4 py-2 text-left">Par</th>
                    <th class="px-4 py-2 text-left">Tipo</th>
                    <th class="px-4 py-2 text-right">Precio</th>
                    <th class="px-4 py-2 text-right">Cantidad</th>
                    <th class="px-4 py-2 text-right">Total</th>
                    <th class="px-4 py-2 text-right">Estado</th>
                    <th class="px-4 py-2 text-right">Fecha</th>
                  </tr>
                </thead>
                <tbody :class="isDark ? 'divide-gray-700' : 'divide-gray-200'" class="divide-y">
                  <tr v-for="order in orderHistory" :key="order.id" :class="isDark ? 'hover:bg-gray-750' : 'hover:bg-gray-50'" class="text-sm">
                    <td class="px-4 py-3">
                      <div class="flex items-center space-x-2">
                        <span :class="isDark ? 'text-white' : 'text-gray-900'" class="font-bold">{{ order.pair }}</span>
                        <span :class="order.type === 'buy' ? 'bg-green-500' : 'bg-red-500'" class="text-white text-xs px-2 py-0.5 rounded font-semibold">
                          {{ order.type === 'buy' ? 'Compra' : 'Venta' }}
                        </span>
                      </div>
                    </td>
                    <td :class="isDark ? 'text-gray-400' : 'text-gray-600'" class="px-4 py-3">{{ order.orderType || 'Límite' }}</td>
                    <td :class="isDark ? 'text-white' : 'text-gray-900'" class="px-4 py-3 text-right font-bold">{{ formatNumber(order.price) }}</td>
                    <td :class="isDark ? 'text-white' : 'text-gray-900'" class="px-4 py-3 text-right font-semibold">{{ order.amount }}</td>
                    <td :class="isDark ? 'text-white' : 'text-gray-900'" class="px-4 py-3 text-right font-semibold">{{ formatNumber(order.total) }}</td>
                    <td class="px-4 py-3 text-right">
                      <span :class="order.status === 'completed' ? 'text-green-500 bg-green-500' : 'text-gray-500 bg-gray-500'" class="text-xs font-bold px-2 py-1 rounded bg-opacity-10">
                        {{ order.status === 'completed' ? 'Completada' : 'Cancelada' }}
                      </span>
                    </td>
                    <td :class="isDark ? 'text-gray-400' : 'text-gray-600'" class="px-4 py-3 text-right text-xs">{{ order.time }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            </div>
          </div>
        </div>
      </div>

      <div class="col-span-12 lg:col-span-12 xl:col-span-3 2xl:col-span-3 flex flex-col min-h-0 space-y-3 order-2 lg:order-2 xl:order-3">
        <div :class="isDark ? 'bg-gray-800' : 'bg-white'" class="rounded-lg p-3 flex-1 overflow-y-auto">
          <div class="grid grid-cols-2 gap-2 mb-3">
            <button 
              @click="orderType = 'buy'"
              :class="orderType === 'buy' ? 'bg-green-500 text-white' : (isDark ? 'bg-gray-700 text-gray-400' : 'bg-gray-200 text-gray-600')"
              class="py-2 rounded-lg font-extrabold transition-colors">
              Comprar
            </button>
            <button 
              @click="orderType = 'sell'"
              :class="orderType === 'sell' ? 'bg-red-500 text-white' : (isDark ? 'bg-gray-700 text-gray-400' : 'bg-gray-200 text-gray-600')"
              class="py-2 rounded-lg font-extrabold transition-colors">
              Vender
            </button>
          </div>

          <div class="flex space-x-2 mb-3">
            <button 
              @click="priceType = 'limit'"
              :class="priceType === 'limit' ? (isDark ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-900') : (isDark ? 'text-gray-400' : 'text-gray-600')"
              class="px-3 py-2 rounded-lg text-sm font-bold transition-colors">
              Límite
            </button>
            <button 
              @click="priceType = 'market'"
              :class="priceType === 'market' ? (isDark ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-900') : (isDark ? 'text-gray-400' : 'text-gray-600')"
              class="px-3 py-2 rounded-lg text-sm font-bold transition-colors">
              Mercado
            </button>
          </div>

                <div class="flex items-center justify-between mb-3 text-sm">
        <span :class="isDark ? 'text-gray-400' : 'text-gray-600'" class="font-semibold">Disponible</span>
        <div class="flex items-center space-x-2">
          <div v-if="loadingBalance" class="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-500"></div>
          <span v-else :class="isDark ? 'text-white' : 'text-gray-900'" class="font-bold">
            {{ formatNumber(availableBalance) }} {{ orderType === 'buy' ? quoteCurrency : baseCurrency }}
          </span>
        </div>
      </div>

          <div v-if="priceType === 'limit'" class="mb-4">
            <label :class="isDark ? 'text-gray-400' : 'text-gray-600'" class="text-sm font-bold mb-2 block">Precio</label>
            <div :class="isDark ? 'bg-gray-700' : 'bg-gray-200'" class="rounded-lg p-3 flex items-center">
              <input 
                v-model="orderPrice" 
                type="number" 
                placeholder="0.00"
                :class="isDark ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-900'"
                class="flex-1 outline-none font-bold text-base">
              <span :class="isDark ? 'text-gray-400' : 'text-gray-600'" class="ml-2 font-semibold">USDT</span>
            </div>
          </div>

          <div class="mb-4">
            <label :class="isDark ? 'text-gray-400' : 'text-gray-600'" class="text-sm font-bold mb-2 block">Cantidad</label>
            <div :class="isDark ? 'bg-gray-700' : 'bg-gray-200'" class="rounded-lg p-3 flex items-center">
              <input 
                v-model="orderAmount" 
                type="number" 
                placeholder="0.00"
                :class="isDark ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-900'"
                class="flex-1 outline-none font-bold text-base">
              <span :class="isDark ? 'text-gray-400' : 'text-gray-600'" class="ml-2 font-semibold">BTC</span>
            </div>
          </div>

          <div class="grid grid-cols-4 gap-2 mb-3">
            <button 
              v-for="percent in [25, 50, 75, 100]" 
              :key="percent"
              @click="setAmountPercent(percent)"
              :class="isDark ? 'bg-gray-700 text-gray-400 hover:bg-gray-600' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'"
              class="py-2 rounded-lg text-sm font-bold transition-colors">
              {{ percent }}%
            </button>
          </div>

          <div class="flex items-center justify-between mb-4 text-sm">
            <span :class="isDark ? 'text-gray-400' : 'text-gray-600'" class="font-semibold">Total</span>
            <span :class="isDark ? 'text-white' : 'text-gray-900'" class="font-bold">
              {{ formatNumber(orderTotal) }} USDT
            </span>
          </div>

          <button 
          @click="placeOrder"
          :disabled="loadingBalance || availableBalance === 0"
          :class="orderType === 'buy' ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'"
          class="w-full py-3 rounded-lg text-white font-extrabold text-base transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
          {{ orderType === 'buy' ? `Comprar ${baseCurrency}` : `Vender ${baseCurrency}` }}
        </button>
        </div>
      </div>

    </div>
  </div>
</template>



<style>
/* Estilos personalizados del <head> original */
body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}
.bg-gray-750 {
  background-color: #1a202c;
}
.hover\:bg-gray-750:hover {
  background-color: #1a202c;
}
.scrollbar-thin::-webkit-scrollbar {
  width: 6px;
}
.scrollbar-thin::-webkit-scrollbar-track {
  background: transparent;
}
.scrollbar-thin::-webkit-scrollbar-thumb {
  background: #4b5563;
  border-radius: 3px;
}
.scrollbar-thin::-webkit-scrollbar-thumb:hover {
  background: #6b7280;
}
</style>