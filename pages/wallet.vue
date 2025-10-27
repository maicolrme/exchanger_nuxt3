<template>
  <div class="container wallet-container">
    <h1>Mis Billeteras</h1>
    
    <!-- Resumen de Billeteras -->
    <div class="wallet-summary">
      <div class="row">
        <div class="col-md-4">
          <div class="summary-card">
            <h3>Balance Total</h3>
            <div class="summary-value">
              <span v-if="loading"><i class="bi bi-hourglass-split"></i></span>
              <span v-else>{{ formatNumber(totalBalance) }} USDT</span>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="summary-card">
            <h3>Billeteras Activas</h3>
            <div class="summary-value">
              <span v-if="loading"><i class="bi bi-hourglass-split"></i></span>
              <span v-else>{{ wallets.length }}</span>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="summary-card">
            <h3>Última Actualización</h3>
            <div class="summary-value">
              <span v-if="loading"><i class="bi bi-hourglass-split"></i></span>
              <span v-else>{{ lastUpdate }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Lista de Billeteras -->
    <div class="wallet-list-container">
      <div class="wallet-header">
        <h2>Detalle de Billeteras</h2>
        <button @click="refreshWallets" class="btn btn-outline-light btn-sm">
          <i class="bi bi-arrow-clockwise"></i> Actualizar
        </button>
      </div>
      
      <div v-if="loading" class="text-center p-5">
        <div class="spinner-border text-light" role="status">
          <span class="visually-hidden">Cargando...</span>
        </div>
      </div>
      
      <div v-else-if="wallets.length === 0" class="no-wallets">
        <p>No tienes billeteras disponibles.</p>
      </div>
      
      <div v-else>
        <div class="row">
          <div v-for="wallet in wallets" :key="wallet.id" class="col-md-6 col-lg-4 mb-4">
            <div class="wallet-card">
              <div class="wallet-card-header">
                <div class="currency-icon" :style="{ backgroundColor: getCurrencyColor(wallet.currency) }">
                  {{ wallet.currency.substring(0, 1) }}
                </div>
                <h3>{{ wallet.currency }}</h3>
              </div>
              
              <div class="wallet-card-body">
                <div class="wallet-balance">
                  <span class="balance-label">Balance:</span>
                  <span class="balance-value">{{ formatNumber(wallet.balance) }}</span>
                </div>
                
                <div class="wallet-value">
                  <span class="value-label">Valor en USDT:</span>
                  <span class="value-amount">{{ formatNumber(calculateUsdtValue(wallet)) }}</span>
                </div>
              </div>
              
              <div class="wallet-card-footer">
                <button @click="showDepositModal(wallet)" class="btn btn-success btn-sm">
                  <i class="bi bi-download"></i> Depositar
                </button>
                <button @click="showWithdrawModal(wallet)" class="btn btn-danger btn-sm">
                  <i class="bi bi-upload"></i> Retirar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Modal de Depósito -->
    <div class="modal fade" id="depositModal" tabindex="-1" aria-labelledby="depositModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="depositModalLabel">Depositar {{ selectedWallet?.currency }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <div class="deposit-address">
              <p>Envía tus fondos a la siguiente dirección:</p>
              <div class="address-box">
                <code>{{ generateDepositAddress() }}</code>
                <button @click="copyToClipboard(generateDepositAddress())" class="btn btn-sm btn-outline-light">
                  <i class="bi bi-clipboard"></i>
                </button>
              </div>
              <div class="qr-code-placeholder">
                <!-- Aquí iría un código QR real -->
                <div class="fake-qr"></div>
              </div>
              <div class="deposit-note">
                <p><strong>Nota:</strong> Los depósitos pueden tardar hasta 30 minutos en reflejarse en tu cuenta.</p>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Modal de Retiro -->
    <div class="modal fade" id="withdrawModal" tabindex="-1" aria-labelledby="withdrawModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="withdrawModalLabel">Retirar {{ selectedWallet?.currency }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="processWithdrawal">
              <div class="mb-3">
                <label for="withdrawAddress" class="form-label">Dirección de Destino</label>
                <input type="text" class="form-control" id="withdrawAddress" v-model="withdrawForm.address" required>
              </div>
              <div class="mb-3">
                <label for="withdrawAmount" class="form-label">Cantidad</label>
                <input type="number" class="form-control" id="withdrawAmount" v-model="withdrawForm.amount" min="0.00000001" :max="selectedWallet?.balance" step="0.00000001" required>
                <div class="form-text">
                  Balance disponible: {{ selectedWallet ? formatNumber(selectedWallet.balance) : '0' }} {{ selectedWallet?.currency }}
                </div>
              </div>
              <div class="mb-3">
                <label for="withdrawFee" class="form-label">Comisión de Red</label>
                <input type="text" class="form-control" id="withdrawFee" :value="'0.0001 ' + (selectedWallet?.currency || '')" disabled>
              </div>
              <div class="mb-3">
                <label for="withdrawTotal" class="form-label">Total a Recibir</label>
                <input type="text" class="form-control" id="withdrawTotal" :value="calculateWithdrawTotal()" disabled>
              </div>
              <div class="d-grid gap-2">
                <button type="submit" class="btn btn-danger">Confirmar Retiro</button>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useAuth } from '~/composables/useAuth';

// Usar el composable de autenticación y el plugin de axios
const { user, isAuthenticated } = useAuth();
const { $axios } = useNuxtApp();

// Definir middleware de autenticación
definePageMeta({
  middleware: ['auth']
});

// Estado para las billeteras
const wallets = ref([]);
const loading = ref(true);
const lastUpdateTime = ref(null);
const selectedWallet = ref(null);

// Estado para el formulario de retiro
const withdrawForm = ref({
  address: '',
  amount: 0
});

// Precios de ejemplo para conversión a USDT
const prices = ref({
  BTC: 50000,
  ETH: 3000,
  BSC: 400,
  USDT: 1
});

// Colores para las monedas
const currencyColors = {
  BTC: '#f7931a',
  ETH: '#627eea',
  BSC: '#f0b90b',
  USDT: '#26a17b'
};

// Calcular balance total en USDT
const totalBalance = computed(() => {
  return wallets.value.reduce((total, wallet) => {
    return total + calculateUsdtValue(wallet);
  }, 0);
});

// Formatear la última actualización
const lastUpdate = computed(() => {
  if (!lastUpdateTime.value) return 'Nunca';
  return new Date(lastUpdateTime.value).toLocaleString();
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

// Función para obtener color de la moneda
function getCurrencyColor(currency) {
  return currencyColors[currency] || '#00ff00';
}

// Función para obtener las billeteras del usuario
async function fetchWallets() {
  loading.value = true;
  try {
    const response = await $axios.get('/wallets');
    console.log('Respuesta del servidor:', response.data);
    if (response.data.success && Array.isArray(response.data.data)) {
      wallets.value = response.data.data;
    } else {
      console.error('Formato de respuesta inesperado:', response.data);
      wallets.value = [];
    }
    lastUpdateTime.value = new Date();
  } catch (error) {
    console.error('Error al obtener billeteras:', error);
  } finally {
    loading.value = false;
  }
}

// Función para actualizar las billeteras
function refreshWallets() {
  fetchWallets();
}

// Función para mostrar el modal de depósito
function showDepositModal(wallet) {
  selectedWallet.value = wallet;
  // Aquí se usaría Bootstrap para mostrar el modal
  // En un entorno real, esto requeriría la importación de Bootstrap JS
}

// Función para mostrar el modal de retiro
function showWithdrawModal(wallet) {
  selectedWallet.value = wallet;
  withdrawForm.value = {
    address: '',
    amount: 0
  };
  // Aquí se usaría Bootstrap para mostrar el modal
  // En un entorno real, esto requeriría la importación de Bootstrap JS
}

// Función para generar una dirección de depósito ficticio
function generateDepositAddress() {
  const chars = '0123456789abcdef';
  let result = '0x';
  for (let i = 0; i < 40; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Función para copiar al portapapeles
function copyToClipboard(text) {
  navigator.clipboard.writeText(text)
    .then(() => {
      alert('Dirección copiada al portapapeles');
    })
    .catch(err => {
      console.error('Error al copiar:', err);
    });
}

// Función para calcular el total a recibir en un retiro
function calculateWithdrawTotal() {
  if (!selectedWallet.value) return '0';
  const amount = parseFloat(withdrawForm.value.amount) || 0;
  const fee = 0.0001;
  const total = Math.max(0, amount - fee);
  return `${formatNumber(total)} ${selectedWallet.value.currency}`;
}

// Función para procesar un retiro
async function processWithdrawal() {
  if (!selectedWallet.value) return;
  
  try {
    // En un entorno real, aquí se enviaría la solicitud al backend
    console.log('Procesando retiro:', {
      wallet_id: selectedWallet.value.id,
      address: withdrawForm.value.address,
      amount: withdrawForm.value.amount
    });
    
    // Simular una respuesta exitosa
    alert(`Retiro de ${withdrawForm.value.amount} ${selectedWallet.value.currency} procesado correctamente`);
    
    // Cerrar el modal y actualizar las billeteras
    // En un entorno real, esto requeriría la importación de Bootstrap JS
    // $('#withdrawModal').modal('hide');
    fetchWallets();
  } catch (error) {
    console.error('Error al procesar el retiro:', error);
    alert('Error al procesar el retiro. Por favor, inténtalo de nuevo.');
  }
}

// Cargar datos al montar el componente
onMounted(async () => {
  await fetchWallets();
});
</script>

<style scoped>
.wallet-container {
  padding: 2rem 0;
}

.wallet-container h1 {
  color: #00ff00;
  margin-bottom: 2rem;
}

/* Estilos para el resumen de billeteras */
.wallet-summary {
  margin-bottom: 3rem;
}

.summary-card {
  background-color: #1e1e1e;
  border-radius: 10px;
  padding: 1.5rem;
  height: 100%;
  text-align: center;
}

.summary-card h3 {
  color: #cccccc;
  font-size: 1rem;
  margin-bottom: 1rem;
}

.summary-value {
  font-size: 1.8rem;
  font-weight: bold;
  color: #00ff00;
}

/* Estilos para la lista de billeteras */
.wallet-list-container {
  background-color: #1e1e1e;
  border-radius: 10px;
  padding: 1.5rem;
}

.wallet-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid #333;
  padding-bottom: 0.5rem;
}

.wallet-header h2 {
  color: #00ff00;
  margin: 0;
}

.wallet-card {
  background-color: #222;
  border-radius: 10px;
  overflow: hidden;
  height: 100%;
  transition: transform 0.3s ease;
}

.wallet-card:hover {
  transform: translateY(-5px);
}

.wallet-card-header {
  display: flex;
  align-items: center;
  padding: 1rem;
  background-color: #333;
}

.currency-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 10px;
  font-weight: bold;
  color: #000;
  font-size: 1.2rem;
}

.wallet-card-header h3 {
  margin: 0;
  color: #ffffff;
}

.wallet-card-body {
  padding: 1rem;
}

.wallet-balance, .wallet-value {
  margin-bottom: 0.5rem;
}

.balance-label, .value-label {
  color: #cccccc;
  display: block;
  margin-bottom: 0.2rem;
}

.balance-value {
  font-size: 1.5rem;
  font-weight: bold;
  color: #ffffff;
}

.value-amount {
  color: #00ff00;
  font-weight: bold;
}

.wallet-card-footer {
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  background-color: #333;
}

.no-wallets {
  text-align: center;
  padding: 3rem;
  color: #cccccc;
}

/* Estilos para los modales */
.modal-content {
  background-color: #222;
  color: #ffffff;
}

.modal-header {
  border-bottom: 1px solid #444;
}

.modal-header .modal-title {
  color: #00ff00;
}

.modal-footer {
  border-top: 1px solid #444;
}

.deposit-address {
  text-align: center;
}

.address-box {
  display: flex;
  align-items: center;
  background-color: #333;
  padding: 0.5rem;
  border-radius: 5px;
  margin: 1rem 0;
}

.address-box code {
  flex: 1;
  word-break: break-all;
  color: #00ff00;
}

.qr-code-placeholder {
  margin: 1.5rem 0;
}

.fake-qr {
  width: 150px;
  height: 150px;
  background-color: #333;
  margin: 0 auto;
  position: relative;
  overflow: hidden;
}

.fake-qr::before, .fake-qr::after {
  content: '';
  position: absolute;
  background-color: #00ff00;
}

.fake-qr::before {
  width: 100%;
  height: 10px;
  top: 50%;
  transform: translateY(-50%);
}

.fake-qr::after {
  width: 10px;
  height: 100%;
  left: 50%;
  transform: translateX(-50%);
}

.deposit-note {
  margin-top: 1rem;
  font-size: 0.9rem;
  color: #cccccc;
}

/* Estilos para los formularios */
.form-control {
  background-color: #333;
  border-color: #444;
  color: #ffffff;
}

.form-control:focus {
  background-color: #333;
  border-color: #00ff00;
  color: #ffffff;
  box-shadow: 0 0 0 0.25rem rgba(0, 255, 0, 0.25);
}

.form-text {
  color: #cccccc;
}
</style>