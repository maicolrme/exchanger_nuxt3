<template>
  <div class="min-h-screen relative bg-gray-900 text-white">
    <!-- Header -->
    <header class="bg-gray-800 border-b border-gray-700 sticky top-0 z-50">
      <div class="px-4 py-3 flex items-center justify-between">
        <div class="flex items-center gap-4">
          <button @click="goBack" class="text-gray-400 hover:text-white">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
            </svg>
          </button>
          <h1 class="text-xl font-bold text-yellow-400">CryptoEx</h1>
        </div>
        <div class="flex items-center gap-2">
          <div class="hidden md:flex items-center gap-2">
            <svg class="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"></path>
            </svg>
            <div @click="toggleTheme" class="toggle-switch" :class="{'active': isLightMode}">
              <div class="toggle-slider"></div>
            </div>
            <svg class="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clip-rule="evenodd"></path>
            </svg>
          </div>
        </div>
      </div>
    </header>

    <!-- Contenido principal -->
    <div class="flex items-center justify-center p-4 min-h-full">
      <slot />
    </div>

    <!-- Footer -->
    <footer class="p-4 text-center text-gray-500 text-xs">
      © 2023 CryptoEx. Todos los derechos reservados.
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';

const isLightMode = ref(false);

onMounted(() => {
  // Comprueba si el modo claro estaba guardado en el almacenamiento local
  isLightMode.value = localStorage.getItem('isLightMode') === 'true';
  applyTheme();
});

watch(isLightMode, (newVal) => {
  // Cada vez que cambia, aplica el tema correspondiente
  applyTheme();
});

function toggleTheme() {
  // Invierte el valor actual (true -> false, false -> true)
  isLightMode.value = !isLightMode.value;
  // Guarda la preferencia en el almacenamiento local del navegador
  localStorage.setItem('isLightMode', isLightMode.value);
}

function applyTheme() {
  const body = document.body;
  if (isLightMode.value) {
    // Si es modo claro, añade la clase CSS '.light-mode' al body
    body.classList.add('light-mode');
  } else {
    // Si es modo oscuro, la quita
    body.classList.remove('light-mode');
  }
}

function goBack() {
  window.history.back();
}
</script>

<style>
/* Estilos globales */
* { 
  margin: 0; 
  padding: 0; 
  box-sizing: border-box; 
}

body { 
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
  transition: background-color 0.3s, color 0.3s; 
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

.light-mode .text-white { 
  color: #1a1a1a !important; 
}

.light-mode .text-gray-300 { 
  color: #666666 !important; 
}

.light-mode .text-gray-400 { 
  color: #999999 !important; 
}

/* Toggle Switch */
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
</style>