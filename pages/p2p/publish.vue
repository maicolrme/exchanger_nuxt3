<template>
  <div class="container mx-auto px-4 py-6">
    <h2 class="text-3xl font-bold text-center mb-8">Publicar Nuevo Anuncio P2P</h2>
    <div class="bg-gray-800 rounded-lg p-6 max-w-2xl mx-auto">
      <form @submit.prevent="publishAd" class="space-y-6">
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
            <option value="BTC">Bitcoin (BTC)</option>
            <option value="ETH">Ethereum (ETH)</option>
            <option value="USDT">Tether (USDT)</option>
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
          <select id="fiat" v-model="p2pStore.formData.fiat" class="block w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-yellow-500 text-sm">
            <option value="USD">Dólar Estadounidense (USD)</option>
            <option value="EUR">Euro (EUR)</option>
            <option value="ARS">Peso Argentino (ARS)</option>
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
          <label for="price" class="block text-sm font-medium text-gray-300 mb-2">Precio Fijo por {{ p2pStore.formData.crypto }} (en {{ p2pStore.formData.fiat }}):</label>
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
            <div v-for="method in paymentMethods" :key="method" class="flex items-center">
              <input type="checkbox" :id="method" :value="method" v-model="p2pStore.formData.paymentMethods" class="mr-2 h-4 w-4 text-yellow-500 focus:ring-yellow-500 border-gray-600 rounded">
              <label :for="method" class="text-sm text-gray-300">{{ method }}</label>
            </div>
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
          Publicar Anuncio
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useP2pStore } from '~/stores/p2p'

// Definir el layout
definePageMeta({
  layout: 'p2p'
})

const p2pStore = useP2pStore()
const validationErrors = ref([])

const paymentMethods = [
  "Transferencia Bancaria",
  "PayPal",
  "Mercado Pago",
  "Binance Pay",
  "Wise",
  "Skrill",
  "Neteller",
  "Uphold",
  "AdvCash",
  "Perfect Money",
  "Western Union",
  "MoneyGram",
  "Efectivo en Persona",
  "Otro"
]

onMounted(() => {
  // Inicializar el tema
  p2pStore.initTheme()
  // Resetear el formulario
  p2pStore.resetForm()
})

const publishAd = () => {
  // Validar el formulario
  const validation = p2pStore.validateAdForm()
  
  if (!validation.isValid) {
    validationErrors.value = validation.errors
    return
  }
  
  // Limpiar errores previos
  validationErrors.value = []
  
  // Publicar el anuncio
  const newAd = p2pStore.publishAd(p2pStore.formData)
  
  // Mostrar mensaje de éxito
  alert('Anuncio publicado con éxito!')
  
  // Resetear el formulario
  p2pStore.resetForm()
  
  // Redirigir a la página de P2P
  navigateTo('/p2p')
}
</script>

<style scoped>
/* Estilos específicos para esta página si son necesarios */
</style>