export const useMarketsApi = () => {
  const { $axios } = useNuxtApp()

  const getMarketsData = async () => {
    try {
      const response = await $axios.get('/trading/public/markets/data')
      return response.data.data // Accedemos a la propiedad 'data' de la respuesta
    } catch (error) {
      console.error('Error fetching markets data:', error)
      return [] // Devolvemos un array vacío en caso de error
    }
  }

  return {
    getMarketsData,
  }
}