// composables/usePaymentMethods.js
import { ref } from 'vue'
import { useNuxtApp } from '#app'

// Carga y normaliza métodos de pago desde el backend
export const usePaymentMethods = (options = {}) => {
  const { $axios } = useNuxtApp()
  const paymentMethods = ref([])
  const loading = ref(false)
  const error = ref(null)

  const endpoint = options.endpoint || '/payment-methods'

  const toName = (item) => {
    if (typeof item === 'string') return item
    if (!item || typeof item !== 'object') return null
    return (
      item.name || item.label || item.method || item.payment_method || item.method_name || null
    )
  }

  const normalize = (resp) => {
    const payload = resp?.data ?? []
    const raw = Array.isArray(payload)
      ? payload
      : (Array.isArray(payload.data) ? payload.data
        : (Array.isArray(payload.methods) ? payload.methods : []))
    const names = raw.map(toName).filter(Boolean)
    return [...new Set(names)]
  }

  const fetchPaymentMethods = async (params = {}) => {
    loading.value = true
    error.value = null
    try {
      const resp = await $axios.get(endpoint, { params })
      paymentMethods.value = normalize(resp)
      return paymentMethods.value
    } catch (err) {
      console.error('[usePaymentMethods] Error de carga:', err)
      error.value = err?.response?.data?.message || 'No se pudieron cargar los métodos de pago.'
      return []
    } finally {
      loading.value = false
    }
  }

  return { paymentMethods, loading, error, fetchPaymentMethods }
}