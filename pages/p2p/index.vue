<template>
  <div>
    <!-- P2P Banner - Profesional y oculto en móviles -->
    

    <!-- Main Content -->
    <section class="py-6 pb-24 md:pb-6">
      <div class="w-full px-4">
        <!-- Buy/Sell Toggle -->
        <div class="flex gap-2 mb-6">
          <button @click="tradeMode = 'buy'" 
                  :class="tradeMode === 'buy' ? 'bg-green-500 text-white' : 'bg-gray-800 text-gray-300'"
                  class="flex-1 py-3 rounded-lg font-semibold transition">
            Comprar
          </button>
          <button @click="tradeMode = 'sell'" 
                  :class="tradeMode === 'sell' ? 'bg-red-500 text-white' : 'bg-gray-800 text-gray-300'"
                  class="flex-1 py-3 rounded-lg font-semibold transition">
            Vender
          </button>
        </div>

        <!-- Filters -->
        <div class="bg-gray-800 rounded-lg p-4 mb-4">
          <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
            <select v-model="filterCrypto" class="bg-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500">
              <option value="USDT">USDT</option>
              <option value="BTC">BTC</option>
              <option value="ETH">ETH</option>
            </select>
            <select v-model="filterFiat" class="bg-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500">
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="ARS">ARS</option>
            </select>
            <select v-model="filterPayment" class="bg-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500">
              <option value="">Todos</option>
              <option value="bank">Banco</option>
              <option value="paypal">PayPal</option>
            </select>
            <input v-model="filterAmount" type="number" placeholder="Monto" 
                   class="bg-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500">
          </div>
        </div>

        <!-- Offers List Mobile -->
        <div class="md:hidden space-y-3">
          <div v-for="offer in filteredOffers" :key="offer.id" 
               class="bg-gray-800 rounded-lg p-4">
            <div class="flex items-center justify-between mb-3">
              <div class="flex items-center gap-3">
                <div class="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center font-bold">
                  {{ offer.username.substring(0, 2).toUpperCase() }}
                </div>
                <div>
                  <div class="flex items-center gap-2">
                    <NuxtLink :to="`/p2p/user/${offer.username}`" 
                              class="font-semibold hover:text-yellow-400 transition cursor-pointer">
                      {{ offer.username }}
                    </NuxtLink>
                    <svg v-if="offer.verified" class="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                    </svg>
                  </div>
                  <div class="text-xs text-gray-400">{{ offer.trades }} ops | {{ offer.completion }}%</div>
                </div>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3 mb-3">
              <div>
                <div class="text-xs text-gray-400 mb-1">Precio</div>
                <div class="text-xl font-bold">{{ offer.price }}</div>
                <div class="text-xs text-gray-400">{{ filterFiat }}</div>
              </div>
              <div>
                <div class="text-xs text-gray-400 mb-1">Disponible</div>
                <div class="font-semibold">{{ offer.available }}</div>
                <div class="text-xs text-gray-400">{{ filterCrypto }}</div>
              </div>
            </div>

            <div class="mb-3">
              <div class="text-xs text-gray-400 mb-1">Límites</div>
              <div class="text-sm">{{ offer.limits }}</div>
            </div>

            <div class="mb-3">
              <span class="text-xs bg-gray-700 px-2 py-1 rounded">{{ offer.payment }}</span>
            </div>

            <div class="flex gap-2">
              <button @click="viewDetails(offer)" 
                      class="flex-1 bg-gray-700 hover:bg-gray-600 py-2.5 rounded-lg font-semibold transition text-sm">
                Ver Detalles
              </button>
              <button @click="openTrade(offer)" 
                      :class="tradeMode === 'buy' ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'"
                      class="flex-1 py-2.5 rounded-lg font-semibold transition text-sm">
                {{ tradeMode === 'buy' ? 'Comprar' : 'Vender' }}
              </button>
            </div>
          </div>
        </div>

        <!-- Offers Table Desktop -->
        <div class="hidden md:block bg-gray-800 rounded-lg overflow-hidden">
          <table class="w-full">
            <thead class="bg-gray-750 border-b border-gray-700">
              <tr class="text-xs text-gray-400">
                <th class="text-left py-3 px-4 font-normal">Comerciante</th>
                <th class="text-right py-3 px-4 font-normal">Precio</th>
                <th class="text-right py-3 px-4 font-normal">Disponible</th>
                <th class="text-left py-3 px-4 font-normal">Límites</th>
                <th class="text-left py-3 px-4 font-normal">Pago</th>
                <th class="text-center py-3 px-4 font-normal">Acción</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="offer in filteredOffers" :key="offer.id" 
                  class="border-b border-gray-700 hover:bg-gray-750 transition">
                <td class="py-4 px-4">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center font-bold text-sm">
                      {{ offer.username.substring(0, 2).toUpperCase() }}
                    </div>
                    <div>
                      <div class="flex items-center gap-2">
                        <NuxtLink :to="`/p2p/user/${offer.username}`" 
                                  class="font-semibold text-sm hover:text-yellow-400 transition cursor-pointer">
                          {{ offer.username }}
                        </NuxtLink>
                        <svg v-if="offer.verified" class="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                        </svg>
                      </div>
                      <div class="text-xs text-gray-400">{{ offer.trades }} ops | {{ offer.completion }}%</div>
                    </div>
                  </div>
                </td>
                <td class="py-4 px-4 text-right">
                  <div class="font-bold">{{ offer.price }}</div>
                  <div class="text-xs text-gray-400">{{ filterFiat }}</div>
                </td>
                <td class="py-4 px-4 text-right">
                  <div>{{ offer.available }}</div>
                  <div class="text-xs text-gray-400">{{ filterCrypto }}</div>
                </td>
                <td class="py-4 px-4">
                  <div class="text-sm">{{ offer.limits }}</div>
                </td>
                <td class="py-4 px-4">
                  <span class="text-xs bg-gray-700 px-2 py-1 rounded">{{ offer.payment }}</span>
                </td>
                <td class="py-4 px-4 text-center">
                  <div class="flex gap-2 justify-center">
                    <button @click="viewDetails(offer)" 
                            class="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold text-sm transition">
                      Ver Detalles
                    </button>
                    <button @click="openTrade(offer)" 
                            :class="tradeMode === 'buy' ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'"
                            class="px-6 py-2 rounded-lg font-semibold text-sm transition">
                      {{ tradeMode === 'buy' ? 'Comprar' : 'Vender' }}
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>

    <!-- Trade Modal -->
    <div v-if="selectedOffer" @click="selectedOffer = null" 
         class="fixed inset-0 bg-black bg-opacity-70 flex items-end md:items-center justify-center z-50 p-4">
      <div @click.stop class="bg-gray-800 rounded-2xl w-full md:max-w-lg overflow-hidden">
        <div class="bg-gray-750 px-6 py-4 flex items-center justify-between border-b border-gray-700">
          <h3 class="text-lg font-bold">{{ tradeMode === 'buy' ? 'Comprar' : 'Vender' }} {{ filterCrypto }}</h3>
          <button @click="selectedOffer = null" class="text-gray-400 hover:text-white">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <div class="p-6 max-h-96 overflow-y-auto">
          <div class="bg-gray-700 rounded-lg p-4 mb-4">
            <div class="flex items-center gap-3 mb-3">
              <div class="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center font-bold">
                {{ selectedOffer.username.substring(0, 2).toUpperCase() }}
              </div>
              <div>
                <div class="flex items-center gap-2">
                  <span class="font-semibold">{{ selectedOffer.username }}</span>
                  <svg v-if="selectedOffer.verified" class="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                  </svg>
                </div>
                <div class="text-xs text-gray-400">{{ selectedOffer.trades }} ops | {{ selectedOffer.completion }}%</div>
              </div>
            </div>
            <div class="grid grid-cols-2 gap-2">
              <div class="bg-gray-800 rounded p-2">
                <div class="text-xs text-gray-400">Precio</div>
                <div class="font-bold">{{ selectedOffer.price }} {{ filterFiat }}</div>
              </div>
              <div class="bg-gray-800 rounded p-2">
                <div class="text-xs text-gray-400">Disponible</div>
                <div class="font-bold">{{ selectedOffer.available }} {{ filterCrypto }}</div>
              </div>
            </div>
          </div>

          <div class="space-y-3 mb-4">
            <div>
              <label class="text-sm text-gray-400 block mb-2">Quiero {{ tradeMode === 'buy' ? 'gastar' : 'recibir' }}</label>
              <input v-model="tradeAmount" type="number" placeholder="100.00"
                     class="w-full bg-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-500">
              <div class="text-xs text-gray-400 mt-1">{{ filterFiat }} | Límites: {{ selectedOffer.limits }}</div>
            </div>
            <div>
              <label class="text-sm text-gray-400 block mb-2">{{ tradeMode === 'buy' ? 'Recibiré' : 'Enviaré' }}</label>
              <input :value="calculateCrypto" readonly
                     class="w-full bg-gray-700 rounded-lg px-4 py-3 text-gray-300">
              <div class="text-xs text-gray-400 mt-1">{{ filterCrypto }}</div>
            </div>
          </div>

          <div class="bg-gray-700 rounded-lg p-3 mb-4">
            <div class="text-xs text-gray-400 mb-1">Método de pago</div>
            <div class="font-semibold">{{ selectedOffer.payment }}</div>
          </div>

          <button @click="confirmTrade" 
                  :class="tradeMode === 'buy' ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'"
                  class="w-full py-3 rounded-lg font-semibold transition">
            {{ tradeMode === 'buy' ? 'Comprar' : 'Vender' }} {{ filterCrypto }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

// Definir el layout para esta página usando la sintaxis correcta de Nuxt 3
definePageMeta({
  layout: 'p2p'
});

// Estado para el modo de comercio (compra/venta)
const tradeMode = ref('buy');

// Filtros
const filterCrypto = ref('USDT');
const filterFiat = ref('USD');
const filterPayment = ref('');
const filterAmount = ref('');

// Oferta seleccionada para el modal
const selectedOffer = ref(null);
const tradeAmount = ref('');

// Datos de ejemplo para las ofertas
const offers = [
  {
    id: 1,
    username: 'trader123',
    verified: true,
    trades: 245,
    completion: 99,
    price: '1.01',
    available: '5,000.00',
    limits: '100.00 - 5,000.00',
    payment: 'Banco'
  },
  {
    id: 2,
    username: 'cryptomaster',
    verified: true,
    trades: 189,
    completion: 98,
    price: '1.02',
    available: '3,200.00',
    limits: '50.00 - 3,000.00',
    payment: 'PayPal'
  },
  {
    id: 3,
    username: 'satoshi21',
    verified: false,
    trades: 56,
    completion: 95,
    price: '1.03',
    available: '1,500.00',
    limits: '100.00 - 1,500.00',
    payment: 'Banco'
  },
  {
    id: 4,
    username: 'blockchainer',
    verified: true,
    trades: 412,
    completion: 100,
    price: '1.04',
    available: '10,000.00',
    limits: '500.00 - 10,000.00',
    payment: 'Banco'
  },
  {
    id: 5,
    username: 'cryptotrader99',
    verified: true,
    trades: 78,
    completion: 97,
    price: '1.05',
    available: '2,500.00',
    limits: '100.00 - 2,500.00',
    payment: 'PayPal'
  }
];

// Filtrar ofertas según los criterios seleccionados
const filteredOffers = computed(() => {
  return offers.filter(offer => {
    if (filterPayment.value && offer.payment !== filterPayment.value) {
      return false;
    }
    
    if (filterAmount.value) {
      const min = parseFloat(offer.limits.split(' - ')[0]);
      const max = parseFloat(offer.limits.split(' - ')[1]);
      const amount = parseFloat(filterAmount.value);
      
      if (amount < min || amount > max) {
        return false;
      }
    }
    
    return true;
  });
});

// Calcular la cantidad de crypto basada en el monto ingresado
const calculateCrypto = computed(() => {
  if (!tradeAmount.value || !selectedOffer.value) return '';
  
  const amount = parseFloat(tradeAmount.value);
  const price = parseFloat(selectedOffer.value.price);
  
  if (isNaN(amount) || isNaN(price) || price === 0) return '';
  
  return (amount / price).toFixed(6);
});

// Abrir el modal de comercio
const openTrade = (offer) => {
  selectedOffer.value = offer;
  tradeAmount.value = '';
};

// Ver detalles del anuncio
const viewDetails = (offer) => {
  navigateTo(`/p2p/offer/${offer.id}`);
};

// Confirmar la operación
const confirmTrade = () => {
  // Aquí iría la lógica para confirmar la operación
  alert(`Operación de ${tradeMode.value === 'buy' ? 'compra' : 'venta'} iniciada`);
  selectedOffer.value = null;
};
</script>