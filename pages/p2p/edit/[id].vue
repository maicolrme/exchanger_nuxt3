<template>
  <div class="container mx-auto px-4 py-6">
    <h2 class="text-3xl font-bold text-center mb-8">Editar Anuncio P2P</h2>
    <div class="bg-gray-800 rounded-lg p-6 max-w-2xl mx-auto">
      <div v-if="adNotFound" class="bg-red-900/50 text-red-200 p-3 rounded-lg mb-4">
        No se encontró el anuncio solicitado.
      </div>
      <form v-if="!adNotFound" @submit.prevent="saveChanges" class="space-y-6">

        <!-- Tipo de Anuncio -->
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">Quiero:</label>
          <div class="flex rounded-lg bg-gray-700 p-1">
            <button type="button" @click="p2pStore.formData.type = 'buy'" :class="{'bg-yellow-500 text-gray-900': p2pStore.formData.type === 'buy', 'text-gray-300 hover:text-white': p2pStore.formData.type !== 'buy'}" class="w-1/2 py-2 rounded-md text-sm font-medium transition-colors duration-200 focus:outline-none">
              Comprar
            </button>
            <button type="button" @click="p2pStore.formData.type = 'sell'" :class="{'bg-yellow-500 text-gray-900': p2pStore.formData.type === 'sell', 'text-gray-300 hover:text-white': p2pStore.formData.type !== 'sell'}" class="w-1/2 py-2 rounded-md text-sm font-medium transition-colors duration-200 focus:outline-none">
              Vender
            </button>
          </div>
        </div>

        <!-- Criptomoneda -->
        <div>
  <label for="crypto" class="block text-sm font-medium text-gray-300 mb-2">Criptomoneda:</label>
  <select id="crypto" v-model="p2pStore.formData.crypto" class="block w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-yellow-500 text-sm">
    <option disabled value="">Seleccione una criptomoneda</option>
    <option v-for="c in p2pStore.cryptoCoins" :key="c.id" :value="c.symbol || c.name">
      {{ c.name || c.symbol }}
    </option>
  </select>
        </div>

        <!-- Cantidad -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label for="min-amount" class="block text-sm font-medium text-gray-300 mb-2">Cantidad Mínima ({{ p2pStore.formData.crypto }}):</label>
            <input type="number" id="min-amount" v-model.number="p2pStore.formData.minAmount" placeholder="Ej: 0.001" step="any" class="block w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-yellow-500 text-sm">
          </div>
          <div>
            <label for="max-amount" class="block text-sm font-medium text-gray-300 mb-2">Cantidad Máxima ({{ p2pStore.formData.crypto }}):</label>
            <input type="number" id="max-amount" v-model.number="p2pStore.formData.maxAmount" placeholder="Ej: 1.0" step="any" class="block w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-yellow-500 text-sm">
          </div>
        </div>

        <!-- Moneda Fiat -->
        <div>
          <label for="fiat" class="block text-sm font-medium text-gray-300 mb-2">Moneda Fiat:</label>
          <select id="fiat" v-model="p2pStore.formData.fiatId" class="block w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-yellow-500 text-sm">
            <option disabled value="">Seleccione una moneda fiat</option>
            <option v-for="f in p2pStore.fiatCoins" :key="f.id" :value="f.id">
              {{ f.name || f.code }}
            </option>
          </select>
        </div>

        <!-- Tipo de Precio -->
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">Tipo de Precio:</label>
          <div class="flex rounded-lg bg-gray-700 p-1">
            <button type="button" @click="p2pStore.formData.priceType = 'fixed'" :class="{'bg-yellow-500 text-gray-900': p2pStore.formData.priceType === 'fixed', 'text-gray-300 hover:text-white': p2pStore.formData.priceType !== 'fixed'}" class="w-1/2 py-2 rounded-md text-sm font-medium transition-colors duration-200 focus:outline-none">
              Precio Fijo
            </button>
            <button type="button" @click="p2pStore.formData.priceType = 'variable'" :class="{'bg-yellow-500 text-gray-900': p2pStore.formData.priceType === 'variable', 'text-gray-300 hover:text-white': p2pStore.formData.priceType !== 'variable'}" class="w-1/2 py-2 rounded-md text-sm font-medium transition-colors duration-200 focus:outline-none">
              Precio Variable
            </button>
          </div>
        </div>

        <!-- Precio Fijo -->
        <div v-if="p2pStore.formData.priceType === 'fixed'">
          <label for="price" class="block text-sm font-medium text-gray-300 mb-2">Precio Fijo por {{ p2pStore.formData.crypto }} (en {{ selectedFiatName }}):</label>
          <input type="number" id="price" v-model.number="p2pStore.formData.price" placeholder="Ej: 65000" step="any" class="block w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-yellow-500 text-sm">
        </div>
        
        <!-- Margen de Precio Variable -->
        <div v-if="p2pStore.formData.priceType === 'variable'">
          <label for="price-premium" class="block text-sm font-medium text-gray-300 mb-2">Margen de Precio (en % sobre el precio de mercado):</label>
          <input type="number" id="price-premium" v-model.number="p2pStore.formData.pricePremium" placeholder="Ej: 1.5 (para 1.5% sobre el mercado)" step="any" class="block w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-yellow-500 text-sm">
        </div>

        <!-- Tiempo Límite de Pago -->
        <div>
          <label for="payment-window" class="block text-sm font-medium text-gray-300 mb-2">Tiempo Límite de Pago (minutos):</label>
          <input type="number" id="payment-window" v-model.number="p2pStore.formData.paymentWindow" placeholder="Ej: 15" class="block w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-yellow-500 text-sm">
        </div>

        <!-- Métodos de Pago -->
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">Métodos de Pago:</label>
          <div class="grid grid-cols-2 gap-2">
            <P2pPaymentMethodInput v-model="selectedPaymentId"/>
          </div>
        </div>

        <!-- Términos del Anuncio -->
        <div>
          <label for="terms" class="block text-sm font-medium text-gray-300 mb-2">Términos del Anuncio:</label>
          <textarea id="terms" v-model="p2pStore.formData.terms" rows="4" placeholder="Ej: Solo usuarios verificados, pago en 15 minutos, etc." class="block w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-yellow-500 text-sm"></textarea>
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
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useP2pStore } from '~/stores/p2p'
import { useMyOffers } from '~/composables/useMyOffers'
import { usePaymentMethods } from '~/composables/usePaymentMethods'
import { useNuxtApp } from '#app'

definePageMeta({
  layout: 'p2p'
})

const route = useRoute()
const p2pStore = useP2pStore()
const validationErrors = ref([])
const selectedPaymentId = ref(null)
const adNotFound = ref(false)

const { paymentMethods, fetchPaymentMethods } = usePaymentMethods()
const { offers, fetchMyOffers, updateOffer } = useMyOffers()

const adId = computed(() => Number(route.params.id))

const selectedFiatName = computed(() => {
  const id = p2pStore.formData.fiatId
  if (!id) return p2pStore.formData.fiat
  const found = p2pStore.fiatCoins.find(c => c.id === id)
  return (found?.name || found?.code) || p2pStore.formData.fiat
})

const { $axios } = useNuxtApp()

const loadFiats = async () => {
  try {
    const resp = await $axios.get('/currency')
    const list = Array.isArray(resp?.data?.data) ? resp.data.data : (Array.isArray(resp?.data) ? resp.data : [])
    p2pStore.fiatCoins = list
    if (!p2pStore.formData.fiatId && list.length > 0) {
      p2pStore.formData.fiatId = list[0].id
    }
  } catch (e) {
    console.error('No se pudo cargar /currency', e)
  }
}

const loadCoins = async () => {
  try {
    const resp = await $axios.get('/coin')
    const list = Array.isArray(resp?.data?.data) ? resp.data.data : (Array.isArray(resp?.data) ? resp.data : [])

    const isFiat = (c) => (c.decimal_places === 2 || c.offLedger === 1 || !c.network)
    const cryptos = list.filter(c => !isFiat(c))

    p2pStore.cryptoCoins = cryptos
  } catch (e) {
    console.error('No se pudo cargar /coin', e)
  }
}

onMounted(async () => {
  p2pStore.initTheme()
  p2pStore.resetForm()
  // Cargar listas dinámicas de monedas desde endpoints consistentes con publish
  await loadFiats()
  await loadCoins()
  // Cargar ofertas y mapear la existente
  await fetchMyOffers()
  const list = offers.value || []
  const existing = list.find(a => a.id === adId.value)
  if (!existing) {
    adNotFound.value = true
    return
  }
  // Mapear datos del anuncio al formulario
  p2pStore.formData.type = existing.type
  p2pStore.formData.crypto = existing.crypto
  p2pStore.formData.minAmount = existing.minLimit ?? existing.minAmount ?? 0
  p2pStore.formData.maxAmount = existing.maxLimit ?? existing.maxAmount ?? 0
  p2pStore.formData.fiat = existing.fiat
  // Intentar resolver fiatId a partir de code/name
  const matchFiat = p2pStore.fiatCoins.find(c => c.code === existing.fiat || c.name === existing.fiat || c.symbol === existing.fiat)
  if (matchFiat) {
    p2pStore.formData.fiatId = matchFiat.id
  } else if (!p2pStore.formData.fiatId && p2pStore.fiatCoins.length > 0) {
    p2pStore.formData.fiatId = p2pStore.fiatCoins[0].id
  }
  p2pStore.formData.priceType = p2pStore.formData.priceType || 'fixed'
  p2pStore.formData.price = existing.price ?? p2pStore.formData.price
  p2pStore.formData.pricePremium = p2pStore.formData.pricePremium ?? 0
  p2pStore.formData.paymentWindow = p2pStore.formData.paymentWindow ?? 15
  p2pStore.formData.terms = existing.terms ?? ''

  await fetchPaymentMethods()
})

const { validateAdForm } = p2pStore

const saveChanges = async () => {
  // Alinear validación con el componente de métodos de pago
  p2pStore.formData.paymentMethods = selectedPaymentId.value ? [selectedPaymentId.value] : []

  const validation = validateAdForm()
  if (!validation.isValid) {
    validationErrors.value = validation.errors
    return
  }
  validationErrors.value = []
  try {
    // Enviar nombre/código de fiat y el id (currency_id) vía composable
    await updateOffer(adId.value, { ...p2pStore.formData, fiat: selectedFiatName.value })
    alert('Anuncio actualizado con éxito!')
    navigateTo('/p2p/myofferts')
  } catch (e) {
    alert('No se pudo actualizar el anuncio')
  }
}
</script>

<style scoped>
/* Estilos específicos para esta página si son necesarios */
</style>