// composables/useOrders.ts
import { ref, computed } from 'vue'
import { useNuxtApp } from '#app'

interface Order {
  id: number
  pair: string
  type: 'buy' | 'sell'
  orderType?: string
  price: number
  amount: number
  total: number
  status: string
  time: string
  filled?: number
  filled_amount?: number | string
  created_at?: string
  market?: string
  side?: 'buy' | 'sell'
}

/**
 * Composable para gestionar las órdenes de trading.
 * Maneja órdenes abiertas y el historial de órdenes.
 */
export const useOrders = () => {
  const { $axios } = useNuxtApp()
  const openOrders = ref<Order[]>([])
  const orderHistory = ref<Order[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Mapear los datos de la API al formato del componente
  const mapApiOrderToUi = (apiOrder: any): Order => {
    const market = apiOrder.market || apiOrder.pair || ''
    const formattedMarket = market.replace(/_/g, '/')
    const price = parseFloat(apiOrder.price) || 0
    const amount = parseFloat(apiOrder.amount) || 0
    const filledAmount = parseFloat(apiOrder.filled_amount || apiOrder.filled_quantity || 0)
    const filledPercent = amount > 0 ? Math.round((filledAmount / amount) * 100) : 0
    
    return {
      id: apiOrder.id,
        oid: apiOrder.oid,
      pair: formattedMarket,
      type: apiOrder.side || apiOrder.type || 'buy',
      orderType: apiOrder.type === 'limit' ? 'Límite' : apiOrder.type === 'market' ? 'Mercado' : 'Límite',
      price: price,
      amount: amount,
      total: price * amount,
      status: apiOrder.status || 'open',
      time: apiOrder.created_at || apiOrder.time || new Date().toISOString(),
      filled: filledPercent,
      filled_amount: filledAmount,
      market: market,
      side: apiOrder.side || apiOrder.type
    }
  }

  // Formatear fecha
  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString)
      return date.toLocaleString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
    } catch {
      return dateString
    }
  }

  // Obtener órdenes abiertas
  const fetchOpenOrders = async () => {
    loading.value = true;
    try {
      const response = await $axios.get('/trading/orders/open');
      const ordersData = response.data.data || response.data || [];
      openOrders.value = Array.isArray(ordersData) ? ordersData.map(mapApiOrderToUi) : [];
      openOrders.value.forEach(order => {
        if (order.time) {
          order.time = formatDate(order.time);
        }
      });
      console.log('Órdenes abiertas obtenidas:', openOrders.value);
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error al obtener órdenes abiertas';
      console.error('Error al obtener órdenes abiertas:', err);
      openOrders.value = [];
    } finally {
      loading.value = false;
    }
  }

  // Obtener historial de órdenes (completadas y canceladas)
  const fetchOrderHistory = async () => {
    loading.value = true;
    error.value = null;
    try {
      const response = await $axios.get('/trading/orders/history');
      const ordersData = response.data.data || response.data || [];
      let completedOrders = Array.isArray(ordersData) ? ordersData.map(mapApiOrderToUi) : [];
      completedOrders.forEach(order => {
        if (order.time) {
          order.time = formatDate(order.time);
        }
        if (order.status === 'filled') {
          order.status = 'completed';
        } else if (order.status === 'cancelled' || order.status === 'canceled') {
          order.status = 'cancelled';
        }
      });
      orderHistory.value = completedOrders;
      console.log('Historial de órdenes obtenido:', orderHistory.value);
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error al obtener historial de órdenes';
      console.error('Error al obtener historial de órdenes:', err);
      orderHistory.value = [];
    } finally {
      loading.value = false;
    }
  }

  const fetchAllOrders = async () => {
    await Promise.all([
      fetchOpenOrders(),
      fetchOrderHistory()
    ]);
  }

  // Cancelar una orden
  const cancelOrder = async (orderId: string): Promise<boolean> => {
    loading.value = true;
    try {
      await $axios.put(`/trading/orders/cancel/${orderId}`);
      // Remover la orden de la lista de abiertas y agregarla al historial
      const orderIndex = openOrders.value.findIndex(o => o.id === orderId);
      if (orderIndex > -1) {
        const cancelledOrder = { ...openOrders.value[orderIndex], status: 'cancelled' };
        openOrders.value.splice(orderIndex, 1);
        orderHistory.value.unshift(cancelledOrder);
      }
      console.log('Orden cancelada:', orderId);
      return true;
    } catch (err: any) {
      console.error('Error al cancelar orden:', err);
      return false;
    } finally {
      loading.value = false;
    }
  }

  // Computadas
  const openOrdersCount = computed(() => openOrders.value.length)
  const hasOpenOrders = computed(() => openOrders.value.length > 0)
  const hasOrderHistory = computed(() => orderHistory.value.length > 0)

  return {
    openOrders,
    orderHistory,
    loading,
    error,
    openOrdersCount,
    hasOpenOrders,
    hasOrderHistory,
    fetchOpenOrders,
    fetchOrderHistory,
    fetchAllOrders,
    cancelOrder,
    formatDate
  }
}








