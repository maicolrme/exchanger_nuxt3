<template>
  <div class_layout="app-layout bg-gray-900 min-h-screen w-full" :class="{'light-mode': isLightMode}">
    
    <!-- Contenido Principal -->
    <div class="main-content w-full">
      <slot />
    </div>
    
    <!-- Footer - Oculto en móviles -->
    <footer class="hidden md:block bg-gray-800 border-t border-gray-700 py-12 mt-auto">
      <div class="w-full px-4">
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
import { ref, onMounted } from 'vue';

// --- Lógica restante (Tema e Idioma) ---

// Estado para el tema
const isLightMode = ref(false);
const selectedLanguage = ref('es');

// Función para cambiar el tema
const toggleTheme = () => {
  isLightMode.value = !isLightMode.value;
  localStorage.setItem('theme', isLightMode.value ? 'light' : 'dark');
};

// Función para cambiar el idioma (sin funcionalidad por ahora)
const changeLanguage = () => {
  localStorage.setItem('locale', selectedLanguage.value);
  console.log('Idioma seleccionado:', selectedLanguage.value);
};

// Cargar el tema guardado y el idioma al iniciar
onMounted(() => {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    isLightMode.value = savedTheme === 'light';
  }
  
  // Inicializar idioma desde localStorage
  const savedLocale = localStorage.getItem('locale') || 'es';
  selectedLanguage.value = savedLocale;
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
  padding: 0px 0;
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
  border-color: #e5e5ea !important;
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

/* Animación suave para transiciones de página */
.page-enter-active,
.page-leave-active {
  transition: all 0.3s ease-in-out;
}

.page-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.page-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}
</style>