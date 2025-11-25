<script setup>
import { useP2pStore } from '~/stores/p2p'

const props = defineProps({
  tradeId: {
    type: [String, Number],
    required: true
  },
  currentUserId: {
    type: [String, Number],
    required: false
  }
})

const emit = defineEmits(['trade-updated'])

const { $pusher } = useNuxtApp()
const p2pStore = useP2pStore()

// Estado del chat
const newMessage = ref('')
const chatFiles = ref([])
const chatboxRef = ref(null)
let p2pChannel = null

const chatMessages = computed(() => p2pStore.chatMessages)

// --- Métodos ---

const isMyMessage = (message) => {
  return message.sender_id === props.currentUserId
}

const scrollToBottom = async () => {
  await nextTick()
  if (chatboxRef.value) {
    chatboxRef.value.scrollTop = chatboxRef.value.scrollHeight
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

const sendMessage = async () => {
  if (newMessage.value.trim() === '' && chatFiles.value.length === 0) return

  try {
    const messageText = newMessage.value
    const attachments = chatFiles.value
    
    newMessage.value = ''
    chatFiles.value = []
    
    // Scroll optimista
    scrollToBottom()
    
    await p2pStore.sendChatMessage(props.tradeId, messageText, attachments)
    
  } catch (err) {
    console.error('Error al enviar mensaje:', err)
    alert('Error al enviar el mensaje')
  }
}

// --- Lifecycle & Pusher ---

onMounted(async () => {
  // Cargar mensajes iniciales
  if (props.tradeId) {
    await p2pStore.fetchChatMessages(props.tradeId)
    scrollToBottom()

    // Configuración de Pusher
    if (process.client && $pusher) {
      console.log(`Suscribiéndose al canal: private-p2p.${props.tradeId}`)
      p2pChannel = $pusher.instance.subscribe(`private-p2p.${props.tradeId}`)

      p2pChannel.bind('pusher:subscription_succeeded', () => {
        console.log('Chat conectado')
      })

      // Eventos de Chat
      p2pChannel.bind('message.sent', (data) => {
        const msg = {
          id: data.message_id,
          senderId: data.user.id,
          senderName: data.user.name,
          text: data.message,
          time: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
          attachments: data.attachments || []
        }
        p2pStore.addChatMessage(msg)
        scrollToBottom()
      })

      p2pChannel.bind('message.deleted', (data) => {
        const index = chatMessages.value.findIndex(m => m.id === data.message_id)
        if (index !== -1) {
          chatMessages.value.splice(index, 1)
        }
      })

      // Eventos de Estado del Trade (Se retransmiten al padre)
      const forwardEvent = (eventName, data) => {
        emit('trade-updated', { type: eventName, data })
      }

      p2pChannel.bind('trade.marked.paid', (data) => forwardEvent('paid', data))
      p2pChannel.bind('payment.proof.uploaded', (data) => forwardEvent('proof_uploaded', data))
      p2pChannel.bind('crypto.released', (data) => forwardEvent('released', data))
      p2pChannel.bind('trade.cancelled', (data) => forwardEvent('cancelled', data))
    }
  }
})

onBeforeUnmount(() => {
  if (p2pChannel) {
    p2pChannel.unbind_all()
    if (props.tradeId) {
        // Nota: Asegúrate de tener acceso a $pusher aquí o muévelo al scope adecuado
        const { $pusher } = useNuxtApp() 
        $pusher.instance.unsubscribe(`private-p2p.${props.tradeId}`)
    }
    p2pStore.clearChatMessages()
  }
})
</script>

<template>
  <div class="bg-gray-800 rounded-lg flex flex-col h-[85vh] max-h-[85vh] transition-colors duration-300 card-container">
    <div class="p-4 border-b border-gray-700">
      <h3 class="font-bold text-lg">Chat del Trade</h3>
    </div>
    
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
              ? 'bg-blue-100 rounded-l-xl rounded-br-xl text-gray-900'
              : 'bg-gray-100 rounded-e-xl rounded-es-xl text-gray-900'
          "
        >
          <div class="flex items-center space-x-2 rtl:space-x-reverse">
            <span class="text-sm font-semibold">{{ message.senderName }}</span>
            <span class="text-sm font-normal text-gray-500">{{ message.time }}</span>
          </div>
          <p class="text-sm font-normal py-2.5">{{ message.text }}</p>
          <div v-if="message.attachments && message.attachments.length > 0" class="mt-2 space-y-2">
            <a
              v-for="attachment in message.attachments"
              :key="attachment.id"
              :href="attachment.url"
              target="_blank"
              class="flex items-center gap-2 text-sm font-semibold hover:underline"
              :class="isMyMessage(message) ? 'text-gray-800' : 'text-blue-600'"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path></svg>
              <span>{{ attachment.name }}</span>
            </a>
          </div>
          
          <p class="text-xs text-right mt-1 opacity-70">{{ message.time }}</p>
        </div>
      </div>
    </div>
    
    <div class="p-4 border-t border-gray-700 transition-colors duration-300">
      
      <div v-if="chatFiles.length > 0" class="mb-2 space-y-2">
        <div v-for="(file, index) in chatFiles" :key="index" class="flex items-center justify-between bg-gray-700 p-2 rounded-lg">
          <div class="flex items-center gap-2 text-sm text-gray-200">
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
          class="flex-1 bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500 transition placeholder-gray-400"
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
/* Estilos para la barra de scroll específicos del componente */
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
</style>