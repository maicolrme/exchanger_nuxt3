<template>
  <div>
    <div class="relative w-full">
      <button
        type="button"
        class="w-full bg-gray-800 border border-gray-700 rounded-lg py-2 px-3 text-sm text-left flex items-center"
        @click="openModal"
      >
        <span v-if="selectedPaymentMethodName" class="text-white">{{ selectedPaymentMethodName }}</span>
        <span v-else class="text-gray-400">Selecciona un método de pago</span>
      </button>
      <div v-if="modelValue" class="absolute inset-y-0 right-0 flex items-center pr-3">
        <button @click.stop="clearPaymentMethod" type="button" class="text-gray-400 hover:text-white">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>

    <Teleport to="body">
      <div
        v-if="showModal"
        class="fixed inset-0 z-[9999] overflow-y-auto bg-black/50 backdrop-blur-sm"
        @click.self="closeModal"
      >
        <div class="flex items-center justify-center min-h-screen px-4 py-8">
          <div class="bg-white text-gray-900 border border-gray-200 rounded-xl shadow-xl max-w-4xl w-full" @click.stop>
            <div class="px-6 py-4 flex justify-between items-center border-b border-gray-200">
              <h5 class="text-xl font-semibold text-gray-900">Selecciona un método de pago</h5>
              <button type="button" class="text-gray-500 hover:text-gray-700 text-2xl" @click="closeModal" aria-label="Close">&times;</button>
            </div>

            <div class="p-6">
              <div class="mb-6">
                <div class="relative flex items-center w-full">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <i class="fas fa-search text-gray-400"></i>
                  </div>
                  <input
                    type="text"
                    class="w-full pl-10 pr-10 py-2 bg-white border border-gray-300 text-gray-800 placeholder-gray-500 rounded-full focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    placeholder="Buscar método..."
                    v-model="searchTerm"
                  >
                  <div v-if="searchTerm" class="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <button class="text-gray-500 hover:text-gray-700 text-lg" type="button" @click="clearSearchTerm">&times;</button>
                  </div>
                </div>
              </div>

              <div v-if="loadingModal" class="text-center py-12">
                <div class="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-yellow-500 border-r-transparent align-[-0.125em]" role="status">
                  <span class="sr-only">Cargando...</span>
                </div>
              </div>

              <div v-else>
                <div v-if="popularMethods.length > 0 && !searchTerm">
                  <h6 class="text-gray-900 font-semibold text-lg mb-3">Métodos Populares</h6>
                  <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-6">
                    <div v-for="method in popularMethods" :key="method.id">
                      <div
                        class="bg-gray-50 text-gray-700 rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer transition-colors duration-200 border-2 border-transparent hover:border-yellow-500 hover:bg-gray-100"
                        :class="{ 
                          '!border-yellow-500 !bg-yellow-50 shadow-lg': modelValue === method.id 
                        }"
                        @click="selectMethod(method)"
                      >
                       <!-- <img :src="method.icon_url" :alt="method.name" class="w-12 h-12 mb-2 object-contain">-->
                        <p class="font-semibold text-sm text-center">{{ method.name }}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div v-if="filteredCategories.length > 0">
                  <div v-for="category in filteredCategories" :key="category.id" class="mb-6">
                    <h6 class="text-gray-900 font-semibold text-lg mb-3">{{ category.name }}</h6>
                    <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                      <div v-for="method in category.active_payment_methods" :key="method.id">
                        <div
                          class="bg-gray-50 text-gray-700 rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer transition-colors duration-200 border-2 border-transparent hover:border-yellow-500 hover:bg-gray-100"
                          :class="{ 
                            '!border-yellow-500 !bg-yellow-50 shadow-lg': modelValue === method.id 
                          }"
                          @click="selectMethod(method)"
                        >
                         <!--  <img :src="method.icon_url" :alt="method.name" class="w-12 h-12 mb-2 object-contain">-->
                          <p class="font-semibold text-sm text-center">{{ method.name }}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div v-if="filteredCategories.length === 0 && !loadingModal" class="text-center py-12">
                  <p class="text-gray-400 text-lg">No se encontraron métodos de pago</p>
                </div>
              </div>
            </div>

            <div class="px-6 py-4 flex justify-end border-t border-gray-200">
              <button type="button" class="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-6 rounded-lg transition-colors" @click="closeModal">Cerrar</button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
// Se eliminó 'useI18n'

const props = defineProps({
  modelValue: {
    type: [Number, String],
    default: null
  }
});

const emit = defineEmits(['update:modelValue']);

const loadingModal = ref(false);
const showModal = ref(false);
const searchTerm = ref('');
const allPaymentMethods = ref([]);
const popularMethods = ref([]);
const selectedPaymentMethodName = ref('');
const methodsLoaded = ref(false);

const config = useRuntimeConfig();
const apiBase = config.public.apiBase || ''; 

const filteredCategories = computed(() => {
  if (!searchTerm.value) {
    return allPaymentMethods.value;
  }
  const lowerSearchTerm = searchTerm.value.toLowerCase();
  
  return allPaymentMethods.value.map(category => {
    const filteredMethods = category.active_payment_methods.filter(method => {
      return method.name.toLowerCase().includes(lowerSearchTerm);
    });
    if (filteredMethods.length > 0) {
      return { ...category, active_payment_methods: filteredMethods };
    }
    return null;
  }).filter(category => category !== null);
});

const allMethodsFlat = computed(() => {
  return [
    ...popularMethods.value,
    ...allPaymentMethods.value.flatMap(c => c.active_payment_methods)
  ];
});

const updatePaymentMethodName = (id) => {
  if (!id) {
    selectedPaymentMethodName.value = '';
    return;
  }
  
  const foundMethod = allMethodsFlat.value.find(m => m.id === id);
  
  if (foundMethod) {
    selectedPaymentMethodName.value = foundMethod.name;
  } else {
    selectedPaymentMethodName.value = ''; 
  }
};

const loadPaymentMethodsData = async () => {
  if (methodsLoaded.value) return;

  loadingModal.value = true;
  try {
    const [categoriesResponse, popularResponse] = await Promise.all([
      $fetch(`${apiBase}/payment-methods`), 
      $fetch(`${apiBase}/payment-methods/popular`),
    ]);

    if (categoriesResponse.success) {
      allPaymentMethods.value = categoriesResponse.data;
    }
    if (popularResponse.success) {
      popularMethods.value = popularResponse.data;
    }
    
    methodsLoaded.value = true;
  } catch (error) {
    console.error("Error cargando métodos de pago:", error);
  } finally {
    loadingModal.value = false;
  }
};

const openModal = () => {
  showModal.value = true;
  searchTerm.value = '';
  if (!methodsLoaded.value) {
    loadPaymentMethodsData();
  }
};

const closeModal = () => {
  showModal.value = false;
};

const clearSearchTerm = () => {
  searchTerm.value = '';
};

const selectMethod = (method) => {
  emit('update:modelValue', method.id);
  selectedPaymentMethodName.value = method.name;
  closeModal();
};

const clearPaymentMethod = () => {
  emit('update:modelValue', null);
  selectedPaymentMethodName.value = '';
};

watch(() => props.modelValue, (newId) => {
  if (methodsLoaded.value) {
    updatePaymentMethodName(newId);
  } else if (!newId) {
    selectedPaymentMethodName.value = '';
  }
}, { immediate: true });

watch(methodsLoaded, (isLoaded) => {
  if (isLoaded && props.modelValue) {
    updatePaymentMethodName(props.modelValue);
  }
});

onMounted(() => {
  loadPaymentMethodsData();
});
</script>