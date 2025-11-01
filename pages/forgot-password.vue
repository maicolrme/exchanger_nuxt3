<template>
  <div class="flex justify-center items-center min-h-[calc(100vh-180px)]">
    <div class="max-w-md w-full bg-gray-800 rounded-lg p-4 sm:p-6 shadow-lg mx-2 sm:mx-0">
      <div class="text-center mb-6">
        <h2 class="text-xl font-bold text-yellow-400">Recuperar Contraseña</h2>
      </div>
    
      <div v-if="error" class="mb-4 p-3 bg-red-500 bg-opacity-20 border border-red-500 text-red-500 rounded-md">
        {{ error }}
      </div>
      
      <div v-if="success" class="mb-4 p-3 bg-green-500 bg-opacity-20 border border-green-500 text-green-500 rounded-md">
        {{ success }}
      </div>
      
      <form @submit.prevent="handleForgotPassword" class="space-y-6">
        <div>
          <label class="block text-sm font-medium mb-1" for="email">Correo Electrónico</label>
          <input 
            type="email" 
            id="email" 
            v-model="email" 
            required
            placeholder="Ingrese su correo electrónico"
            class="w-full px-3 py-2 bg-gray-700 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-base"
          >
        </div>
        
        <p class="text-sm text-gray-400">
          Ingrese su correo electrónico y le enviaremos un enlace para restablecer su contraseña.
        </p>
        
        <button 
          type="submit" 
          class="w-full py-2 bg-yellow-500 text-gray-900 rounded-md font-semibold hover:bg-yellow-400 transition-colors duration-300 text-base"
          :disabled="loading"
        >
          {{ loading ? 'Enviando...' : 'Enviar Enlace de Recuperación' }}
        </button>
      </form>
      
      <div class="mt-6 text-center text-sm">
        <p class="text-gray-400">
          ¿Recordaste tu contraseña?
          <NuxtLink to="/login" class="text-yellow-500 hover:text-yellow-400 font-medium">Volver al inicio de sesión</NuxtLink>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

definePageMeta({
  layout: 'p2p'
});

const email = ref('');
const error = ref('');
const success = ref('');
const loading = ref(false);

async function handleForgotPassword() {
  error.value = '';
  success.value = '';
  
  if (!email.value) {
    error.value = 'Por favor ingrese su correo electrónico';
    return;
  }
  
  loading.value = true;
  
  try {
    // Aquí iría la llamada a la API para enviar el correo de recuperación
    // Por ahora simulamos una respuesta exitosa después de un breve retraso
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    success.value = 'Se ha enviado un enlace de recuperación a su correo electrónico';
    email.value = '';
  } catch (err) {
    error.value = 'Ocurrió un error al procesar su solicitud. Por favor intente nuevamente.';
    console.error(err);
  } finally {
    loading.value = false;
  }
}
</script>