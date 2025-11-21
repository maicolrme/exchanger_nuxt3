<script setup>
// Nuxt 3 auto-importa ref, computed, onMounted, etc.
// Si usas Vue puro sin Nuxt, necesitarías: import { ref, reactive, computed, onMounted, onUnmounted, nextTick } from 'vue'

// --- Estado ---
const isLightMode = ref(false)
const newMessage = ref('')
const chatboxRef = ref(null)
let timerInterval = null

const tradeDetails = reactive({
  crypto: 'BTC',
  cryptoAmount: 0.05,
  fiat: 'EUR',
  fiatAmount: 3257.51,
  orderId: 'A4B2C1D8E6F5G7H9',
  status: 'El comprador ha confirmado el pago',
  buyerName: 'CryptoBuyer007',
  paymentConfirmed: true,
  orderCompleted: false,
  startTime: new Date().getTime(),
  durationMinutes: 30
})

const remainingTime = ref('00:00')

const chatMessages = ref([
  { id: 1, sender: 'buyer', text: '¡Hola! Ya he realizado el pago, por favor, verifica.', time: '10:45' },
  { id: 2, sender: 'me', text: 'Recibido. Voy a verificar la transferencia ahora mismo. Un momento.', time: '10:46' },
])

// --- Computed ---
const actionMessage = computed(() => {
  if (tradeDetails.orderCompleted) {
    return 'La transacción se ha completado con éxito.'
  }
  if (tradeDetails.paymentConfirmed) {
    return 'El comprador ha marcado el pago como realizado. Por favor, verifica en tu cuenta que has recibido el importe exacto y libera las criptomonedas.'
  }
  return 'Esperando a que el comprador realice y confirme el pago.'
})

const statusColor = computed(() => {
  if (tradeDetails.orderCompleted) return 'text-green-500'
  if (tradeDetails.paymentConfirmed) return 'text-yellow-400'
  return 'text-gray-400'
})

// --- Métodos ---
const toggleTheme = () => {
  isLightMode.value = !isLightMode.value
  if (process.client) {
    localStorage.setItem('theme', isLightMode.value ? 'light' : 'dark')
  }
}

const goBack = () => {
  // En Nuxt usaríamos useRouter
  const router = useRouter()
  // router.back() 
  console.log('Navegando atrás...')
}

const sendMessage = async () => {
  if (newMessage.value.trim() === '') return

  chatMessages.value.push({
    id: chatMessages.value.length + 1,
    sender: 'me',
    text: newMessage.value,
    time: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
  })
  
  newMessage.value = ''
  
  await nextTick()
  if (chatboxRef.value) {
    chatboxRef.value.scrollTop = chatboxRef.value.scrollHeight
  }
}

const releaseCrypto = () => {
  if (confirm('¿Estás seguro de que has recibido el pago correcto y quieres liberar las criptomonedas? Esta acción es irreversible.')) {
    alert('¡Criptomonedas liberadas! La orden ha sido completada.')
    tradeDetails.status = 'Orden Completada'
    tradeDetails.orderCompleted = true
  }
}

const startAppeal = () => {
  alert('Se ha iniciado un proceso de apelación. El soporte se pondrá en contacto contigo pronto.')
}

const triggerFileUpload = () => {
  alert('Función para adjuntar archivo (ej: comprobante de pago) se activaría aquí.')
}

const viewPaymentProof = () => {
  alert('Aquí se mostraría el comprobante de pago subido por el comprador.')
}

const startTimer = () => {
  timerInterval = setInterval(() => {
    const now = new Date().getTime()
    const elapsed = now - tradeDetails.startTime
    const totalDurationMs = tradeDetails.durationMinutes * 60 * 1000
    const timeLeftMs = totalDurationMs - elapsed

    if (timeLeftMs <= 0) {
      remainingTime.value = '00:00'
      clearInterval(timerInterval)
      console.log('Tiempo de operación agotado.')
    } else {
      const minutes = Math.floor((timeLeftMs % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((timeLeftMs % (1000 * 60)) / 1000)
      remainingTime.value = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
    }
  }, 1000)
}

// --- Ciclo de vida ---
onMounted(() => {
  if (process.client) {
    isLightMode.value = localStorage.getItem('theme') === 'light'
  }
  startTimer()
})

onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval)
})
</script>

<template>
  <!-- Wrapper principal que maneja el modo claro/oscuro y el fondo -->
  <div class="min-h-screen transition-colors duration-300 bg-gray-900 text-white" :class="{'light-mode': isLightMode}">
    
    

    <!-- Main Content -->
    <div class="container mx-auto px-4 py-6">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Left Column: Trade Details -->
        <div class="lg:col-span-2 bg-gray-800 rounded-lg p-6 space-y-6 transition-colors duration-300 trade-card">
          <div>
            <h2 class="text-2xl font-bold">Vender {{ tradeDetails.cryptoAmount }} {{ tradeDetails.crypto }}</h2>
            <p class="text-gray-400">Estado: <span class="font-semibold" :class="statusColor">{{ tradeDetails.status }}</span></p>
            <p class="text-gray-400" v-if="!tradeDetails.orderCompleted">Tiempo restante: <span class="font-semibold text-yellow-400">{{ remainingTime }}</span></p>
          </div>

          <div class="border-t border-b border-gray-700 py-6 space-y-4 transition-colors duration-300">
            <div class="flex justify-between items-center">
              <span class="text-gray-400">Cantidad a recibir</span>
              <span class="text-2xl font-bold text-yellow-400">{{ tradeDetails.fiatAmount.toLocaleString('es-ES') }} {{ tradeDetails.fiat }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-gray-400">Comprador</span>
              <span class="font-semibold">{{ tradeDetails.buyerName }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-gray-400">ID de la Orden</span>
              <span class="font-mono text-sm">{{ tradeDetails.orderId }}</span>
            </div>
          </div>
          
          <div class="bg-gray-700 rounded-lg p-4 text-center transition-colors duration-300 info-box">
            <h3 class="font-bold text-lg text-yellow-400">Acción Requerida</h3>
            <p class="text-gray-300 mt-2">{{ actionMessage }}</p>
          </div>

          <div class="bg-gray-700 rounded-lg p-4 space-y-2 transition-colors duration-300 info-box" v-if="tradeDetails.paymentConfirmed">
            <h3 class="font-bold text-lg text-yellow-400">Comprobante de Pago</h3>
            <p class="text-gray-300">El comprador ha subido un comprobante de pago. Por favor, revísalo cuidadosamente antes de liberar las criptomonedas.</p>
            <button @click="viewPaymentProof" class="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-lg transition">
              Ver Comprobante
            </button>
          </div>

          <div class="flex flex-col md:flex-row gap-4">
            <button @click="releaseCrypto" :disabled="!tradeDetails.paymentConfirmed" class="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed">
              Liberar Criptomonedas
            </button>
            <button @click="startAppeal" class="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-3 rounded-lg transition">
              Iniciar Apelación
            </button>
          </div>
        </div>

        <!-- Right Column: Chat -->
        <div class="bg-gray-800 rounded-lg flex flex-col h-[70vh] transition-colors duration-300 chat-container">
          <div class="p-4 border-b border-gray-700 transition-colors duration-300">
            <h3 class="font-bold">Chat con {{ tradeDetails.buyerName }}</h3>
            <div class="text-xs text-gray-400 flex items-center gap-2 mt-1">
              <span class="w-2 h-2 rounded-full bg-green-500"></span>
              En línea
            </div>
          </div>
          <div ref="chatboxRef" class="flex-1 p-4 space-y-4 overflow-y-auto scrollbar-hide">
            <!-- Chat Messages -->
            <div v-for="message in chatMessages" :key="message.id" class="flex" :class="message.sender === 'me' ? 'justify-end' : 'justify-start'">
              <div class="max-w-xs md:max-w-md p-3 rounded-lg" :class="message.sender === 'me' ? 'chat-bubble-sent rounded-br-none' : 'chat-bubble-received rounded-bl-none'">
                <p class="text-sm">{{ message.text }}</p>
                <p class="text-xs text-right mt-1 opacity-70">{{ message.time }}</p>
              </div>
            </div>
          </div>
          <div class="p-4 border-t border-gray-700 transition-colors duration-300">
            <form @submit.prevent="sendMessage" class="flex gap-2">
              <button type="button" @click="triggerFileUpload" class="bg-gray-700 hover:bg-gray-600 text-gray-300 font-bold px-4 rounded-lg transition input-area">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path></svg>
              </button>
              <input v-model="newMessage" type="text" placeholder="Escribe un mensaje..." class="flex-1 bg-gray-700 border border-gray-600 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-yellow-500 text-sm input-area text-white">
              <button type="submit" class="bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-bold px-4 rounded-lg transition">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" transform="rotate(90 12 12) translate(0 24)"></path></svg>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Utilidades personalizadas */
.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }

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
.toggle-switch.active { background-color: #fbbf24; }

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
.toggle-switch.active .toggle-slider { transform: translateX(24px); }

/* Burbujas de Chat por defecto (Dark Mode) */
.chat-bubble-sent { background-color: #fbbf24; color: #1f2937; }
.chat-bubble-received { background-color: #374151; color: white; }

/* --- Estilos Light Mode --- */
/* Se aplican cuando la clase .light-mode está presente en el contenedor raíz */

.light-mode.bg-gray-900 { background-color: #f5f5f5 !important; color: #1a1a1a !important; }
.light-mode header { background-color: #ffffff !important; border-color: #e5e5e5 !important; }
.light-mode .trade-card, 
.light-mode .chat-container { background-color: #ffffff !important; border: 1px solid #e5e5e5; color: #1a1a1a !important; }
.light-mode .info-box { background-color: #f8f8f8 !important; color: #1a1a1a !important; }
.light-mode .input-area { background-color: #f0f0f0 !important; border-color: #e5e5e5 !important; color: #1a1a1a !important; }

/* Textos en light mode */
.light-mode .text-white { color: #1a1a1a !important; }
.light-mode .text-gray-300 { color: #4b5563 !important; }
.light-mode .text-gray-400 { color: #6b7280 !important; }
.light-mode .border-gray-700 { border-color: #e5e5e5 !important; }

/* Chat en light mode */
.light-mode .chat-bubble-sent { background-color: #facc15 !important; color: #1a1a1a !important; }
.light-mode .chat-bubble-received { background-color: #e5e7eb !important; color: #1a1a1a !important; }
</style>