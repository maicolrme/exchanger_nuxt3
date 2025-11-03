<template>
  <div class="min-h-screen">
    <!-- Balance Overview -->
    <div class="bg-gray-800 rounded-lg p-6 mb-6">
      <div class="flex justify-between items-start mb-4">
        <div>
          <p class="text-gray-400 text-sm mb-1">Balance Total</p>
          <h2 class="text-3xl font-extrabold text-white">
            {{ totalBalance.toLocaleString('en-US', { style: 'currency', currency: 'USD' }) }}
          </h2>
        </div>
        <button 
          @click="showBalance = !showBalance" 
          class="p-2 rounded-lg transition bg-gray-700 hover:bg-gray-600"
        >
          {{ showBalance ? '👁️' : '👁️‍🗨️' }}
        </button>
      </div>
      
    </div>

    <!-- Filters -->
    <div class="flex flex-wrap gap-3 mb-6">
      <input 
        v-model="searchQuery"
        type="text"
        placeholder="Buscar criptomoneda..."
        class="flex-1 min-w-[200px] px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-gray-700 text-white border border-gray-600"
      >
      <select 
        v-model="filterType"
        class="px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-gray-700 text-white border border-gray-600"
      >
        <option value="all">Todas</option>
        <option value="spot">Spot</option>
        <option value="staking">Staking</option>
      </select>
      <button 
        @click="hideZeroBalances = !hideZeroBalances"
        :class="hideZeroBalances ? 'bg-yellow-500 text-gray-900' : 'bg-gray-700 text-white'" 
        class="px-4 py-3 rounded-lg font-semibold transition whitespace-nowrap hover:opacity-90"
      >
        {{ hideZeroBalances ? '✓ Sin Balance' : 'Ocultar 0' }}
      </button>
    </div>

    <!-- Wallets List -->
    <div class="space-y-3">
      <div 
        v-for="wallet in filteredWallets" 
        :key="wallet.symbol"
        class="bg-gray-800 border border-gray-700 hover:bg-gray-750 rounded-lg p-4 transition cursor-pointer"
        @click="selectedWallet = wallet"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <div 
              class="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm text-white"
              :style="{ backgroundColor: wallet.color }"
            >
              {{ wallet.symbol.substring(0, 2) }}
            </div>
            <div>
              <p class="font-semibold text-white">{{ wallet.name }}</p>
              <p class="text-gray-400 text-sm">{{ wallet.symbol }}</p>
            </div>
          </div>
          <div class="text-right">
            <p class="font-bold text-white">
              {{ showBalance ? wallet.balance.toFixed(8) : '••••••' }} {{ wallet.symbol }}
            </p>
            <p class="text-gray-400 text-sm">
              {{ showBalance ? '$' + (wallet.balance * wallet.price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '••••••' }}
            </p>
          </div>
        </div>
        <div class="flex items-center justify-between mt-3 pt-3 border-t border-gray-700">
          <div class="flex items-center space-x-2">
            <span 
              :class="wallet.change24h >= 0 ? 'text-green-500' : 'text-red-500'" 
              class="text-sm font-semibold"
            >
              {{ wallet.change24h >= 0 ? '▲' : '▼' }} {{ Math.abs(wallet.change24h) }}%
            </span>
            <span class="text-gray-400 text-xs">24h</span>
          </div>
          <div class="flex space-x-2">
            <button class="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm font-semibold transition">
              Comprar
            </button>
            <button class="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm font-semibold transition">
              Transferir
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="filteredWallets.length === 0" class="text-center py-12">
      <p class="text-gray-400 text-lg">No se encontraron wallets</p>
    </div>

    <!-- Detail Modal -->
    <div 
      v-if="selectedWallet" 
      @click="selectedWallet = null" 
      class="fixed inset-0 bg-black bg-opacity-50 flex items-end md:items-center justify-center z-50"
    >
      <div 
        @click.stop 
        class="bg-gray-800 border border-gray-700 w-full md:max-w-md md:rounded-lg rounded-t-2xl p-6 max-h-[90vh] overflow-y-auto"
      >
        <div class="flex justify-between items-start mb-6">
          <div class="flex items-center space-x-3">
            <div 
              class="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm text-white"
              :style="{ backgroundColor: selectedWallet.color }"
            >
              {{ selectedWallet.symbol.substring(0, 2) }}
            </div>
            <div>
              <h3 class="text-xl font-bold text-white">{{ selectedWallet.name }}</h3>
              <p class="text-gray-400">{{ selectedWallet.symbol }}</p>
            </div>
          </div>
          <button 
            @click="selectedWallet = null" 
            class="text-gray-400 hover:text-white text-2xl"
          >
            ×
          </button>
        </div>

        <div class="space-y-4 mb-6">
          <div>
            <p class="text-gray-400 text-sm mb-1">Balance Disponible</p>
            <p class="text-2xl font-bold text-white">
              {{ selectedWallet.balance.toFixed(8) }} {{ selectedWallet.symbol }}
            </p>
            <p class="text-gray-400 text-sm">
              ${{ (selectedWallet.balance * selectedWallet.price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
            </p>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <p class="text-gray-400 text-xs mb-1">Precio Actual</p>
              <p class="font-semibold text-white">
                ${{ selectedWallet.price.toLocaleString('en-US') }}
              </p>
            </div>
            <div>
              <p class="text-gray-400 text-xs mb-1">Cambio 24h</p>
              <p 
                :class="selectedWallet.change24h >= 0 ? 'text-green-500' : 'text-red-500'" 
                class="font-semibold"
              >
                {{ selectedWallet.change24h >= 0 ? '+' : '' }}{{ selectedWallet.change24h }}%
              </p>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <button class="bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg font-semibold transition">
            Comprar
          </button>
          <button class="bg-red-500 hover:bg-red-600 text-white py-3 rounded-lg font-semibold transition">
            Vender
          </button>
          <button class="bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg font-semibold transition">
            Depositar
          </button>
          <button class="bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg font-semibold transition">
            Retirar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Configurar layout
definePageMeta({
  layout: 'p2p'
})

// Estado reactivo
const showBalance = ref(true)
const searchQuery = ref('')
const filterType = ref('all')
const hideZeroBalances = ref(false)
const selectedWallet = ref(null)

// Datos de wallets
const wallets = ref([
  { symbol: 'BTC', name: 'Bitcoin', balance: 0.25842, price: 65420, change24h: 2.5, type: 'spot', color: '#f7931a' },
  { symbol: 'ETH', name: 'Ethereum', balance: 3.5482, price: 3240, change24h: 1.8, type: 'spot', color: '#627eea' },
  { symbol: 'USDT', name: 'Tether', balance: 1250.00, price: 1, change24h: 0.01, type: 'spot', color: '#26a17b' },
  { symbol: 'BNB', name: 'Binance Coin', balance: 12.5, price: 580, change24h: -0.5, type: 'staking', color: '#f3ba2f' },
  { symbol: 'SOL', name: 'Solana', balance: 45.2, price: 165, change24h: 5.2, type: 'spot', color: '#14f195' },
  { symbol: 'ADA', name: 'Cardano', balance: 2500, price: 0.45, change24h: -1.2, type: 'staking', color: '#0033ad' },
  { symbol: 'XRP', name: 'Ripple', balance: 0, price: 0.52, change24h: 0.8, type: 'spot', color: '#23292f' },
  { symbol: 'DOT', name: 'Polkadot', balance: 150.5, price: 7.2, change24h: 3.1, type: 'staking', color: '#e6007a' }
])

// Computed properties
const totalBalance = computed(() => {
  return wallets.value.reduce((sum, w) => sum + (w.balance * w.price), 0)
})

const filteredWallets = computed(() => {
  return wallets.value.filter(w => {
    const matchesSearch = w.name.toLowerCase().includes(searchQuery.value.toLowerCase()) || 
                        w.symbol.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchesType = filterType.value === 'all' || w.type === filterType.value
    const matchesBalance = !hideZeroBalances.value || w.balance > 0
    return matchesSearch && matchesType && matchesBalance
  })
})

// Meta tags
useHead({
  title: 'Mis Wallets - CryptoEx',
  meta: [
    { name: 'description', content: 'Gestiona tus wallets de criptomonedas en CryptoEx' }
  ]
})
</script>

<style scoped>
.bg-gray-750 {
  background-color: #1a202c;
}
</style>