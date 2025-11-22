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
            <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Transferir</h1>
            <p class="text-gray-500 dark:text-gray-400">Mueve tus activos.</p>
          </div>
        </div>
      </header>

      <!-- Transfer Container -->
      <div class="bg-white dark:bg-gray-850/50 border border-gray-200 dark:border-gray-800 rounded-xl p-6 sm:p-8">
        <!-- Tabs -->
        <div class="mb-6 border-b border-gray-200 dark:border-gray-700">
          <nav class="-mb-px flex space-x-6" aria-label="Tabs">
            <button @click="activeTab = 'toUser'" 
                    :class="['whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm', activeTab === 'toUser' ? 'border-yellow-500 text-yellow-500' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-400 dark:hover:border-gray-500']">
              Transferir a Usuario
            </button>
            <button @click="activeTab = 'betweenWallets'" 
                    :class="['whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm', activeTab === 'betweenWallets' ? 'border-yellow-500 text-yellow-500' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-400 dark:hover:border-gray-500']">
              Transferir entre Wallets
            </button>
          </nav>
        </div>

        <!-- Tab Content -->
        <div>
          <!-- Transfer to User -->
          <div v-if="activeTab === 'toUser'" class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div class="flex flex-col gap-6">
              <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Enviar a otro usuario</h2>
              <!-- Asset Selection -->
              <div>
                <label for="user-asset" class="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Activo</label>
                <select id="user-asset" v-model="userTransfer.asset" class="w-full p-3 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-500">
                  <option v-for="asset in assets" :key="asset.symbol" :value="asset.symbol">{{ asset.name }} ({{ asset.symbol }})</option>
                </select>
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-2">Disponible: {{ selectedUserAssetBalance }} {{ userTransfer.asset }}</p>
              </div>
              <!-- Recipient Input -->
              <div>
                <label for="recipient" class="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Email o ID del Usuario</label>
                <input type="text" id="recipient" v-model="userTransfer.recipient" placeholder="Introduce el email o ID" class="w-full p-3 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-500">
              </div>
              <!-- Amount Input -->
              <div>
                <label for="user-amount" class="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Monto</label>
                <input type="number" id="user-amount" v-model.number="userTransfer.amount" placeholder="0.00" class="w-full p-3 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-500">
              </div>
            </div>
            <div class="bg-gray-100 dark:bg-gray-900 rounded-xl p-6 flex flex-col justify-between border border-gray-200 dark:border-gray-800">
                <div>
                    <h3 class="font-semibold text-lg text-gray-900 dark:text-white mb-4">Resumen</h3>
                    <div class="space-y-3 text-sm">
                        <div class="flex justify-between"><span class="text-gray-500 dark:text-gray-400">Enviando a:</span> <span class="text-gray-900 dark:text-white break-all">{{ userTransfer.recipient || '-' }}</span></div>
                        <div class="flex justify-between"><span class="text-gray-500 dark:text-gray-400">Monto:</span> <span class="text-gray-900 dark:text-white">{{ userTransfer.amount > 0 ? userTransfer.amount.toFixed(8) : '0.00' }} {{ userTransfer.asset }}</span></div>
                        <div class="flex justify-between"><span class="text-gray-500 dark:text-gray-400">Comisión:</span> <span class="text-green-600 dark:text-green-500 font-semibold">Gratis</span></div>
                    </div>
                </div>
                <button @click="submitUserTransfer" class="w-full mt-6 py-3 rounded-lg font-semibold text-white dark:text-gray-900 bg-yellow-500 hover:bg-yellow-400 transition-colors">Confirmar Transferencia</button>
            </div>
          </div>

          <!-- Transfer between Wallets -->
          <div v-if="activeTab === 'betweenWallets'" class="max-w-md mx-auto">
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-6 text-center">Mover entre mis wallets</h2>
            <div class="bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
                <!-- From/To Wallets -->
                <div class="flex items-center justify-between gap-4 mb-4">
                    <div class="w-full text-center p-3 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700">
                        <p class="text-xs text-gray-500 dark:text-gray-400">Desde</p>
                        <p class="font-semibold">{{ walletTransfer.from }}</p>
                    </div>
                    <button @click="swapWallets" class="p-2 text-gray-500 dark:text-gray-400 hover:text-yellow-500 transition-colors"><i class="fas fa-exchange-alt fa-lg"></i></button>
                    <div class="w-full text-center p-3 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700">
                        <p class="text-xs text-gray-500 dark:text-gray-400">Hacia</p>
                        <p class="font-semibold">{{ walletTransfer.to }}</p>
                    </div>
                </div>
                <!-- Asset Selection -->
                <div class="mb-4">
                    <label for="wallet-asset" class="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Activo</label>
                    <select id="wallet-asset" v-model="walletTransfer.asset" class="w-full p-3 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-500">
                        <option v-for="asset in assets" :key="asset.symbol" :value="asset.symbol">{{ asset.name }} ({{ asset.symbol }})</option>
                    </select>
                    <p class="text-xs text-gray-500 dark:text-gray-400 mt-2">Disponible en {{ walletTransfer.from }}: {{ selectedWalletAssetBalance }} {{ walletTransfer.asset }}</p>
                </div>
                <!-- Amount Input -->
                <div class="mb-6">
                    <label for="wallet-amount" class="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Monto</label>
                    <input type="number" id="wallet-amount" v-model.number="walletTransfer.amount" placeholder="0.00" class="w-full p-3 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-500">
                </div>
                <!-- Action Button -->
                <button @click="submitWalletTransfer" class="w-full py-3 rounded-lg font-semibold text-white dark:text-gray-900 bg-yellow-500 hover:bg-yellow-400 transition-colors">Confirmar</button>
            </div>
          </div>
        </div>
      </div>

    </section>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'

useHead({
  title: 'Transferir Activos',
  meta: [
    { name: 'description', content: 'Transfiere activos a otros usuarios o entre tus wallets.' }
  ]
})

const route = useRoute()
const activeTab = ref('toUser')

const assets = ref([
  { symbol: 'BTC', name: 'Bitcoin', trading: 0.2, funding: 0.3 },
  { symbol: 'ETH', name: 'Ethereum', trading: 5, funding: 5 },
  { symbol: 'USDT', name: 'Tether', trading: 1000, funding: 4000 },
])

// State for Transfer to User
const userTransfer = reactive({
  asset: 'BTC',
  recipient: '',
  amount: null,
})

const selectedUserAssetBalance = computed(() => {
    const asset = assets.value.find(a => a.symbol === userTransfer.asset);
    // Assuming transfers to users come from the funding wallet
    return asset ? asset.funding : 0;
});

// State for Transfer between Wallets
const walletTransfer = reactive({
  from: 'Funding',
  to: 'Trading',
  asset: 'BTC',
  amount: null,
})

const selectedWalletAssetBalance = computed(() => {
    const asset = assets.value.find(a => a.symbol === walletTransfer.asset);
    if (!asset) return 0;
    return walletTransfer.from === 'Funding' ? asset.funding : asset.trading;
});

function swapWallets() {
  [walletTransfer.from, walletTransfer.to] = [walletTransfer.to, walletTransfer.from];
}

function submitUserTransfer() {
  console.log('Transfer to user:', userTransfer);
  alert('Transferencia a usuario solicitada.');
}

function submitWalletTransfer() {
  console.log('Transfer between wallets:', walletTransfer);
  alert('Transferencia entre wallets solicitada.');
}

// Set initial asset from route query
onMounted(() => {
  const assetQuery = route.query.asset
  if (assetQuery && assets.value.some(a => a.symbol === assetQuery)) {
    userTransfer.asset = assetQuery;
    walletTransfer.asset = assetQuery;
  }
  const tabQuery = route.query.tab
  if (tabQuery && ['toUser', 'betweenWallets'].includes(tabQuery)) {
      activeTab.value = tabQuery
  }
})

</script>

<style scoped>
.bg-gray-850 { background-color: #1f2937; }
</style>