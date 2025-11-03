<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
    <div class="max-w-4xl mx-auto">
      <h1 class="text-3xl font-bold text-gray-800 mb-8 text-center">
        🔍 Prueba de Detección de Dispositivos
      </h1>
      
      <!-- Información del dispositivo -->
      <div class="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h2 class="text-xl font-semibold text-gray-700 mb-4">📱 Información del Dispositivo</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="bg-blue-50 p-4 rounded-lg">
            <p class="text-sm text-gray-600">Tipo de Dispositivo</p>
            <p class="text-lg font-semibold text-blue-600">{{ deviceType }}</p>
          </div>
          <div class="bg-green-50 p-4 rounded-lg">
            <p class="text-sm text-gray-600">Es Móvil</p>
            <p class="text-lg font-semibold text-green-600">{{ isMobile ? '✅ Sí' : '❌ No' }}</p>
          </div>
          <div class="bg-purple-50 p-4 rounded-lg">
            <p class="text-sm text-gray-600">Es Tablet</p>
            <p class="text-lg font-semibold text-purple-600">{{ isTablet ? '✅ Sí' : '❌ No' }}</p>
          </div>
          <div class="bg-orange-50 p-4 rounded-lg">
            <p class="text-sm text-gray-600">User Agent</p>
            <p class="text-xs font-mono text-orange-600 break-all">{{ userAgent }}</p>
          </div>
        </div>
      </div>

      <!-- Ejemplo de uso del composable -->
      <div class="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h2 class="text-xl font-semibold text-gray-700 mb-4">⚙️ Ejemplo de useDeviceView</h2>
        <div class="bg-gray-50 p-4 rounded-lg">
          <p class="text-sm text-gray-600 mb-2">Componente recomendado para este dispositivo:</p>
          <div class="bg-white p-3 rounded border-l-4 border-blue-500">
            <code class="text-blue-600 font-mono">
              {{ deviceType === 'mobile' ? 'views/mobile/dashboard.vue' : 'views/desktop/dashboard.vue' }}
            </code>
          </div>
        </div>
      </div>

      <!-- Ejemplo práctico -->
      <div class="bg-white rounded-lg shadow-lg p-6">
        <h2 class="text-xl font-semibold text-gray-700 mb-4">🎯 Vista Adaptativa</h2>
        <div class="p-4 rounded-lg" :class="adaptiveClasses">
          <div v-if="isMobile" class="text-center">
            <div class="text-4xl mb-2">📱</div>
            <h3 class="text-lg font-semibold text-blue-600">Vista Móvil</h3>
            <p class="text-sm text-gray-600">Interfaz optimizada para dispositivos móviles</p>
            <div class="mt-4 space-y-2">
              <div class="bg-blue-100 p-2 rounded text-sm">Navegación táctil</div>
              <div class="bg-blue-100 p-2 rounded text-sm">Botones grandes</div>
              <div class="bg-blue-100 p-2 rounded text-sm">Layout vertical</div>
            </div>
          </div>
          <div v-else-if="isTablet" class="text-center">
            <div class="text-4xl mb-2">📟</div>
            <h3 class="text-lg font-semibold text-purple-600">Vista Tablet</h3>
            <p class="text-sm text-gray-600">Interfaz híbrida para tablets</p>
            <div class="mt-4 grid grid-cols-2 gap-2">
              <div class="bg-purple-100 p-2 rounded text-sm">Navegación mixta</div>
              <div class="bg-purple-100 p-2 rounded text-sm">Botones medianos</div>
              <div class="bg-purple-100 p-2 rounded text-sm">Layout adaptativo</div>
              <div class="bg-purple-100 p-2 rounded text-sm">Multitarea</div>
            </div>
          </div>
          <div v-else class="text-center">
            <div class="text-4xl mb-2">🖥️</div>
            <h3 class="text-lg font-semibold text-green-600">Vista Escritorio</h3>
            <p class="text-sm text-gray-600">Interfaz completa para desktop</p>
            <div class="mt-4 grid grid-cols-3 gap-2">
              <div class="bg-green-100 p-2 rounded text-sm">Navegación completa</div>
              <div class="bg-green-100 p-2 rounded text-sm">Sidebar</div>
              <div class="bg-green-100 p-2 rounded text-sm">Múltiples columnas</div>
              <div class="bg-green-100 p-2 rounded text-sm">Atajos de teclado</div>
              <div class="bg-green-100 p-2 rounded text-sm">Hover effects</div>
              <div class="bg-green-100 p-2 rounded text-sm">Tooltips</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Botón para volver -->
      <div class="text-center mt-8">
        <NuxtLink 
          to="/" 
          class="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          ← Volver al Inicio
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup>
// Usar el composable useDevice de @nuxtjs/device
const { isMobile, isTablet } = useDevice()

// Usar nuestro composable personalizado useDeviceView
const { deviceType } = useDeviceView('dashboard')

// Obtener información adicional del navegador
const userAgent = process.client ? navigator.userAgent : 'Server Side Rendering'

// Clases adaptativas basadas en el dispositivo
const adaptiveClasses = computed(() => {
  if (isMobile.value) return 'bg-blue-50 border-l-4 border-blue-500'
  if (isTablet.value) return 'bg-purple-50 border-l-4 border-purple-500'
  return 'bg-green-50 border-l-4 border-green-500'
})

// Configurar el título de la página
useHead({
  title: 'Prueba de Dispositivos - Exchanger',
  meta: [
    { name: 'description', content: 'Página de prueba para la detección de dispositivos' }
  ]
})
</script>

<style scoped>
/* Estilos específicos para la página de prueba */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>