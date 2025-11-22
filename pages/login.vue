<template>
  <div class="flex justify-center items-center min-h-[calc(100vh-180px)]">
    <div class="max-w-md w-full bg-gray-800 rounded-lg p-4 sm:p-6 shadow-lg mx-2 sm:mx-0">
      <div class="text-center mb-6">
        <h2 class="text-xl font-bold text-yellow-400">Iniciar Sesión</h2>
      </div>
    
    <div v-if="error" class="mb-4 p-3 bg-red-500 bg-opacity-20 border border-red-500 text-red-500 rounded-md">
      {{ error }}
    </div>
    
    <form @submit.prevent="handleLogin" class="space-y-6">
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
      
      <div>
        <label class="block text-sm font-medium mb-1" for="password">Contraseña</label>
        <input 
          type="password" 
          id="password" 
          v-model="password" 
          required
          placeholder="Ingrese su contraseña"
          class="w-full px-3 py-2 bg-gray-700 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-base"
        >
      </div>
      
      <div class="flex items-center justify-between text-sm">
        <label class="flex items-center text-sm">
          <input type="checkbox" v-model="remember" class="mr-2 form-checkbox h-4 w-4 text-yellow-500 transition duration-150 ease-in-out rounded focus:ring-yellow-500">
          Recordarme
        </label>
        <NuxtLink to="/forgot-password" class="text-yellow-500 hover:text-yellow-400 text-sm">¿Olvidaste tu contraseña?</NuxtLink>
      </div>
      
      <button 
        type="submit" 
        class="w-full py-2 bg-yellow-500 text-gray-900 rounded-md font-semibold hover:bg-yellow-400 transition-colors duration-300 text-base"
        :disabled="loading"
      >
        {{ loading ? 'Iniciando sesión...' : 'Iniciar Sesión' }}
      </button>
    </form>
    
    <div class="mt-6 text-center text-sm">
      <p class="text-gray-400">
        ¿No tienes una cuenta?
        <NuxtLink to="/register" class="text-yellow-500 hover:text-yellow-400 font-medium">Regístrate aquí</NuxtLink>
      </p>
    </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '~/composables/useAuth';


const router = useRouter();
const { login, error: authError, loading } = useAuth();

const email = ref('');
const password = ref('');
const error = ref('');
const remember = ref(false);

async function handleLogin() {
  error.value = '';
  
  if (!email.value || !password.value) {
    error.value = 'Por favor complete todos los campos';
    return;
  }
  
  const success = await login(email.value, password.value);
  
  if (success) {
    // Forzar recarga para actualizar el estado de autenticación en la UI
    window.location.href = '/';
  } else {
    error.value = authError.value;
  }
}
</script>

<style scoped>
/* Los estilos específicos están ahora en el layout auth.vue y en las clases de Tailwind */
</style>