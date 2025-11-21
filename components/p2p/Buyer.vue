<script setup>
// En Nuxt 3, ref, reactive, onMounted, etc. se auto-importan.
// Si usaras Vue puro, necesitarías importarlos de 'vue'.

// --- Estado ---
const isLightMode = ref(false)
const timeLeft = ref('14:59')
const newMessage = ref('')
const chatbox = ref(null) // Referencia al elemento DOM del chat
let timerInterval = null

// Detalles del trade reactivos
const tradeDetails = reactive({
  crypto: 'BTC',
  cryptoAmount: 0.05,
  fiat: 'EUR',
  fiatAmount: 3257.51,
  price: 65150.25,
  orderId: 'A4B2C1D8E6F5G7H9',
  status: 'Esperando el pago del comprador',
  sellerName: 'CryptoWhale',
  paymentInfo: {
    método: 'Transferencia Bancaria',
    nombre: 'John Doe',
    iban: 'ES80 2100 0000 0000 0000 0000',
    concepto: 'Compra BTC A4B2C1'
  }
})

const chatMessages = ref([
  { id: 1, sender: 'seller', text: 'Hola, puedes proceder con el pago. Liberaré los fondos tan pronto como lo reciba.', time: '10:31' },
  { id: 2, sender: 'me', text: '¡Perfecto! Estoy en ello ahora mismo.', time: '10:32' },
])

// --- Métodos ---

const toggleTheme = () => {
  isLightMode.value = !isLightMode.value
  // Opcional: Guardar preferencia en localStorage
  if (process.client) {
    localStorage.setItem('theme', isLightMode.value ? 'light' : 'dark')
  }
}

const goBack = () => {
  const router = useRouter()
  // router.back() // Descomentar para funcionalidad real
  console.log('Navegando atrás...')
}

const handleFileUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
    alert(`Archivo ${file.name} seleccionado. Sube el comprobante cuando estés listo.`)
    // Lógica de subida al servidor iría aquí
  }
}

const startTimer = (duration) => {
  let timer = duration
  let minutes, seconds

  // Limpiamos intervalo previo si existe
  if (timerInterval) clearInterval(timerInterval)

  timerInterval = setInterval(() => {
    minutes = parseInt(timer / 60, 10)
    seconds = parseInt(timer % 60, 10)

    minutes = minutes < 10 ? "0" + minutes : minutes
    seconds = seconds < 10 ? "0" + seconds : seconds

    timeLeft.value = minutes + ":" + seconds

    if (--timer < 0) {
      timer = 0
      clearInterval(timerInterval)
      // Lógica cuando el tiempo expira
      alert('El tiempo de la orden ha expirado.')
    }
  }, 1000)
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
  
  // Esperar a que el DOM se actualice para hacer scroll
  await nextTick()
  if (chatbox.value) {
    chatbox.value.scrollTop = chatbox.value.scrollHeight
  }
}

const confirmPayment = () => {
  alert('Has notificado al vendedor. Por favor, espera a que verifique el pago y libere las criptomonedas.')
  tradeDetails.status = 'Pago realizado, esperando liberación.'
}

const cancelOrder = () => {
  if (confirm('¿Estás seguro de que quieres cancelar esta orden?')) {
    alert('Orden cancelada.')
    // Lógica de redirección
  }
}

const copyToClipboard = (text) => {
  if (process.client && navigator.clipboard) {
    navigator.clipboard.writeText(text).then(() => {
      // Podrías usar un toast notification aquí
      alert('¡Copiado al portapapeles!') 
    }).catch(err => {
      console.error('Error al copiar: ', err)
    })
  }
}

// --- Ciclo de Vida ---

onMounted(() => {
  const fifteenMinutes = 60 * 15
  startTimer(fifteenMinutes)
  
  // Recuperar tema si existe
  if (process.client) {
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme === 'light') isLightMode.value = true
  }
})

onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval)
})
</script>

<template>
  <div class="min-h-screen transition-colors duration-300 bg-gray-900 text-white font-sans" :class="{'light-mode': isLightMode}">
    
   

    <div class="container mx-auto px-4 py-6">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div class="lg:col-span-2 bg-gray-800 rounded-lg p-6 space-y-6 transition-colors duration-300 card-container">
          <div>
            <h2 class="text-2xl font-bold">Comprar {{ tradeDetails.cryptoAmount }} {{ tradeDetails.crypto }}</h2>
            <p class="text-gray-400">Estado: <span class="font-semibold text-yellow-400">{{ tradeDetails.status }}</span></p>
          </div>

          <div class="border-t border-b border-gray-700 py-6 space-y-4 transition-colors duration-300">
            <div class="flex justify-between items-center">
              <span class="text-gray-400">Cantidad a pagar</span>
              <span class="text-2xl font-bold text-yellow-400">{{ tradeDetails.fiatAmount.toLocaleString('es-ES') }} {{ tradeDetails.fiat }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-gray-400">Precio</span>
              <span class="font-semibold">{{ tradeDetails.price.toLocaleString('es-ES') }} {{ tradeDetails.fiat }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-gray-400">ID de la Orden</span>
              <span class="font-mono text-sm">{{ tradeDetails.orderId }}</span>
            </div>
          </div>

          <div>
            <h3 class="text-lg font-bold mb-3">Información de pago del vendedor</h3>
            <div class="bg-gray-700 rounded-lg p-4 space-y-3 transition-colors duration-300 info-box">
              <div v-for="(value, key) in tradeDetails.paymentInfo" :key="key" class="flex justify-between items-center text-sm">
                <span class="text-gray-400 capitalize">{{ key.replace('_', ' ') }}</span>
                <div class="flex items-center gap-2">
                  <span class="font-semibold">{{ value }}</span>
                  <button @click="copyToClipboard(value)" title="Copiar">
                    <svg class="w-4 h-4 text-gray-400 hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <div class="text-center bg-gray-700 rounded-lg p-4 mb-4 transition-colors duration-300 info-box">
            <p class="text-gray-400">Realiza el pago antes de que el tiempo se agote</p>
            <div class="text-4xl font-bold text-red-500 my-2">{{ timeLeft }}</div>
          </div>
          
          <div class="bg-gray-700 rounded-lg p-4 mb-4 transition-colors duration-300 info-box">
            <h3 class="text-lg font-bold mb-3">Subir comprobante de pago</h3>
            <div class="border border-dashed border-gray-500 rounded-lg p-4 text-center upload-area">
              <input type="file" id="paymentProof" class="hidden" @change="handleFileUpload">
              <label for="paymentProof" class="cursor-pointer flex flex-col items-center justify-center py-4">
                <svg class="w-10 h-10 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                </svg>
                <p class="text-sm text-gray-400">Haz clic para subir tu comprobante</p>
                <p class="text-xs text-gray-500 mt-1">Formatos aceptados: JPG, PNG, PDF</p>
              </label>
            </div>
          </div>
          
          <div class="bg-gray-700 rounded-lg p-4 transition-colors duration-300 info-box">
            <h3 class="text-lg font-bold mb-3">Términos del Trade</h3>
            <div class="text-sm text-gray-400 space-y-2">
              <p>1. El vendedor liberará los fondos después de confirmar el pago.</p>
              <p>2. El tiempo máximo para completar el pago es de 15 minutos.</p>
              <p>3. En caso de disputa, se revisará el comprobante de pago.</p>
              <p>4. Las transacciones son irreversibles una vez completadas.</p>
            </div>
          </div>
          
          <div class="flex flex-col md:flex-row gap-4">
            <button @click="confirmPayment" class="w-full bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-bold py-3 rounded-lg transition">
              He realizado el pago, notificar al vendedor
            </button>
            <button @click="cancelOrder" class="w-full bg-gray-700 hover:bg-gray-600 font-bold py-3 rounded-lg transition cancel-btn">
              Cancelar orden
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
/* Utilidades */
.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }

/* Toggle Switch Styles */
.toggle-switch { position: relative; width: 48px; height: 24px; background-color: #4b5563; border-radius: 12px; cursor: pointer; transition: background-color 0.3s; }
.toggle-switch.active { background-color: #fbbf24; }
.toggle-slider { position: absolute; top: 2px; left: 2px; width: 20px; height: 20px; background-color: white; border-radius: 50%; transition: transform 0.3s; }
.toggle-switch.active .toggle-slider { transform: translateX(24px); }

/* Chat Styles Base (Dark Mode Default) */
.chat-bubble-sent { background-color: #fbbf24; color: #1f2937; }
.chat-bubble-received { background-color: #374151; }

/* --- Light Mode Overrides --- */
/* Se aplican cuando el div contenedor tiene la clase .light-mode */

.light-mode.bg-gray-900 { background-color: #f5f5f5 !important; color: #1a1a1a !important; }

.light-mode header { background-color: #ffffff !important; border-color: #e5e5e5 !important; }
.light-mode header h1 { color: #d97706 !important; /* Darker yellow for better contrast */ }

.light-mode .card-container, 
.light-mode .bg-gray-800 { background-color: #ffffff !important; border: 1px solid #e5e5e5; color: #1a1a1a !important; }

.light-mode .info-box,
.light-mode .bg-gray-700 { background-color: #f8f8f8 !important; color: #1a1a1a !important; }

.light-mode .text-white { color: #1a1a1a !important; }
.light-mode .text-gray-300 { color: #666666 !important; }
.light-mode .text-gray-400 { color: #6b7280 !important; }
.light-mode .border-gray-700 { border-color: #e5e5e5 !important; }

.light-mode .chat-bubble-sent { background-color: #facc15 !important; color: #1a1a1a !important; }
.light-mode .chat-bubble-received { background-color: #e5e7eb !important; color: #1a1a1a !important; }

.light-mode .chat-input,
.light-mode input[type="text"] { background-color: #f0f0f0 !important; border-color: #e5e5e5 !important; color: #1a1a1a !important; }

.light-mode .cancel-btn { background-color: #e5e7eb !important; color: #1f2937 !important; }
.light-mode .cancel-btn:hover { background-color: #d1d5db !important; }

.light-mode .upload-area { border-color: #d1d5db !important; }
</style>