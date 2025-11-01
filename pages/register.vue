<template>
  <div class="flex justify-center items-center min-h-[calc(100vh-180px)]">
    <div class="max-w-md w-full bg-gray-800 rounded-lg p-4 sm:p-6 shadow-lg mx-2 sm:mx-0">
      <div class="text-center mb-6">
        <h2 class="text-xl font-bold text-yellow-400">Crear Cuenta</h2>
      </div>
      
      <div v-if="error" class="mb-4 p-3 bg-red-500 bg-opacity-20 border border-red-500 text-red-500 rounded-md">
        {{ error }}
      </div>
      
      <form @submit.prevent="handleRegister" class="space-y-6">
        <div>
          <label class="block text-sm font-medium mb-1" for="name">Nombre</label>
          <input 
            type="text" 
            id="name" 
            v-model="name" 
            required
            placeholder="Ingrese su nombre"
            class="w-full px-3 py-2 bg-gray-700 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-base"
          >
        </div>
        
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
        
        <div>
          <label class="block text-sm font-medium mb-1" for="password_confirmation">Confirmar Contraseña</label>
          <input 
            type="password" 
            class="w-full px-3 py-2 bg-gray-700 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-base"
            id="password_confirmation" 
            v-model="passwordConfirmation" 
            required
            placeholder="Confirme su contraseña"
          >
        </div>
        
        <div class="flex items-center mb-4">
          <input 
            type="checkbox" 
            class="mr-2 form-checkbox h-4 w-4 text-yellow-500 transition duration-150 ease-in-out rounded focus:ring-yellow-500"
            id="terms" 
            v-model="terms" 
            required
          >
          <label class="text-sm" for="terms">
            Acepto los <a href="#" class="text-yellow-500 hover:text-yellow-400">Términos y Condiciones</a>
          </label>
        </div>
        
        <button 
          type="submit" 
          class="w-full py-2 bg-yellow-500 text-gray-900 rounded-md font-semibold hover:bg-yellow-400 transition-colors duration-300 text-base"
          :disabled="loading"
        >
          {{ loading ? 'Registrando...' : 'Registrarse' }}
        </button>
      </form>
      
      <div class="mt-3 text-center">
        <p class="text-sm">¿Ya tienes una cuenta? <NuxtLink to="/login" class="text-yellow-500 hover:text-yellow-400">Iniciar Sesión</NuxtLink></p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '~/composables/useAuth';

const router = useRouter();
const { register, error: authError, loading } = useAuth();

definePageMeta({
  layout: 'p2p'
});

const name = ref('');
const email = ref('');
const password = ref('');
const passwordConfirmation = ref('');
const error = ref('');

async function handleRegister() {
  error.value = '';
  
  if (!name.value || !email.value || !password.value || !passwordConfirmation.value) {
    error.value = 'Por favor complete todos los campos';
    return;
  }
  
  if (password.value !== passwordConfirmation.value) {
    error.value = 'Las contraseñas no coinciden';
    return;
  }
  
  const success = await register(
    name.value,
    email.value,
    password.value,
    passwordConfirmation.value
  );
  
  if (success) {
    router.push('/');
  } else {
    error.value = authError.value;
  }
}
</script>

