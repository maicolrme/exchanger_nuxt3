<template>
  <div class="container profile-container">
    <div class="row">
      <div class="col-md-4">
        <div class="profile-card">
          <h2>Perfil de Usuario</h2>
          <div class="profile-info">
            <div class="profile-avatar">
              <span class="avatar-placeholder">{{ userInitials }}</span>
            </div>
            <div class="profile-details">
              <h3>{{ user?.name || 'Usuario' }}</h3>
              <p><i class="bi bi-envelope"></i> {{ user?.email || 'No disponible' }}</p>
              <p><i class="bi bi-calendar"></i> Miembro desde: {{ memberSince }}</p>
            </div>
          </div>
        </div>
      </div>
      
      <div class="col-md-8">
        <div class="wallet-card">
          <h2>Mis Billeteras</h2>
          <div v-if="loading" class="text-center">
            <div class="spinner-border text-light" role="status">
              <span class="visually-hidden">Cargando...</span>
            </div>
          </div>
          <div v-else-if="wallets.length === 0" class="no-wallets">
            <p>No tienes billeteras disponibles.</p>
          </div>
          <div v-else class="table-responsive">
            <table class="table custom-table">
              <thead>
                <tr>
                  <th>Moneda</th>
                  <th>Balance</th>
                  <th>Valor Estimado (USDT)</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="wallet in wallets" :key="wallet.id">
                  <td>
                    <div class="currency-name">
                      <span class="currency-icon">{{ wallet.currency.substring(0, 1) }}</span>
                      {{ wallet.currency }}
                    </div>
                  </td>
                  <td>{{ formatNumber(wallet.balance) }}</td>
                  <td>{{ formatNumber(calculateUsdtValue(wallet)) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useAuth } from '~/composables/useAuth';

// Usar el composable de autenticación
const { user, isAuthenticated, loadUser } = useAuth();

// Definir middleware de autenticación
definePageMeta({
  middleware: ['auth']
});

// Estado para las billeteras
const wallets = ref([]);
const loading = ref(true);

// Asegurarse de que el usuario esté cargado
onMounted(async () => {
  if (!user.value) {
    await loadUser();
  }
  await fetchWallets();
});

// Precios de ejemplo para conversión a USDT
const prices = ref({
  BTC: 50000,
  ETH: 3000,
  BSC: 400,
  USDT: 1
});

// Calcular iniciales del usuario para el avatar
const userInitials = computed(() => {
  if (!user.value || !user.value.name) return '?';
  
  const nameParts = user.value.name.split(' ');
  if (nameParts.length >= 2) {
    return `${nameParts[0][0]}${nameParts[1][0]}`;
  }
  return nameParts[0][0];
});

// Formatear fecha de registro
const memberSince = computed(() => {
  if (!user.value || !user.value.created_at) return 'N/A';
  
  const date = new Date(user.value.created_at);
  return date.toLocaleDateString();
});

// Función para formatear números
function formatNumber(value) {
  return new Intl.NumberFormat('es-ES', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 8
  }).format(value);
}

// Función para calcular el valor en USDT
function calculateUsdtValue(wallet) {
  const price = prices.value[wallet.currency] || 0;
  return wallet.balance * price;
}

// Función para obtener las billeteras del usuario
async function fetchWallets() {
  loading.value = true;
  try {
    const { $axios } = useNuxtApp();
    const response = await $axios.get('/wallets');
    wallets.value = response.data;
  } catch (error) {
    console.error('Error al obtener billeteras:', error);
  } finally {
    loading.value = false;
  }
}

// Cargar datos al montar el componente
// Esta sección se elimina porque ya se ha movido la lógica al nuevo onMounted arriba
// onMounted(async () => {
//   await fetchWallets();
// });
</script>

<style scoped>
.profile-container {
  padding: 2rem 0;
}

.profile-card, .wallet-card {
  background-color: #1e1e1e;
  border-radius: 10px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.profile-card h2, .wallet-card h2 {
  color: #00ff00;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid #333;
  padding-bottom: 0.5rem;
}

.profile-info {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.profile-avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background-color: #333;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 1rem;
}

.avatar-placeholder {
  font-size: 2.5rem;
  color: #00ff00;
  font-weight: bold;
}

.profile-details {
  text-align: center;
}

.profile-details h3 {
  margin-bottom: 0.5rem;
  color: #ffffff;
}

.profile-details p {
  color: #cccccc;
  margin-bottom: 0.5rem;
}

.profile-details i {
  margin-right: 0.5rem;
  color: #00ff00;
}

.custom-table {
  color: white;
}

.custom-table thead th {
  color: #fff;
  background-color: #444;
  border-bottom: none;
}

.custom-table tbody tr {
  background-color: #222;
}

.custom-table tbody tr:nth-child(even) {
  background-color: #333;
}

.custom-table tbody td {
  color: white;
  vertical-align: middle;
}

.currency-name {
  display: flex;
  align-items: center;
}

.currency-icon {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background-color: #00ff00;
  color: #000;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 10px;
  font-weight: bold;
}

.no-wallets {
  text-align: center;
  padding: 2rem;
  color: #cccccc;
}
</style>