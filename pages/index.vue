<template>
  <div :class="isLightMode ? 'light-mode' : 'dark-mode'">
    <!-- Hero Carousel -->
    <section class="carousel-container w-full relative overflow-hidden">
      <div v-for="(slide, index) in slides" :key="index" 
           class="carousel-slide w-full" 
           :class="{'active': currentSlide === index}">
        <div class="py-16 md:py-24 w-full" :class="slide.bgClass">
          <div class="w-full">
            <div class="grid md:grid-cols-2 gap-8 items-center max-w-7xl mx-auto px-4">
              <div>
                <h2 class="text-4xl md:text-5xl font-bold mb-4">{{ slide.title }}</h2>
                <p class="text-lg md:text-xl text-gray-200 mb-6">{{ slide.description }}</p>
                <div class="flex gap-4">
                  <button @click="startTrading" class="px-6 py-3 bg-white text-gray-900 rounded-lg font-semibold hover:bg-gray-100 transform hover:scale-105 transition">
                    {{ slide.ctaText }}
                  </button>
                  <button class="px-6 py-3 border-2 border-white rounded-lg font-semibold hover:bg-white hover:text-gray-900 transition">
                    Más Información
                  </button>
                </div>
              </div>
              <div class="hidden md:flex justify-center">
                <div class="float-animation">
                  <svg class="w-64 h-64 text-white opacity-20" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"></path>
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clip-rule="evenodd"></path>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Carousel Controls -->
      <div class="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
        <button v-for="(slide, index) in slides" :key="'dot-' + index"
                @click="currentSlide = index"
                class="w-3 h-3 rounded-full transition"
                :class="currentSlide === index ? 'bg-white' : 'bg-white bg-opacity-50'">
        </button>
      </div>
    </section>

    <!-- Notificaciones -->
    <div v-if="showNotification" class="fixed top-20 right-4 max-w-sm bg-green-500 text-white p-4 rounded-lg shadow-lg z-50 animate-fade-in-down">
      <div class="flex items-center justify-between">
        <div class="flex items-center">
          <svg class="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <p>{{ notificationMessage }}</p>
        </div>
        <button @click="showNotification = false" class="ml-4 text-white hover:text-gray-200">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
    </div>

    <!-- Market Ticker -->
    <section class="bg-gray-800 border-b border-gray-700 py-3">
      <div class="container mx-auto px-4">
        <div class="flex gap-6 overflow-x-auto scrollbar-hide">
          <div v-for="ticker in tickers" :key="ticker.symbol" class="flex items-center gap-2 whitespace-nowrap">
            <span class="text-sm font-semibold">{{ ticker.symbol }}</span>
            <span class="text-sm">{{ ticker.price }}</span>
            <span class="text-xs" :class="ticker.change >= 0 ? 'price-up' : 'price-down'">
              {{ ticker.change >= 0 ? '+' : '' }}{{ ticker.change }}%
            </span>
          </div>
        </div>
      </div>
    </section>

    <!-- Stats Section -->
    <section class="py-16 bg-gray-900">
      <div class="container mx-auto px-4">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div class="stat-number">$450B+</div>
            <div class="text-gray-400 mt-2">Volumen 24h</div>
          </div>
          <div>
            <div class="stat-number">120M+</div>
            <div class="text-gray-400 mt-2">Usuarios</div>
          </div>
          <div>
            <div class="stat-number">350+</div>
            <div class="text-gray-400 mt-2">Criptomonedas</div>
          </div>
          <div>
            <div class="stat-number">0.1%</div>
            <div class="text-gray-400 mt-2">Comisiones</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Download App Section -->
    <section class="py-16 bg-gray-900">
      <div class="container mx-auto px-4">
        <div class="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 class="text-3xl md:text-4xl font-bold mb-6">Lleva el trading contigo</h2>
            <p class="text-gray-400 text-lg mb-8">Descarga nuestra aplicación móvil y opera en cualquier momento y lugar. Disponible para iOS y Android.</p>
            <div class="flex flex-wrap gap-4">
              <a href="#" class="flex items-center bg-gray-800 hover:bg-gray-700 rounded-lg px-6 py-3 transition hover-scale">
                <svg class="w-8 h-8 mr-3" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.08-.46-2.07-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.78 1.18-.19 2.31-.89 3.51-.84 1.54.07 2.7.61 3.44 1.57-3.14 1.88-2.29 6.12.82 7.33-.64 1.64-1.47 3.27-2.85 4.13zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.32 2.32-1.89 4.27-3.74 4.25z"/>
                </svg>
                <div>
                  <div class="text-xs">Descarga en</div>
                  <div class="text-sm font-semibold">App Store</div>
                </div>
              </a>
              <a href="#" class="flex items-center bg-gray-800 hover:bg-gray-700 rounded-lg px-6 py-3 transition hover-scale">
                <svg class="w-8 h-8 mr-3" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 0 1-.61-.92V2.734a1 1 0 0 1 .609-.92zm10.89 10.184l2.81-2.81 4.383 2.256c1.017.528 1.017 1.848 0 2.372l-4.383 2.256-2.81-2.81 2.81-2.81-2.81-2.81zm-.801.002L5.394 20.186l10.166-5.205-2.802-2.801a1.997 1.997 0 0 1 0-2.824l2.802-2.801L5.394 1.814 13.698 12z"/>
                </svg>
                <div>
                  <div class="text-xs">Disponible en</div>
                  <div class="text-sm font-semibold">Google Play</div>
                </div>
              </a>
            </div>
          </div>
          <div class="hidden md:block">
            <img src="https://cryptologos.cc/logos/bitcoin-btc-logo.svg" alt="App Preview" class="w-full max-w-md mx-auto float-animation">
          </div>
        </div>
      </div>
    </section>

    <!-- Partners Section -->
    <section class="py-16 bg-gray-900">
      <div class="container mx-auto px-4">
        <h2 class="text-3xl md:text-4xl font-bold text-center mb-4">Nuestros Socios</h2>
        <p class="text-gray-400 text-center mb-12">Trabajamos con los mejores en la industria para brindarte un servicio de calidad</p>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-8 items-center justify-items-center">
          <div class="hover-scale transition-transform duration-300">
            <img src="https://cryptologos.cc/logos/bitcoin-btc-logo.svg" alt="Partner 1" class="h-12">
          </div>
          <div class="hover-scale transition-transform duration-300">
            <img src="https://cryptologos.cc/logos/ethereum-eth-logo.svg" alt="Partner 2" class="h-12">
          </div>
          <div class="hover-scale transition-transform duration-300">
            <img src="https://cryptologos.cc/logos/binance-coin-bnb-logo.svg" alt="Partner 3" class="h-12">
          </div>
          <div class="hover-scale transition-transform duration-300">
            <img src="https://cryptologos.cc/logos/cardano-ada-logo.svg" alt="Partner 4" class="h-12">
          </div>
        </div>
      </div>
    </section>
    
    <!-- Benefits Section -->
    <section class="py-16 bg-gray-800">
      <div class="container mx-auto px-4">
        <div class="text-center mb-16">
          <h2 class="text-3xl md:text-4xl font-bold mb-4">Beneficios Exclusivos</h2>
          <p class="text-gray-400 text-lg max-w-2xl mx-auto">Descubre por qué millones de traders eligen CryptoEx para sus operaciones diarias</p>
        </div>
        <div class="grid md:grid-cols-4 gap-8">
          <div class="text-center hover-scale transition-transform duration-300">
            <div class="w-16 h-16 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <div class="stat-number mb-2">$50M+</div>
            <h3 class="font-bold mb-2">Liquidez Diaria</h3>
            <p class="text-gray-400 text-sm">Amplio volumen de trading y profundidad de mercado</p>
          </div>
          <div class="text-center hover-scale transition-transform duration-300">
            <div class="w-16 h-16 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
              </svg>
            </div>
            <div class="stat-number mb-2">100%</div>
            <h3 class="font-bold mb-2">Fondos Seguros</h3>
            <p class="text-gray-400 text-sm">Protección total de activos y datos personales</p>
          </div>
          <div class="text-center hover-scale transition-transform duration-300">
            <div class="w-16 h-16 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
              </svg>
            </div>
            <div class="stat-number mb-2">0.1s</div>
            <h3 class="font-bold mb-2">Ejecución</h3>
            <p class="text-gray-400 text-sm">Velocidad de ejecución de órdenes ultrarrápida</p>
          </div>
          <div class="text-center hover-scale transition-transform duration-300">
            <div class="w-16 h-16 bg-gradient-to-r from-purple-400 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
              </svg>
            </div>
            <div class="stat-number mb-2">24/7</div>
            <h3 class="font-bold mb-2">Soporte</h3>
            <p class="text-gray-400 text-sm">Asistencia profesional en múltiples idiomas</p>
          </div>
        </div>
      </div>
    </section>
    
    <!-- Features Section -->
    <section class="py-16 bg-gray-800">
      <div class="container mx-auto px-4">
        <div class="text-center mb-12">
          <h2 class="text-3xl md:text-4xl font-bold mb-4">¿Por qué elegir CryptoEx?</h2>
          <p class="text-gray-400 text-lg">La plataforma más segura y confiable para tus inversiones</p>
        </div>
        <div class="grid md:grid-cols-3 gap-8">
          <div class="bg-gray-700 rounded-lg p-6 hover:bg-gray-750 transition">
            <div class="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center mb-4">
              <svg class="w-6 h-6 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
              </svg>
            </div>
            <h3 class="text-xl font-bold mb-2">Seguridad de Nivel Mundial</h3>
            <p class="text-gray-400">Protección con autenticación de dos factores, cold storage y seguro de fondos.</p>
          </div>
          <div class="bg-gray-700 rounded-lg p-6 hover:bg-gray-750 transition">
            <div class="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center mb-4">
              <svg class="w-6 h-6 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
              </svg>
            </div>
            <h3 class="text-xl font-bold mb-2">Trading Ultra Rápido</h3>
            <p class="text-gray-400">Ejecuta órdenes en milisegundos con nuestra tecnología de matching engine.</p>
          </div>
          <div class="bg-gray-700 rounded-lg p-6 hover:bg-gray-750 transition">
            <div class="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center mb-4">
              <svg class="w-6 h-6 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
              </svg>
            </div>
            <h3 class="text-xl font-bold mb-2">Soporte 24/7</h3>
            <p class="text-gray-400">Nuestro equipo está disponible todo el día para ayudarte con cualquier consulta.</p>
          </div>
        </div>
      </div>
    </section>
    
    <!-- CTA Section -->
    <section class="py-16 bg-gradient-to-r from-yellow-500 to-yellow-600">
      <div class="container mx-auto px-4 text-center">
        <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Comienza tu viaje en Crypto hoy
        </h2>
        <p class="text-lg text-gray-800 mb-8 max-w-2xl mx-auto">
          Únete a millones de usuarios que confían en CryptoEx para comprar, vender y operar criptomonedas de forma segura.
        </p>
        <button @click="startTrading" class="px-8 py-4 bg-gray-900 text-white rounded-lg font-bold text-lg hover:bg-gray-800 transition transform hover:scale-105">
          Crear Cuenta Gratis
        </button>
        <p class="mt-4 text-gray-800">
          ¿Ya tienes una cuenta? <NuxtLink to="/login" class="font-semibold hover:text-gray-900">Inicia sesión aquí</NuxtLink>
        </p>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRouter } from '#app';


const router = useRouter();
const isLightMode = ref(false);
const showNotification = ref(false);
const notificationMessage = ref('');
const currentSlide = ref(0);

// Cargar el tema guardado al iniciar
onMounted(() => {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    isLightMode.value = savedTheme === 'light';
  }
});


definePageMeta({
  layout: 'p2p'
});

const slides = [
  {
    title: 'Opera Crypto con Confianza',
    description: 'La plataforma líder para comprar, vender y operar más de 350 criptomonedas con las comisiones más bajas del mercado.',
    ctaText: 'Comenzar Ahora',
    bgClass: 'gradient-bg'
  },
  {
    title: 'Trading P2P Seguro',
    description: 'Compra y vende criptomonedas directamente con otros usuarios utilizando más de 100 métodos de pago.',
    ctaText: 'Explorar P2P',
    bgClass: 'gradient-bg-2'
  },
  {
    title: 'Gana con tus Criptos',
    description: 'Obtén hasta un 12% de rendimiento anual en tus activos digitales con nuestros productos de ahorro.',
    ctaText: 'Empezar a Ganar',
    bgClass: 'gradient-bg-3'
  }
];

const tickers = [
  { symbol: 'BTC/USDT', price: '42,567.80', change: 2.34 },
  { symbol: 'ETH/USDT', price: '2,345.67', change: 1.56 },
  { symbol: 'BNB/USDT', price: '412.30', change: -0.78 },
  { symbol: 'SOL/USDT', price: '98.45', change: 5.67 },
  { symbol: 'ADA/USDT', price: '0.5678', change: -1.23 },
  { symbol: 'XRP/USDT', price: '0.6789', change: 0.45 },
  { symbol: 'DOT/USDT', price: '12.34', change: 3.21 },
  { symbol: 'DOGE/USDT', price: '0.1234', change: -2.34 }
];

// Cambiar slide cada 5 segundos
onMounted(() => {
  setInterval(() => {
    currentSlide.value = (currentSlide.value + 1) % slides.length;
  }, 5000);
});

function startTrading() {
  router.push('/register');
}

function showNotificationMessage(message) {
  notificationMessage.value = message;
  showNotification.value = true;
  setTimeout(() => {
    showNotification.value = false;
  }, 3000);
}
</script>

<style scoped>
/* Carousel */
.carousel-container {
  position: relative;
  overflow: hidden;
}
.carousel-slide {
  display: none;
  animation: fadeIn 0.5s;
}
.carousel-slide.active {
  display: block;
}

/* Estilos para el tema claro/oscuro */
:deep(.dark-mode) {
  background-color: #121212;
  color: #f5f5f5;
}

:deep(.light-mode) {
  background-color: #ffffff;
  color: #333333;
}
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Gradient Background */
.gradient-bg {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
.gradient-bg-2 {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}
.gradient-bg-3 {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

/* Animaciones */
@keyframes fade-in-down {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.animate-fade-in-down {
  animation: fade-in-down 0.3s ease-out;
}

/* Hover Effects */
.hover-scale {
  transition: transform 0.2s;
}
.hover-scale:hover {
  transform: scale(1.05);
}

/* Hero Animation */
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
}
.float-animation {
  animation: float 3s ease-in-out infinite;
}

/* Stats Counter */
.stat-number {
  font-size: 2.5rem;
  font-weight: 800;
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Scrollbar */
.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }

/* Price colors */
.price-up { color: #0ecb81; }
.price-down { color: #f6465d; }
</style>