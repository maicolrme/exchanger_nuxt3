<template>
  <div>
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
            <CryptoInput v-model="filterCrypto" />
            <FiatInput v-model="filterFiat" />
            <P2pPaymentMethodInput v-model="filterPayment" />
            <input v-model="filterAmount" type="number" placeholder="Monto"
                   class="bg-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500">
          </div>
        </div>

        <!-- Loading Spinner -->
        <div v-if="loading" class="flex justify-center items-center py-10">
          <svg class="animate-spin h-10 w-10 text-yellow-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>

        <!-- Offers List Mobile -->
        <div v-if="!loading" class="md:hidden space-y-3">
          <div v-for="offer in filteredOffers" :key="offer.id"
               class="bg-gray-800 rounded-lg p-4">
            <div class="flex items-center justify-between mb-3">
              <div class="flex items-center gap-3">
                <div class="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center font-bold">
                  {{ offer.user_profile.name.substring(0, 2).toUpperCase() }}
                </div>
                <div>
                  <div class="flex items-center gap-2">
                    <NuxtLink :to="`/p2p/user/${offer.user_profile.name}`"
                              class="font-semibold hover:text-yellow-400 transition cursor-pointer">
                      {{ offer.user_profile.name }}
                    </NuxtLink>
                    <svg v-if="offer.user_profile.is_verified" class="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                    </svg>
                  </div>
                  <div class="text-xs text-gray-400">{{ offer.user_profile.total_trades }} ops | {{ offer.user_profile.completion_rate || 0 }}%</div>
                </div>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3 mb-3">
              <div>
                <div class="text-xs text-gray-400 mb-1">Precio</div>
                <div class="text-xl font-bold">{{ offer.price }}</div>
                <div class="text-xs text-gray-400">{{ offer.fiat }}</div>
              </div>
              <div>
                <div class="text-xs text-gray-400 mb-1">Disponible</div>
                <div class="font-semibold">{{ offer.available_amount }}</div>
                <div class="text-xs text-gray-400">{{ offer.currency }}</div>
              </div>
            </div>

            <div class="mb-3">
              <div class="text-xs text-gray-400 mb-1">Límites</div>
              <div class="text-sm">{{ offer.min_amount }} - {{ offer.max_amount }}</div>
            </div>

            <div class="mb-3">
              <span class="text-xs bg-gray-700 px-2 py-1 rounded">{{ offer.payment_method }}</span>
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
                      {{ offer.user_profile.name.substring(0, 2).toUpperCase() }}
                    </div>
                    <div>
                      <div class="flex items-center gap-2">
                        <NuxtLink :to="`/p2p/user/${offer.user_profile.name}`"
                                  class="font-semibold text-sm hover:text-yellow-400 transition cursor-pointer">
                          {{ offer.user_profile.name }}
                        </NuxtLink>
                        <svg v-if="offer.user_profile.is_verified" class="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                        </svg>
                      </div>
                      <div class="text-xs text-gray-400">{{ offer.user_profile.total_trades }} ops | {{ offer.user_profile.completion_rate || 0 }}%</div>
                    </div>
                  </div>
                </td>
                <td class="py-4 px-4 text-right">
                  <div class="font-bold">{{ offer.price }}</div>
                  <div class="text-xs text-gray-400">{{ offer.fiat }}</div>
                </td>
                <td class="py-4 px-4 text-right">
                  <div>{{ offer.available_amount }}</div>
                  <div class="text-xs text-gray-400">{{ offer.currency }}</div>
                </td>
                <td class="py-4 px-4">
                  <div class="text-sm">{{ offer.min_amount }} - {{ offer.max_amount }}</div>
                </td>
                <td class="py-4 px-4">
                  <span class="text-xs bg-gray-700 px-2 py-1 rounded">{{ offer.payment_method }}</span>
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
    <div v-if="selectedOffer" @click="closeTradeModal"
         class="fixed inset-0 bg-black bg-opacity-70 flex items-end md:items-center justify-center z-50 p-4">
      <div @click.stop class="bg-gray-800 rounded-2xl w-full md:max-w-lg overflow-hidden">
        <div class="bg-gray-750 px-6 py-4 flex items-center justify-between border-b border-gray-700">
          <h3 class="text-lg font-bold">
            {{ selectedOffer.type === 'buy' ? 'Comprar' : 'Vender' }} {{ selectedOffer.currency }}
          </h3>
          <button @click="closeTradeModal" class="text-gray-400 hover:text-white">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <div class="p-6 max-h-96 overflow-y-auto">
          <div class="bg-gray-700 rounded-lg p-4 mb-4">
            <div class="flex items-center gap-3 mb-3">
              <div class="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center font-bold">
                {{ selectedOffer.user_profile.name.substring(0, 2).toUpperCase() }}
              </div>
              <div>
                <div class="flex items-center gap-2">
                  <span class="font-semibold">{{ selectedOffer.user_profile.name }}</span>
                  <svg v-if="selectedOffer.user_profile.is_verified" class="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                  </svg>
                </div>
                <div class="text-xs text-gray-400">{{ selectedOffer.user_profile.total_trades }} ops | {{ selectedOffer.user_profile.completion_rate || 0 }}%</div>
              </div>
            </div>
            <div class="grid grid-cols-2 gap-2">
              <div class="bg-gray-800 rounded p-2">
                <div class="text-xs text-gray-400">Precio</div>
                <div class="font-bold">{{ selectedOffer.price }} {{ selectedOffer.fiat }}</div>
              </div>
              <div class="bg-gray-800 rounded p-2">
                <div class="text-xs text-gray-400">Disponible</div>
                <div class="font-bold">{{ selectedOffer.available_amount }} {{ selectedOffer.currency }}</div>
              </div>
            </div>
          </div>

          <div class="space-y-3 mb-4">
            <div>
              <label class="text-sm text-gray-400 block mb-2">Quiero {{ tradeMode === 'buy' ? 'gastar' : 'recibir' }}</label>
              <input v-model="tradeAmount" type="number" placeholder="100.00"
                     class="w-full bg-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-500">
              <div class="text-xs text-gray-400 mt-1">{{ selectedOffer.fiat }} | Límites: {{ selectedOffer.min_amount }} - {{ selectedOffer.max_amount }}</div>
            </div>
            <div>
              <label class="text-sm text-gray-400 block mb-2">{{ tradeMode === 'buy' ? 'Recibiré' : 'Enviaré' }}</label>
              <input :value="calculateCrypto" readonly
                     class="w-full bg-gray-700 rounded-lg px-4 py-3 text-gray-300">
              <div class="text-xs text-gray-400 mt-1">{{ selectedOffer.currency }}</div>
            </div>
          </div>

          <div class="bg-gray-700 rounded-lg p-3 mb-4">
            <div class="text-xs text-gray-400 mb-1">Método de pago</div>
            <div class="font-semibold">{{ selectedOffer.payment_method }}</div>
          </div>

          <button @click="confirmTrade"
                  :class="tradeMode === 'buy' ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'"
                  class="w-full py-3 rounded-lg font-semibold transition">
            {{ tradeMode === 'buy' ? 'Comprar' : 'Vender' }} {{ selectedOffer.currency }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useNuxtApp } from '#app';
import P2pPaymentMethodInput from '~/components/p2p/PaymentMethodInput.vue';
import CryptoInput from '~/components/p2p/CryptoInput.vue';
import FiatInput from '~/components/p2p/FiatInput.vue';
import { useNotificationsStore } from '~/stores/notifications';

const notificationsStore = useNotificationsStore();

// Definir el layout para esta página usando la sintaxis correcta de Nuxt 3


const { $axios } = useNuxtApp();

// Estado para el modo de comercio (compra/venta)
const tradeMode = ref('buy');
const loading = ref(false);

// Filtros
const filterCrypto = ref('');
const filterFiat = ref('');
const filterPayment = ref('');
const filterAmount = ref('');

// Listas para los filtros
const currencies = ref([]);
const fiatCurrencies = ref([]);
const paymentMethods = ref([]);

// Oferta seleccionada para el modal
const selectedOffer = ref(null);
const tradeAmount = ref('');

// Datos para las ofertas
const offers = ref([]);

// --- Funciones para obtener datos de la API ---

// Obtener ofertas de la API
const fetchOffers = async () => {
  loading.value = true;
  try {
    const params = new URLSearchParams();
    params.append('type', tradeMode.value);

    if (filterCrypto.value) {
      params.append('currency_id', filterCrypto.value);
    }
    if (filterFiat.value) {
      params.append('fiat_currency_id', filterFiat.value);
    }
    if (filterPayment.value) {
      params.append('payment_method_id', filterPayment.value);
    }

    const response = await $axios.get('/p2p/offers', { params });
    offers.value = response.data.data;
  } catch (error) {
    console.error('Error fetching offers:', error);
    offers.value = [];
  } finally {
    loading.value = false;
  }
};




onMounted(() => {
  fetchOffers();

});

watch([tradeMode, filterCrypto, filterFiat, filterPayment], fetchOffers);


// Filtrar ofertas según los criterios seleccionados
const filteredOffers = computed(() => {
  if (!offers.value) return [];
  let result = offers.value;

  if (filterAmount.value) {
    const amount = parseFloat(filterAmount.value);
    if (!isNaN(amount)) {
      result = result.filter(
        offer => amount >= offer.min_amount && amount <= offer.max_amount
      );
    }
  }

  return result;
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

const closeTradeModal = () => {
  selectedOffer.value = null;
};

// Ver detalles del anuncio
const viewDetails = (offer) => {
  navigateTo(`/p2p/offer/${offer.id}`);
};

// Confirmar la operación
const confirmTrade = async () => {
  if (!selectedOffer.value || !tradeAmount.value) {
    notificationsStore.addNotification({
      type: 'error',
      message: 'Por favor, introduce un monto para continuar.',
    });
    return;
  }

  try {
    const response = await $axios.post('/p2p/trades', {
      offer_id: selectedOffer.value.id,
      amount: parseFloat(tradeAmount.value),
    });

    if (response.data && response.data.data && response.data.data.id) {
      const tradeId = response.data.data.id;
      notificationsStore.addNotification({
        type: 'success',
        message: 'La orden ha sido creada exitosamente.',
      });
      closeTradeModal();
      navigateTo(`/p2p/trades/${tradeId}`);
    } else {
      notificationsStore.addNotification({
        type: 'error',
        message: 'Hubo un problema al crear la orden. Inténtalo de nuevo.',
      });
      console.error('La respuesta de la API no contiene el ID del trade.');
    }
  } catch (error) {
    notificationsStore.addNotification({
      type: 'error',
      message: error.response?.data?.message || 'Error al crear el trade. Por favor, verifica los datos e inténtalo de nuevo.',
    });
    console.error('Error al crear el trade:', error);
  }
};
</script>