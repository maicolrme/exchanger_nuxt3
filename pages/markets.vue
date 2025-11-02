<script setup>
import { ref, computed } from 'vue'
definePageMeta({
  layout: 'p2p'
});
// --- Estado (Reemplaza la 'data' de Vue 2) ---

// Ref para la barra de búsqueda
const searchQuery = ref('');

// Ref para la categoría seleccionada
const selectedCategory = ref('all');

// Refs para el ordenamiento de la tabla
const sortColumn = ref(null);
const sortDirection = ref('desc');

// Ref para los datos de los mercados
const markets = ref([
  { symbol: 'BTC/USDT', name: 'Bitcoin', price: '64,285.50', change: 2.34, high24h: '65,120.00', low24h: '63,450.00', volume24h: '2,456', isFavorite: false, category: 'spot' },
  { symbol: 'ETH/USDT', name: 'Ethereum', price: '3,245.80', change: 5.67, high24h: '3,280.00', low24h: '3,100.00', volume24h: '1,823', isFavorite: true, category: 'spot' },
  { symbol: 'BNB/USDT', name: 'Binance Coin', price: '425.30', change: -1.23, high24h: '435.00', low24h: '420.00', volume24h: '567', isFavorite: false, category: 'spot' },
  { symbol: 'SOL/USDT', name: 'Solana', price: '142.50', change: 8.45, high24h: '145.00', low24h: '135.00', volume24h: '892', isFavorite: true, category: 'defi' },
  { symbol: 'XRP/USDT', name: 'Ripple', price: '0.5234', change: -3.12, high24h: '0.5450', low24h: '0.5100', volume24h: '1,234', isFavorite: false, category: 'spot' },
  { symbol: 'ADA/USDT', name: 'Cardano', price: '0.4567', change: 1.89, high24h: '0.4650', low24h: '0.4400', volume24h: '678', isFavorite: false, category: 'spot' },
  { symbol: 'DOGE/USDT', name: 'Dogecoin', price: '0.0823', change: -2.45, high24h: '0.0850', low24h: '0.0800', volume24h: '456', isFavorite: false, category: 'spot' },
  { symbol: 'AVAX/USDT', name: 'Avalanche', price: '35.67', change: 4.23, high24h: '36.50', low24h: '34.00', volume24h: '345', isFavorite: false, category: 'defi' },
  { symbol: 'DOT/USDT', name: 'Polkadot', price: '6.789', change: -0.89, high24h: '6.950', low24h: '6.650', volume24h: '234', isFavorite: true, category: 'spot' },
  { symbol: 'MATIC/USDT', name: 'Polygon', price: '0.8456', change: 3.45, high24h: '0.8700', low24h: '0.8200', volume24h: '567', isFavorite: false, category: 'defi' },
  { symbol: 'LINK/USDT', name: 'Chainlink', price: '14.567', change: 6.78, high24h: '15.000', low24h: '13.800', volume24h: '432', isFavorite: false, category: 'defi' },
  { symbol: 'UNI/USDT', name: 'Uniswap', price: '8.234', change: -4.56, high24h: '8.650', low24h: '8.100', volume24h: '298', isFavorite: false, category: 'defi' },
  { symbol: 'LTC/USDT', name: 'Litecoin', price: '87.65', change: 1.23, high24h: '89.00', low24h: '86.00', volume24h: '345', isFavorite: false, category: 'spot' },
  { symbol: 'ATOM/USDT', name: 'Cosmos', price: '10.234', change: 7.89, high24h: '10.500', low24h: '9.800', volume24h: '267', isFavorite: false, category: 'defi' },
  { symbol: 'TRX/USDT', name: 'TRON', price: '0.1234', change: -1.67, high24h: '0.1280', low24h: '0.1200', volume24h: '189', isFavorite: false, category: 'spot' }
]);

// --- Propiedades Computadas (Reemplaza 'computed') ---
const filteredMarkets = computed(() => {
  let result = markets.value;

  // Filtrar por búsqueda
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(m =>
      m.symbol.toLowerCase().includes(query) ||
      m.name.toLowerCase().includes(query)
    );
  }

  // Filtrar por categoría
  if (selectedCategory.value === 'favorites') {
    result = result.filter(m => m.isFavorite);
  } else if (selectedCategory.value === 'spot') {
    result = result.filter(m => m.category === 'spot');
  } else if (selectedCategory.value === 'defi') {
    result = result.filter(m => m.category === 'defi');
  } else if (selectedCategory.value === 'gainers') {
    result = result.filter(m => m.change > 0).sort((a, b) => b.change - a.change);
  } else if (selectedCategory.value === 'losers') {
    result = result.filter(m => m.change < 0).sort((a, b) => a.change - b.change);
  }

  // Ordenar
  if (sortColumn.value) {
    result = [...result].sort((a, b) => {
      let aVal = a[sortColumn.value];
      let bVal = b[sortColumn.value];

      // Convertir strings con comas a números para ordenar
      if (sortColumn.value === 'price' || sortColumn.value === 'volume24h') {
        aVal = parseFloat(String(aVal).replace(/,/g, ''));
        bVal = parseFloat(String(bVal).replace(/,/g, ''));
      }

      if (sortDirection.value === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });
  }

  return result;
});

// --- Métodos (Reemplaza 'methods') ---

// He eliminado toggleTheme() porque la lógica del tema
// pertenece al layout, no a la página.

function toggleFavorite(symbol) {
  const market = markets.value.find(m => m.symbol === symbol);
  if (market) {
    market.isFavorite = !market.isFavorite;
  }
}

function sortBy(column) {
  if (sortColumn.value === column) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortColumn.value = column;
    sortDirection.value = 'desc';
  }
}

// --- Metadatos de la página (SEO) ---
// Opcional: Define el título y la descripción de la página
useHead({
  title: 'CryptoEx - Mercados'
})
</script>

<template>
  <div class="bg-gray-900 text-white pb-20 md:pb-0 min-h-screen w-full">

    

    <div class="px-4 py-4">
      <div class="mb-4">
        <div class="relative">
          <svg class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none"
            stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
          <input v-model="searchQuery" type="text" placeholder="Buscar moneda..."
            class="w-full bg-gray-800 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500">
        </div>
      </div>

      <div class="flex gap-2 overflow-x-auto scrollbar-hide mb-4">
        <button @click="selectedCategory = 'all'"
          :class="selectedCategory === 'all' ? 'bg-yellow-500 text-gray-900' : 'bg-gray-800 text-gray-300'"
          class="px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap">
          Todos
        </button>
        <button @click="selectedCategory = 'favorites'"
          :class="selectedCategory === 'favorites' ? 'bg-yellow-500 text-gray-900' : 'bg-gray-800 text-gray-300'"
          class="px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap">
          ⭐ Favoritos
        </button>
        <button @click="selectedCategory = 'spot'"
          :class="selectedCategory === 'spot' ? 'bg-yellow-500 text-gray-900' : 'bg-gray-800 text-gray-300'"
          class="px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap">
          Spot
        </button>
        <button @click="selectedCategory = 'defi'"
          :class="selectedCategory === 'defi' ? 'bg-yellow-500 text-gray-900' : 'bg-gray-800 text-gray-300'"
          class="px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap">
          DeFi
        </button>
        <button @click="selectedCategory = 'gainers'"
          :class="selectedCategory === 'gainers' ? 'bg-yellow-500 text-gray-900' : 'bg-gray-800 text-gray-300'"
          class="px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap">
          🔥 Top Ganadores
        </button>
        <button @click="selectedCategory = 'losers'"
          :class="selectedCategory === 'losers' ? 'bg-yellow-500 text-gray-900' : 'bg-gray-800 text-gray-300'"
          class="px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap">
          📉 Top Perdedores
        </button>
      </div>

      <div class="md:hidden space-y-2">
        <NuxtLink v-for="market in filteredMarkets" :key="market.symbol"
          :to="`/trade/${market.symbol.replace('/', '_')}`"
          class="bg-gray-800 rounded-lg p-3 hover:bg-gray-750 cursor-pointer block">
          <div class="flex items-center justify-between mb-2">
            <div class="flex items-center gap-2">
              <svg @click.stop="toggleFavorite(market.symbol)" class="w-4 h-4 star-icon"
                :class="{ 'active': market.isFavorite }" fill="currentColor" viewBox="0 0 20 20">
                <path
                  d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z">
                </path>
              </svg>
              <div class="flex items-center gap-2">
                <img :src="`https://cryptoicons.org/api/icon/${market.symbol.split('/')[0].toLowerCase()}/25`" 
                     :alt="market.symbol.split('/')[0]" 
                     class="w-5 h-5 rounded-full" 
                     onerror="this.src='https://cryptoicons.org/api/icon/generic/25'; this.onerror=null;">
                <span class="font-semibold">{{ market.symbol }}</span>
              </div>
              <span class="text-xs text-gray-400">{{ market.name }}</span>
            </div>
            <div class="text-right">
              <div class="font-semibold">${{ market.price }}</div>
              <div class="text-xs" :class="market.change >= 0 ? 'price-up' : 'price-down'">
                {{ market.change >= 0 ? '+' : '' }}{{ market.change }}%
              </div>
            </div>
          </div>
          <div class="grid grid-cols-3 gap-2 text-xs text-gray-400">
            <div>
              <div>24h Alto</div>
              <div class="text-white">${{ market.high24h }}</div>
            </div>
            <div>
              <div>24h Bajo</div>
              <div class="text-white">${{ market.low24h }}</div>
            </div>
            <div>
              <div>Vol 24h</div>
              <div class="text-white">{{ market.volume24h }}M</div>
            </div>
          </div>
        </NuxtLink>
      </div>

      <div class="hidden md:block bg-gray-800 rounded-lg overflow-hidden">
        <table class="w-full">
          <thead class="bg-gray-750 border-b border-gray-700">
            <tr class="text-xs text-gray-400">
              <th class="text-left py-3 px-4 font-normal">Par</th>
              <th class="text-right py-3 px-4 font-normal cursor-pointer hover:text-white" @click="sortBy('price')">
                Precio
                <span v-if="sortColumn === 'price'">{{ sortDirection === 'asc' ? '↑' : '↓' }}</span>
              </th>
              <th class="text-right py-3 px-4 font-normal cursor-pointer hover:text-white" @click="sortBy('change')">
                24h Cambio
                <span v-if="sortColumn === 'change'">{{ sortDirection === 'asc' ? '↑' : '↓' }}</span>
              </th>
              <th class="text-right py-3 px-4 font-normal">24h Alto</th>
              <th class="text-right py-3 px-4 font-normal">24h Bajo</th>
              <th class="text-right py-3 px-4 font-normal cursor-pointer hover:text-white" @click="sortBy('volume24h')">
                24h Volumen
                <span v-if="sortColumn === 'volume24h'">{{ sortDirection === 'asc' ? '↑' : '↓' }}</span>
              </th>
              <th class="text-center py-3 px-4 font-normal">Acción</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="market in filteredMarkets" :key="market.symbol"
              class="border-b border-gray-700 hover:bg-gray-750 cursor-pointer">
              <td class="py-4 px-4">
                <div class="flex items-center gap-2">
                  <svg @click.stop="toggleFavorite(market.symbol)" class="w-4 h-4 star-icon"
                    :class="{ 'active': market.isFavorite }" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z">
                    </path>
                  </svg>
                  <div class="flex items-center gap-2">
                    <img :src="`https://cryptoicons.org/api/icon/${market.symbol.split('/')[0].toLowerCase()}/25`" 
                         :alt="market.symbol.split('/')[0]" 
                         class="w-5 h-5 rounded-full" 
                         onerror="this.src='https://cryptoicons.org/api/icon/generic/25'; this.onerror=null;">
                    <div>
                      <div class="font-semibold text-sm">{{ market.symbol }}</div>
                      <div class="text-xs text-gray-400">{{ market.name }}</div>
                    </div>
                  </div>
                </div>
              </td>
              <td class="py-4 px-4 text-right font-semibold">${{ market.price }}</td>
              <td class="py-4 px-4 text-right font-semibold" :class="market.change >= 0 ? 'price-up' : 'price-down'">
                {{ market.change >= 0 ? '+' : '' }}{{ market.change }}%
              </td>
              <td class="py-4 px-4 text-right text-gray-300">${{ market.high24h }}</td>
              <td class="py-4 px-4 text-right text-gray-300">${{ market.low24h }}</td>
              <td class="py-4 px-4 text-right text-gray-300">{{ market.volume24h }}M</td>
              <td class="py-4 px-4 text-center">
                <NuxtLink :to="`/trade/${market.symbol.replace('/', '_')}`">
                  <button class="bg-green-500 hover:bg-green-600 text-white text-xs px-4 py-1.5 rounded font-semibold">
                    Operar
                  </button>
                </NuxtLink>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<style >
/* He copiado todos tus estilos personalizados.
  No les he puesto 'scoped' para que las reglas de 'light-mode' 
  puedan aplicarse correctamente desde tu layout (que es donde
  probablemente se añade la clase '.light-mode' al <body> o <html>).
*/
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}



.price-up {
  color: #0ecb81;
}

.price-down {
  color: #f6465d;
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

/* Light Mode */
.light-mode {
  background-color: #f5f5f5;
  color: #1a1a1a;
}

.light-mode .bg-gray-900 {
  background-color: #f5f5f5 !important;
}

.light-mode .bg-gray-800 {
  background-color: #ffffff !important;
  border: 1px solid #e5e5e5;
}

.light-mode .bg-gray-700 {
  background-color: #f8f8f8 !important;
}

.light-mode .bg-gray-750 {
  background-color: #f0f0f0 !important;
}

.light-mode .text-white {
  color: #1a1a1a !important;
}

.light-mode .text-gray-300 {
  color: #666666 !important;
}

.light-mode .text-gray-400 {
  color: #999999 !important;
}

.light-mode .text-gray-500 {
  color: #aaaaaa !important;
}

.light-mode .border-gray-700 {
  border-color: #e5e5e5 !important;
}

.light-mode .hover\:bg-gray-600:hover {
  background-color: #e8e8e8 !important;
}

.light-mode .hover\:bg-gray-700:hover {
  background-color: #f0f0f0 !important;
}

.light-mode .hover\:bg-gray-750:hover {
  background-color: #f5f5f5 !important;
}

/* Toggle Switch */
/* Estos estilos estaban en el original. Es probable que tu layout 
  ya tenga su propio 'toggle', pero los mantengo por si acaso.
*/
.toggle-switch {
  position: relative;
  width: 48px;
  height: 24px;
  background-color: #4b5563;
  border-radius: 12px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.toggle-switch.active {
  background-color: #fbbf24;
}

.toggle-slider {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 20px;
  height: 20px;
  background-color: white;
  border-radius: 50%;
  transition: transform 0.3s;
}

.toggle-switch.active .toggle-slider {
  transform: translateX(24px);
}

/* Star Icon */
.star-icon {
  cursor: pointer;
  transition: color 0.2s;
}

.star-icon.active {
  color: #fbbf24;
}

.star-icon:not(.active) {
  color: #6b7280;
}

.star-icon:hover {
  color: #fbbf24;
}
</style>