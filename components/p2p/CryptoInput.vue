<template>
  <div>
    <div @click="openModal" class="cursor-pointer bg-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 flex justify-between items-center">
      <span>{{ selectedCrypto ? selectedCrypto.name : 'Seleccionar Cripto' }}</span>
      <svg v-if="!selectedCrypto" class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
      <svg v-else @click.stop="clearSelection" class="w-4 h-4 text-gray-400 hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
    </div>

    <div v-if="isModalOpen" @click="closeModal" class="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div @click.stop class="bg-gray-800 rounded-2xl w-full max-w-md overflow-hidden">
        <div class="bg-gray-750 px-6 py-4 border-b border-gray-700">
          <h3 class="text-lg font-bold">Seleccionar Criptomoneda</h3>
          <input v-model="searchTerm" type="text" placeholder="Buscar criptomoneda..." class="w-full bg-gray-700 rounded-lg px-4 py-2 mt-4 focus:outline-none focus:ring-2 focus:ring-yellow-500">
        </div>
        <div class="p-6 max-h-96 overflow-y-auto">
          <ul class="space-y-2">
            <li v-for="crypto in filteredCryptos" :key="crypto.id" @click="selectCrypto(crypto)" class="p-3 hover:bg-gray-700 rounded-lg cursor-pointer transition">
              {{ crypto.name }}
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useNuxtApp } from '#app';

const { $axios } = useNuxtApp();
const props = defineProps({
  modelValue: [String, Number]
});
const emit = defineEmits(['update:modelValue']);

const isModalOpen = ref(false);
const searchTerm = ref('');
const cryptos = ref([]);
const selectedCrypto = ref(null);

const fetchCryptos = async () => {
  try {
    const response = await $axios.get('/coin');
    cryptos.value = response.data;
    updateSelectedCrypto();
  } catch (error) {
    console.error('Error fetching cryptos:', error);
  }
};

const filteredCryptos = computed(() => {
  if (!searchTerm.value) {
    return cryptos.value;
  }
  return cryptos.value.filter(crypto =>
    crypto.name.toLowerCase().includes(searchTerm.value.toLowerCase())
  );
});

const openModal = () => {
  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
};

const selectCrypto = (crypto) => {
  selectedCrypto.value = crypto;
  emit('update:modelValue', crypto.id);
  closeModal();
};

const clearSelection = () => {
  selectedCrypto.value = null;
  emit('update:modelValue', '');
};

const updateSelectedCrypto = () => {
  if (props.modelValue) {
    selectedCrypto.value = cryptos.value.find(c => c.id === props.modelValue) || null;
  } else {
    selectedCrypto.value = null;
  }
};

onMounted(fetchCryptos);

watch(() => props.modelValue, updateSelectedCrypto);
</script>