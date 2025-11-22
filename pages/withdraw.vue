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
            <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Retirar</h1>
            <p class="text-gray-500 dark:text-gray-400">Envía activos desde tu wallet.</p>
          </div>
        </div>
      </header>

      <!-- Withdraw Form -->
      <div class="bg-white dark:bg-gray-850/50 border border-gray-200 dark:border-gray-800 rounded-xl p-6 sm:p-8">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          <!-- Left Side: Form Inputs -->
          <div class="flex flex-col gap-6">
            <!-- Asset Selection -->
            <div>
              <label for="asset" class="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Activo</label>
              <div class="relative">
                <select id="asset" v-model="selectedAssetSymbol" class="w-full pl-4 pr-10 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 appearance-none">
                  <option v-for="asset in assets" :key="asset.symbol" :value="asset.symbol">
                    {{ asset.name }} ({{ asset.symbol }})
                  </option>
                </select>
                <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500 dark:text-gray-400"><i class="fas fa-chevron-down"></i></div>
              </div>
              <p v-if="selectedAsset" class="text-xs text-gray-500 dark:text-gray-400 mt-2">Disponible: {{ selectedAsset.balance }} {{ selectedAsset.symbol }}</p>
            </div>

            <!-- Address Input -->
            <div>
                <label for="address" class="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Dirección de Destino</label>
                <input type="text" id="address" v-model="address" placeholder="Introduce la dirección de la wallet" class="w-full p-3 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-500">
            </div>

            <!-- Network Selection -->
            <div v-if="selectedAsset">
              <label for="network" class="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Red</label>
              <div class="relative">
                <select id="network" v-model="selectedNetwork" class="w-full pl-4 pr-10 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 appearance-none">
                  <option v-for="network in selectedAsset.networks" :key="network.id" :value="network.id">
                    {{ network.name }}
                  </option>
                </select>
                <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500 dark:text-gray-400"><i class="fas fa-chevron-down"></i></div>
              </div>
            </div>

            <!-- Amount Input -->
            <div>
                <label for="amount" class="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Monto</label>
                <div class="relative">
                    <input type="number" id="amount" v-model.number="amount" placeholder="0.00" class="w-full p-3 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 pr-20">
                    <button @click="setMaxAmount" class="absolute inset-y-0 right-0 px-4 text-yellow-500 font-semibold text-sm hover:text-yellow-400">MAX</button>
                </div>
            </div>
          </div>

          <!-- Right Side: Summary and Action -->
          <div class="bg-gray-100 dark:bg-gray-900 rounded-xl p-6 flex flex-col justify-between border border-gray-200 dark:border-gray-800">
            <div>
                <h3 class="font-semibold text-lg text-gray-900 dark:text-white mb-4">Resumen del Retiro</h3>
                <div class="space-y-3 text-sm">
                    <div class="flex justify-between"><span class="text-gray-500 dark:text-gray-400">Monto a retirar:</span> <span class="text-gray-900 dark:text-white">{{ amount > 0 ? amount.toFixed(8) : '0.00' }} {{ selectedAssetSymbol }}</span></div>
                    <div class="flex justify-between"><span class="text-gray-500 dark:text-gray-400">Comisión de red:</span> <span class="text-gray-900 dark:text-white">{{ networkFee.toFixed(8) }} {{ selectedAssetSymbol }}</span></div>
                    <hr class="border-gray-300 dark:border-gray-700"/>
                    <div class="flex justify-between font-bold"><span class="text-gray-800 dark:text-gray-300">Recibirás:</span> <span class="text-yellow-500">{{ amountToReceive.toFixed(8) }} {{ selectedAssetSymbol }}</span></div>
                </div>
                <div class="mt-6 bg-yellow-100 dark:bg-yellow-900/20 border border-yellow-400 dark:border-yellow-500 text-yellow-700 dark:text-yellow-300 rounded-lg p-3 text-xs">
                    <p class="font-semibold flex items-center gap-2"><i class="fas fa-exclamation-triangle"></i> Importante</p>
                    <p class="mt-1">Verifica que la dirección y la red son correctas. Las transacciones en blockchain son irreversibles.</p>
                </div>
            </div>
            <button :disabled="!isFormValid" @click="submitWithdrawal" class="w-full mt-6 py-3 rounded-lg font-semibold text-white dark:text-gray-900 transition-colors" :class="isFormValid ? 'bg-yellow-500 hover:bg-yellow-400' : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'">
              Retirar
            </button>
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
  title: 'Retirar Activos',
  meta: [
    { name: 'description', content: 'Retira criptomonedas de tu wallet de forma segura.' }
  ]
})

const route = useRoute()

const assets = ref([
  { 
    symbol: 'BTC', 
    name: 'Bitcoin', 
    balance: 0.5,
    networks: [
      { id: 'btc-mainnet', name: 'Bitcoin', fee: 0.0001 },
      { id: 'btc-lightning', name: 'Lightning Network', fee: 0.00001 }
    ]
  },
  {
    symbol: 'ETH',
    name: 'Ethereum',
    balance: 10,
    networks: [
        { id: 'eth-erc20', name: 'Ethereum (ERC20)', fee: 0.001 },
        { id: 'eth-arbitrum', name: 'Arbitrum', fee: 0.0001 }
    ]
  },
  {
    symbol: 'USDT',
    name: 'Tether',
    balance: 5000,
    networks: [
        { id: 'usdt-trc20', name: 'Tron (TRC20)', fee: 1 },
        { id: 'usdt-erc20', name: 'Ethereum (ERC20)', fee: 5 }
    ]
  }
])

const selectedAssetSymbol = ref('BTC')
const selectedNetwork = ref(null)
const address = ref('')
const amount = ref(null)

const selectedAsset = computed(() => assets.value.find(a => a.symbol === selectedAssetSymbol.value))
const selectedNetworkInfo = computed(() => selectedAsset.value?.networks.find(n => n.id === selectedNetwork.value))

const networkFee = computed(() => selectedNetworkInfo.value?.fee || 0)
const amountToReceive = computed(() => {
    const result = (amount.value || 0) - networkFee.value;
    return result > 0 ? result : 0;
});

const isFormValid = computed(() => {
    return address.value.trim() !== '' && 
           amount.value > 0 && 
           amount.value <= selectedAsset.value?.balance &&
           selectedNetwork.value !== null;
});

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
    amount.value = null; // Reset amount on asset change
});

const setMaxAmount = () => {
    if(selectedAsset.value) {
        amount.value = selectedAsset.value.balance;
    }
}

const submitWithdrawal = () => {
    if(isFormValid.value) {
        console.log('Submitting withdrawal:', {
            asset: selectedAssetSymbol.value,
            network: selectedNetwork.value,
            address: address.value,
            amount: amount.value
        });
        // Here you would typically call an API to process the withdrawal
        alert('¡Retiro solicitado con éxito!');
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