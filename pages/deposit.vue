<template>
  <div class="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-300">
    <section class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-16">

      <!-- Header -->
      <header class="mb-8">
        <div class="flex items-center gap-4">
          <NuxtLink to="/wallet" class="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
            <i class="fas fa-arrow-left fa-lg"></i>
          </NuxtLink>
          <div>
            <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Depositar</h1>
            <p class="text-gray-500 dark:text-gray-400">Recibe activos en tu wallet.</p>
          </div>
        </div>
      </header>

      <!-- Deposit Form -->
      <div class="bg-white dark:bg-gray-850/50 border border-gray-200 dark:border-gray-800 rounded-xl p-6 sm:p-8">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          <!-- Left Side: Asset Selection and Info -->
          <div class="flex flex-col gap-6">
            <div>
              <label for="asset" class="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Activo</label>
              <div class="relative">
                <select id="asset" v-model="selectedAssetSymbol" class="w-full pl-4 pr-10 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 appearance-none">
                  <option v-for="asset in assets" :key="asset.symbol" :value="asset.symbol">
                    {{ asset.name }} ({{ asset.symbol }})
                  </option>
                </select>
                <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500 dark:text-gray-400">
                    <i class="fas fa-chevron-down"></i>
                </div>
              </div>
            </div>

            <div v-if="selectedAsset">
              <label for="network" class="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Red</label>
              <div class="relative">
                <select id="network" v-model="selectedNetwork" class="w-full pl-4 pr-10 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 appearance-none">
                  <option v-for="network in selectedAsset.networks" :key="network.id" :value="network.id">
                    {{ network.name }}
                  </option>
                </select>
                <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500 dark:text-gray-400">
                    <i class="fas fa-chevron-down"></i>
                </div>
              </div>
            </div>

            <div class="bg-yellow-100 dark:bg-yellow-900/20 border border-yellow-400 dark:border-yellow-500 text-yellow-800 dark:text-yellow-300 rounded-lg p-4 text-sm">
              <p class="font-semibold mb-2 flex items-center gap-2"><i class="fas fa-exclamation-triangle"></i> Atención</p>
              <ul class="list-disc list-inside space-y-1">
                <li>Envía únicamente {{ selectedAsset?.symbol }} a esta dirección.</li>
                <li>Asegúrate de que la red seleccionada ({{ selectedNetworkInfo?.name }}) coincide con la red desde la que realizas el envío.</li>
                <li>El depósito puede tardar varios minutos en ser confirmado por la red.</li>
              </ul>
            </div>
          </div>

          <!-- Right Side: Address and QR Code -->
          <div v-if="selectedAsset && selectedNetworkInfo" class="bg-gray-100 dark:bg-gray-900 rounded-xl p-6 flex flex-col items-center justify-center border border-gray-200 dark:border-gray-800">
            <p class="text-sm text-gray-500 dark:text-gray-400 mb-2">Tu dirección de depósito de {{ selectedAsset.symbol }}</p>
            <div class="w-48 h-48 bg-white p-2 rounded-lg flex items-center justify-center mb-4">
                <!-- Placeholder for QR Code -->
                <img :src="`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${selectedNetworkInfo.address}`" alt="QR Code"/>
            </div>
            <div class="w-full bg-gray-200 dark:bg-gray-800 rounded-lg p-3 flex items-center justify-between gap-2">
              <p class="text-sm text-gray-900 dark:text-white break-all">{{ selectedNetworkInfo.address }}</p>
              <button @click="copyAddress" class="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors p-1">
                <i :class="copied ? 'fas fa-check text-green-500' : 'fas fa-copy'"></i>
              </button>
            </div>
          </div>

        </div>
      </div>

    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'

useHead({
  title: 'Depositar Activos',
  meta: [
    { name: 'description', content: 'Deposita criptomonedas en tu wallet de forma segura.' }
  ]
})

const route = useRoute()

const assets = ref([
  { 
    symbol: 'BTC', 
    name: 'Bitcoin', 
    networks: [
      { id: 'btc-mainnet', name: 'Bitcoin', address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa' },
      { id: 'btc-lightning', name: 'Lightning Network', address: 'lnbc1... '}
    ]
  },
  {
    symbol: 'ETH',
    name: 'Ethereum',
    networks: [
        { id: 'eth-erc20', name: 'Ethereum (ERC20)', address: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e' },
        { id: 'eth-arbitrum', name: 'Arbitrum', address: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1' }
    ]
  },
  {
    symbol: 'USDT',
    name: 'Tether',
    networks: [
        { id: 'usdt-trc20', name: 'Tron (TRC20)', address: 'TXYZ... ' },
        { id: 'usdt-erc20', name: 'Ethereum (ERC20)', address: '0xdAC17F958D2ee523a2206206994597C13D831ec7' }
    ]
  }
])

const selectedAssetSymbol = ref('BTC')
const selectedNetwork = ref(null)
const copied = ref(false)

const selectedAsset = computed(() => assets.value.find(a => a.symbol === selectedAssetSymbol.value))
const selectedNetworkInfo = computed(() => selectedAsset.value?.networks.find(n => n.id === selectedNetwork.value))

// Set initial asset and network from route query or defaults
onMounted(() => {
  const assetQuery = route.query.asset
  if (assetQuery && assets.value.some(a => a.symbol === assetQuery)) {
    selectedAssetSymbol.value = assetQuery
  }
  if (selectedAsset.value && selectedAsset.value.networks.length > 0) {
    selectedNetwork.value = selectedAsset.value.networks[0].id
  }
})

// Watch for asset changes to reset network
watch(selectedAssetSymbol, (newAssetSymbol) => {
    const newAsset = assets.value.find(a => a.symbol === newAssetSymbol)
    if (newAsset && newAsset.networks.length > 0) {
        selectedNetwork.value = newAsset.networks[0].id
    }
});

const copyAddress = () => {
  if (selectedNetworkInfo.value) {
    navigator.clipboard.writeText(selectedNetworkInfo.value.address)
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  }
}

</script>

<style scoped>
.bg-gray-850 { background-color: #1f2937; }
select {
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
}
</style>