<template>
  <div class="min-h-screen bg-gray-900 text-gray-300">
    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-16">

      <!-- Header -->
      <header class="mb-8">
        <div class="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <h1 class="text-3xl font-bold text-white">Wallet</h1>
            <p class="text-gray-400">Gestiona tus activos y revisa tus balances.</p>
          </div>
          <div class="flex items-center gap-2 flex-wrap">
            <NuxtLink to="/deposit" class="bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-semibold py-2 px-4 rounded-lg transition-colors flex items-center gap-2 text-sm sm:text-base">
              <i class="fas fa-arrow-down"></i> Depositar
            </NuxtLink>
            <NuxtLink to="/transfer" class="bg-gray-800 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center gap-2 text-sm sm:text-base">
              <i class="fas fa-exchange-alt"></i> Transferir
            </NuxtLink>
            <NuxtLink to="/withdraw" class="bg-gray-800 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center gap-2 text-sm sm:text-base">
              <i class="fas fa-arrow-up"></i> Retirar
            </NuxtLink>
          </div>
        </div>
      </header>

      <!-- Balance Overview -->
      <div class="bg-gradient-to-r from-gray-800 to-gray-850 rounded-xl p-6 mb-8 border border-gray-700">
        <div class="flex justify-between items-start mb-4">
            <div>
                <p class="text-gray-400 text-sm mb-1 flex items-center gap-2">
                    <i class="fas fa-wallet"></i> Balance Total
                </p>
                <h2 class="text-2xl sm:text-3xl font-extrabold text-white">
                    {{ showBalance ? totalBalance.toLocaleString('en-US', { style: 'currency', currency: 'USD' }) : '••••••••' }}
                </h2>
            </div>
            <button @click="showBalance = !showBalance" class="p-2 rounded-lg transition text-gray-400 hover:text-white hover:bg-gray-700">
                <i :class="showBalance ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
            </button>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
                <p class="text-gray-400">Disponible</p>
                <p class="font-semibold text-white">{{ showBalance ? availableBalance.toLocaleString('en-US', { style: 'currency', currency: 'USD' }) : '••••••••' }}</p>
            </div>
            <div>
                <p class="text-gray-400">Bloqueado</p>
                <p class="font-semibold text-white">{{ showBalance ? lockedBalance.toLocaleString('en-US', { style: 'currency', currency: 'USD' }) : '••••••••' }}</p>
            </div>
        </div>
      </div>

      <!-- Wallet Type Filter -->
      <div class="mb-6">
        <div class="flex border-b border-gray-700">
          <button @click="activeWalletType = 'trading'" :class="activeWalletType === 'trading' ? 'border-yellow-500 text-white' : 'border-transparent text-gray-400'" class="px-4 py-2 font-semibold border-b-2 transition-colors text-sm sm:text-base">
            Wallet de Trading
          </button>
          <button @click="activeWalletType = 'funding'" :class="activeWalletType === 'funding' ? 'border-yellow-500 text-white' : 'border-transparent text-gray-400'" class="px-4 py-2 font-semibold border-b-2 transition-colors text-sm sm:text-base">
            Wallet de Funding
          </button>
        </div>
      </div>

      <!-- Search and other filters -->
      <div class="flex flex-col sm:flex-row gap-3 mb-6">
        <div class="relative flex-grow">
          <i class="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
          <input v-model="searchQuery" type="text" placeholder="Buscar activo..." class="w-full pl-10 pr-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-gray-800 text-white border border-gray-700" />
        </div>
        <div class="flex items-center gap-3">
            <button @click="hideZeroBalances = !hideZeroBalances" :class="hideZeroBalances ? 'bg-yellow-500 text-gray-900' : 'bg-gray-800 text-white'" class="w-full sm:w-auto px-4 py-3 rounded-lg font-semibold transition whitespace-nowrap hover:opacity-90 border border-gray-700">
              <i class="fas fa-filter text-xs mr-2"></i>
              Ocultar balances bajos
            </button>
        </div>
      </div>

      <!-- Wallets Table (Desktop) -->
      <div class="hidden md:block bg-gray-850 border border-gray-800 rounded-xl overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-800">
            <thead class="bg-gray-800">
              <tr>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Activo</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Total</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Disponible</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Bloqueado</th>
                <th scope="col" class="px-6 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody class="bg-gray-850 divide-y divide-gray-800">
              <tr v-for="wallet in filteredWallets" :key="wallet.symbol" class="hover:bg-gray-800 transition-colors">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center gap-3">
                    <div class="h-10 w-10 rounded-full flex items-center justify-center font-bold text-white" :style="{ backgroundColor: wallet.color }">
                      {{ wallet.symbol.substring(0, 3) }}
                    </div>
                    <div>
                      <div class="text-sm font-semibold text-white">{{ wallet.name }}</div>
                      <div class="text-xs text-gray-400">{{ wallet.symbol }}</div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-white">{{ showBalance ? (wallet.balance + wallet.locked).toFixed(8) : '••••••••' }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-white">{{ showBalance ? wallet.balance.toFixed(8) : '••••••••' }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-white">{{ showBalance ? wallet.locked.toFixed(8) : '••••••••' }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-center text-sm">
                  <div class="flex items-center justify-center gap-2">
                    <NuxtLink :to="`/deposit?asset=${wallet.symbol}`" class="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-1 px-3 rounded-md text-xs transition-colors">Depositar</NuxtLink>
                    <NuxtLink :to="`/transfer?asset=${wallet.symbol}`" class="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-1 px-3 rounded-md text-xs transition-colors">Transferir</NuxtLink>
                    <NuxtLink :to="`/withdraw?asset=${wallet.symbol}`" class="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-1 px-3 rounded-md text-xs transition-colors">Retirar</NuxtLink>
                  </div>
                </td>
              </tr>
              <tr v-if="filteredWallets.length === 0">
                <td colspan="5" class="text-center py-12">
                  <i class="fas fa-box-open fa-3x text-gray-600"></i>
                  <p class="text-gray-400 text-lg mt-4">No se encontraron activos</p>
                  <p class="text-sm text-gray-500">Intenta ajustar tu búsqueda o filtros.</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Wallets Cards (Mobile) -->
      <div class="md:hidden space-y-4">
        <div v-for="wallet in filteredWallets" :key="wallet.symbol" class="bg-gray-850 border border-gray-800 rounded-xl p-4">
          <div class="flex justify-between items-center mb-4">
            <div class="flex items-center gap-3">
              <div class="h-10 w-10 rounded-full flex items-center justify-center font-bold text-white" :style="{ backgroundColor: wallet.color }">
                {{ wallet.symbol.substring(0, 3) }}
              </div>
              <div>
                <div class="text-sm font-semibold text-white">{{ wallet.name }}</div>
                <div class="text-xs text-gray-400">{{ wallet.symbol }}</div>
              </div>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-4 text-sm mb-4">
            <div>
              <p class="text-gray-400">Total</p>
              <p class="font-semibold text-white">{{ showBalance ? (wallet.balance + wallet.locked).toFixed(8) : '••••••••' }}</p>
            </div>
            <div>
              <p class="text-gray-400">Disponible</p>
              <p class="font-semibold text-white">{{ showBalance ? wallet.balance.toFixed(8) : '••••••••' }}</p>
            </div>
            <div class="col-span-2">
              <p class="text-gray-400">Bloqueado</p>
              <p class="font-semibold text-white">{{ showBalance ? wallet.locked.toFixed(8) : '••••••••' }}</p>
            </div>
          </div>
          <div class="flex items-center justify-center gap-2 border-t border-gray-700 pt-4">
            <NuxtLink :to="`/deposit?asset=${wallet.symbol}`" class="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-1 px-3 rounded-md text-xs transition-colors">Depositar</NuxtLink>
            <NuxtLink :to="`/transfer?asset=${wallet.symbol}`" class="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-1 px-3 rounded-md text-xs transition-colors">Transferir</NuxtLink>
            <NuxtLink :to="`/withdraw?asset=${wallet.symbol}`" class="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-1 px-3 rounded-md text-xs transition-colors">Retirar</NuxtLink>
          </div>
        </div>
        <div v-if="filteredWallets.length === 0" class="text-center py-12">
            <i class="fas fa-box-open fa-3x text-gray-600"></i>
            <p class="text-gray-400 text-lg mt-4">No se encontraron activos</p>
            <p class="text-sm text-gray-500">Intenta ajustar tu búsqueda o filtros.</p>
        </div>
      </div>

    </section>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

useHead({
  title: 'Mi Wallet',
  meta: [
    { name: 'description', content: 'Gestiona tus wallets de criptomonedas.' }
  ]
})

const showBalance = ref(true)
const searchQuery = ref('')
const activeWalletType = ref('trading')
const hideZeroBalances = ref(false)

// Datos de ejemplo
const wallets = ref([
  { symbol: 'BTC', name: 'Bitcoin', balance: 0.25, locked: 0.00842, price: 65420, change24h: 2.5, walletType: 'trading', color: '#f7931a' },
  { symbol: 'ETH', name: 'Ethereum', balance: 3.5, locked: 0.0482, price: 3240, change24h: 1.8, walletType: 'trading', color: '#627eea' },
  { symbol: 'USDT', name: 'Tether', balance: 1250.00, locked: 0, price: 1, change24h: 0.01, walletType: 'funding', color: '#26a17b' },
  { symbol: 'BNB', name: 'Binance Coin', balance: 12.5, locked: 2.5, price: 580, change24h: -0.5, walletType: 'trading', color: '#f3ba2f' },
  { symbol: 'SOL', name: 'Solana', balance: 45.2, locked: 0, price: 165, change24h: 5.2, walletType: 'funding', color: '#14f195' },
  { symbol: 'ADA', name: 'Cardano', balance: 2500, locked: 500, price: 0.45, change24h: -1.2, walletType: 'trading', color: '#0033ad' },
  { symbol: 'XRP', name: 'Ripple', balance: 0, locked: 0, price: 0.52, change24h: 0.8, walletType: 'trading', color: '#23292f' },
  { symbol: 'DOT', name: 'Polkadot', balance: 150.5, locked: 0, price: 7.2, change24h: 3.1, walletType: 'funding', color: '#e6007a' }
])

const totalBalance = computed(() => {
  return filteredWallets.value.reduce((sum, w) => sum + ((w.balance + w.locked) * w.price), 0)
})

const availableBalance = computed(() => {
  return filteredWallets.value.reduce((sum, w) => sum + (w.balance * w.price), 0)
})

const lockedBalance = computed(() => {
  return filteredWallets.value.reduce((sum, w) => sum + (w.locked * w.price), 0)
})

const filteredWallets = computed(() => {
  return wallets.value.filter(w => {
    const matchesSearch = w.name.toLowerCase().includes(searchQuery.value.toLowerCase()) || w.symbol.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchesWalletType = w.walletType === activeWalletType.value
    const matchesBalance = !hideZeroBalances.value || (w.balance + w.locked) > 0.00001
    return matchesSearch && matchesWalletType && matchesBalance
  })
})

</script>

<style scoped>
.bg-gray-850 { background-color: #1f2937; }
select {
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  background-image: url('data:image/svg+xml;charset=UTF-8,<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20"><path stroke="%239ca3af" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="m6 8 4 4 4-4"/></svg>');
  background-position: right 0.75rem center;
  background-repeat: no-repeat;
  background-size: 1.25em;
  padding-right: 2.5rem; /* Ensure space for the arrow */
}
</style>