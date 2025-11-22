<template>
  <div class="container mx-auto px-4 py-6">
    <h2 class="text-3xl font-bold text-center mb-8">Editar Anuncio P2P</h2>
    <div class="bg-gray-800 rounded-lg p-6 max-w-2xl mx-auto">
      <div v-if="adNotFound" class="bg-red-900/50 text-red-200 p-3 rounded-lg mb-4">
        No se encontró el anuncio solicitado o no tienes permiso para editarlo.
      </div>
      <form v-else @submit.prevent="saveChanges" class="space-y-6">

        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">Quiero:</label>
          <div class="flex rounded-lg bg-gray-700 p-1">
            <button type="button" @click="form.type = 'buy'"
              :class="{'bg-yellow-500 text-gray-900': form.type === 'buy', 'text-gray-300 hover:text-white': form.type !== 'buy'}"
              class="w-1/2 py-2 rounded-md text-sm font-medium transition-colors duration-200 focus:outline-none">
              Comprar
            </button>
            <button type="button" @click="form.type = 'sell'"
              :class="{'bg-yellow-500 text-gray-900': form.type === 'sell', 'text-gray-300 hover:text-white': form.type !== 'sell'}"
              class="w-1/2 py-2 rounded-md text-sm font-medium transition-colors duration-200 focus:outline-none">
              Vender
            </button>
          </div>
        </div>

        <div>
          <label for="crypto" class="block text-sm font-medium text-gray-300 mb-2">Criptomoneda:</label>
          <select id="crypto" v-model="form.crypto"
            class="block w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-yellow-500 text-sm">
            <option disabled value="">Seleccione una criptomoneda</option>
            <option v-for="c in cryptoCoins" :key="c.id" :value="c.symbol || c.name">
              {{ c.name || c.symbol }}
            </option>
          </select>
        </div>

        <div>
          <label for="fiat" class="block text-sm font-medium text-gray-300 mb-2">Moneda Fiat:</label>
          <select id="fiat" v-model="form.fiatId"
            class="block w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-yellow-500 text-sm">
            <option disabled value="">Seleccione una moneda fiat</option>
            <option v-for="f in fiatCoins" :key="f.id" :value="f.id">
              {{ f.name || f.code }}
            </option>
          </select>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label for="min-amount" class="block text-sm font-medium text-gray-300 mb-2">Cantidad Mínima ({{ form.crypto }}):</label>
            <input type="number" id="min-amount" v-model.number="form.minAmount" placeholder="Ej: 0.001" step="any"
              class="block w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-yellow-500 text-sm">
          </div>
          <div>
            <label for="max-amount" class="block text-sm font-medium text-gray-300 mb-2">Cantidad Máxima ({{ form.crypto }}):</label>
            <input type="number" id="max-amount" v-model.number="form.maxAmount" placeholder="Ej: 1.0" step="any"
              class="block w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-yellow-500 text-sm">
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">Tipo de Precio:</label>
          <div class="flex rounded-lg bg-gray-700 p-1">
            <button type="button" @click="form.priceType = 'fixed'"
              :class="{'bg-yellow-500 text-gray-900': form.priceType === 'fixed', 'text-gray-300 hover:text-white': form.priceType !== 'fixed'}"
              class="w-1/2 py-2 rounded-md text-sm font-medium transition-colors duration-200 focus:outline-none">
              Precio Fijo
            </button>
            <button type="button" @click="form.priceType = 'variable'"
              :class="{'bg-yellow-500 text-gray-900': form.priceType === 'variable', 'text-gray-300 hover:text-white': form.priceType !== 'variable'}"
              class="w-1/2 py-2 rounded-md text-sm font-medium transition-colors duration-200 focus:outline-none">
              Precio Variable
            </button>
          </div>
        </div>

        <div v-if="form.priceType === 'fixed'">
          <label for="price" class="block text-sm font-medium text-gray-300 mb-2">Precio Fijo por {{ form.crypto }} (en {{ selectedFiatName }}):</label>
          <input type="number" id="price" v-model.number="form.price" placeholder="Ej: 65000" step="any"
            class="block w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-yellow-500 text-sm">
        </div>

        <div v-if="form.priceType === 'variable'">
          <label for="price-premium" class="block text-sm font-medium text-gray-300 mb-2">Margen de Precio (en % sobre el precio de mercado):</label>
          <input type="number" id="price-premium" v-model.number="form.pricePremium" placeholder="Ej: 1.5 (para 1.5% sobre el mercado)" step="any"
            class="block w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-yellow-500 text-sm">
        </div>

        <div>
          <label for="payment-window" class="block text-sm font-medium text-gray-300 mb-2">Tiempo Límite de Pago (minutos):</label>
          <input type="number" id="payment-window" v-model.number="form.paymentWindow" placeholder="Ej: 15"
            class="block w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-yellow-500 text-sm">
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">Métodos de Pago:</label>
          <div class="grid grid-cols-2 gap-2">
            <P2pPaymentMethodInput v-model="selectedPaymentId" />
          </div>
        </div>

        <div>
          <label for="terms" class="block text-sm font-medium text-gray-300 mb-2">Términos del Anuncio:</label>
          <textarea id="terms" v-model="form.terms" rows="4" placeholder="Ej: Solo usuarios verificados, pago en 15 minutos, etc."
            class="block w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-yellow-500 text-sm"></textarea>
        </div>

        <div v-if="validationErrors.length > 0" class="bg-red-900/50 text-red-200 p-3 rounded-lg">
          <ul class="list-disc pl-5">
            <li v-for="(error, index) in validationErrors" :key="index">{{ error }}</li>
          </ul>
        </div>

        <button type="submit" class="w-full bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-bold py-3 rounded-lg transition">
          Guardar Cambios
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useNuxtApp, useRoute, navigateTo } from '#app'

const { $axios } = useNuxtApp()
const route = useRoute()
const adId = route.params.id

// --- Estado Local del Formulario ---
const form = reactive({
  type: 'buy',
  crypto: '',
  fiatId: '',
  minAmount: null,
  maxAmount: null,
  priceType: 'fixed',
  price: null,
  pricePremium: null,
  paymentWindow: null,
  terms: ''
})

// --- Estado de UI y Listas ---
const cryptoCoins = ref([])
const fiatCoins = ref([])
const validationErrors = ref([])
const selectedPaymentId = ref(null)
const adNotFound = ref(false)

// --- Computed ---
const selectedFiatName = computed(() => {
  if (!form.fiatId) return 'Fiat'
  const coin = fiatCoins.value.find(c => c.id === form.fiatId)
  return coin?.name || coin?.code || 'Fiat'
})

// --- Utilidades ---
const getData = (resp) => Array.isArray(resp?.data?.data) ? resp.data.data : (Array.isArray(resp?.data) ? resp.data : [])

// --- Carga de Datos ---
onMounted(async () => {
  try {
    // Cargar monedas, fiats y el anuncio existente en paralelo
    const [fiatResp, coinResp, adResp] = await Promise.all([
      $axios.get('/currency'),
      $axios.get('/coin'),
      $axios.get(`/p2p/offers/${adId}`)
    ])

    // Configurar Fiats
    fiatCoins.value = getData(fiatResp)
    // Configurar Criptos
    const allCoins = getData(coinResp)
    cryptoCoins.value = allCoins.filter(c => c.decimal_places !== 2 && c.offLedger !== 1 && c.network)

    // Rellenar formulario con datos del anuncio
    const ad = adResp.data // Ajuste: La respuesta no está anidada en .data
    if (ad && ad.id) {
      form.type = ad.type
      form.crypto = ad.currency.symbol // Ajuste: el objeto es currency, no crypto_currency
      form.fiatId = ad.fiat_currency_id
      form.minAmount = ad.min_amount
      form.maxAmount = ad.max_amount
      form.priceType = ad.fixed_price === 1 ? 'fixed' : 'variable' // Usar fixed_price para determinar el tipo
      form.price = ad.price
      form.pricePremium = ad.margen_price // Usar margen_price para el premium
      form.paymentWindow = ad.time_limit
      form.terms = ad.terms
      // Usar el ID del método de pago directamente
      selectedPaymentId.value = ad.payment_method_id
    } else {
      adNotFound.value = true
    }

  } catch (e) {
    console.error('Error cargando recursos del formulario:', e)
    adNotFound.value = true
  }
})

// --- Envío del Formulario ---
const saveChanges = async () => {
  validationErrors.value = []

  const cryptoObj = cryptoCoins.value.find(c => [c.symbol, c.name].includes(form.crypto))

  const payload = {
    type: form.type,
    price: form.price,
    min_amount: form.minAmount,
    max_amount: form.maxAmount,
    time_limit: form.paymentWindow,
    terms: form.terms,
    price_premium: form.priceType === 'variable' ? form.pricePremium : undefined,
    crypto_currency_id: cryptoObj?.id,
    fiat_currency_id: form.fiatId,
    payment_method_id: selectedPaymentId.value,
    _method: 'PUT' // Laravel necesita esto para tratar POST como PUT
  }

  try {
    const { data } = await $axios.post(`/p2p/offers/${adId}`, payload)
    
    if (data?.data || data) {
      alert('Anuncio actualizado con éxito!')
      navigateTo('/p2p/myofferts')
    } else {
      validationErrors.value = ['Respuesta inesperada del servidor']
    }
  } catch (e) {
    const errData = e?.response?.data
    if (errData?.errors) {
      validationErrors.value = Object.values(errData.errors).flat()
    } else {
      validationErrors.value = [errData?.message || 'No se pudo actualizar el anuncio']
    }
  }
}
</script>

<style scoped>
/* Estilos locales */
</style>