export const useTradeApi = () => {
  const { $axios } = useNuxtApp()

  const getTrade = async (id: string | number) => {
    const response = await $axios.get(`/p2p/trades/${id}`)
    return response.data
  }

  const markAsPaid = async (id: string | number) => {
    const response = await $axios.post(`/p2p/trades/${id}/mark-paid`)
    return response.data
  }

  const releaseCrypto = async (id: string | number) => {
    const response = await $axios.post(`/p2p/trades/${id}/release`)
    return response.data
  }

  const cancelTrade = async (id: string | number) => {
    const response = await $axios.post(`/p2p/trades/${id}/cancel`)
    return response.data
  }

  const openDispute = async (id: string | number) => {
    const response = await $axios.post(`/p2p/trades/${id}/dispute`)
    return response.data
  }

  const uploadPaymentProof = async (id: string | number, file: File) => {
    const formData = new FormData()
    formData.append('proof', file)
    
    const response = await $axios.post(`/p2p/trades/${id}/payment-proof`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data
  }

  const sendMessage = async (id: string | number, message: string, attachments?: File[]) => {
    if (attachments && attachments.length > 0) {
      const formData = new FormData()
      formData.append('message', message)
      attachments.forEach(file => {
        formData.append('attachments[]', file)
      })
      
      const response = await $axios.post(`/p2p/trades/${id}/messages`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      return response.data
    } else {
      const response = await $axios.post(`/p2p/trades/${id}/messages`, { message })
      return response.data
    }
  }

  return {
    getTrade,
    markAsPaid,
    releaseCrypto,
    cancelTrade,
    openDispute,
    uploadPaymentProof,
    sendMessage
  }
}