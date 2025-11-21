<template>
  <nav class="navbar navbar-expand-lg navbar-dark">
    <div class="container">
      <NuxtLink class="navbar-brand" to="/">Trading Exchanger</NuxtLink>
      
      <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>
      
      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav ml-auto">
          <li class="nav-item">
            <NuxtLink class="nav-link" to="/markets">Mercados</NuxtLink>
          </li>
          
          
          <!-- Opciones para usuarios no autenticados -->
          <template v-if="!isAuthenticated">
            <li class="nav-item">
              <NuxtLink class="nav-link" to="/login">Iniciar Sesión</NuxtLink>
            </li>
            <li class="nav-item">
              <NuxtLink class="nav-link" to="/register">Registrarse</NuxtLink>
            </li>
          </template>
          
          <!-- Opciones para usuarios autenticados -->
          <template v-else>
            <li class="nav-item">
              <NuxtLink class="nav-link" to="/wallet">Mi Cartera</NuxtLink>
            </li>
            <li class="nav-item">
              <NuxtLink class="nav-link" to="/orders/history">
                <i class="fas fa-history"></i> Historial
              </NuxtLink>
            </li>
            <li class="nav-item dropdown">
              <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                <i class="fas fa-user-circle"></i>
                <span class="user-name" v-if="user?.name">{{ user.name }}</span>
                <span class="user-name" v-else>Usuario</span>
              </a>
              <div class="dropdown-menu dropdown-menu-right" aria-labelledby="navbarDropdown">
                <div class="dropdown-header">
                  <i class="fas fa-user"></i> {{ user?.name || 'Usuario' }}
                </div>
                <div class="dropdown-divider"></div>
                <NuxtLink class="dropdown-item" to="/profile">
                  <i class="fas fa-user-cog"></i> Mi Perfil
                </NuxtLink>
                <div class="dropdown-divider"></div>
                <a class="dropdown-item" href="#" @click.prevent="handleLogout">
                  <i class="fas fa-sign-out-alt"></i> Cerrar Sesión
                </a>
              </div>
            </li>
          </template>
        </ul>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { computed, onMounted } from 'vue';

const authStore = useAuthStore();

// Computed properties reactivas del store
const user = computed(() => authStore.user);
const isAuthenticated = computed(() => authStore.isAuthenticated);

// Solo cargar usuario en el cliente para evitar problemas de hidratación
onMounted(() => {
  if (process.client && authStore.token && !authStore.user) {
    authStore.loadUser();
  }
});

async function handleLogout() {
  await authStore.logout();
  navigateTo('/login');
}</script>

<style scoped>
.navbar {
  background-color: #1a1a1a;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  margin-bottom: 20px;
}

.navbar-brand {
  color: #00ff00;
  font-weight: bold;
}

.nav-link {
  color: #ffffff;
}

.nav-link:hover {
  color: #00ff00;
}

.dropdown-menu {
  background-color: #1e1e1e;
  border-color: #333;
}

.dropdown-item {
  color: #ffffff;
}

.dropdown-item:hover {
  background-color: #333;
  color: #00ff00;
}

.dropdown-divider {
  border-top-color: #333;
}

.user-name {
  margin-left: 8px;
  font-weight: 500;
}

.dropdown-header {
  color: #00ff00;
  font-weight: 500;
  padding: 0.5rem 1rem;
  background-color: #2a2a2a;
}

.dropdown-item i {
  margin-right: 8px;
  width: 16px;
  text-align: center;
}
</style>