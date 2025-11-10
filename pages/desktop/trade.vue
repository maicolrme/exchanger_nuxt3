<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';

 setPageLayout('p2p');


// --- Estado Reactivo (antes 'data') ---
const isDark = ref(true);
const selectedPair = ref('BTC/USDT');
const currentPrice = ref(60500.75);
const priceChange = ref(-1.25);
const high24h = ref(62100.00);
const low24h = ref(59800.50);
const volume24h = ref('1.5B USDT');
const orderbookView = ref('both'); // 'both', 'sell', 'buy'
const timeframe = ref('1H');
const timeframes = ref(['15m', '1H', '4H', '1D', '1W']);
const candleCount = ref(30);

const candleData = ref([
  { open: 59000, high: 59500, low: 58800, close: 59300 },
  { open: 59300, high: 60000, low: 59100, close: 59900 },
  { open: 59900, high: 60200, low: 59700, close: 59800 },
  { open: 59800, high: 60500, low: 59800, close: 60400 },
  { open: 60400, high: 60800, low: 60300, close: 60700 },
  { open: 60700, high: 61500, low: 60600, close: 61400 },
  { open: 61400, high: 61500, low: 61000, close: 61200 },
  { open: 61200, high: 61300, low: 60800, close: 60900 },
  { open: 60900, high: 61000, low: 60500, close: 60600 },
  { open: 60600, high: 60800, low: 60400, close: 60700 },
  { open: 60700, high: 61200, low: 60700, close: 61100 },
  { open: 61100, high: 61300, low: 60900, close: 61000 },
  { open: 61000, high: 61500, low: 61000, close: 61400 },
  { open: 61400, high: 61800, low: 61300, close: 61700 },
  { open: 61700, high: 62200, low: 61600, close: 62100 },
  { open: 62100, high: 62300, low: 61800, close: 61900 },
  { open: 61900, high: 62000, low: 61500, close: 61600 },
  { open: 61600, high: 61800, low: 61400, close: 61700 },
  { open: 61700, high: 61900, low: 61500, close: 61800 },
  { open: 61800, high: 61900, low: 61200, close: 61300 },
  { open: 61300, high: 61400, low: 61000, close: 61100 },
  { open: 61100, high: 61200, low: 60700, close: 60800 },
  { open: 60800, high: 60900, low: 60400, close: 60500 },
  { open: 60500, high: 60800, low: 60400, close: 60700 },
  { open: 60700, high: 60800, low: 60300, close: 60400 },
  { open: 60400, high: 60600, low: 60200, close: 60300 },
  { open: 60300, high: 60500, low: 60000, close: 60100 },
  { open: 60100, high: 60300, low: 59800, close: 59900 },
  { open: 59900, high: 60200, low: 59900, close: 60100 },
  { open: 60100, high: 60600, low: 60000, close: 60500 },
  // ... (añade más datos si es necesario)
]);

const ordersTab = ref('open'); // 'open', 'history'
const openOrders = ref([
  { id: 1, pair: 'BTC/USDT', type: 'buy', orderType: 'Límite', price: 60000.00, amount: 0.1, total: 6000.00, filled: 50 },
  { id: 2, pair: 'ETH/USDT', type: 'sell', orderType: 'Límite', price: 4100.00, amount: 2.5, total: 10250.00, filled: 20 },
]);
const orderHistory = ref([
  { id: 3, pair: 'BTC/USDT', type: 'buy', orderType: 'Límite', price: 59500.00, amount: 0.2, total: 11900.00, status: 'completed', time: '2025-11-10 14:30:15' },
  { id: 4, pair: 'BTC/USDT', type: 'sell', orderType: 'Límite', price: 61000.00, amount: 0.1, total: 6100.00, status: 'cancelled', time: '2025-11-10 10:15:00' },
]);

const orderType = ref('buy'); // 'buy', 'sell'
const priceType = ref('limit'); // 'limit', 'market'
const orderPrice = ref(60500.00);
const orderAmount = ref(0.1);

const buyOrders = ref([
  { price: 60490.50, amount: 0.5, total: 30, totalValue: '30,245.25' },
  { price: 60485.10, amount: 1.2, total: 60, totalValue: '72,582.12' },
  { price: 60480.00, amount: 0.8, total: 40, totalValue: '48,384.00' },
  // ... más datos
]);
const sellOrders = ref([
  { price: 60500.75, amount: 0.7, total: 35, totalValue: '42,350.53' },
  { price: 60505.20, amount: 1.0, total: 50, totalValue: '60,505.20' },
  { price: 60510.00, amount: 0.3, total: 15, totalValue: '18,153.00' },
  // ... más datos
]);

// --- Propiedades Computadas (antes 'computed') ---

const availableBalance = computed(() => {
  return orderType.value === 'buy' ? 10000.00 : 0.5;
});

const orderTotal = computed(() => {
  const price = priceType.value === 'limit' ? orderPrice.value : currentPrice.value;
  return orderAmount.value * price;
});

const displayBuyOrders = computed(() => {
  return buyOrders.value.slice(0, 15);
});

const displaySellOrders = computed(() => {
  return sellOrders.value.slice(0, 15).reverse();
});

// Computadas para el Gráfico
const chartMinPrice = computed(() => {
  const data = candleData.value.slice(0, candleCount.value);
  return Math.min(...data.map(c => c.low)) * 0.99; // 1% de padding
});

const chartMaxPrice = computed(() => {
  const data = candleData.value.slice(0, candleCount.value);
  return Math.max(...data.map(c => c.high)) * 1.01; // 1% de padding
});

const priceRange = computed(() => {
  return chartMaxPrice.value - chartMinPrice.value;
});

const visibleCandles = computed(() => {
  const data = candleData.value.slice(0, candleCount.value).reverse();
  const width = 800 / data.length;
  
  const scaleY = (val: number) => 400 - ((val - chartMinPrice.value) / priceRange.value) * 400;

  return data.map((candle, index) => {
    const x = (index + 0.5) * width;
    const openY = scaleY(candle.open);
    const closeY = scaleY(candle.close);
    
    return {
      x: x,
      width: width * 0.7,
      highY: scaleY(candle.high),
      lowY: scaleY(candle.low),
      bodyY: Math.min(openY, closeY),
      bodyHeight: Math.abs(openY - closeY) || 1, // altura mínima de 1
      color: candle.open > candle.close ? '#ef4444' : '#22c55e' // Red / Green
    };
  });
});

const currentPriceY = computed(() => {
  return 400 - ((currentPrice.value - chartMinPrice.value) / priceRange.value) * 400;
});

// --- Métodos (ahora funciones) ---

function setAmountPercent(percent: number) {
  const balance = availableBalance.value;
  if (orderType.value === 'buy') {
    const price = priceType.value === 'limit' ? orderPrice.value : currentPrice.value;
    orderAmount.value = (balance * (percent / 100)) / price;
  } else {
    orderAmount.value = balance * (percent / 100);
  }
}

function formatNumber(num: number) {
  if (num === null || num === undefined) return '0.00';
  return num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function placeOrder() {
  const newOrder = {
    id: Date.now(),
    pair: selectedPair.value,
    type: orderType.value,
    orderType: priceType.value === 'limit' ? 'Límite' : 'Mercado',
    price: priceType.value === 'limit' ? orderPrice.value : currentPrice.value,
    amount: orderAmount.value,
    total: orderTotal.value,
    filled: 0
  };
  
  openOrders.value.unshift(newOrder);
  
  // Opcional: mover a historial si es de mercado
  if (priceType.value === 'market') {
    cancelOrder(newOrder.id, 'completed');
  }

  // Resetear formulario
  orderAmount.value = 0;
  // orderPrice.value = currentPrice.value; // opcional
}

function cancelOrder(orderId: number, status = 'cancelled') {
  const orderIndex = openOrders.value.findIndex(o => o.id === orderId);
  if (orderIndex > -1) {
    const order = openOrders.value.splice(orderIndex, 1)[0];
    
    orderHistory.value.unshift({
      ...order,
      status: status,
      filled: status === 'completed' ? 100 : order.filled,
      time: new Date().toLocaleString('es-ES')
    });
  }
}

// Simular actualización de precio
function updatePrice() {
  const change = (Math.random() - 0.5) * 50; // fluctuación
  currentPrice.value = Math.max(58000, Math.min(63000, currentPrice.value + change));
  priceChange.value = (Math.random() - 0.5) * 5; // % de cambio
}

// --- Ciclo de Vida (antes 'mounted') ---

onMounted(() => {
  // Iniciar el ticker de precio simulado
  setInterval(updatePrice, 1500);
});

// --- SEO y Metadatos (antes <head>) ---
useHead({
  title: 'CryptoEx - Pro Trading Desktop',
  htmlAttrs: {
    lang: 'es'
  },
  meta: [
    { charset: 'UTF-E' },
    { name: 'viewport', content: 'width=device-width, initial-scale=1.0' }
  ]
});
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

          <div :class="isDark ? 'bg-gray-900' : 'bg-gray-50'" class="flex-1 p-3">
            <svg width="100%" height="100%" viewBox="0 0 800 400" preserveAspectRatio="xMidYMid meet">
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

              <line 
                x1="0" 
                :y1="currentPriceY" 
                x2="800" 
                :y2="currentPriceY" 
                stroke="#fbbf24" 
                stroke-width="3" 
                stroke-dasharray="10,5"/>
              
              <rect 
                x="730" 
                :y="currentPriceY - 15" 
                width="65" 
                height="30" 
                fill="#fbbf24" 
                rx="4"/>
              <text 
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
              Órdenes Abiertas ({{ openOrders.length }})
            </button>
            <button 
              @click="ordersTab = 'history'" 
              :class="ordersTab === 'history' ? 'text-yellow-500 border-b-2 border-yellow-500' : (isDark ? 'text-gray-400' : 'text-gray-600')"
              class="pb-2 font-bold transition-colors">
              Historial
            </button>
          </div>

          <div class="overflow-y-auto scrollbar-thin" style="height: calc(200px - 40px);">
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
                      <button @click="cancelOrder(order.id)" class="text-red-500 hover:text-red-400 text-xs font-bold px-3 py-1 rounded-lg bg-red-500 bg-opacity-10 hover:bg-opacity-20 transition-colors">
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
            <span :class="isDark ? 'text-white' : 'text-gray-900'" class="font-bold">
              {{ formatNumber(availableBalance) }} {{ orderType === 'buy' ? 'USDT' : 'BTC' }}
            </span>
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
            :class="orderType === 'buy' ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'"
            class="w-full py-3 rounded-lg text-white font-extrabold text-base transition-colors">
            {{ orderType === 'buy' ? 'Comprar BTC' : 'Vender BTC' }}
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
.main-container {
  /* Estilos que podrían haber estado aquí */
}
</style>