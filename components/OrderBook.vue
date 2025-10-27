<template>
  <div class="order-book">
    <h3>Libro de Órdenes</h3>
    
    <div v-if="loading" class="loading-indicator">
      <div class="spinner-border spinner-border-sm" role="status">
        <span class="sr-only">Cargando...</span>
      </div>
      <span class="ml-2">Cargando libro de órdenes...</span>
    </div>
    
    <div v-else>
      <!-- Órdenes de venta -->
      <div class="sell-orders">
        <div class="order-header">
          <span>Precio ({{ marketInfo.quote_currency }})</span>
          <span>Cantidad ({{ marketInfo.base_currency }})</span>
          <span>Total ({{ marketInfo.quote_currency }})</span>
        </div>
        <div class="order-list">
          <div 
            v-for="(order, index) in sellOrders" 
            :key="'sell-' + order.id" 
            class="order-item sell"
            :style="{ opacity: 0.3 + (0.7 * (index + 1) / sellOrders.length) }"
          >
            <span class="order-price">{{ formatPrice(order.price) }}</span>
            <span class="order-amount">{{ formatAmount(order.amount) }}</span>
            <span class="order-total">{{ formatPrice(order.price * order.amount) }}</span>
            <div class="order-depth" :style="{ width: calculateDepth(order, sellOrders) + '%' }"></div>
            <div 
              class="order-fill-progress" 
              :style="{ 
                width: calculateFillProgress(order) + '%',
                backgroundColor: 'rgba(255, 0, 0, 0.3)'
              }"
            ></div>
          </div>
          <div v-if="sellOrders.length === 0" class="no-orders">
            No hay órdenes de venta
          </div>
        </div>
      </div>
      
      <!-- Spread -->
      <div class="spread">
        <span>Spread: {{ formatPrice(calculateSpread()) }} ({{ formatPercentage(calculateSpreadPercentage()) }})</span>
      </div>
      
      <!-- Órdenes de compra -->
      <div class="buy-orders">
        <div class="order-list">
          <div 
            v-for="(order, index) in buyOrders" 
            :key="'buy-' + order.id" 
            class="order-item buy"
            :style="{ opacity: 0.3 + (0.7 * (index + 1) / buyOrders.length) }"
          >
            <span class="order-price">{{ formatPrice(order.price) }}</span>
            <span class="order-amount">{{ formatAmount(order.amount) }}</span>
            <span class="order-total">{{ formatPrice(order.price * order.amount) }}</span>
            <div class="order-depth" :style="{ width: calculateDepth(order, buyOrders) + '%' }"></div>
            <div 
              class="order-fill-progress" 
              :style="{ 
                width: calculateFillProgress(order) + '%',
                backgroundColor: 'rgba(0, 255, 0, 0.3)'
              }"
            ></div>
          </div>
          <div v-if="buyOrders.length === 0" class="no-orders">
            No hay órdenes de compra
          </div>
        </div>
        <div class="order-header">
          <span>Precio ({{ marketInfo.quote_currency }})</span>
          <span>Cantidad ({{ marketInfo.base_currency }})</span>
          <span>Total ({{ marketInfo.quote_currency }})</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue';
import { useNuxtApp } from '#app';
import Pusher from 'pusher-js';

// Props
const props = defineProps({
  market: {
    type: String,
    required: true
  }
});

// Emits
const emit = defineEmits(['order-clicked']);

// Obtener instancias de axios y pusher
const { $axios } = useNuxtApp();

// Estado del componente
const loading = ref(true);
const buyOrders = ref([]);
const sellOrders = ref([]);
const marketInfo = ref({
  base_currency: 'BTC',
  quote_currency: 'USDT'
});

// Canal de Pusher
let channel = null;
let marketChannel = null;

// Computed para el nombre del mercado
const marketName = computed(() => props.market);

// Función para formatear precios
function formatPrice(price) {
  try {
    const num = Number(price);
    if (isNaN(num)) return '0.00';
    
    // Determinar el número de decimales basado en el precio
    if (num >= 1000) return num.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    if (num >= 1) return num.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 4 });
    if (num >= 0.01) return num.toLocaleString('es-ES', { minimumFractionDigits: 4, maximumFractionDigits: 6 });
    return num.toLocaleString('es-ES', { minimumFractionDigits: 6, maximumFractionDigits: 8 });
  } catch (error) {
    console.error('Error en formatPrice:', error);
    return '0.00';
  }
}

// Función para formatear cantidades
function formatAmount(amount) {
  try {
    const num = Number(amount);
    if (isNaN(num)) return '0.00';
    
    if (num >= 1) return num.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 4 });
    if (num >= 0.01) return num.toLocaleString('es-ES', { minimumFractionDigits: 4, maximumFractionDigits: 6 });
    return num.toLocaleString('es-ES', { minimumFractionDigits: 6, maximumFractionDigits: 8 });
  } catch (error) {
    console.error('Error en formatAmount:', error);
    return '0.00';
  }
}

// Función para formatear porcentajes
function formatPercentage(value) {
  try {
    const num = Number(value);
    if (isNaN(num)) return '0.00%';
    return `${num >= 0 ? '+' : ''}${num.toFixed(2)}%`;
  } catch (error) {
    console.error('Error en formatPercentage:', error);
    return '0.00%';
  }
}

// Función para calcular la profundidad de una orden
function calculateDepth(order, orders) {
  if (orders.length === 0) return 0;
  
  const maxVolume = Math.max(...orders.map(o => o.price * o.amount));
  const orderVolume = order.price * order.amount;
  
  return (orderVolume / maxVolume) * 100;
}

// Función para calcular el progreso de llenado
function calculateFillProgress(order) {
  try {
    const amount = Number(order.amount) || 0;
    const filledAmount = Number(order.filled_amount) || 0;
    
    if (amount === 0) return 0;
    return (filledAmount / amount) * 100;
  } catch (error) {
    console.error('Error en calculateFillProgress:', error);
    return 0;
  }
}

// Función para calcular el spread
function calculateSpread() {
  if (sellOrders.value.length === 0 || buyOrders.value.length === 0) return 0;
  
  const lowestSell = sellOrders.value[0]?.price || 0;
  const highestBuy = buyOrders.value[0]?.price || 0;
  
  return lowestSell - highestBuy;
}

// Función para calcular el porcentaje del spread
function calculateSpreadPercentage() {
  const spread = calculateSpread();
  if (spread === 0) return 0;
  
  const lowestSell = sellOrders.value[0]?.price || 1;
  return (spread / lowestSell) * 100;
}

// Función para obtener información del mercado
async function fetchMarketInfo() {
  try {
    const response = await $axios.get(`/markets/${marketName.value}`);
    
    marketInfo.value = {
      id: response.data.id || 1,
      name: response.data.name || marketName.value,
      base_currency: response.data.base_currency || 'BTC',
      quote_currency: response.data.quote_currency || 'USDT',
      last_price: Number(response.data.last_price) || 0,
      change_24h: Number(response.data.change_24h) || 0,
      high_24h: Number(response.data.high_24h) || 0,
      low_24h: Number(response.data.low_24h) || 0,
      volume_24h: Number(response.data.volume_24h) || 0
    };
  } catch (error) {
    console.error('Error al obtener información del mercado:', error);
    
    // Datos por defecto
    const [base, quote] = marketName.value.split('_');
    marketInfo.value = {
      id: 1,
      name: marketName.value,
      base_currency: base || 'BTC',
      quote_currency: quote || 'USDT',
      last_price: 1,
      change_24h: 0,
      high_24h: 1.1,
      low_24h: 0.9,
      volume_24h: 0
    };
  }
}

// Función para obtener el libro de órdenes
async function fetchOrderBook() {
  console.log('🔍 Obteniendo libro de órdenes para:', marketName.value);
  
  try {
    const response = await $axios.get(`/markets/${marketName.value}/orderbook`);
    console.log('✅ Respuesta del servidor:', response.data);
    
    // Procesar órdenes de compra
    buyOrders.value = (response.data.buyOrders || []).map(order => ({
      id: order.id,
      price: Number(order.price) || 0,
      amount: Number(order.amount) || 0,
      filled_amount: Number(order.filled_amount) || 0,
      side: 'buy',
      total: Number(order.price * order.amount) || 0,
      status: order.status || 'open'
    })).filter(order => order.status === 'open' || order.status === 'partially_filled')
      .sort((a, b) => b.price - a.price); // Ordenar por precio descendente
    
    // Procesar órdenes de venta
    sellOrders.value = (response.data.sellOrders || []).map(order => ({
      id: order.id,
      price: Number(order.price) || 0,
      amount: Number(order.amount) || 0,
      filled_amount: Number(order.filled_amount) || 0,
      side: 'sell',
      total: Number(order.price * order.amount) || 0,
      status: order.status || 'open'
    })).filter(order => order.status === 'open' || order.status === 'partially_filled')
      .sort((a, b) => a.price - b.price); // Ordenar por precio ascendente
    
    console.log('✅ Libro de órdenes actualizado:', {
      buyOrders: buyOrders.value.length,
      sellOrders: sellOrders.value.length
    });
    
  } catch (error) {
    console.error('❌ Error al obtener libro de órdenes:', error);
    
    // Datos de ejemplo
    buyOrders.value = [
      { id: 1, price: 0.98, amount: 1, filled_amount: 0, side: 'buy', total: 0.98, status: 'open' },
      { id: 2, price: 0.97, amount: 2, filled_amount: 0, side: 'buy', total: 1.94, status: 'open' }
    ];
    
    sellOrders.value = [
      { id: 3, price: 1.01, amount: 1, filled_amount: 0, side: 'sell', total: 1.01, status: 'open' },
      { id: 4, price: 1.02, amount: 1, filled_amount: 0, side: 'sell', total: 1.02, status: 'open' }
    ];
  }
}

// Función para manejar una nueva orden
function handleNewOrder(order) {
  console.log('🆕 Procesando nueva orden en OrderBook:', order);
  
  // Validar la orden
  if (!order || !order.id || !order.side || !order.market) {
    console.warn('⚠️ Nueva orden inválida:', order);
    return;
  }
  
  // Verificar que pertenezca al mercado actual
  if (order.market !== marketName.value) {
    console.log('ℹ️ Nueva orden de otro mercado, ignorando:', order.market);
    return;
  }
  
  // Añadir la orden al libro
  updateOrderInBook(order);
}

// Función para actualizar una orden en el libro
function updateOrderInBook(order) {
  console.log('🔄 Actualizando orden en el libro:', order);
  
  // Validar que la orden tenga los datos necesarios
  if (!order || !order.id || !order.side || !order.market) {
    console.warn('⚠️ Orden inválida recibida:', order);
    return;
  }
  
  // Verificar que la orden pertenezca al mercado actual
  if (order.market !== marketName.value) {
    console.log('ℹ️ Orden de otro mercado, ignorando:', order.market);
    return;
  }
  
  const isBuy = order.side === 'buy';
  const orders = isBuy ? buyOrders : sellOrders;
  const index = orders.value.findIndex(o => o.id === order.id);

  // Crear una copia de la orden con los valores correctos
  const updatedOrder = {
    id: order.id,
    price: Number(order.price) || 0,
    amount: Number(order.amount) || 0,
    filled_amount: Number(order.filled_amount) || 0,
    side: order.side,
    total: Number(order.price * order.amount) || 0,
    status: order.status || 'open'
  };

  if (index === -1) {
    // Si la orden no existe y está abierta o parcialmente llena, la añadimos
    if (order.status === 'open' || order.status === 'partially_filled' || order.status === 'pending') {
      console.log('➕ Añadiendo nueva orden al libro:', updatedOrder);
      orders.value.push(updatedOrder);
      
      // Reordenar las órdenes
      orders.value.sort((a, b) => {
        return isBuy ? b.price - a.price : a.price - b.price;
      });
      
      console.log(`📊 Orden añadida al libro de ${isBuy ? 'compra' : 'venta'}. Total: ${orders.value.length}`);
    } else {
      console.log('ℹ️ Orden no añadida al libro (estado no válido):', order.status);
    }
  } else {
    // Si la orden existe y está completamente llena o cancelada, la eliminamos
    if (order.status === 'filled' || order.status === 'cancelled' || order.status === 'closed') {
      console.log('➖ Eliminando orden del libro:', updatedOrder);
      orders.value.splice(index, 1);
      console.log(`📊 Orden eliminada del libro de ${isBuy ? 'compra' : 'venta'}. Total: ${orders.value.length}`);
    } else {
      // Actualizar la orden existente
      console.log('📝 Actualizando orden existente:', updatedOrder);
      orders.value[index] = {
        ...orders.value[index],
        ...updatedOrder
      };

      // Si la orden está parcialmente llena, actualizar la cantidad restante
      if (order.status === 'partially_filled') {
        const remainingAmount = Number(order.amount) - Number(order.filled_amount);
        orders.value[index].amount = remainingAmount;
        orders.value[index].total = remainingAmount * Number(order.price);
        console.log(`📊 Orden parcialmente llena. Cantidad restante: ${remainingAmount}`);
      }
    }
  }

  // Forzar la actualización de la vista
  orders.value = [...orders.value];
  
  console.log('📊 Estado actual del libro de órdenes:', {
    buyOrders: buyOrders.value.length,
    sellOrders: sellOrders.value.length,
    totalOrders: buyOrders.value.length + sellOrders.value.length
  });
}

// Configurar eventos en tiempo real
function setupRealTimeUpdates() {
  // Definir Pusher localmente para pruebas
  const pusher = new Pusher('8b7a912a1b66ce5ad679', {
    cluster: 'mt1',
    forceTLS: true
  });
  channel = pusher.subscribe('exchanger');

  // Suscripción robusta al evento order-updated
  channel.unbind('order-updated'); // Limpia cualquier suscripción previa para evitar duplicados
  channel.bind('order-updated', (data) => {
    console.log('📥 [DEPURACIÓN][LOCAL] Evento order-updated recibido en OrderBook:', JSON.stringify(data, null, 2));
    if (!data.order) {
      console.error('❌ [DEPURACIÓN] El evento no contiene la propiedad order');
      return;
    }
    if (data.order.market !== marketName.value) {
      console.log('ℹ️ [DEPURACIÓN] Orden de otro mercado:', data.order.market, 'actual:', marketName.value);
      return;
    }
    // Lógica de actualización
    updateOrderInBook(data.order);
  });
  
  // Evento cuando se crea una nueva orden
  channel.bind('order-open', (data) => {
    console.log('📥 Evento order-open recibido en OrderBook:', data);
    if (data.order && data.order.market === marketName.value) {
      handleNewOrder(data.order);
    }
  });
  
  // Evento cuando se crea una orden (evento alternativo)
  channel.bind('order-created', (data) => {
    console.log('📥 Evento order-created recibido en OrderBook:', data);
    if (data.order && data.order.market === marketName.value) {
      handleNewOrder(data.order);
    }
  });
  
  // Evento cuando se cierra/cancela una orden
  channel.bind('order-closed', (data) => {
    console.log('📥 Evento order-closed recibido en OrderBook:', data);
    if (data.order && data.order.market === marketName.value) {
      updateOrderInBook(data.order);
    }
  });
  
  // Evento cuando se cancela una orden
  channel.bind('order-cancelled', (data) => {
    console.log('📥 Evento order-cancelled recibido en OrderBook:', data);
    if (data.order && data.order.market === marketName.value) {
      updateOrderInBook(data.order);
    }
  });

  // Evento cuando se completa una orden
  channel.bind('order-filled', (data) => {
    console.log('📥 Evento order-filled recibido en OrderBook:', data);
    if (data.order && data.order.market === marketName.value) {
      updateOrderInBook(data.order);
    }
  });

  // Suscribirse al canal específico del mercado
  marketChannel = pusher.subscribe(`market.${marketName.value}`);
  
  // Escuchar eventos específicos del mercado
  marketChannel.bind('order.created', (data) => {
    console.log('📥 Evento order.created del mercado recibido en OrderBook:', data);
    if (data.order && data.order.market === marketName.value) {
      handleNewOrder(data.order);
    }
  });

  // Evento de transacción completada
  marketChannel.bind('transaction.completed', (data) => {
    console.log('📥 Evento transaction.completed recibido en OrderBook:', data);
    if (data.market === marketName.value) {
      // Si hay órdenes involucradas, actualizar el libro
      if (data.buy_order) {
        updateOrderInBook(data.buy_order);
      }
      if (data.sell_order) {
        updateOrderInBook(data.sell_order);
      }
    }
  });
  
  console.log('✅ Configuración de actualizaciones en tiempo real completada para OrderBook');
}

// Limpiar eventos en tiempo real
function cleanupRealTimeUpdates() {
  console.log('🧹 Limpiando eventos en tiempo real de OrderBook');
  
  if (channel) {
    channel.unsubscribe();
    channel = null;
  }
  
  if (marketChannel) {
    marketChannel.unsubscribe();
    marketChannel = null;
  }
}

// Inicializar el componente
onMounted(async () => {
  try {
    console.log('🚀 Inicializando componente OrderBook para mercado:', marketName.value);
    
    // Cargar datos iniciales
    await fetchMarketInfo();
    await fetchOrderBook();
    
    // Configurar eventos en tiempo real (asegura que siempre se llama)
    setupRealTimeUpdates();
    
    loading.value = false;
  } catch (error) {
    console.error('Error al inicializar OrderBook:', error);
    loading.value = false;
  }
});

// Limpiar al desmontar
onBeforeUnmount(() => {
  cleanupRealTimeUpdates();
});

// Observar cambios en el mercado
watch(() => props.market, async (newMarket, oldMarket) => {
  if (newMarket !== oldMarket) {
    console.log('🔄 Cambio de mercado detectado:', oldMarket, '->', newMarket);
    
    // Limpiar eventos anteriores
    cleanupRealTimeUpdates();
    
    // Limpiar datos
    buyOrders.value = [];
    sellOrders.value = [];
    loading.value = true;
    
    // Cargar nuevos datos
    await fetchMarketInfo();
    await fetchOrderBook();
    
    // Configurar nuevos eventos
    setupRealTimeUpdates();
    
    loading.value = false;
  }
});
</script>

<style scoped>
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

.loading-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  color: #cccccc;
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
  position: relative;
}

.order-item {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  padding: 0.5rem 0;
  position: relative;
  z-index: 1;
  background-color: rgba(0, 0, 0, 0.2);
  margin: 1px 0;
  border-radius: 2px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.order-item:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.order-depth {
  position: absolute;
  top: 0;
  bottom: 0;
  right: 0;
  z-index: -2;
  transition: width 0.3s ease;
}

.order-fill-progress {
  position: absolute;
  top: 0;
  bottom: 0;
  right: 0;
  z-index: -1;
  transition: width 0.3s ease;
}

.sell .order-depth {
  background-color: rgba(255, 0, 0, 0.1);
}

.buy .order-depth {
  background-color: rgba(0, 255, 0, 0.1);
}

.order-price {
  font-weight: bold;
  position: relative;
  z-index: 2;
}

.sell .order-price {
  color: #ff4444;
}

.buy .order-price {
  color: #44ff44;
}

.order-amount,
.order-total {
  position: relative;
  z-index: 2;
  color: #cccccc;
}

.spread {
  text-align: center;
  padding: 0.5rem;
  background-color: rgba(0, 0, 0, 0.3);
  border-top: 1px solid #333;
  border-bottom: 1px solid #333;
  font-size: 0.9rem;
  color: #cccccc;
}

.no-orders {
  text-align: center;
  padding: 1rem;
  color: #666666;
  font-style: italic;
}

/* Scrollbar personalizado */
.order-list::-webkit-scrollbar {
  width: 6px;
}

.order-list::-webkit-scrollbar-track {
  background: #2a2a2a;
}

.order-list::-webkit-scrollbar-thumb {
  background: #555;
  border-radius: 3px;
}

.order-list::-webkit-scrollbar-thumb:hover {
  background: #777;
}
</style> 