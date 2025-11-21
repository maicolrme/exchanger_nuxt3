<template>
  <div class="app-layout bg-gray-900 min-h-screen w-full" :class="{'light-mode': isLightMode}">
    
    <div class="main-content w-full">
      <slot />
    </div>
    
    <nav class="fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700 z-40">
      <div class="flex justify-around py-3">
        <NuxtLink to="/" class="flex flex-col items-center gap-1 bottom-nav-indicator" :class="{ 'text-yellow-400 active': $route.path === '/', 'text-gray-400': $route.path !== '/' }">
          <svg class="w-6 h-6" :class="{ 'text-yellow-400': $route.path === '/', 'text-gray-400': $route.path !== '/' }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
          </svg>
          <span class="text-xs" :class="{ 'text-yellow-400': $route.path === '/', 'text-gray-400': $route.path !== '/' }">Inicio</span>
        </NuxtLink>
        <NuxtLink to="/markets" class="flex flex-col items-center gap-1 bottom-nav-indicator" :class="{ 'text-yellow-400 active': $route.path === '/markets', 'text-gray-400': $route.path !== '/markets' }">
          <svg class="w-6 h-6" :class="{ 'text-yellow-400': $route.path === '/markets', 'text-gray-400': $route.path !== '/markets' }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
          </svg>
          <span class="text-xs" :class="{ 'text-yellow-400': $route.path === '/markets', 'text-gray-400': $route.path !== '/markets' }">Mercados</span>
        </NuxtLink>
        
        <NuxtLink to="/p2p" class="flex flex-col items-center gap-1 bottom-nav-indicator" :class="{ 'text-yellow-400 active': $route.path.startsWith('/p2p'), 'text-gray-400': !$route.path.startsWith('/p2p') }">
          <svg class="w-6 h-6" :class="{ 'text-yellow-400': $route.path.startsWith('/p2p'), 'text-gray-400': !$route.path.startsWith('/p2p') }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path>
          </svg>
          <span class="text-xs" :class="{ 'text-yellow-400': $route.path.startsWith('/p2p'), 'text-gray-400': !$route.path.startsWith('/p2p') }">P2P</span>
        </NuxtLink>
        <NuxtLink to="/wallet" class="flex flex-col items-center gap-1 bottom-nav-indicator" :class="{ 'text-yellow-400 active': $route.path === '/wallet', 'text-gray-400': $route.path !== '/wallet' }">
          <svg class="w-6 h-6" :class="{ 'text-yellow-400': $route.path === '/wallet', 'text-gray-400': $route.path !== '/wallet' }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
          </svg>
          <span class="text-xs" :class="{ 'text-yellow-400': $route.path === '/wallet', 'text-gray-400': $route.path !== '/wallet' }">Wallet</span>
        </NuxtLink>
        <NuxtLink to="/profile" class="flex flex-col items-center gap-1 bottom-nav-indicator" :class="{ 'text-yellow-400 active': $route.path === '/profile', 'text-gray-400': $route.path !== '/profile' }">
          <svg class="w-6 h-6" :class="{ 'text-yellow-400': $route.path === '/profile', 'text-gray-400': $route.path !== '/profile' }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
          </svg>
          <span class="text-xs" :class="{ 'text-yellow-400': $route.path === '/profile', 'text-gray-400': $route.path !== '/profile' }">Perfil</span>
        </NuxtLink>
      </div>
    </nav>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import { useRoute } from 'vue-router';

// Obtener estado de autenticación directamente del store
const authStore = useAuthStore();
const user = computed(() => authStore.user);
const isAuthenticated = computed(() => authStore.isAuthenticated);
// Store de notificaciones para badge
const notifStore = useNotificationsStore();
const unreadCount = computed(() => notifStore.unreadCount);

// Estado para el tema
const isLightMode = ref(false);
// menuOpen ha sido eliminado ya que el side menu ha sido eliminado
const selectedLanguage = ref('es');
const route = useRoute();

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

// toggleMenu ha sido eliminado ya que el side menu ha sido eliminado
// watch para cerrar el menú en cambio de ruta ha sido eliminado

// Función para cerrar sesión
const handleLogout = async () => {
  await authStore.logout();
  window.location.href = '/login';
};

// Cargar el tema guardado y el usuario al iniciar
onMounted(() => {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    isLightMode.value = savedTheme === 'light';
  }
  
  // Inicializar idioma desde localStorage
  const savedLocale = localStorage.getItem('locale') || 'es';
  selectedLanguage.value = savedLocale;
  
  // Cargar información del usuario solo si hay token y no hay usuario
  if (process.client && authStore.token && !authStore.user) {
    authStore.loadUser();
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
  /* Espacio en la parte inferior para la navegación inferior fija */
  padding-bottom: 70px; /* Ajustar según la altura de la nav inferior (ej. 56px + padding) */
}

.main-content {
  flex: 1;
  padding: 0px 0; /* Eliminado el padding top */
}

/* Estilos para el modo claro/oscuro (Se mantienen) */
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

/* Estilos adicionales (Se mantienen) */
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

/* Mejorar la respuesta táctil en móviles */
@media (max-width: 768px) {
  .app-layout {
    touch-action: pan-y;
    -webkit-overflow-scrolling: touch;
  }
  
  /* Indicador visual sutil para swipe */
  .bottom-nav-indicator {
    position: relative;
  }
  
  .bottom-nav-indicator::after {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 50%;
    transform: translateX(-50%);
    width: 20px;
    height: 2px;
    background: linear-gradient(90deg, transparent, rgba(251, 191, 36, 0.5), transparent);
    border-radius: 1px;
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  
  .bottom-nav-indicator.active::after {
    opacity: 1;
  }
}
</style>