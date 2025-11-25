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

      <!-- Search and other filters -->
      <div class="flex flex-col sm:flex-row gap-3 mb-6">
        <div class="relative flex-grow">
          <i class="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
          <input v-model="searchQuery" type="text" placeholder="Buscar activo..." class="w-full pl-10 pr-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-gray-800 text-white border border-gray-700" />
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
                    <img :src="wallet.icon" :alt="wallet.name" class="h-10 w-10 rounded-full">
                    <div>
                      <div class="text-sm font-semibold text-white">{{ wallet.name }}</div>
                      <div class="text-xs text-gray-400">{{ wallet.symbol }}</div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-white">{{ wallet.balance + wallet.locked }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-white">{{ wallet.balance}}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-white">{{  wallet.locked}}</td>
                <td class="px-6 py-4 whitespace-nowrap text-center text-sm">
                  <div class="flex items-center justify-center gap-2">
                    <NuxtLink :to="`/deposit?asset=${wallet.symbol}`" class="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-1 px-3 rounded-md text-xs transition-colors">Depositar</NuxtLink>
                    <NuxtLink :to="`/transfer?asset=${wallet.symbol}`" class="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-1 px-3 rounded-md text-xs transition-colors">Transferir</NuxtLink>
                    <NuxtLink :to="`/withdraw?asset=${wallet.symbol}`" class="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-1 px-3 rounded-md text-xs transition-colors">Retirar</NuxtLink>
                  </div>
                </td>
              </tr>
              <tr v-if="loading || filteredWallets.length === 0">
                <td colspan="5" class="text-center py-12">
                  <LoadingIndicator v-if="loading" />
                  <div v-else>
                    <i class="fas fa-box-open fa-3x text-gray-600"></i>
                    <p class="text-gray-400 text-lg mt-4">No se encontraron activos</p>
                    <p class="text-sm text-gray-500">Intenta ajustar tu búsqueda o filtros.</p>
                  </div>
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
              <img :src="wallet.icon" :alt="wallet.name" class="h-10 w-10 rounded-full">
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
        <div v-if="loading || filteredWallets.length === 0" class="text-center py-12">
          <LoadingIndicator v-if="loading" />
          <div v-else>
            <i class="fas fa-box-open fa-3x text-gray-600"></i>
            <p class="text-gray-400 text-lg mt-4">No se encontraron activos</p>
            <p class="text-sm text-gray-500">Intenta ajustar tu búsqueda o filtros.</p>
          </div>
        </div>
      </div>

    </section>
  </div>
</template>

<script setup>
import { computed, onBeforeMount } from 'vue';
import { useWalletStore } from '~/stores/wallet.js';
import LoadingIndicator from '~/components/p2p/LoadingIndicator.vue';

const walletStore = useWalletStore();

onBeforeMount(() => {
  walletStore.fetchWallets();
});

const showBalance = computed(() => walletStore.showBalance);
const totalBalance = computed(() => walletStore.totalBalance);
const availableBalance = computed(() => walletStore.availableBalance);
const lockedBalance = computed(() => walletStore.lockedBalance);
const filteredWallets = computed(() => walletStore.filteredWallets);
const loading = computed(() => walletStore.loading);
const error = computed(() => walletStore.error);

const searchQuery = computed({
  get: () => walletStore.searchQuery,
  set: (value) => walletStore.setSearchQuery(value)
});
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