// composables/useMyOffers.js
import { ref } from 'vue'
import { useNuxtApp } from '#app'

/**
 * Composable para gestionar las ofertas del usuario en P2P.
 * Usa Axios inyectado (nuxtApp.$axios) con baseURL definida en plugins/axios.js
 * Endpoints por defecto (ajustables via options):
 *  - list:   '/p2p/offers/myoffers'  (GET)
 *  - update: '/p2p/offers/:id'       (PATCH)
 *  - delete: '/p2p/offers/:id'       (DELETE)
 */
export const useMyOffers = (options = {}) => {
  const { $axios } = useNuxtApp()
  const offers = ref([])
  const loading = ref(false)
  const error = ref(null)
  const pagination = ref({ current_page: 1, last_page: 1, total: 0 })
 
  const endpoints = {
    list: options.endpoints?.list || '/p2p/offers/myoffers',
    update: options.endpoints?.update || ((id) => `/p2p/offers/${id}`),
    delete: options.endpoints?.delete || ((id) => `/p2p/offers/${id}`),
    create: options.endpoints?.create || '/p2p/offers'
  }

  const toUiModel = (item) => ({
    id: item.id,
    type: item.type,
    price: item.price,
    minLimit: item.min_amount,
    maxLimit: item.max_amount,
    available: item.available_amount,
    timeLimit: item.time_limit,
    status: item.status,
    isActive: item.status === 'active',
    fiat: item.currency,
    payment: item.payment_method
  })

  const normalizeListResponse = (resp) => {
    // Soporta respuesta Laravel paginator { data: [], links, meta }
    const root = resp?.data || {}
    const items = Array.isArray(root.data) ? root.data : []
    const meta = root.meta || { current_page: 1, last_page: 1, total: items.length || 0 }
    return { items, meta }
  }

  const compact = (obj) => Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined))

  const toApiPayload = (payload = {}) => compact({
    type: payload.type,
    price: payload.price,
    // aceptar nombres de UI de myofferts y publish
    min_amount: payload.minLimit ?? payload.minAmount ?? payload.min_amount,
    max_amount: payload.maxLimit ?? payload.maxAmount ?? payload.max_amount,
    available_amount: payload.available ?? payload.available_amount ?? payload.maxAmount, // fallback
    time_limit: payload.timeLimit ?? payload.paymentWindow ?? payload.time_limit,
    status: typeof payload.isActive === 'boolean' ? (payload.isActive ? 'active' : 'inactive') : payload.status,
    currency: payload.fiat ?? payload.currency,
    // enviar id de moneda fiat en campo esperado por backend
    fiat_currency_id: payload.fiatId ?? payload.fiat_currency_id,
    // opcional: id de cripto si se incluye en el payload
    currency_id: payload.currency_id,
    payment_method: payload.payment ?? payload.payment_method ?? (Array.isArray(payload.paymentMethods) ? payload.paymentMethods[0] : undefined),
    terms: payload.terms,
    crypto: payload.crypto,
    // soporte de precio variable: enviar premium si existe
    price_premium: payload.pricePremium
  })

  const fetchMyOffers = async (params = {}) => {
    loading.value = true
    error.value = null
    try {
      const resp = await $axios.get(endpoints.list, { params })
      const { items, meta } = normalizeListResponse(resp)
      offers.value = items.map(toUiModel)
      pagination.value = {
        current_page: meta?.current_page || 1,
        last_page: meta?.last_page || 1,
        total: meta?.total || items.length || 0
      }
      return items
    } catch (err) {
      console.error('Error al cargar mis ofertas:', err)
      error.value = err.response?.data?.message || 'No se pudieron cargar las ofertas.'
      return []
    } finally {
      loading.value = false
    }
  }

  const updateOffer = async (id, payload) => {
    // PATCH parcial para actualizar campos del anuncio
    try {
      const resp = await $axios.patch(
        typeof endpoints.update === 'function' ? endpoints.update(id) : endpoints.update,
        toApiPayload(payload)
      )
      const updated = resp?.data?.data || resp?.data
      const idx = offers.value.findIndex(o => o.id === id)
      if (idx !== -1 && updated) {
        const updatedUi = toUiModel(updated)
        offers.value[idx] = { ...offers.value[idx], ...updatedUi }
      }
      return updated
    } catch (err) {
      console.error('Error al actualizar oferta:', err)
      throw err
    }
  }

  const toggleOfferStatus = async (id, isActive) => {
    return updateOffer(id, { isActive })
  }

  const deleteOffer = async (id) => {
    try {
      await $axios.delete(typeof endpoints.delete === 'function' ? endpoints.delete(id) : endpoints.delete)
      offers.value = offers.value.filter(o => o.id !== id)
      return true
    } catch (err) {
      console.error('Error al eliminar oferta:', err)
      throw err
    }
  }

  const createOffer = async (payload) => {
    try {
      const resp = await $axios.post(endpoints.create, toApiPayload(payload))
      const created = resp?.data?.data || resp?.data
      // si la respuesta devuelve el objeto, mapear y agregar a offers
      if (created && created.id != null) {
        const uiItem = toUiModel(created)
        offers.value = [uiItem, ...offers.value]
      }
      return created
    } catch (err) {
      console.error('Error al crear oferta:', err)
      throw err
    }
  }

  return {
    offers,
    loading,
    error,
    pagination,
    fetchMyOffers,
    updateOffer,
    deleteOffer,
    toggleOfferStatus,
    createOffer
  }
}