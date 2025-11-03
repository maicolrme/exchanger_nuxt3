<template>
  <div class="app-layout bg-gray-900 min-h-screen w-full" :class="{'light-mode': isLightMode}" 
       @touchstart="handleTouchStart" 
       @touchend="handleTouchEnd"
       @touchmove="handleTouchMove">
    <!-- Overlay para cuando el menú está abierto -->
    <div v-if="menuOpen" @click="toggleMenu" class="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden transition-opacity duration-300 ease-in-out"></div>
    
    <!-- Side Menu para móviles -->
    <div class="fixed inset-y-0 left-0 transform md:hidden z-50 transition duration-300 ease-in-out" 
         :class="menuOpen ? 'translate-x-0' : '-translate-x-full'">
      <div class="h-full w-72 bg-gray-800 shadow-lg overflow-y-auto">
        <div class="p-4 border-b border-gray-700 flex items-center justify-between">
          <h1 class="text-xl font-bold text-yellow-400">CryptoEx</h1>
          <button @click="toggleMenu" class="text-gray-400 hover:text-white">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        
        <!-- Usuario info (si está autenticado) -->
        <div v-if="isAuthenticated" class="p-4 border-b border-gray-700">
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-yellow-400">
              <span v-if="user?.name">{{ user.name.charAt(0).toUpperCase() }}</span>
              <span v-else>U</span>
            </div>
            <div>
              <div class="font-medium text-white">
                <span v-if="user?.name">{{ user.name }}</span>
                <span v-else>Usuario</span>
              </div>
              <div class="text-xs text-gray-400">{{ user?.email || '' }}</div>
            </div>
          </div>
        </div>
        
        <!-- Enlaces de navegación -->
       <!-- Enlaces de navegación -->
        <nav class="p-4">
          <div class="space-y-4">
            <div class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Navegación</div>
            <NuxtLink to="/" class="flex items-center space-x-3 text-gray-300 hover:text-white hover:bg-gray-700 p-2 rounded-lg transition">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
              </svg>
              <span>Inicio</span>
            </NuxtLink>
            <NuxtLink to="/markets" class="flex items-center space-x-3 text-gray-300 hover:text-white hover:bg-gray-700 p-2 rounded-lg transition">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
              </svg>
              <span>Markets</span>
            </NuxtLink>
            <NuxtLink to="/p2p" class="flex items-center space-x-3 text-white bg-gray-700 p-2 rounded-lg transition">
              <svg class="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path>
              </svg>
              <span>P2P</span>
            </NuxtLink>
            
            <div class="border-t border-gray-700 my-4"></div>
            
            <!-- Enlaces para usuarios no autenticados -->
            <template v-if="!isAuthenticated">
              <div class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Cuenta</div>
              <NuxtLink to="/login" class="flex items-center space-x-3 text-gray-300 hover:text-white hover:bg-gray-700 p-2 rounded-lg transition">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path>
                </svg>
                <span>Login</span>
              </NuxtLink>
              <NuxtLink to="/register" class="flex items-center space-x-3 text-gray-300 hover:text-white hover:bg-gray-700 p-2 rounded-lg transition">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path>
                </svg>
                <span>Registro</span>
              </NuxtLink>
            </template>
            
            <!-- Enlaces para usuarios autenticados -->
            <template v-else>
              <div class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Mi Cuenta</div>
              <NuxtLink to="/profile" class="flex items-center space-x-3 text-gray-300 hover:text-white hover:bg-gray-700 p-2 rounded-lg transition">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                </svg>
                <span>Mi Perfil</span>
              </NuxtLink>
              <NuxtLink to="/wallet" class="flex items-center space-x-3 text-gray-300 hover:text-white hover:bg-gray-700 p-2 rounded-lg transition">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
                </svg>
                <span>Mi Cartera</span>
              </NuxtLink>
              <NuxtLink to="/orders/history" class="flex items-center space-x-3 text-gray-300 hover:text-white hover:bg-gray-700 p-2 rounded-lg transition">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <span>Historial</span>
              </NuxtLink>
              <a href="#" @click.prevent="handleLogout" class="flex items-center space-x-3 text-gray-300 hover:text-white hover:bg-gray-700 p-2 rounded-lg transition">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                </svg>
                <span>Cerrar Sesión</span>
              </a>
            </template>
            
            <div class="border-t border-gray-700 my-4"></div>
            
            <!-- Configuración -->
            <div class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Configuración</div>
            <div class="flex items-center justify-between p-2">
              <div class="flex items-center space-x-3 text-gray-300">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path v-if="isLightMode" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h1M3 12H2m8.042-8.485l.707-.707M10.95 18.49l-.707.707m8.485-1.414l.707.707M18.49 10.95l.707-.707M18.49 13.05l.707-.707m-1.414-8.485l-.707.707M3 12h1m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path>
                  <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path>
                </svg>
                <span>Tema</span>
              </div>
              <button @click="toggleTheme" class="relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none" 
                      :class="isLightMode ? 'bg-yellow-500' : 'bg-gray-700'">
                <span class="sr-only">Toggle theme</span>
                <span class="inline-block w-4 h-4 transform bg-white rounded-full transition-transform" 
                      :class="isLightMode ? 'translate-x-6' : 'translate-x-1'"></span>
              </button>
            </div>
            <div class="flex items-center justify-between p-2">
              <div class="flex items-center space-x-3 text-gray-300">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"></path>
                </svg>
                <span>Idioma</span>
              </div>
              <select v-model="selectedLanguage" @change="changeLanguage" class="bg-gray-700 text-white text-sm py-1 px-2 rounded-lg appearance-none pr-8 cursor-pointer focus:outline-none">
                <option value="es">ES</option>
                <option value="en">EN</option>
              </select>
            </div>
          </div>
        </nav>
        
        <!-- Botón de publicar -->
        <div class="p-4 mt-4">
          <NuxtLink to="/p2p/publish" class="flex items-center justify-center w-full py-2 px-4 bg-yellow-500 text-gray-900 rounded-lg font-semibold hover:bg-yellow-400 transition">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
            {{ 'Publicar Anuncio' }}
          </NuxtLink>
        </div>
      </div>
    </div>
    
    <header class="bg-gray-800 border-b border-gray-700 sticky top-0 z-30">
      <div class="px-0 py-3 flex items-center justify-between w-full">
        <div class="flex items-center gap-4 px-4">
          <h1 class="text-xl font-bold text-yellow-400">CryptoEx</h1>
          <div class="hidden md:flex gap-4 text-sm">
            <NuxtLink to="/" class="text-gray-300 hover:text-white">Inicio</NuxtLink>
            <NuxtLink to="/markets" class="text-gray-300 hover:text-white">Mercados</NuxtLink>
            
            <NuxtLink to="/p2p" class="text-white font-semibold">P2P</NuxtLink>
          </div>
        </div>
        <div class="flex items-center gap-2 px-4">
          <!-- Botón de menú para móviles -->
          <button @click="toggleMenu" class="md:hidden text-gray-400 hover:text-white">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
          </button>
          
          <!-- Botones de Login y Registro (visible solo en desktop y cuando no está autenticado) -->
          <div v-if="!isAuthenticated" class="hidden md:flex gap-2">
            <NuxtLink to="/login" class="text-xs px-3 py-1.5 bg-gray-700 text-white rounded font-semibold hover:bg-gray-600 transition">
              Login
            </NuxtLink>
            <NuxtLink to="/register" class="text-xs px-3 py-1.5 bg-yellow-500 text-gray-900 rounded font-semibold hover:bg-yellow-400 transition">
              Registro
            </NuxtLink>
          </div>
          
          <!-- Menú de usuario (visible solo en desktop y cuando está autenticado) -->
          <div v-else class="hidden md:flex items-center gap-2">
            <div class="relative group">
              <button class="flex items-center gap-1 text-xs px-3 py-1.5 bg-gray-700 text-white rounded font-semibold hover:bg-gray-600 transition">
                <span v-if="user?.name">{{ user.name }}</span>
                <span v-else>Usuario</span>
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </button>
              <div class="absolute right-0 mt-1 w-48 bg-gray-800 border border-gray-700 rounded shadow-lg hidden group-hover:block z-50">
                <NuxtLink to="/profile" class="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white">Mi Perfil</NuxtLink>
                <NuxtLink to="/wallet" class="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white">Mi Cartera</NuxtLink>
                <NuxtLink to="/orders/history" class="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white">Historial</NuxtLink>
                <div class="border-t border-gray-700 my-1"></div>
                <a href="#" @click.prevent="handleLogout" class="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white">Cerrar Sesión</a>
              </div>
            </div>
          </div>
          
          <!-- Botón de cambio de tema (solo en desktop) -->
          <button @click="toggleTheme" class="hidden md:block text-gray-400 hover:text-white transition-colors duration-300">
            <svg v-if="isLightMode" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h1M3 12H2m8.042-8.485l.707-.707M10.95 18.49l-.707.707m8.485-1.414l.707.707M18.49 10.95l.707-.707M18.49 13.05l.707-.707m-1.414-8.485l-.707.707M3 12h1m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path>
            </svg>
            <svg v-else class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path>
            </svg>
          </button>
          
          <!-- Selector de idioma (solo en desktop) -->
          <div class="hidden md:block relative">
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
    </header>

    <div class="main-content w-full">
      <slot />
    </div>
    
   <!-- Bottom Navigation -->
    <nav class="fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700 md:hidden z-40">
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
import { ref, onMounted, watch, computed } from 'vue';
import { useRoute } from 'vue-router';

// Obtener estado de autenticación directamente del store
const authStore = useAuthStore();
const user = computed(() => authStore.user);
const isAuthenticated = computed(() => authStore.isAuthenticated);

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

// Función para cambiar el idioma (sin funcionalidad por ahora)
const changeLanguage = () => {
  localStorage.setItem('locale', selectedLanguage.value);
  console.log('Idioma seleccionado:', selectedLanguage.value);
};

// Función para abrir/cerrar el menú móvil
const toggleMenu = () => {
  menuOpen.value = !menuOpen.value;
};

// Navegación por deslizamiento mejorada con feedback visual
const navigationRoutes = ['/', '/markets', '/p2p', '/wallet', '/profile'];
let touchStartX = 0;
let touchEndX = 0;
let touchStartY = 0;
let touchEndY = 0;
let isSwipeActive = ref(false);
let swipeProgress = ref(0);
let swipeDirection = ref('');

const handleTouchStart = (e) => {
  // Solo en móviles y si no hay menú abierto
  if (window.innerWidth >= 768 || menuOpen.value) return;
  
  touchStartX = e.changedTouches[0].screenX;
  touchStartY = e.changedTouches[0].screenY;
  isSwipeActive.value = false;
  swipeProgress.value = 0;
  swipeDirection.value = '';
};

const handleTouchMove = (e) => {
  // Solo en móviles y si no hay menú abierto
  if (window.innerWidth >= 768 || menuOpen.value) return;
  
  const currentX = e.changedTouches[0].screenX;
  const currentY = e.changedTouches[0].screenY;
  const deltaX = currentX - touchStartX;
  const deltaY = Math.abs(currentY - touchStartY);
  
  // Si el movimiento vertical es mayor que el horizontal, no es un swipe horizontal
  if (deltaY > Math.abs(deltaX)) return;
  
  // Activar feedback visual si el movimiento supera 20px
  if (Math.abs(deltaX) > 20) {
    isSwipeActive.value = true;
    swipeDirection.value = deltaX > 0 ? 'right' : 'left';
    
    // Calcular progreso del swipe (0-100)
    const maxSwipe = window.innerWidth * 0.3; // 30% del ancho de pantalla
    swipeProgress.value = Math.min(Math.abs(deltaX) / maxSwipe * 100, 100);
    
    // Agregar clases CSS para feedback visual direccional
    document.body.classList.add('swipe-active');
    document.body.classList.add(`swipe-${swipeDirection.value}`);
    document.body.style.setProperty('--swipe-progress', `${swipeProgress.value}%`);
  }
};

const handleTouchEnd = (e) => {
  // Solo en móviles y si no hay menú abierto
  if (window.innerWidth >= 768 || menuOpen.value) return;
  
  touchEndX = e.changedTouches[0].screenX;
  touchEndY = e.changedTouches[0].screenY;
  
  // Limpiar feedback visual
  document.body.classList.remove('swipe-active', 'swipe-left', 'swipe-right');
  document.body.style.removeProperty('--swipe-progress');
  
  handleSwipe();
  
  // Reset valores
  isSwipeActive.value = false;
  swipeProgress.value = 0;
  swipeDirection.value = '';
};

const handleSwipe = () => {
  const swipeThreshold = 80; // Mínima distancia para considerar un swipe
  const swipeDistanceX = touchEndX - touchStartX;
  const swipeDistanceY = Math.abs(touchEndY - touchStartY);
  
  // Si el movimiento vertical es mayor que el horizontal, no es un swipe horizontal
  if (swipeDistanceY > Math.abs(swipeDistanceX)) return;
  
  // Si no supera el umbral, no hacer nada
  if (Math.abs(swipeDistanceX) < swipeThreshold) return;
  
  const currentIndex = navigationRoutes.indexOf(route.path);
  if (currentIndex === -1) return;
  
  let nextIndex;
  let transitionName;
  
  if (swipeDistanceX > 0) {
    // Swipe hacia la derecha - ir a la página anterior (izquierda)
    nextIndex = currentIndex > 0 ? currentIndex - 1 : navigationRoutes.length - 1;
    transitionName = 'slide-right'; // La nueva página viene desde la izquierda
  } else {
    // Swipe hacia la izquierda - ir a la página siguiente (derecha)
    nextIndex = currentIndex < navigationRoutes.length - 1 ? currentIndex + 1 : 0;
    transitionName = 'slide-left'; // La nueva página viene desde la derecha
  }
  
  // Configurar la transición direccional
  const nuxtApp = useNuxtApp();
  nuxtApp.$router.options.pageTransition = {
    name: transitionName,
    mode: 'out-in',
    duration: 400,
    css: true
  };
  
  // Agregar clase de transición antes de navegar
  document.body.classList.add('page-transitioning');
  
  // Navegar a la nueva ruta con transición direccional
  navigateTo(navigationRoutes[nextIndex]);
  
  // Remover clase después de la transición y restaurar transición por defecto
  setTimeout(() => {
    document.body.classList.remove('page-transitioning');
    // Restaurar transición por defecto
    nuxtApp.$router.options.pageTransition = {
      name: 'slide',
      mode: 'out-in',
      duration: 400,
      css: false
    };
  }, 450);
};

// Función para cerrar sesión
const handleLogout = async () => {
  await authStore.logout();
  window.location.href = '/login';
};

// Cerrar el menú cuando cambia la ruta
watch(() => route.path, () => {
  menuOpen.value = false;
});

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

/* Feedback visual para deslizamiento estilo Instagram */
body.swipe-active {
  overflow-x: hidden;
}

body.swipe-active::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(251, 191, 36, 0.1) var(--swipe-progress, 0%),
    transparent 100%
  );
  pointer-events: none;
  z-index: 9999;
  transition: opacity 0.1s ease;
}

body.swipe-active[data-swipe-direction="left"]::before {
  background: linear-gradient(
    270deg,
    transparent 0%,
    rgba(251, 191, 36, 0.1) var(--swipe-progress, 0%),
    transparent 100%
  );
}

/* Indicador de dirección de swipe */
body.swipe-active::after {
  content: '';
  position: fixed;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 60px;
  background: rgba(251, 191, 36, 0.8);
  border-radius: 2px;
  opacity: calc(var(--swipe-progress, 0%) / 100);
  transition: opacity 0.1s ease;
  z-index: 10000;
}

body.swipe-active[data-swipe-direction="right"]::after {
  left: 20px;
  box-shadow: 0 0 20px rgba(251, 191, 36, 0.5);
}

body.swipe-active[data-swipe-direction="left"]::after {
  right: 20px;
  box-shadow: 0 0 20px rgba(251, 191, 36, 0.5);
}

/* Transición de página mejorada */
body.page-transitioning {
  overflow: hidden;
}

body.page-transitioning .app-layout {
  transition: transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

/* Estilos para navegación por deslizamiento */
.swipe-container {
  touch-action: pan-y; /* Permite scroll vertical pero controla el horizontal */
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