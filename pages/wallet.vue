<template>
  <div class="min-h-screen bg-gray-900 text-gray-300">
    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-16">

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

      <div v-if="error" class="bg-red-900 bg-opacity-30 border border-red-700 text-red-300 p-4 rounded-lg mb-6 flex items-center gap-3">
        <i class="fas fa-exclamation-triangle"></i>
        <span>{{ error }}</span>
      </div>

      <div class="bg-gradient-to-r from-gray-800 to-gray-850 rounded-xl p-6 mb-8 border border-gray-700">
        <div class="flex justify-between items-start mb-4">
            <div>
                <p class="text-gray-400 text-sm mb-1 flex items-center gap-2">
                    <i class="fas fa-wallet"></i> Balance Total
                </p>
                <h2 class="text-2xl sm:text-3xl font-extrabold text-white">
                    {{ showBalance ? totalBalanceFiat.toLocaleString('en-US', { style: 'currency', currency: fiatCurrency }) : '••••••••' }}
                </h2>
            </div>
            <button @click="showBalance = !showBalance" class="p-2 rounded-lg transition text-gray-400 hover:text-white hover:bg-gray-700">
                <i :class="showBalance ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
            </button>
        </div>
        
      </div>

      <div class="flex flex-col sm:flex-row gap-3 mb-6">
        <div class="relative flex-grow">
          <i class="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
          <input v-model="searchQuery" type="text" placeholder="Buscar activo..." class="w-full pl-10 pr-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-gray-800 text-white border border-gray-700" />
        </div>
      </div>

      <div v-if="loading" class="text-center py-12">
        <LoadingIndicator v-if="typeof LoadingIndicator !== 'undefined'" /> 
        <i v-else class="fas fa-spinner fa-spin fa-3x text-yellow-500"></i>
        <p class="text-gray-400 mt-4">Cargando carteras...</p>
      </div>

      <div v-else-if="filteredWallets.length > 0" class="hidden md:block bg-gray-850 border border-gray-800 rounded-xl overflow-hidden">
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
                <td class="px-6 py-4 whitespace-nowrap text-sm text-white">
                    <span v-if="showBalance">{{ parseFloat(wallet.total).toFixed(8) }}</span>
                    <span v-else>••••••••</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-white">
                    <span v-if="showBalance">{{ parseFloat(wallet.available).toFixed(8) }}</span>
                    <span v-else>••••••••</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-white">
                    <span v-if="showBalance">{{ parseFloat(wallet.locked_balance).toFixed(8) }}</span>
                    <span v-else>••••••••</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-center text-sm">
                  <div class="flex items-center justify-center gap-2">
                    <NuxtLink :to="`/deposit?asset=${wallet.symbol}`" class="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-1 px-3 rounded-md text-xs transition-colors">Depositar</NuxtLink>
                    <NuxtLink :to="`/transfer?asset=${wallet.symbol}`" class="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-1 px-3 rounded-md text-xs transition-colors">Transferir</NuxtLink>
                    <NuxtLink :to="`/withdraw?asset=${wallet.symbol}`" class="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-1 px-3 rounded-md text-xs transition-colors">Retirar</NuxtLink>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div v-else-if="filteredWallets.length > 0" class="md:hidden space-y-4">
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
              <p class="font-semibold text-white">{{ showBalance ? parseFloat(wallet.total).toFixed(8) : '••••••••' }}</p>
            </div>
            <div>
              <p class="text-gray-400">Disponible</p>
              <p class="font-semibold text-white">{{ showBalance ? parseFloat(wallet.available).toFixed(8) : '••••••••' }}</p>
            </div>
            <div class="col-span-2">
              <p class="text-gray-400">Bloqueado</p>
              <p class="font-semibold text-white">{{ showBalance ? parseFloat(wallet.locked_balance).toFixed(8) : '••••••••' }}</p>
            </div>
          </div>
          <div class="flex items-center justify-center gap-2 border-t border-gray-700 pt-4">
            <NuxtLink :to="`/deposit?asset=${wallet.symbol}`" class="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-1 px-3 rounded-md text-xs transition-colors">Depositar</NuxtLink>
            <NuxtLink :to="`/transfer?asset=${wallet.symbol}`" class="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-1 px-3 rounded-md text-xs transition-colors">Transferir</NuxtLink>
            <NuxtLink :to="`/withdraw?asset=${wallet.symbol}`" class="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-1 px-3 rounded-md text-xs transition-colors">Retirar</NuxtLink>
          </div>
        </div>
      </div>
      
      <div v-else-if="!loading && !error" class="text-center py-12">
        <i class="fas fa-box-open fa-3x text-gray-600"></i>
        <p class="text-gray-400 text-lg mt-4">No se encontraron activos</p>
        <p class="text-sm text-gray-500">Intenta ajustar tu búsqueda o filtros.</p>
      </div>

    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useNuxtApp } from '#app'; // Necesario en Nuxt 3 para usar $axios
import LoadingIndicator from '~/components/p2p/LoadingIndicator.vue'; // Asumiendo que esta es la ruta correcta

// --- ESTADO LOCAL ---
const wallets = ref([]);
const loading = ref(false);
const error = ref(null);
const showBalance = ref(true);
const searchQuery = ref('');

// Totales globales del servidor
const totalBalanceFiat = ref(0);
const fiatCurrency = ref('USD'); // Default

// --- GETTERS (PROPIEDADES COMPUTADAS) ---

// Calcula el saldo total bloqueado sumando el campo 'fiat_' de las carteras.
// Nota: La respuesta del servidor tiene 'locked_balance', pero asumimos que el cálculo global en fiat
// necesita sumar todos los 'fiat_' correspondientes al balance bloqueado.
// Como no hay un campo 'locked_fiat' global, sumamos los 'fiat_' de las carteras
// que representan el valor total de ese activo, y no solo el valor bloqueado.
// Para ser precisos, sumamos el valor Fiat (fiat_) solo si la cartera tiene balance bloqueado,
// pero esto es una suposición. Usaremos los campos tal como vienen del servidor.
const lockedBalanceFiat = computed(() => {
    return wallets.value.reduce((sum, w) => {
        // Asumiendo que w.fiat_ es el valor fiat de la CRIPTO disponible
        // y necesitamos el valor fiat del balance bloqueado.
        // Dado que el servidor no da un 'locked_fiat', hacemos una suma simple
        // del valor fiat (w.fiat_) de cada cartera. ESTO NO ES CORRECTO
        // según tu lógica anterior.
        
        // **OPCIÓN MÁS PRECISA (pero suposición):** Si el servidor no da un 'locked_fiat',
        // usaremos el total global del servidor (totalBalanceFiat) y asumimos
        // que el campo "total_currency" ya es el total.

        // **Ajuste:** Mantendremos el cálculo de los totales encriptados si queremos mostrarlos,
        // pero la sección de "Balance Overview" está usando FIAT. 
        
        // **Cálculo de Locked FIAT (Heurística):**
        // Calculamos la proporción del balance bloqueado sobre el total del activo
        // y lo multiplicamos por el valor fiat total del activo (w.fiat_).
        const totalCrypto = parseFloat(w.available) + parseFloat(w.locked_balance);
        const lockedCrypto = parseFloat(w.locked_balance);
        const fiatValue = parseFloat(w.fiat_); // Valor fiat del balance 'available'

        if (totalCrypto > 0) {
            // Valor fiat total del activo = Valor fiat disponible + Valor fiat bloqueado (a calcular)
            // Simplificamos asumiendo que el valor fiat de w.balance y w.locked_balance es similar
            const totalFiat = fiatValue * (totalCrypto / parseFloat(w.available));
            const lockedFiat = totalFiat - fiatValue;
            return sum + (lockedFiat || 0);
        }
        return sum;

    }, 0);
});


// El saldo disponible en Fiat es el total global menos el saldo bloqueado en Fiat
const availableBalanceFiat = computed(() => {
    const available = totalBalanceFiat.value - lockedBalanceFiat.value;
    return available > 0 ? available : 0;
});

const filteredWallets = computed(() => {
    if (!wallets.value || !searchQuery.value) return wallets.value;
    const query = searchQuery.value.toLowerCase();
    return wallets.value.filter(w => {
        const name = w.name ? w.name.toLowerCase() : '';
        const symbol = w.symbol ? w.symbol.toLowerCase() : '';
        return name.includes(query) || symbol.includes(query);
    });
});

// --- ACCIÓN AXIOS ---
async function fetchWallets() {
    loading.value = true;
    error.value = null;
    const { $axios } = useNuxtApp();

    try {
        const response = await $axios.get('/wallets');
        
        // Asignación de totales globales
        totalBalanceFiat.value = parseFloat(response.data.total_currency || 0);
        fiatCurrency.value = response.data._currency || 'USD';

        // Mapeo de carteras (usando los nombres de las propiedades del servidor)
        wallets.value = response.data.wallets.map(w => ({
            ...w,
            // Aseguramos que los valores que usamos en la tabla sean numéricos
            total: parseFloat(w.total || 0),
            available: parseFloat(w.available || 0),
            locked_balance: parseFloat(w.locked_balance || 0),
            fiatValue: parseFloat(w.fiat_ || 0),
        }));
    } catch (e) {
        error.value = 'Error al cargar los datos. Por favor, inténtalo de nuevo más tarde.';
        console.error('Error fetching wallets:', e);
    } finally {
        loading.value = false;
    }
}

// --- HOOKS DE CICLO DE VIDA ---
onMounted(() => {
    fetchWallets();
});

// Nota importante: Eliminé las referencias a `walletStore.toggleBalanceVisibility()` 
// y `walletStore.setSearchQuery()` porque ahora son manejadas directamente con `ref` localmente.
// `v-model="searchQuery"` y `@click="showBalance = !showBalance"` funcionan directamente con los refs.
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