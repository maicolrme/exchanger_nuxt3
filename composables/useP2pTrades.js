import { ref, computed } from 'vue'
import { useAuthStore } from '~/stores/auth'

export function useP2pTrades() {
  const { $axios } = useNuxtApp()
  const authStore = useAuthStore()

  const trades = ref([])
  const loading = ref(true)
  const error = ref(null)

  const statusMap = {
    pending: 'Pendiente de pago',
    paid: 'En proceso',
    completed: 'Completada',
    cancelled: 'Cancelada',
    in_dispute: 'En disputa',
  }

  const toUiModel = (item) => ({
    id: item.id,
    trade_number: item.trade_number,
    status: statusMap[item.status] || item.status,
    amount: item.amount,
    price: item.price,
    total: item.total,
    coin: item.coin,
    fiat_currency: item.fiat_currency,
    user_role: item.user_role,
    counterparty: item.counterparty,
    offer_type: item.offer_type,
    // El backend envia el rol del usuario en el trade, lo usamos para determinar si es compra o venta
    type: item.user_role, 
    // Mapeamos los campos para que coincidan con la vista
    crypto: item.coin,
    fiat: item.fiat_currency,
    date: 'N/A', // El API no devuelve fecha para los trades
  })

  const normalizeListResponse = (data) => {
    if (!Array.isArray(data)) return []
    return data.map(toUiModel)
  }

  const fetchTrades = async () => {
    loading.value = true
    error.value = null
    try {
      // Usamos el endpoint que nos indicaste
      const response = await $axios.get('/p2p/trades/my-trades/all')
      trades.value = normalizeListResponse(response.data.data)
    } catch (e) {
      error.value = e
      console.error('Error fetching P2P trades:', e)
      // Fallback a datos vacíos en caso de error
      trades.value = []
    } finally {
      loading.value = false
    }
  }

  return {
    trades,
    loading,
    error,
    fetchTrades,
  }
}