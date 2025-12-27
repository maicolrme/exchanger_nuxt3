<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick, watch } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useP2pStore } from '~/stores/p2p'

const props = defineProps({
  tradeId: {
    type: [String, Number],
    required: true
  }
})

const { $pusher } = useNuxtApp()
const authStore = useAuthStore()
const p2pStore = useP2pStore()

// Estado del chat
const newMessage = ref('')
const chatFiles = ref([])
const chatboxRef = ref(null)
let p2pChannel = null

// Estado para móvil: popup, minimizado, cerrado
const isMobile = ref(false)
const chatState = ref('closed') // 'closed', 'open', 'minimized'
const unreadCount = ref(0)
const lastReadMessageId = ref(null)

// Computed
const chatMessages = computed(() => p2pStore.chatMessages)
const currentUserId = computed(() => authStore.user?.id)

// Detectar si es móvil
const checkMobile = () => {
  if (process.client) {
    const wasMobile = isMobile.value
    isMobile.value = window.innerWidth < 768 // md breakpoint
    
    // Si cambia de desktop a móvil, cerrar el chat
    if (!wasMobile && isMobile.value) {
      chatState.value = 'closed'
    }
    // Si cambia de móvil a desktop, abrir el chat
    if (wasMobile && !isMobile.value) {
      chatState.value = 'open'
    }
  }
}

// Funciones para controlar el estado del chat en móvil
const openChat = () => {
  chatState.value = 'open'
  unreadCount.value = 0
  if (chatMessages.value.length > 0) {
    lastReadMessageId.value = chatMessages.value[chatMessages.value.length - 1].id
  }
  scrollToBottom()
}

const closeChat = () => {
  chatState.value = 'closed'
}

const minimizeChat = () => {
  chatState.value = 'minimized'
  if (chatMessages.value.length > 0) {
    lastReadMessageId.value = chatMessages.value[chatMessages.value.length - 1].id
  }
}

const toggleChat = () => {
  if (chatState.value === 'closed') {
    openChat()
  } else if (chatState.value === 'minimized') {
    openChat()
  } else {
    minimizeChat()
  }
}

// Métodos
const isMyMessage = (message) => {
  return message.sender_id === currentUserId.value || message.senderId === currentUserId.value
}

const sendMessage = async () => {
  if (newMessage.value.trim() === '' && chatFiles.value.length === 0) return

  try {
    const messageText = newMessage.value
    const attachments = chatFiles.value
    
    newMessage.value = ''
    chatFiles.value = []
    
    // Scroll al final
    scrollToBottom()
    
    // Enviar mensaje al servidor a través del store
    await p2pStore.sendChatMessage(props.tradeId, messageText, attachments)
    
  } catch (err) {
    console.error('Error al enviar mensaje:', err)
    alert('Error al enviar el mensaje')
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

// Configurar eventos de Pusher
const setupPusherEvents = () => {
  if (process.client && $pusher && props.tradeId) {
    console.log(`Intentando suscribirse al canal: private-p2p.${props.tradeId}`)
    p2pChannel = $pusher.instance.subscribe(`private-p2p.${props.tradeId}`)

    p2pChannel.bind('pusher:subscription_succeeded', () => {
      console.log('Suscripción a Pusher exitosa!')
    })

    p2pChannel.bind('pusher:subscription_error', (status) => {
      console.error(`Error en la suscripción a Pusher: ${status}`)
    })

    p2pChannel.bind('message.sent', (data) => {
      const newMessage = {
        id: data.message_id,
        senderId: data.user.id,
        senderName: data.user.name,
        text: data.message,
        time: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
        attachments: data.attachments || []
      }
      p2pStore.addChatMessage(newMessage)
      scrollToBottom()
    })

    p2pChannel.bind('message.deleted', (data) => {
      const index = chatMessages.value.findIndex(m => m.id === data.message_id)
      if (index !== -1) {
        chatMessages.value.splice(index, 1)
      }
    })
  }
}

// Lifecycle
onMounted(() => {
  setupPusherEvents()
  checkMobile()
  if (process.client) {
    window.addEventListener('resize', checkMobile)
    // En desktop, el chat está siempre abierto
    if (!isMobile.value) {
      chatState.value = 'open'
    }
    scrollToBottom()
  }
})

onBeforeUnmount(() => {
  if (process.client) {
    window.removeEventListener('resize', checkMobile)
  }
  // Desuscripción de Pusher
  if (p2pChannel) {
    p2pChannel.unbind_all()
    $pusher.instance.unsubscribe(`private-p2p.${props.tradeId}`)
  }
})

// Watch para hacer scroll cuando lleguen nuevos mensajes
watch(chatMessages, (newMessages) => {
  if (chatState.value === 'open') {
    scrollToBottom()
    // Actualizar último mensaje leído
    if (newMessages.length > 0) {
      lastReadMessageId.value = newMessages[newMessages.length - 1].id
      unreadCount.value = 0
    }
  } else if (chatState.value === 'minimized' || chatState.value === 'closed') {
    // Contar mensajes no leídos
    if (lastReadMessageId.value && newMessages.length > 0) {
      const lastReadIndex = newMessages.findIndex(m => m.id === lastReadMessageId.value)
      if (lastReadIndex !== -1) {
        unreadCount.value = newMessages.length - lastReadIndex - 1
      } else {
        unreadCount.value = newMessages.length
      }
    } else if (newMessages.length > 0) {
      unreadCount.value = newMessages.length
    }
  }
}, { deep: true })

</script>

<template>
  <!-- Botón flotante para móvil (solo cuando está cerrado o minimizado) -->
  <div 
    v-if="isMobile && (chatState === 'closed' || chatState === 'minimized')"
    class="fixed bottom-4 right-4 z-50 md:hidden"
  >
    <button
      @click="toggleChat"
      class="bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-bold rounded-full p-4 shadow-lg transition-all transform hover:scale-110 relative"
    >
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
      </svg>
      <!-- Badge de mensajes no leídos -->
      <span 
        v-if="unreadCount > 0"
        class="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center"
      >
        {{ unreadCount > 9 ? '9+' : unreadCount }}
      </span>
    </button>
  </div>

  <!-- Chat minimizado en móvil (barra pequeña en la parte inferior) -->
  <div
    v-if="isMobile && chatState === 'minimized'"
    class="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-gray-800 border-t border-gray-700 p-2"
  >
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2">
        <svg class="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
        </svg>
        <span class="text-sm font-semibold text-white">Chat del Trade</span>
        <span 
          v-if="unreadCount > 0"
          class="bg-red-500 text-white text-xs font-bold rounded-full px-2 py-0.5"
        >
          {{ unreadCount > 9 ? '9+' : unreadCount }} nuevo{{ unreadCount > 1 ? 's' : '' }}
        </span>
      </div>
      <div class="flex gap-2">
        <button
          @click="openChat"
          class="p-2 text-gray-400 hover:text-white transition"
          title="Expandir"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"></path>
          </svg>
        </button>
        <button
          @click="closeChat"
          class="p-2 text-gray-400 hover:text-white transition"
          title="Cerrar"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
    </div>
  </div>

  <!-- Overlay para móvil cuando el chat está abierto -->
  <div
    v-if="isMobile && chatState === 'open'"
    @click="minimizeChat"
    class="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
  ></div>

  <!-- Contenedor principal del chat -->
  <div 
    :class="[
      'bg-gray-800 rounded-lg flex flex-col transition-colors duration-300 card-container',
      isMobile && chatState === 'open' 
        ? 'fixed inset-4 z-50 md:relative md:inset-auto h-[calc(100vh-2rem)] md:h-[85vh] md:max-h-[85vh]'
        : isMobile && chatState !== 'open'
        ? 'hidden md:flex md:h-[85vh] md:max-h-[85vh]'
        : 'h-[85vh] max-h-[85vh]'
    ]"
  >
    <!-- Header con botones de control en móvil -->
    <div class="p-4 border-b border-gray-700 flex items-center justify-between">
      <h3 class="font-bold text-lg">Chat del Trade</h3>
      <div v-if="isMobile && chatState === 'open'" class="flex gap-2 md:hidden">
        <button
          @click="minimizeChat"
          class="p-2 text-gray-400 hover:text-white transition"
          title="Minimizar"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"></path>
          </svg>
        </button>
        <button
          @click="closeChat"
          class="p-2 text-gray-400 hover:text-white transition"
          title="Cerrar"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
    </div>
    
    <!-- Mensajes del Chat -->
    <div ref="chatboxRef" class="flex-1 p-4 space-y-4 overflow-y-auto styled-scrollbar">
      <div
        v-for="message in chatMessages"
        :key="message.id"
        class="flex items-start gap-2.5"
        :class="isMyMessage(message) ? 'justify-end' : 'justify-start'"
      >
        <div
          class="flex flex-col w-full max-w-[320px] leading-1.5 p-4 border-gray-200"
          :class="
            isMyMessage(message)
              ? 'bg-blue-100 rounded-l-xl rounded-br-xl'
              : 'bg-gray-100 rounded-e-xl rounded-es-xl'
          "
        >
          <div class="flex items-center space-x-2 rtl:space-x-reverse">
            <span class="text-sm font-semibold text-gray-900">{{ message.senderName }}</span>
            <span class="text-sm font-normal text-gray-500">{{ message.time }}</span>
          </div>
          <p class="text-sm font-normal py-2.5 text-gray-900">{{ message.text }}</p>
          <div v-if="message.attachments && message.attachments.length > 0" class="mt-2 space-y-2">
            <a
              v-for="attachment in message.attachments"
              :key="attachment.id"
              :href="attachment.url"
              target="_blank"
              class="flex items-center gap-2 text-sm font-semibold hover:underline"
              :class="isMyMessage(message) ? 'text-gray-800' : 'text-blue-300'"
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
</template>

<style scoped>
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

.light-mode .card-container {
  background-color: #ffffff; /* bg-white */
}
</style>

