<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';

// --- Metadatos de la página (reemplaza <head>) ---
useHead({
  title: 'CryptoEx - Trading',
  htmlAttrs: {
    lang: 'es'
  },
  meta: [
    { charset: 'UTF-8' },
    { name: 'viewport', content: 'width=device-width, initial-scale=1.0' }
  ]
});



setPageLayout('p2p');

// --- Estado Reactivo (antes 'data') ---
// Sincroniza el tema con el layout `p2p` observando su clase `light-mode` y localStorage
const isLightMode = ref(false);
const isDark = computed(() => !isLightMode.value);
let themeObserver: MutationObserver | null = null;

onMounted(() => {
  if (process.client) {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      isLightMode.value = savedTheme === 'light';
    }

    const rootEl = document.querySelector('.app-layout');
    if (rootEl) {
      // Estado inicial basado en la clase del layout
      isLightMode.value = rootEl.classList.contains('light-mode');

      // Observar cambios de clase para reflejar el toggle del layout
      themeObserver = new MutationObserver((mutations) => {
        for (const m of mutations) {
          if (m.type === 'attributes' && m.attributeName === 'class') {
            isLightMode.value = (m.target as HTMLElement).classList.contains('light-mode');
          }
        }
      });
      themeObserver.observe(rootEl, { attributes: true, attributeFilter: ['class'] });
    }
  }
});

onUnmounted(() => {
  themeObserver?.disconnect();
  themeObserver = null;
});
const selectedPair = ref('BTC/USDT');
const currentPrice = ref('67,234.50'); // Mantenido como string para simular el original
const priceChange = ref(2.45);
const volume24h = ref('1.2B');
const orderbookView = ref('both');
const orderType = ref('buy');
const priceType = ref('limit');
const orderPrice = ref(''); // Mantenido como string
const orderAmount = ref(''); // Mantenido como string
const availableBalance = ref(10000);
const ordersTab = ref('open');

const sellOrders = ref([
  { price: '67,350.00', amount: '0.5234', totalValue: '35,243.19', total: 75 },
  { price: '67,340.00', amount: '0.8921', totalValue: '60,074.21', total: 65 },
  { price: '67,330.00', amount: '1.2456', totalValue: '83,875.13', total: 85 },
  { price: '67,320.00', amount: '0.3421', totalValue: '23,033.67', total: 45 },
  { price: '67,310.00', amount: '2.1234', totalValue: '142,897.87', total: 95 },
  { price: '67,300.00', amount: '0.9876', totalValue: '66,470.28', total: 70 },
  { price: '67,290.00', amount: '1.5678', totalValue: '105,501.30', total: 80 },
  { price: '67,280.00', amount: '0.6543', totalValue: '44,024.10', total: 55 },
]);

const buyOrders = ref([
  { price: '67,230.00', amount: '0.7654', totalValue: '51,465.08', total: 60 },
  { price: '67,220.00', amount: '1.4321', totalValue: '96,275.36', total: 90 },
  { price: '67,210.00', amount: '0.5432', totalValue: '36,509.47', total: 50 },
  { price: '67,200.00', amount: '2.3456', totalValue: '157,651.20', total: 100 },
  { price: '67,190.00', amount: '0.8765', totalValue: '58,895.74', total: 65 },
  { price: '67,180.00', amount: '1.6789', totalValue: '112,792.32', total: 85 },
  { price: '67,170.00', amount: '0.4321', totalValue: '29,023.56', total: 40 },
  { price: '67,160.00', amount: '1.9876', totalValue: '133,493.22', total: 95 },
]);

const openOrders = ref([
  { id: 1, pair: 'BTC/USDT', type: 'buy', orderType: 'Límite', price: '67,100.00', amount: '0.5000', total: '33,550.00', filled: 0, time: '2025-10-08 14:23:45' },
  { id: 2, pair: 'BTC/USDT', type: 'sell', orderType: 'Límite', price: '67,500.00', amount: '0.2500', total: '16,875.00', filled: 45, time: '2025-10-08 13:15:22' },
]);

const orderHistory = ref([
  { id: 101, pair: 'BTC/USDT', type: 'buy', price: '66,800.00', amount: '0.3000', total: '20,040.00', status: 'completed', time: '2025-10-08 12:30:15' },
  { id: 102, pair: 'BTC/USDT', type: 'sell', price: '67,000.00', amount: '0.1500', total: '10,050.00', status: 'completed', time: '2025-10-08 11:45:30' },
  { id: 103, pair: 'BTC/USDT', type: 'buy', price: '66,500.00', amount: '0.5000', total: '33,250.00', status: 'cancelled', time: '2025-10-08 10:20:10' },
]);

// --- Propiedades Computadas (reemplaza 'calculateTotal' de methods) ---
const orderTotal = computed(() => {
  const priceStr = priceType.value === 'market' ? currentPrice.value : orderPrice.value;
  const price = parseFloat(String(priceStr).replace(/,/g, '')) || 0;
  const amount = parseFloat(String(orderAmount.value)) || 0;
  return (price * amount).toFixed(2);
});

// --- Funciones (antes 'methods') ---
function setPercentage(percent: number) {
  const balance = availableBalance.value;
  if (orderType.value === 'buy') {
    const priceStr = priceType.value === 'limit' && orderPrice.value ? orderPrice.value : currentPrice.value;
    const price = parseFloat(String(priceStr).replace(/,/g, ''));
    if (!price || price <= 0) {
        orderAmount.value = '0.00';
        return;
    }
    const totalAvailable = balance * (percent / 100);
    orderAmount.value = (totalAvailable / price).toFixed(6);
  } else {
    orderAmount.value = (balance * (percent / 100)).toFixed(6);
  }
}

function placeOrder() {
  const amount = parseFloat(String(orderAmount.value));
  if (!amount || amount <= 0) {
    console.warn('Por favor ingresa una cantidad válida'); // Reemplazo de alert
    return;
  }
  
  const price = parseFloat(String(orderPrice.value));
  if (priceType.value === 'limit' && (!price || price <= 0)) {
    console.warn('Por favor ingresa un precio válido'); // Reemplazo de alert
    return;
  }
  
  const now = new Date();
  const timeStr = now.toISOString().slice(0, 19).replace('T', ' ');
  
  const newOrder = {
    id: Date.now(),
    pair: selectedPair.value,
    type: orderType.value,
    orderType: priceType.value === 'limit' ? 'Límite' : 'Mercado',
    price: priceType.value === 'limit' ? orderPrice.value : currentPrice.value,
    amount: orderAmount.value,
    total: orderTotal.value, // Usamos la propiedad computada
    filled: 0,
    time: timeStr
  };
  
  openOrders.value.unshift(newOrder);
  
  // Limpiar formulario
  orderPrice.value = '';
  orderAmount.value = '';
  
  // Cambiar a pestaña de órdenes abiertas
  ordersTab.value = 'open';
  
  console.log(`Orden de ${orderType.value === 'buy' ? 'compra' : 'venta'} creada exitosamente`); // Reemplazo de alert
}

function cancelOrder(orderId: number) {
  const orderIndex = openOrders.value.findIndex(o => o.id === orderId);
  if (orderIndex !== -1) {
    const order = openOrders.value.splice(orderIndex, 1)[0]; // Quitar de abiertas
    
    // Añadir a historial como cancelada
    orderHistory.value.unshift({
      ...order,
      status: 'cancelled',
      time: new Date().toISOString().slice(0, 19).replace('T', ' ') // Actualizar hora
    });
  }
}
</script>


<template>
  <div>
    <!-- Header Sticky -->
    <header :class="isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'" class="sticky top-16 z-20 border-b transition-colors duration-300">
      

      <!-- Par de trading -->
      <div :class="isDark ? 'bg-gray-750 border-gray-700' : 'bg-gray-100 border-gray-200'" class="px-4 py-2 border-t">
        <div class="flex items-center justify-between">
          <div>
            <div class="flex items-center space-x-2">
              <span :class="isDark ? 'text-white' : 'text-gray-900'" class="font-bold text-lg">{{ selectedPair }}</span>
              <svg class="w-4 h-4" :class="isDark ? 'text-gray-400' : 'text-gray-600'" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"/>
              </svg>
            </div>
            <div :class="isDark ? 'text-gray-400' : 'text-gray-600'" class="text-xs">Vol: {{ volume24h }}</div>
          </div>
          <div class="text-right">
            <div :class="isDark ? 'text-white' : 'text-gray-900'" class="font-bold text-lg">{{ currentPrice }}</div>
            <div :class="priceChange >= 0 ? 'text-green-500' : 'text-red-500'" class="text-xs font-semibold">
              {{ priceChange >= 0 ? '+' : '' }}{{ priceChange }}%
            </div>
          </div>
        </div>
      </div>
    </header>

    <div :class="isDark ? 'bg-gray-900' : 'bg-gray-50'" class="transition-colors duration-300">
      <div class="px-4 py-4 space-y-4">
        
        <!-- Order Book -->
        <div :class="isDark ? 'bg-gray-800' : 'bg-white'" class="rounded-lg overflow-hidden">
          <div :class="isDark ? 'bg-gray-750 border-gray-700' : 'bg-gray-100 border-gray-200'" class="px-4 py-3 border-b">
            <div class="flex items-center justify-between">
              <h3 :class="isDark ? 'text-white' : 'text-gray-900'" class="font-semibold">Order Book</h3>
              <div class="flex space-x-2">
                <button @click="orderbookView = 'both'" :class="orderbookView === 'both' ? 'text-yellow-500' : (isDark ? 'text-gray-400' : 'text-gray-600')" class="text-xs">Ambos</button>
                <button @click="orderbookView = 'buy'" :class="orderbookView === 'buy' ? 'text-green-500' : (isDark ? 'text-gray-400' : 'text-gray-600')" class="text-xs">Compra</button>
                <button @click="orderbookView = 'sell'" :class="orderbookView === 'sell' ? 'text-red-500' : (isDark ? 'text-gray-400' : 'text-gray-600')" class="text-xs">Venta</button>
              </div>
            </div>
          </div>

          <!-- Orderbook Header -->
          <div :class="isDark ? 'bg-gray-750 text-gray-400' : 'bg-gray-50 text-gray-600'" class="px-4 py-2 grid grid-cols-3 text-xs">
            <div>Precio(USDT)</div>
            <div class="text-right">Cantidad(BTC)</div>
            <div class="text-right">Total</div>
          </div>

          <!-- Sell Orders (Rojo) -->
          <div v-if="orderbookView === 'both' || orderbookView === 'sell'" class="px-4 py-2 space-y-1">
            <div v-for="order in sellOrders.slice().reverse().slice(0, 8)" :key="order.price" class="grid grid-cols-3 text-xs relative">
              <div class="absolute inset-0 bg-red-900 opacity-10" :style="{ width: order.total + '%' }"></div>
              <div class="text-red-500 relative z-10">{{ order.price }}</div>
              <div :class="isDark ? 'text-white' : 'text-gray-900'" class="text-right relative z-10">{{ order.amount }}</div>
              <div :class="isDark ? 'text-gray-400' : 'text-gray-600'" class="text-right relative z-10">{{ order.totalValue }}</div>
            </div>
          </div>

          <!-- Precio Actual -->
          <div :class="isDark ? 'bg-gray-750' : 'bg-gray-100'" class="px-4 py-3">
            <div class="flex items-center justify-between">
              <span :class="priceChange >= 0 ? 'text-green-500' : 'text-red-500'" class="font-bold text-lg">{{ currentPrice }}</span>
              <span :class="isDark ? 'text-gray-400' : 'text-gray-600'" class="text-xs">≈ ${{ currentPrice }}</span>
            </div>
          </div>

          <!-- Buy Orders (Verde) -->
          <div v-if="orderbookView === 'both' || orderbookView === 'buy'" class="px-4 py-2 space-y-1">
            <div v-for="order in buyOrders.slice(0, 8)" :key="order.price" class="grid grid-cols-3 text-xs relative">
              <div class="absolute inset-0 bg-green-900 opacity-10" :style="{ width: order.total + '%' }"></div>
              <div class="text-green-500 relative z-10">{{ order.price }}</div>
              <div :class="isDark ? 'text-white' : 'text-gray-900'" class="text-right relative z-10">{{ order.amount }}</div>
              <div :class="isDark ? 'text-gray-400' : 'text-gray-600'" class="text-right relative z-10">{{ order.totalValue }}</div>
            </div>
          </div>
        </div>

        <!-- Formulario de Trading -->
        <div :class="isDark ? 'bg-gray-800' : 'bg-white'" class="rounded-lg p-4">
          <!-- Tabs Compra/Venta -->
          <div class="flex space-x-2 mb-4">
            <button 
              @click="orderType = 'buy'" 
              :class="orderType === 'buy' ? 'bg-green-500 text-white' : (isDark ? 'bg-gray-700 text-gray-400' : 'bg-gray-200 text-gray-600')"
              class="flex-1 py-2 rounded-lg font-semibold transition-colors duration-200">
              Comprar
            </button>
            <button 
              @click="orderType = 'sell'" 
              :class="orderType === 'sell' ? 'bg-red-500 text-white' : (isDark ? 'bg-gray-700 text-gray-400' : 'bg-gray-200 text-gray-600')"
              class="flex-1 py-2 rounded-lg font-semibold transition-colors duration-200">
              Vender
            </button>
          </div>

          <!-- Tipo de orden -->
          <div class="flex space-x-2 mb-4">
            <button 
              @click="priceType = 'limit'" 
              :class="priceType === 'limit' ? (isDark ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-900') : (isDark ? 'text-gray-400' : 'text-gray-600')"
              class="px-3 py-1 rounded text-sm font-semibold transition-colors duration-200">
              Límite
            </button>
            <button 
              @click="priceType = 'market'" 
              :class="priceType === 'market' ? (isDark ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-900') : (isDark ? 'text-gray-400' : 'text-gray-600')"
              class="px-3 py-1 rounded text-sm font-semibold transition-colors duration-200">
              Mercado
            </button>
          </div>

          <!-- Formulario -->
          <div class="space-y-3">
            <!-- Precio -->
            <div v-if="priceType === 'limit'">
              <label :class="isDark ? 'text-gray-400' : 'text-gray-600'" class="text-xs mb-1 block">Precio</label>
              <div :class="isDark ? 'bg-gray-700' : 'bg-gray-200'" class="rounded-lg p-3 flex items-center">
                <input 
                  v-model="orderPrice" 
                  type="number" 
                  placeholder="0.00" 
                  :class="isDark ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-900'"
                  class="flex-1 outline-none font-semibold">
                <span :class="isDark ? 'text-gray-400' : 'text-gray-600'" class="text-sm ml-2">USDT</span>
              </div>
            </div>

            <!-- Cantidad -->
            <div>
              <label :class="isDark ? 'text-gray-400' : 'text-gray-600'" class="text-xs mb-1 block">Cantidad</label>
              <div :class="isDark ? 'bg-gray-700' : 'bg-gray-200'" class="rounded-lg p-3 flex items-center">
                <input 
                  v-model="orderAmount" 
                  type="number" 
                  placeholder="0.00" 
                  :class="isDark ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-900'"
                  class="flex-1 outline-none font-semibold">
                <span :class="isDark ? 'text-gray-400' : 'text-gray-600'" class="text-sm ml-2">BTC</span>
              </div>
            </div>

            <!-- Slider de porcentaje -->
            <div>
              <div class="flex justify-between text-xs mb-2" :class="isDark ? 'text-gray-400' : 'text-gray-600'">
                <span>Disponible: {{ availableBalance }} {{ orderType === 'buy' ? 'USDT' : 'BTC' }}</span>
              </div>
              <div class="flex space-x-2">
                <button @click="setPercentage(25)" :class="isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'" class="flex-1 py-1 rounded text-xs font-semibold transition-colors duration-200">25%</button>
                <button @click="setPercentage(50)" :class="isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'" class="flex-1 py-1 rounded text-xs font-semibold transition-colors duration-200">50%</button>
                <button @click="setPercentage(75)" :class="isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'" class="flex-1 py-1 rounded text-xs font-semibold transition-colors duration-200">75%</button>
                <button @click="setPercentage(100)" :class="isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'" class="flex-1 py-1 rounded text-xs font-semibold transition-colors duration-200">100%</button>
              </div>
            </div>

            <!-- Total -->
            <div>
              <label :class="isDark ? 'text-gray-400' : 'text-gray-600'" class="text-xs mb-1 block">Total</label>
              <div :class="isDark ? 'bg-gray-700' : 'bg-gray-200'" class="rounded-lg p-3 flex items-center">
                <div :class="isDark ? 'text-white' : 'text-gray-900'" class="flex-1 font-semibold">
                  {{ orderTotal }}
                </div>
                <span :class="isDark ? 'text-gray-400' : 'text-gray-600'" class="text-sm ml-2">USDT</span>
              </div>
            </div>

            <!-- Botón de orden -->
            <button 
              @click="placeOrder"
              :class="orderType === 'buy' ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'"
              class="w-full py-3 rounded-lg text-white font-bold transition-colors duration-200">
              {{ orderType === 'buy' ? 'Comprar' : 'Vender' }} BTC
            </button>
          </div>
        </div>

        <!-- Órdenes Abiertas -->
        <div :class="isDark ? 'bg-gray-800' : 'bg-white'" class="rounded-lg overflow-hidden">
          <div :class="isDark ? 'bg-gray-750 border-gray-700' : 'bg-gray-100 border-gray-200'" class="px-4 py-3 border-b">
            <div class="flex space-x-4">
              <button 
                @click="ordersTab = 'open'" 
                :class="ordersTab === 'open' ? 'text-yellow-500 border-b-2 border-yellow-500' : (isDark ? 'text-gray-400' : 'text-gray-600')"
                class="pb-1 font-semibold text-sm transition-colors duration-200">
                Abiertas ({{ openOrders.length }})
              </button>
              <button 
                @click="ordersTab = 'history'" 
                :class="ordersTab === 'history' ? 'text-yellow-500 border-b-2 border-yellow-500' : (isDark ? 'text-gray-400' : 'text-gray-600')"
                class="pb-1 font-semibold text-sm transition-colors duration-200">
                Historial
              </button>
            </div>
          </div>

          <!-- Órdenes Abiertas -->
          <div v-if="ordersTab === 'open'">
            <div v-if="openOrders.length === 0" class="px-4 py-8 text-center">
              <svg class="w-12 h-12 mx-auto mb-2" :class="isDark ? 'text-gray-700' : 'text-gray-300'" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" clip-rule="evenodd"/>
              </svg>
              <p :class="isDark ? 'text-gray-400' : 'text-gray-600'" class="text-sm">No tienes órdenes abiertas</p>
            </div>
            <div v-else class="divide-y" :class="isDark ? 'divide-gray-700' : 'divide-gray-200'">
              <div v-for="order in openOrders" :key="order.id" class="px-4 py-3">
                <div class="flex items-center justify-between mb-2">
                  <div class="flex items-center space-x-2">
                    <span :class="isDark ? 'text-white' : 'text-gray-900'" class="font-semibold">{{ order.pair }}</span>
                    <span :class="order.type === 'buy' ? 'bg-green-500' : 'bg-red-500'" class="text-white text-xs px-2 py-0.5 rounded">
                      {{ order.type === 'buy' ? 'Compra' : 'Venta' }}
                    </span>
                    <span :class="isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'" class="text-xs px-2 py-0.5 rounded">
                      {{ order.orderType }}
                    </span>
                  </div>
                  <button @click="cancelOrder(order.id)" :class="isDark ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-red-700'" class="text-xs font-semibold">
                    Cancelar
                  </button>
                </div>
                <div class="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <div :class="isDark ? 'text-gray-400' : 'text-gray-600'">Precio</div>
                    <div :class="isDark ? 'text-white' : 'text-gray-900'" class="font-semibold">{{ order.price }}</div>
                  </div>
                  <div>
                    <div :class="isDark ? 'text-gray-400' : 'text-gray-600'">Cantidad</div>
                    <div :class="isDark ? 'text-white' : 'text-gray-900'" class="font-semibold">{{ order.amount }}</div>
                  </div>
                  <div>
                    <div :class="isDark ? 'text-gray-400' : 'text-gray-600'">Total</div>
                    <div :class="isDark ? 'text-white' : 'text-gray-900'" class="font-semibold">{{ order.total }}</div>
                  </div>
                </div>
                <div class="mt-2 flex items-center justify-between text-xs">
                  <span :class="isDark ? 'text-gray-500' : 'text-gray-500'">{{ order.time }}</span>
                  <div class="flex items-center space-x-1">
                    <div class="w-16 h-1 bg-gray-700 rounded-full overflow-hidden">
                      <div class="h-full bg-yellow-500" :style="{ width: order.filled + '%' }"></div>
                    </div>
                    <span :class="isDark ? 'text-gray-400' : 'text-gray-600'">{{ order.filled }}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Historial -->
          <div v-if="ordersTab === 'history'">
            <div v-if="orderHistory.length === 0" class="px-4 py-8 text-center">
              <svg class="w-12 h-12 mx-auto mb-2" :class="isDark ? 'text-gray-700' : 'text-gray-300'" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"/>
              </svg>
              <p :class="isDark ? 'text-gray-400' : 'text-gray-600'" class="text-sm">Sin historial de órdenes</p>
            </div>
            <div v-else class="divide-y" :class="isDark ? 'divide-gray-700' : 'divide-gray-200'">
              <div v-for="order in orderHistory" :key="order.id" class="px-4 py-3">
                <div class="flex items-center justify-between mb-2">
                  <div class="flex items-center space-x-2">
                    <span :class="isDark ? 'text-white' : 'text-gray-900'" class="font-semibold">{{ order.pair }}</span>
                    <span :class="order.type === 'buy' ? 'bg-green-500' : 'bg-red-500'" class="text-white text-xs px-2 py-0.5 rounded">
                      {{ order.type === 'buy' ? 'Compra' : 'Venta' }}
                    </span>
                  </div>
                  <span :class="order.status === 'completed' ? 'text-green-500' : 'text-gray-400'" class="text-xs font-semibold">
                    {{ order.status === 'completed' ? 'Completada' : 'Cancelada' }}
                  </span>
                </div>
                <div class="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <div :class="isDark ? 'text-gray-400' : 'text-gray-600'">Precio</div>
                    <div :class="isDark ? 'text-white' : 'text-gray-900'" class="font-semibold">{{ order.price }}</div>
                  </div>
                  <div>
                    <div :class="isDark ? 'text-gray-400' : 'text-gray-600'">Cantidad</div>
                    <div :class="isDark ? 'text-white' : 'text-gray-900'" class="font-semibold">{{ order.amount }}</div>
                  </div>
                  <div>
                    <div :class="isDark ? 'text-gray-400' : 'text-gray-600'">Total</div>
                    <div :class="isDark ? 'text-white' : 'text-gray-900'" class="font-semibold">{{ order.total }}</div>
                  </div>
                </div>
                <div class="mt-2 text-xs" :class="isDark ? 'text-gray-500' : 'text-gray-500'">{{ order.time }}</div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>



<style>
/* Estilos globales del <head> original */
body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}
.bg-gray-750 {
  background-color: #1a202c;
}
.hover\:bg-gray-750:hover {
  background-color: #1a202c;
}
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
.fade-in {
  animation: fadeIn 0.3s ease-in;
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>