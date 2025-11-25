<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useMyOffers } from '~/composables/useMyOffers'
import SkeletonLoader from '~/components/p2p/SkeletonLoader.vue'

// --- State ---
const isLightMode = ref(false)
const activeTab = ref('all')
// Modal eliminado: usaremos navegación a página de edición

// Backend: ofertas del usuario
const { offers, loading, error, fetchMyOffers, updateOffer, deleteOffer, toggleOfferStatus } = useMyOffers()

// --- Computed ---
const filteredAds = computed(() => {
  const list = offers.value || []
  if (activeTab.value === 'active') {
    return list.filter(ad => ad.isActive)
  } else if (activeTab.value === 'disabled') {
    return list.filter(ad => !ad.isActive)
  }
  return list
})

// --- Methods ---

// Theme Logic
const toggleTheme = () => {
  isLightMode.value = !isLightMode.value
  localStorage.setItem('isLightMode', isLightMode.value)
  applyTheme()
}

const applyTheme = () => {
  if (typeof document !== 'undefined') {
    const body = document.body
    if (isLightMode.value) {
      body.classList.add('light-mode')
    } else {
      body.classList.remove('light-mode')
    }
  }
}

// Ad Actions
const toggleStatus = async (ad) => {
  const next = !ad.isActive
  try {
    await toggleOfferStatus(ad.id, next)
    ad.isActive = next
  } catch (e) {
    alert('No se pudo actualizar el estado del anuncio')
  }
}

const editAd = (ad) => {
  navigateTo(`/p2p/edit/${ad.id}`)
}

// Edición gestionada en /p2p/edit/[id]

const deleteAd = async (id) => {
  if (confirm('¿Estás seguro de que quieres eliminar este anuncio? Esta acción no se puede deshacer.')) {
    try {
      await deleteOffer(id)
    } catch (e) {
      alert('No se pudo eliminar el anuncio')
    }
  }
}

// --- Lifecycle ---
onMounted(async () => {
  const savedTheme = localStorage.getItem('isLightMode')
  isLightMode.value = savedTheme === 'true'
  applyTheme()
  // Cargar ofertas del backend
  await fetchMyOffers()
})

watch(isLightMode, () => {
  applyTheme()
})

// SEO Title
useHead({
  title: 'CryptoEx - Mis Anuncios'
})
</script>

<template>
  <div class="min-h-screen bg-gray-900 text-white transition-colors duration-300">
    
    <section class="py-6 border-b border-gray-800">
      <div class="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
        <div class="flex items-center gap-4 w-full md:w-auto justify-between md:justify-start">
          <div>
            <h2 class="text-2xl font-bold text-white">Gestión de Anuncios</h2>
            <p class="text-sm text-gray-400">Administra tus ofertas visibles</p>
          </div>
          
         
        </div>

        <NuxtLink to="/p2p/publish" class="w-full md:w-auto bg-yellow-500 text-gray-900 px-6 py-2 rounded-lg font-bold hover:bg-yellow-400 flex items-center justify-center gap-2 transition-colors">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
          Crear Nuevo Anuncio
        </NuxtLink>
      </div>
    </section>

    <section class="py-6 pb-24 md:pb-6">
      <div class="container mx-auto px-4">
        
        <div class="flex gap-4 border-b border-gray-700 mb-6 overflow-x-auto scrollbar-hide">
          <button @click="activeTab = 'all'" :class="activeTab === 'all' ? 'text-yellow-400 border-yellow-400' : 'text-gray-400 border-transparent'" class="pb-3 px-2 border-b-2 font-medium whitespace-nowrap transition-colors">Todos</button>
          <button @click="activeTab = 'active'" :class="activeTab === 'active' ? 'text-yellow-400 border-yellow-400' : 'text-gray-400 border-transparent'" class="pb-3 px-2 border-b-2 font-medium whitespace-nowrap transition-colors">En Línea</button>
          <button @click="activeTab = 'disabled'" :class="activeTab === 'disabled' ? 'text-yellow-400 border-yellow-400' : 'text-gray-400 border-transparent'" class="pb-3 px-2 border-b-2 font-medium whitespace-nowrap transition-colors">Desactivados</button>
        </div>

        <div class="md:hidden space-y-4">
          <!-- Mobile Loading -->
          <div v-if="loading" class="py-8">
            <SkeletonLoader />
          </div>
          <!-- Mobile Error -->
          <div v-else-if="error" class="text-center py-12 px-6 bg-red-900/30 rounded-lg">
            <p class="text-xl font-bold text-red-400">¡Error!</p>
            <p class="mt-2 text-red-300">No se pudieron cargar tus ofertas.</p>
          </div>
          <!-- Mobile No Data -->
          <div v-else-if="filteredAds.length === 0" class="text-center py-12">
            <p class="text-xl font-semibold text-gray-500">No tienes anuncios aquí.</p>
          </div>

          <div v-else v-for="ad in filteredAds" :key="ad.id" class="bg-gray-800 rounded-lg p-4 border-l-4 shadow-sm" :class="ad.type === 'buy' ? 'border-green-500' : 'border-red-500'">
            <div class="flex justify-between items-start mb-3">
              <div>
                <span class="text-xs font-bold uppercase tracking-wider" :class="ad.type === 'buy' ? 'text-green-500' : 'text-red-500'">
                  {{ ad.type === 'buy' ? 'Compro' : 'Vendo' }}
                </span>
                <h3 class="text-lg font-bold text-white">{{ ad.crypto }} / {{ ad.fiat }}</h3>
              </div>
              <div class="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                <input type="checkbox" :id="'toggle-m-'+ad.id" class="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer" :checked="ad.isActive" @change="toggleStatus(ad)"/>
                <label :for="'toggle-m-'+ad.id" class="toggle-label block overflow-hidden h-5 rounded-full bg-gray-600 cursor-pointer"></label>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p class="text-xs text-gray-400">Precio</p>
                <p class="font-semibold text-white">{{ ad.price }} {{ ad.fiat }}</p>
              </div>
              <div>
                <p class="text-xs text-gray-400">Disponible</p>
                <p class="font-semibold text-white">{{ ad.available }} {{ ad.crypto }}</p>
              </div>
            </div>

            <div class="flex items-center justify-between border-t border-gray-700 pt-3 mt-2">
              <span class="text-xs bg-gray-700 px-2 py-1 rounded text-gray-300">{{ ad.payment }}</span>
              <div class="flex gap-2">
                <button @click="editAd(ad)" class="p-2 text-blue-400 hover:bg-gray-700 rounded transition-colors">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                </button>
                <button @click="deleteAd(ad.id)" class="p-2 text-red-400 hover:bg-gray-700 rounded transition-colors">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="hidden md:block bg-gray-800 rounded-lg overflow-hidden shadow-xl">
          <table class="w-full">
            <thead class="bg-gray-750 border-b border-gray-700">
              <tr class="text-left text-xs text-gray-400 uppercase">
                <th class="px-6 py-3 font-medium">ID / Tipo</th>
                <th class="px-6 py-3 font-medium">Activo</th>
                <th class="px-6 py-3 font-medium">Precio</th>
                <th class="px-6 py-3 font-medium">Límites / Disponible</th>
                <th class="px-6 py-3 font-medium">Método Pago</th>
                <th class="px-6 py-3 font-medium">Estado</th>
                <th class="px-6 py-3 text-center font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-700">
              <!-- Loading State -->
              <tr v-if="loading">
                <td colspan="7" class="text-center">
                  <SkeletonLoader />
                </td>
              </tr>
              <!-- Error State -->
              <tr v-else-if="error">
                <td colspan="7" class="text-center py-12 px-6 bg-red-900/30">
                  <p class="text-xl font-bold text-red-400">¡Error!</p>
                  <p class="mt-2 text-red-300">No se pudieron cargar tus ofertas.</p>
                </td>
              </tr>
              <!-- No Data State -->
              <tr v-else-if="filteredAds.length === 0">
                <td colspan="7" class="text-center py-12">
                  <p class="text-xl font-semibold text-gray-500">No tienes anuncios aquí.</p>
                </td>
              </tr>

              <tr v-else v-for="ad in filteredAds" :key="ad.id" class="hover:bg-gray-750 transition-colors">
                <td class="px-6 py-4">
                  <div class="font-mono text-xs text-gray-500 mb-1">#{{ ad.id }}</div>
                  <span :class="ad.type === 'buy' ? 'text-green-500' : 'text-red-500'" class="font-bold">
                    {{ ad.type === 'buy' ? 'COMPRA' : 'VENTA' }}
                  </span>
                  <span class="ml-1 text-sm text-white">{{ ad.crypto }}</span>
                </td>
                <td class="px-6 py-4">
                  <div class="relative inline-block w-10 align-middle select-none transition duration-200 ease-in">
                    <input type="checkbox" :id="'toggle-'+ad.id" class="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer" :checked="ad.isActive" @change="toggleStatus(ad)"/>
                    <label :for="'toggle-'+ad.id" class="toggle-label block overflow-hidden h-5 rounded-full bg-gray-600 cursor-pointer"></label>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <div class="font-bold text-lg text-white">{{ ad.price }}</div>
                  <div class="text-xs text-gray-400">{{ ad.fiat }}</div>
                </td>
                <td class="px-6 py-4">
                  <div class="text-sm text-white">Disp: {{ ad.available }} {{ ad.crypto }}</div>
                  <div class="text-xs text-gray-400">Lim: {{ ad.minLimit }} - {{ ad.maxLimit }}</div>
                </td>
                <td class="px-6 py-4">
                  <span class="px-2 py-1 rounded bg-gray-700 text-xs text-white">{{ ad.payment }}</span>
                </td>
                <td class="px-6 py-4">
                  <span :class="ad.isActive ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'" class="px-2 py-1 rounded-full text-xs font-semibold">
                    {{ ad.isActive ? 'Publicado' : 'Oculto' }}
                  </span>
                </td>
                <td class="px-6 py-4 text-center">
                  <div class="flex justify-center gap-3">
                    <button @click="editAd(ad)" class="text-blue-400 hover:text-blue-300 transition" title="Editar">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                    </button>
                    <button @click="deleteAd(ad.id)" class="text-red-400 hover:text-red-300 transition" title="Eliminar">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div v-if="filteredAds.length === 0" class="text-center py-12">
          <div class="text-gray-500 mb-2">
            <svg class="w-16 h-16 mx-auto opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>
          </div>
          <h3 class="text-lg font-medium text-gray-300">No tienes anuncios aquí</h3>
          <p class="text-gray-500 text-sm">Crea un anuncio para empezar a operar.</p>
        </div>
      </div>
    </section>

    

  </div>
</template>

<style scoped>
/* Toggle Switch Styles */
.toggle-checkbox:checked { right: 0; border-color: #10B981; }
.toggle-checkbox:checked + .toggle-label { background-color: #10B981; }
.toggle-checkbox { right: 0; z-index: 1; border-color: #D1D5DB; transition: all 0.3s; }
.toggle-label { width: 2.5rem; height: 1.25rem; transition: background-color 0.3s; }


</style>