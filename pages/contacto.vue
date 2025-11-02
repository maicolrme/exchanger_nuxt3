<template>
  <div class="container mx-auto px-4 py-6">
    <h2 class="text-3xl font-bold text-center mb-8">Contáctanos</h2>
    <div class="bg-gray-800 rounded-lg p-6 max-w-2xl mx-auto">
      <form @submit.prevent="enviarMensaje" class="space-y-6">
        <!-- Nombre -->
        <div>
          <label for="nombre" class="block text-sm font-medium text-gray-300 mb-2">Nombre completo:</label>
          <input type="text" id="nombre" v-model="formData.nombre" placeholder="Ingresa tu nombre completo" class="block w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-yellow-500 text-sm">
        </div>

        <!-- Email -->
        <div>
          <label for="email" class="block text-sm font-medium text-gray-300 mb-2">Correo electrónico:</label>
          <input type="email" id="email" v-model="formData.email" placeholder="ejemplo@correo.com" class="block w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-yellow-500 text-sm">
        </div>

        <!-- Asunto -->
        <div>
          <label for="asunto" class="block text-sm font-medium text-gray-300 mb-2">Asunto:</label>
          <select id="asunto" v-model="formData.asunto" class="block w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-yellow-500 text-sm">
            <option value="soporte">Soporte técnico</option>
            <option value="cuenta">Problemas con mi cuenta</option>
            <option value="deposito">Depósitos y retiros</option>
            <option value="sugerencia">Sugerencias</option>
            <option value="otro">Otro</option>
          </select>
        </div>

        <!-- Mensaje -->
        <div>
          <label for="mensaje" class="block text-sm font-medium text-gray-300 mb-2">Mensaje:</label>
          <textarea id="mensaje" v-model="formData.mensaje" rows="5" placeholder="Escribe tu mensaje aquí..." class="block w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-yellow-500 text-sm"></textarea>
        </div>

        <!-- Botón de envío -->
        <div>
          <button type="submit" class="w-full bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold py-3 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500">
            Enviar mensaje
          </button>
        </div>
      </form>

      <!-- Información de contacto adicional -->
      <div class="mt-8 pt-6 border-t border-gray-700">
        <h3 class="text-xl font-semibold mb-4">Información de contacto</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="flex items-start space-x-3">
            <svg class="w-5 h-5 text-yellow-500 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
            </svg>
            <div>
              <p class="text-sm font-medium text-gray-300">Email:</p>
              <p class="text-sm text-gray-400">soporte@cryptoex.com</p>
            </div>
          </div>
          <div class="flex items-start space-x-3">
            <svg class="w-5 h-5 text-yellow-500 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
            </svg>
            <div>
              <p class="text-sm font-medium text-gray-300">Teléfono:</p>
              <p class="text-sm text-gray-400">+1 (555) 123-4567</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
definePageMeta({
  layout: 'p2p'
});

// Estado del formulario
const formData = ref({
  nombre: '',
  email: '',
  asunto: 'soporte',
  mensaje: ''
});

// Método para enviar el mensaje
const enviarMensaje = () => {
  // Aquí iría la lógica para enviar el formulario
  // Por ahora solo mostramos un console.log
  console.log('Formulario enviado:', formData.value);
  
  // Resetear el formulario después de enviar
  formData.value = {
    nombre: '',
    email: '',
    asunto: 'soporte',
    mensaje: ''
  };
  
  // Mostrar un mensaje de éxito (en una implementación real)
  alert('¡Mensaje enviado con éxito! Nos pondremos en contacto contigo pronto.');
};

// Metadatos de la página (SEO)
useHead({
  title: 'CryptoEx - Contáctanos'
})
</script>

<style scoped>
/* Estilos adicionales si son necesarios */
</style>