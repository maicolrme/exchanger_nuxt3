<template>
  <div class="auth-container">
    <div class="auth-card">
      <h2 class="text-center mb-4">Crear Cuenta</h2>
      
      <div v-if="error" class="alert alert-danger">
        {{ error }}
      </div>
      
      <form @submit.prevent="handleRegister">
        <div class="form-group">
          <label for="name">Nombre</label>
          <input 
            type="text" 
            class="form-control" 
            id="name" 
            v-model="name" 
            required
            placeholder="Ingrese su nombre"
          >
        </div>
        
        <div class="form-group">
          <label for="email">Correo Electrónico</label>
          <input 
            type="email" 
            class="form-control" 
            id="email" 
            v-model="email" 
            required
            placeholder="Ingrese su correo electrónico"
          >
        </div>
        
        <div class="form-group">
          <label for="password">Contraseña</label>
          <input 
            type="password" 
            class="form-control" 
            id="password" 
            v-model="password" 
            required
            placeholder="Ingrese su contraseña"
          >
        </div>
        
        <div class="form-group">
          <label for="password_confirmation">Confirmar Contraseña</label>
          <input 
            type="password" 
            class="form-control" 
            id="password_confirmation" 
            v-model="passwordConfirmation" 
            required
            placeholder="Confirme su contraseña"
          >
        </div>
        
        <button 
          type="submit" 
          class="btn btn-primary btn-block" 
          :disabled="loading"
        >
          {{ loading ? 'Registrando...' : 'Registrarse' }}
        </button>
      </form>
      
      <div class="mt-3 text-center">
        <p>¿Ya tienes una cuenta? <NuxtLink to="/login" class="text-primary">Iniciar Sesión</NuxtLink></p>
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

<style scoped>
.auth-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #121212;
}

.auth-card {
  background-color: #1e1e1e;
  border-radius: 8px;
  padding: 30px;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

h2 {
  color: #00ff00;
  margin-bottom: 20px;
}

.form-control {
  background-color: #333;
  border-color: #444;
  color: white;
}

.form-control:focus {
  background-color: #444;
  border-color: #00ff00;
  color: white;
  box-shadow: 0 0 0 0.2rem rgba(0, 255, 0, 0.25);
}

.btn-primary {
  background-color: #00ff00;
  border-color: #00ff00;
  color: #000;
}

.btn-primary:hover, .btn-primary:focus {
  background-color: #00cc00;
  border-color: #00cc00;
  color: #000;
}

.btn-primary:disabled {
  background-color: #006600;
  border-color: #006600;
}

a {
  color: #00ff00;
}

a:hover {
  color: #00cc00;
  text-decoration: none;
}
</style>