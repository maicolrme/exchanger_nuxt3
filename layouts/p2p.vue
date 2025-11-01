<template>
  <div class="app-layout bg-gray-900 min-h-screen w-full" :class="{'light-mode': isLightMode}">
    <header class="bg-gray-800 border-b border-gray-700 sticky top-0 z-50">
      <div class="px-4 py-3 flex items-center justify-between">
        <div class="flex items-center gap-4">
          <h1 class="text-xl font-bold text-yellow-400">CryptoEx</h1>
          <div class="hidden md:flex gap-4 text-sm">
            <NuxtLink to="/markets" class="text-gray-300 hover:text-white">Mercados</NuxtLink>
            <NuxtLink to="/trade" class="text-gray-300 hover:text-white">Trading</NuxtLink>
            <NuxtLink to="/p2p" class="text-white font-semibold">P2P</NuxtLink>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <!-- Botón de menú para móviles -->
          <button @click="toggleMenu" class="md:hidden text-gray-400 hover:text-white">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path v-if="!menuOpen" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
              <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
          
          <!-- Botones de Login y Registro (visible solo en desktop) -->
          <div class="hidden md:flex gap-2">
            <NuxtLink to="/login" class="text-xs px-3 py-1.5 bg-gray-700 text-white rounded font-semibold hover:bg-gray-600 transition">
              Login
            </NuxtLink>
            <NuxtLink to="/register" class="text-xs px-3 py-1.5 bg-yellow-500 text-gray-900 rounded font-semibold hover:bg-yellow-400 transition">
              Registro
            </NuxtLink>
          </div>
          
          <!-- Botón de cambio de tema -->
          <button @click="toggleTheme" class="text-gray-400 hover:text-white transition-colors duration-300">
            <svg v-if="isLightMode" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h1M3 12H2m8.042-8.485l.707-.707M10.95 18.49l-.707.707m8.485-1.414l.707.707M18.49 10.95l.707-.707M18.49 13.05l.707-.707m-1.414-8.485l-.707.707M3 12h1m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path>
            </svg>
            <svg v-else class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path>
            </svg>
          </button>
          
          <!-- Selector de idioma -->
          <div class="relative">
            <select v-model="selectedLanguage" @change="changeLanguage" class="bg-gray-700 text-white text-sm py-1 px-2 rounded-lg appearance-none pr-8 cursor-pointer focus:outline-none focus:ring-2 focus:ring-yellow-500">
              <option value="es">ES</option>
              <option value="en">EN</option>
            </select>
            <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-1 text-white">
              <svg class="fill-current h-3 w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
              </svg>
            </div>
          </div>
          
          <!-- Botón de publicar -->
          <NuxtLink to="/p2p/publish" class="text-xs px-3 py-1.5 bg-yellow-500 text-gray-900 rounded font-semibold hover:bg-yellow-400">
            Publicar
          </NuxtLink>
        </div>
      </div>
      
      <!-- Menú móvil -->
      <div v-if="menuOpen" class="md:hidden bg-gray-800 border-t border-gray-700 py-2">
        <div class="flex flex-col px-4 space-y-2">
          <NuxtLink to="/markets" class="text-gray-300 hover:text-white py-2">Mercados</NuxtLink>
          <NuxtLink to="/trade" class="text-gray-300 hover:text-white py-2">Trading</NuxtLink>
          <NuxtLink to="/p2p" class="text-white font-semibold py-2">P2P</NuxtLink>
          <div class="border-t border-gray-700 my-2"></div>
          <NuxtLink to="/login" class="text-gray-300 hover:text-white py-2">Login</NuxtLink>
          <NuxtLink to="/register" class="text-gray-300 hover:text-white py-2">Registro</NuxtLink>
        </div>
      </div>
    </header>

    <div class="container mx-auto main-content w-full">
      <slot />
    </div>
    
    <!-- Bottom Navigation -->
    <nav class="fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700 md:hidden z-40">
      <div class="flex justify-around py-3">
        <NuxtLink to="/markets" class="flex flex-col items-center gap-1">
          <svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
          </svg>
          <span class="text-xs text-gray-400">Mercados</span>
        </NuxtLink>
        <NuxtLink to="/trade" class="flex flex-col items-center gap-1">
          <svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
          </svg>
          <span class="text-xs text-gray-400">Trading</span>
        </NuxtLink>
        <NuxtLink to="/p2p" class="flex flex-col items-center gap-1">
          <svg class="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path>
          </svg>
          <span class="text-xs text-yellow-400">P2P</span>
        </NuxtLink>
        <NuxtLink to="/profile" class="flex flex-col items-center gap-1">
          <svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
          </svg>
          <span class="text-xs text-gray-400">Perfil</span>
        </NuxtLink>
      </div>
    </nav>
    
    <!-- Footer -->
    <footer class="bg-gray-800 border-t border-gray-700 py-12 mt-auto">
      <div class="container mx-auto px-4">
        <div class="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 class="text-xl font-bold text-yellow-400 mb-4">CryptoEx</h3>
            <p class="text-gray-400 text-sm">El exchange de criptomonedas más confiable del mundo.</p>
          </div>
          <div>
            <h4 class="font-semibold mb-4">Productos</h4>
            <ul class="space-y-2 text-sm text-gray-400">
              <li><NuxtLink to="/markets" class="hover:text-white">Exchange</NuxtLink></li>
              <li><NuxtLink to="/p2p" class="hover:text-white">P2P Trading</NuxtLink></li>
              <li><NuxtLink to="/trade" class="hover:text-white">Futuros</NuxtLink></li>
              <li><NuxtLink to="#" class="hover:text-white">Earn</NuxtLink></li>
            </ul>
          </div>
          <div>
            <h4 class="font-semibold mb-4">Soporte</h4>
            <ul class="space-y-2 text-sm text-gray-400">
              <li><NuxtLink to="#" class="hover:text-white">Centro de Ayuda</NuxtLink></li>
              <li><NuxtLink to="#" class="hover:text-white">Contacto</NuxtLink></li>
              <li><NuxtLink to="#" class="hover:text-white">API</NuxtLink></li>
              <li><NuxtLink to="#" class="hover:text-white">Tarifas</NuxtLink></li>
            </ul>
          </div>
          <div>
            <h4 class="font-semibold mb-4">Legal</h4>
            <ul class="space-y-2 text-sm text-gray-400">
              <li><NuxtLink to="#" class="hover:text-white">Términos de Uso</NuxtLink></li>
              <li><NuxtLink to="#" class="hover:text-white">Privacidad</NuxtLink></li>
              <li><NuxtLink to="#" class="hover:text-white">AML & KYC</NuxtLink></li>
              <li><NuxtLink to="#" class="hover:text-white">Riesgos</NuxtLink></li>
            </ul>
          </div>
        </div>
        <div class="border-t border-gray-700 pt-8 text-center text-sm text-gray-400">
          <p>&copy; 2025 CryptoEx. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';

// Estado para el tema
const isLightMode = ref(false);
const menuOpen = ref(false);
const selectedLanguage = ref('es');
const route = useRoute();

// Función para cambiar el tema
const toggleTheme = () => {
  isLightMode.value = !isLightMode.value;
  localStorage.setItem('theme', isLightMode.value ? 'light' : 'dark');
};

// Función para cambiar el idioma
const changeLanguage = () => {
  // Aquí se implementaría la lógica para cambiar el idioma
  console.log('Idioma cambiado a:', selectedLanguage.value);
};

// Función para abrir/cerrar el menú móvil
const toggleMenu = () => {
  menuOpen.value = !menuOpen.value;
};

// Cerrar el menú cuando cambia la ruta
watch(() => route.path, () => {
  menuOpen.value = false;
});

// Cargar el tema guardado al iniciar
onMounted(() => {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    isLightMode.value = savedTheme === 'light';
  }
});
</script>

<style>
/* Estilos globales */
body {
  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  transition: background-color 0.3s, color 0.3s;
}

.app-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #111827;
  color: #ffffff;
  width: 100vw;
  max-width: 100%;
  overflow-x: hidden;
}

.main-content {
  flex: 1;
  padding: 20px 0;
}

/* Estilos para el modo claro/oscuro */
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

.light-mode .border-gray-700 {
  border-color: #e5e5e5 !important;
}

/* Estilos adicionales */
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
</style>