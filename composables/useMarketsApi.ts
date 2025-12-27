export const useMarketsApi = () => {
  const { $axios } = useNuxtApp()

  const getMarketsData = async () => {
    try {
      const response = await $axios.get('/markets')
      return response.data.data // Accedemos a la propiedad 'data' de la respuesta
    } catch (error) {
      console.error('Error fetching markets data:', error)
      return [] // Devolvemos un array vacío en caso de error
    }
  }

  const fetchMarkets = async () => {
    return await $axios.get('api/markets');
  };

  const fetchMarket = async (market: string) => {
    return await $axios.get(`api/market/${market}`);
  };

  return {
    fetchMarkets,
    fetchMarket,
     getMarketsData,
  };
}
