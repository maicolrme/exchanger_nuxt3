<script setup>
// Composables y utilidades
const { $pusher } = useNuxtApp()
const route = useRoute()
const router = useRouter()
const tradeApi = useTradeApi()
import { useAuthStore } from '~/stores/auth';

// ID del trade desde la URL
const tradeId = computed(() => route.params.id)

// Estado de carga y error
const loading = ref(true)
const error = ref(null)

// Datos del trade desde la API
const trade = ref(null)
const userRole = ref(null)
const isBuyer = ref(false)
const isSeller = ref(false)
const permissions = ref(null)
const counterparty = ref(null)
const timeRemaining = ref(null)

// Estado del componente
const isLightMode = ref(false)
const timeLeft = ref('14:59')
const newMessage = ref('')
const chatFiles = ref([]) // Estado para el archivo adjunto
const chatboxRef = ref(null)
let timerInterval = null
let p2pChannel = null

// Información de pago del vendedor (mock - idealmente debe venir del backend)
const paymentInfo = ref({
  método: 'Visa',
  nombre: 'Banco Popular',
  número: '**** **** **** 1234',
  concepto: ''
})

// Mensajes de chat
const chatMessages = ref([])

// --- Computed Properties ---
const tradeTitle = computed(() => {
  if (!trade.value) return ''
  const action = isBuyer.value ? 'Comprar' : 'Vender'
  const crypto = 'USDT'
  return `${action} ${parseFloat(trade.value?.amount || 0).toFixed(2)} ${crypto}`
})

const statusText = computed(() => {
  if (!trade.value) return ''
  if (timeRemaining.value?.expired) return 'Trade expirado'
  
  const status = trade.value?.status
  if (status === 'pending') {
    return isBuyer.value 
      ? 'Esperando el pago del comprador' 
      : 'Esperando confirmación del comprador'
  }
  if (status === 'paid') {
    return isBuyer.value 
      ? 'Pago realizado, esperando liberación' 
      : 'El comprador ha confirmado el pago'
  }
  if (status === 'completed') return 'Orden completada'
  if (status === 'cancelled') return 'Orden cancelada'
  return status
})

const statusColor = computed(() => {
  if (!trade.value) return 'text-gray-400'
  const status = trade.value?.status
  if (timeRemaining.value?.expired) return 'text-red-500'
  if (status === 'completed') return 'text-green-500'
  if (status === 'paid') return 'text-yellow-400'
  if (status === 'cancelled') return 'text-red-500'
  return 'text-gray-400'
})

const amountLabel = computed(() => isBuyer.value ? 'Cantidad a pagar' : 'Cantidad a recibir')
const counterpartyName = computed(() => counterparty.value?.name || counterparty.value?.username || 'Usuario')
const counterpartyLabel = computed(() => isBuyer.value ? 'Vendedor' : 'Comprador')

const actionMessage = computed(() => {
  if (!trade.value) return ''
  if (timeRemaining.value?.expired) {
    return 'El tiempo de este trade ha expirado. Por favor, contacta con soporte si es necesario.'
  }
  
  if (trade.value?.status === 'completed') {
    return 'La transacción se ha completado con éxito.'
  }
  
  if (isBuyer.value) {
    if (trade.value?.status === 'paid') {
      return 'Has notificado al vendedor del pago. Espera a que verifique y libere las criptomonedas.'
    }
    return 'Realiza el pago al vendedor siguiendo la información proporcionada y sube el comprobante.'
  } else {
    if (trade.value?.has_payment_proof) {
      return 'El comprador ha marcado el pago como realizado y ha subido un comprobante. Verifica en tu cuenta que has recibido el importe exacto y libera las criptomonedas.'
    }
    return 'Esperando a que el comprador realice y confirme el pago.'
  }
})

// --- Métodos ---
const fetchTradeData = async () => {
  try {
    loading.value = true
    error.value = null
    
    // Llamada a la API usando el composable
    const response = await tradeApi.getTrade(tradeId.value)
    
    // Asignar datos de la respuesta
    trade.value = response.trade
    userRole.value = response.user_role
    isBuyer.value = response.is_buyer
    isSeller.value = response.is_seller
    permissions.value = response.permissions
    counterparty.value = response.counterparty
    timeRemaining.value = response.time_remaining
    
    // Inicializar concepto de pago
    if (trade.value?.trade_number) {
      paymentInfo.value.concepto = `Trade ${trade.value.trade_number}`
    }
    
    // Inicializar mensajes de chat
    initializeChatMessages()
    
    // Cargar mensajes del chat si existen
    if (trade.value?.messages && trade.value.messages.length > 0) {
      chatMessages.value = trade.value.messages.map(msg => ({
        id: msg.id,
        sender: msg.user_id === trade.value?.buyer_id 
          ? (isBuyer.value ? 'me' : 'buyer')
          : (isSeller.value ? 'me' : 'seller'),
        text: msg.message,
        attachments: msg.attachments || [],
        time: new Date(msg.created_at).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
      }))
    }
    
    // Iniciar timer si es necesario
    if (trade.value?.expires_at && !timeRemaining.value?.expired) {
      startTimer(trade.value.expires_at)
    }
    
    scrollToBottom()
    
  } catch (err) {
    console.error('Error al cargar el trade:', err)
    error.value = err.response?.data?.message || err.message || 'Error al cargar los datos del trade'
  } finally {
    loading.value = false
  }
}

const initializeChatMessages = () => {
  if (!trade.value || chatMessages.value.length > 0) return
  
  const initialMessage = isBuyer.value
    ? 'Hola, puedes proceder con el pago. Liberaré los fondos tan pronto como lo reciba.'
    : '¡Hola! Listo para realizar el pago.'
  
  chatMessages.value = [
    { 
      id: 1, 
      sender: isBuyer.value ? 'seller' : 'buyer', 
      text: initialMessage,
      time: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
    }
  ]
}

const toggleTheme = () => {
  isLightMode.value = !isLightMode.value
  if (process.client) {
    localStorage.setItem('theme', isLightMode.value ? 'light' : 'dark')
  }
}

const goBack = () => {
  router.push('/p2p/trades')
}

const handleFileUpload = async (event) => {
  const file = event.target.files[0]
  if (!file) return
  
  try {
    loading.value = true
    await tradeApi.uploadPaymentProof(tradeId.value, file)
    alert('Comprobante subido exitosamente')
    // await fetchTradeData() // Eliminado para evitar recarga
  } catch (err) {
    console.error('Error al subir comprobante:', err)
    alert(err.response?.data?.message || 'Error al subir el comprobante. Por favor, intenta de nuevo.')
  } finally {
    loading.value = false
  }
}

const startTimer = (expiresAt) => {
  if (timerInterval) clearInterval(timerInterval)
  
  timerInterval = setInterval(() => {
    const now = new Date().getTime()
    const expiry = new Date(expiresAt).getTime()
    const timeLeftMs = expiry - now

    if (timeLeftMs <= 0) {
      timeLeft.value = '00:00'
      clearInterval(timerInterval)
      // Recargar datos para actualizar el estado
      // fetchTradeData() // Eliminado para evitar recarga constante
    } else {
      const minutes = Math.floor((timeLeftMs % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((timeLeftMs % (1000 * 60)) / 1000)
      timeLeft.value = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
    }
  }, 1000)
}

const sendMessage = async () => {
  if (newMessage.value.trim() === '' && chatFiles.value.length === 0) return

  try {
    const messageText = newMessage.value
    const attachments = chatFiles.value
    
    newMessage.value = ''
    chatFiles.value = []
    
    // Agregar mensaje optimistamente a la UI
    const tempMessage = {
      id: Date.now(),
      sender: 'me',
      text: messageText,
      attachments: attachments.map(file => ({ name: file.name, url: URL.createObjectURL(file) })),
      time: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
    }
  //  chatMessages.value.push(tempMessage)
    
    // Scroll al final
    scrollToBottom()
    
    // Enviar mensaje al servidor
    await tradeApi.sendMessage(tradeId.value, messageText, attachments)
    
    // Recargar datos para obtener el mensaje real con la URL del servidor
    // await fetchTradeData() // Eliminado para evitar recarga
    
  } catch (err) {
    console.error('Error al enviar mensaje:', err)
    alert('Error al enviar el mensaje')
    // Recargar mensajes para revertir el estado optimista si falla
    // await fetchTradeData() // Eliminado para evitar recarga
  }
}

// Acciones del COMPRADOR
const confirmPayment = async () => {
  if (!permissions.value?.can_mark_paid) {
    alert('No tienes permisos para realizar esta acción')
    return
  }
  
  if (!confirm('¿Confirmas que has realizado el pago?')) {
    return
  }
  
  try {
    loading.value = true
    await tradeApi.markAsPaid(tradeId.value)
    alert('Has notificado al vendedor. Por favor, espera a que verifique el pago.')
    // await fetchTradeData() // Eliminado para evitar recarga
  } catch (err) {
    console.error('Error al marcar como pagado:', err)
    alert(err.response?.data?.message || 'Error al procesar la solicitud')
  } finally {
    loading.value = false
  }
}

// Acciones del VENDEDOR
const releaseCrypto = async () => {
  if (!permissions.value?.can_release_crypto) {
    alert('No tienes permisos para liberar las criptomonedas todavía')
    return
  }
  
  if (!confirm('¿Estás seguro de que has recibido el pago correcto y quieres liberar las criptomonedas? Esta acción es irreversible.')) {
    return
  }
  
  try {
    loading.value = true
    await tradeApi.releaseCrypto(tradeId.value)
    alert('¡Criptomonedas liberadas! La orden ha sido completada.')
    // await fetchTradeData() // Eliminado para evitar recarga
  } catch (err) {
    console.error('Error al liberar criptomonedas:', err)
    alert(err.response?.data?.message || 'Error al liberar las criptomonedas')
  } finally {
    loading.value = false
  }
}

const viewPaymentProof = () => {
  if (trade.value?.payment_proofs && trade.value.payment_proofs.length > 0) {
    const proofUrl = trade.value.payment_proofs[0].url || trade.value.payment_proofs[0].path
    window.open(proofUrl, '_blank')
  } else {
    alert('No hay comprobantes disponibles')
  }
}

// Acciones COMUNES
const cancelOrder = async () => {
  if (!permissions.value?.can_cancel) {
    alert('No puedes cancelar esta orden en su estado actual')
    return
  }
  
  if (!confirm('¿Estás seguro de que quieres cancelar esta orden?')) {
    return
  }
  
  try {
    loading.value = true
    await tradeApi.cancelTrade(tradeId.value)
    alert('Orden cancelada.')
    // await fetchTradeData() // Eliminado para evitar recarga
  } catch (err) {
    console.error('Error al cancelar orden:', err)
    alert(err.response?.data?.message || 'Error al cancelar la orden')
  } finally {
    loading.value = false
  }
}

const openDispute = async () => {
  if (!permissions.value?.can_open_dispute) {
    alert('No puedes abrir una disputa en este momento')
    return
  }
  
  const reason = prompt('Por favor, describe brevemente el motivo de la disputa:')
  if (!reason || reason.trim() === '') {
    return
  }
  
  try {
    loading.value = true
    await tradeApi.openDispute(tradeId.value, reason)
    alert('Se ha iniciado un proceso de disputa. El soporte se pondrá en contacto contigo pronto.')
    // await fetchTradeData() // Eliminado para evitar recarga
  } catch (err) {
    console.error('Error al abrir disputa:', err)
    alert(err.response?.data?.message || 'Error al abrir la disputa')
  } finally {
    loading.value = false
  }
}

const copyToClipboard = async (text) => {
  if (process.client && navigator.clipboard) {
    try {
      await navigator.clipboard.writeText(text)
      alert('¡Copiado al portapapeles!')
    } catch (err) {
      console.error('Error al copiar: ', err)
      // Fallback para navegadores más antiguos
      const textArea = document.createElement('textarea')
      textArea.value = text
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      alert('¡Copiado al portapapeles!')
    }
  }
}

const triggerFileUpload = () => {
  document.getElementById('chatFileUpload')?.click()
}

const handleChatFileUpload = async (event) => {
  const files = event.target.files
  if (!files) return

  if (chatFiles.value.length + files.length > 5) {
    alert('No puedes subir más de 5 archivos.')
    return
  }

  for (const file of files) {
    // Validar tamaño o tipo si es necesario
    if (file.size > 5 * 1024 * 1024) { // 5MB
      alert(`El archivo ${file.name} es demasiado grande. El tamaño máximo es de 5MB.`)
      continue
    }
    chatFiles.value.push(file)
  }
}

const removeChatFile = (index) => {
  chatFiles.value.splice(index, 1)
}

const scrollToBottom = async () => {
  await nextTick()
  if (chatboxRef.value) {
    chatboxRef.value.scrollTop = chatboxRef.value.scrollHeight
  }
}

// --- Ciclo de vida --
onMounted(() => {
  fetchTradeData().then(() => {
    if (process.client && $pusher && tradeId.value) {
      console.log(`Intentando suscribirse al canal: private-p2p.${tradeId.value}`);
      p2pChannel = $pusher.subscribe(`private-p2p.${tradeId.value}`);

      p2pChannel.bind('pusher:subscription_succeeded', () => {
        console.log('Suscripción a Pusher exitosa!');
      });

      p2pChannel.bind('pusher:subscription_error', (status) => {
        console.error(`Error en la suscripción a Pusher: ${status}`);
      });

      p2pChannel.bind('message.sent', (data) => {
        const newMessage = {
          id: data.message_id,
          sender: data.user.id === trade.value?.buyer_id
            ? (isBuyer.value ? 'me' : 'buyer')
            : (isSeller.value ? 'me' : 'seller'),
          text: data.message, // Corregido de data.body a data.message
          attachments: data.attachments || [],
          time: new Date(data.created_at).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
        };
        chatMessages.value.push(newMessage);
        scrollToBottom();
      });

      p2pChannel.bind('message.deleted', (data) => {
        const index = chatMessages.value.findIndex(m => m.id === data.message_id);
        if (index !== -1) {
          chatMessages.value.splice(index, 1);
        }
      });

      p2pChannel.bind('trade.marked.paid', (data) => {
        if (trade.value) {
          trade.value.status = data.status;
          alert(data.message);
        }
      });

      p2pChannel.bind('payment.proof.uploaded', (data) => {
        if (trade.value) {
          trade.value.has_payment_proof = true;
          alert(data.message);
        }
      });

      p2pChannel.bind('crypto.released', (data) => {
        if (trade.value) {
          trade.value.status = data.status;
          alert(data.message);
        }
      });

      p2pChannel.bind('trade.cancelled', (data) => {
        if (trade.value) {
          trade.value.status = data.status;
          alert(data.message);
        }
      });
    }
  });

  if (process.client) {
    const savedTheme = localStorage.getItem('theme');
    isLightMode.value = savedTheme === 'light'
    if (savedTheme) {
      isLightMode.value = savedTheme === 'light'
    }
  }
})

onBeforeUnmount(() => {
  if (timerInterval) {
    clearInterval(timerInterval)
  }
  // Desuscripción de Pusher
  if (p2pChannel) {
    p2pChannel.unbind_all()
    $pusher.unsubscribe(`private-p2p.${tradeId.value}`)
  }
})

</script>

<template>
  <div 
    class="min-h-screen transition-colors duration-300 bg-gray-900 text-white font-sans" 
    :class="{'light-mode': isLightMode}"
  >
    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center min-h-screen">
      <div class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
        <p class="text-gray-400">Cargando trade...</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="flex items-center justify-center min-h-screen px-4">
      <div class="bg-red-900/20 border border-red-500 rounded-lg p-6 max-w-md w-full text-center">
        <svg class="w-12 h-12 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <h3 class="text-xl font-bold text-red-500 mb-2">Error al cargar el trade</h3>
        <p class="text-gray-300 mb-4">{{ error }}</p>
        <div class="flex gap-3 justify-center">
          <button 
            @click="fetchTradeData" 
            class="bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-bold py-2 px-6 rounded-lg transition"
          >
            Reintentar
          </button>
          <button 
            @click="goBack" 
            class="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded-lg transition"
          >
            Volver
          </button>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div v-else class="container mx-auto px-4 py-6">
      <!-- Header con botón de regreso y toggle de tema -->
      <div class="flex justify-between items-center mb-4">
        <button 
          @click="goBack" 
          class="flex items-center gap-2 text-gray-400 hover:text-white transition"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
          </svg>
          Volver a mis trades
        </button>

       
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Columna Principal: Detalles del Trade -->
        <div class="lg:col-span-2 bg-gray-800 rounded-lg p-6 space-y-6 transition-colors duration-300 card-container">
          
          <!-- Header -->
          <div>
            <h2 class="text-2xl font-bold">{{ tradeTitle }}</h2>
            <p class="text-gray-400">
              Estado: <span class="font-semibold" :class="statusColor">{{ statusText }}</span>
            </p>
          </div>

          <!-- Detalles del Trade -->
          <div class="border-t border-b border-gray-700 py-6 space-y-4 transition-colors duration-300">
            <div class="flex justify-between items-center">
              <span class="text-gray-400">{{ amountLabel }}</span>
              <span class="text-2xl font-bold text-yellow-400">
                {{ parseFloat(trade?.total || 0).toLocaleString('es-ES', { minimumFractionDigits: 2 }) }} 
                {{ trade?.fiat_currency?.code }}
              </span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-gray-400">Cantidad Crypto</span>
              <span class="font-semibold">
                {{ parseFloat(trade?.amount || 0).toFixed(8) }} USDT
              </span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-gray-400">Precio</span>
              <span class="font-semibold">
                {{ parseFloat(trade?.price || 0).toLocaleString('es-ES', { minimumFractionDigits: 2 }) }} 
                {{ trade?.fiat_currency?.code }}
              </span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-gray-400">{{ counterpartyLabel }}</span>
              <div class="flex items-center gap-2">
                <span class="font-semibold">{{ counterpartyName }}</span>
                <span class="text-xs text-gray-500">({{ counterparty?.total_trades || 0 }} trades)</span>
              </div>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-gray-400">Método de Pago</span>
              <span class="font-semibold">{{ trade?.payment_method?.name?.es || trade?.payment_method?.name?.en }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-gray-400">ID de la Orden</span>
              <span class="font-mono text-sm">{{ trade?.trade_number }}</span>
            </div>
          </div>

          <!-- Información de Pago del Vendedor (SOLO COMPRADOR) -->
          <div v-if="isBuyer && !timeRemaining?.expired && trade?.status === 'pending'">
            <h3 class="text-lg font-bold mb-3">Información de pago del vendedor</h3>
            <div class="bg-gray-700 rounded-lg p-4 space-y-3 transition-colors duration-300 info-box">
              <div 
                v-for="(value, key) in paymentInfo" 
                :key="key" 
                class="flex justify-between items-center text-sm"
              >
                <span class="text-gray-400 capitalize">{{ key }}</span>
                <div class="flex items-center gap-2">
                  <span class="font-semibold">{{ value }}</span>
                  <button @click="copyToClipboard(value)" title="Copiar">
                    <svg class="w-4 h-4 text-gray-400 hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Timer -->
          <div 
            v-if="!timeRemaining?.expired && trade?.status !== 'completed' && trade?.status !== 'cancelled'"
            class="text-center bg-gray-700 rounded-lg p-4 transition-colors duration-300 info-box"
          >
            <p class="text-gray-400">
              {{ isBuyer ? 'Realiza el pago antes de que el tiempo se agote' : 'Tiempo restante para completar el trade' }}
            </p>
            <div class="text-4xl font-bold text-red-500 my-2">{{ timeLeft }}</div>
          </div>

          <!-- Mensaje de Acción Requerida -->
          <div class="bg-gray-700 rounded-lg p-4 text-center transition-colors duration-300 info-box">
            <h3 class="font-bold text-lg text-yellow-400">
              {{ trade?.status === 'completed' ? 'Trade Completado' : timeRemaining?.expired ? 'Trade Expirado' : 'Acción Requerida' }}
            </h3>
            <p class="text-gray-300 mt-2">{{ actionMessage }}</p>
          </div>
          
          <!-- Subir Comprobante (SOLO COMPRADOR) -->
          <div 
            v-if="isBuyer && permissions?.can_upload_proof && !timeRemaining?.expired"
            class="bg-gray-700 rounded-lg p-4 transition-colors duration-300 info-box"
          >
            <h3 class="text-lg font-bold mb-3">Subir comprobante de pago</h3>
            <div class="border border-dashed border-gray-500 rounded-lg p-4 text-center upload-area">
              <input type="file" id="paymentProof" class="hidden" @change="handleFileUpload" accept="image/*,.pdf">
              <label for="paymentProof" class="cursor-pointer flex flex-col items-center justify-center py-4">
                <svg class="w-10 h-10 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                </svg>
                <p class="text-sm text-gray-400">Haz clic para subir tu comprobante</p>
                <p class="text-xs text-gray-500 mt-1">Formatos aceptados: JPG, PNG, PDF</p>
              </label>
            </div>
            <div v-if="trade?.has_payment_proof" class="mt-2 text-center">
              <span class="text-green-500 text-sm flex items-center justify-center gap-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
                Comprobante subido
              </span>
            </div>
          </div>

          <!-- Ver Comprobante (SOLO VENDEDOR) -->
          <div 
            v-if="isSeller && trade?.has_payment_proof"
            class="bg-gray-700 rounded-lg p-4 space-y-2 transition-colors duration-300 info-box"
          >
            <h3 class="font-bold text-lg text-yellow-400">Comprobante de Pago</h3>
            <p class="text-gray-300">
              El comprador ha subido un comprobante de pago. Por favor, revísalo cuidadosamente antes de liberar las criptomonedas.
            </p>
            <button 
              @click="viewPaymentProof" 
              class="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-lg transition"
            >
              Ver Comprobante
            </button>
          </div>
          
          <!-- Términos del Trade -->
          <div 
            v-if="trade?.offer?.terms"
            class="bg-gray-700 rounded-lg p-4 transition-colors duration-300 info-box"
          >
            <h3 class="text-lg font-bold mb-3">Términos del Trade</h3>
            <div class="text-sm text-gray-400">
              <p>{{ trade.offer.terms }}</p>
            </div>
          </div>
          
          <!-- Botones de Acción -->
          <div class="flex flex-col md:flex-row gap-4 mb-4">
            <!-- Botones del COMPRADOR -->
            <template v-if="isBuyer">
              <button 
                v-if="permissions?.can_mark_paid"
                @click="confirmPayment" 
                :disabled="loading"
                class="w-full bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-bold py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                He realizado el pago, notificar al vendedor
              </button>
            </template>

            <!-- Botones del VENDEDOR -->
            <template v-if="isSeller">
              <button 
                @click="releaseCrypto" 
                :disabled="!permissions?.can_release_crypto || loading"
                class="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Liberar Criptomonedas
              </button>
            </template>

            <!-- Botones COMUNES -->
            <button 
              v-if="permissions?.can_cancel"
              @click="cancelOrder" 
              :disabled="loading"
              class="w-full bg-gray-700 hover:bg-gray-600 font-bold py-3 rounded-lg transition cancel-btn disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancelar orden
            </button>

            <button 
              v-if="permissions?.can_open_dispute"
              @click="openDispute" 
              :disabled="loading"
              class="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Iniciar Disputa
            </button>
          </div>
        </div>

        <!-- Columna Derecha: Chat -->
        <div class="bg-gray-800 rounded-lg flex flex-col h-[85vh] max-h-[85vh] transition-colors duration-300 card-container">
          <div class="p-4 border-b border-gray-700">
            <h3 class="font-bold text-lg">Chat del Trade</h3>
          </div>
          
          <!-- Mensajes del Chat -->
          <div ref="chatboxRef" class="flex-1 p-4 space-y-4 overflow-y-auto styled-scrollbar">
            <div 
              v-for="message in chatMessages" 
              :key="message.id" 
              class="flex" 
              :class="message.sender === 'me' ? 'justify-end' : 'justify-start'"
            >
              <div 
                class="max-w-xs md:max-w-md p-3 rounded-lg" 
                :class="message.sender === 'me' ? 'chat-bubble-sent rounded-br-none' : 'chat-bubble-received rounded-bl-none'"
              >
                <p v-if="message.text" class="text-sm">{{ message.text }}</p>
                
                <!-- Mostrar archivos adjuntos -->
                <div v-if="message.attachments && message.attachments.length > 0" class="mt-2 space-y-2">
                  <a 
                    v-for="(attachment, index) in message.attachments"
                    :key="index"
                    :href="attachment.url" 
                    target="_blank" 
                    class="flex items-center gap-2 text-sm font-semibold hover:underline"
                    :class="message.sender === 'me' ? 'text-gray-800' : 'text-blue-300'"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path></svg>
                    <span>{{ attachment.name }}</span>
                  </a>
                </div>
                
                <p class="text-xs text-right mt-1 opacity-70">{{ message.time }}</p>
              </div>
            </div>
          </div>
          
          <!-- Input de Chat -->
          <div class="p-4 border-t border-gray-700 transition-colors duration-300">
            
            <!-- Vista previa de archivos adjuntos -->
            <div v-if="chatFiles.length > 0" class="mb-2 space-y-2">
              <div v-for="(file, index) in chatFiles" :key="index" class="flex items-center justify-between bg-gray-700 p-2 rounded-lg">
                <div class="flex items-center gap-2 text-sm">
                  <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                  <span class="truncate">{{ file.name }}</span>
                </div>
                <button @click="removeChatFile(index)" class="p-1 text-gray-400 hover:text-white">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
              </div>
            </div>

            <form @submit.prevent="sendMessage" class="flex gap-2">
              <input type="file" id="chatFileUpload" class="hidden" @change="handleChatFileUpload" multiple>
              <button 
                type="button" 
                @click="triggerFileUpload" 
                class="p-3 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-400 hover:text-white transition"
                title="Adjuntar archivo"
              >
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path></svg>
              </button>
              <input 
                v-model="newMessage" 
                type="text" 
                placeholder="Escribe tu mensaje..." 
                class="flex-1 bg-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500 transition"
                @keydown.enter.prevent="sendMessage"
              >
              <button 
                type="submit" 
                class="bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-bold p-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                :disabled="newMessage.trim() === '' && chatFiles.length === 0"
              >
                <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"></path></svg>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
.light-mode {
  background-color: #f3f4f6; /* bg-gray-100 */
  color: #111827; /* text-gray-900 */
}
.light-mode .card-container {
  background-color: #ffffff; /* bg-white */
}
.light-mode .info-box {
  background-color: #f9fafb; /* bg-gray-50 */
}
.light-mode .chat-bubble-sent {
  background-color: #d1d5db; /* bg-gray-300 */
  color: #1f2937; /* text-gray-800 */
}
.light-mode .chat-bubble-received {
  background-color: #e5e7eb; /* bg-gray-200 */
  color: #1f2937; /* text-gray-800 */
}

/* Estilos para la barra de scroll */
.styled-scrollbar::-webkit-scrollbar {
  width: 8px;
}

.styled-scrollbar::-webkit-scrollbar-track {
  background: #1f2937; /* bg-gray-800 */
}

.styled-scrollbar::-webkit-scrollbar-thumb {
  background: #4b5563; /* bg-gray-600 */
  border-radius: 4px;
}

.styled-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #6b7280; /* bg-gray-500 */
}

/* Para Firefox */
.styled-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: #4b5563 #1f2937;
}

.light-mode .styled-scrollbar::-webkit-scrollbar-track {
  background: #e5e7eb; /* bg-gray-200 */
}

.light-mode .styled-scrollbar::-webkit-scrollbar-thumb {
  background: #9ca3af; /* bg-gray-400 */
}

.light-mode .styled-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #6b7280; /* bg-gray-500 */
}

.light-mode .styled-scrollbar {
  scrollbar-color: #9ca3af #e5e7eb;
}
</style>