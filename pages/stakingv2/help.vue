<template>
  <div class="flex flex-col md:flex-row gap-4 p-4 min-h-screen" :class="isDark ? 'bg-[#060621] text-white' : 'bg-white text-black'">
    <!-- Sidebar -->
    <div class="w-full md:w-1/4 bg-blue-50 rounded-lg shadow p-4">
      <h6 class="font-semibold text-blue-700 mb-3 flex items-center">
        <i class="fas fa-list mr-2"></i> Temas de Ayuda
      </h6>
      <ul>
        <li
          v-for="tab in tabs"
          :key="tab.id"
          @click="setActiveTab(tab.id)"
          :class="[
            'cursor-pointer px-4 py-2 rounded mb-1 hover:bg-blue-200',
            activeTab === tab.id ? 'bg-blue-500 text-white font-semibold' : 'text-blue-700'
          ]"
        >
          <i :class="tab.icon + ' mr-2'"></i>{{ tab.title }}
        </li>
      </ul>
    </div>

    <!-- Contenido -->
    <div class="w-full md:w-3/4 space-y-4">
      <!-- Tabs normales -->
      <div
        v-for="tab in tabs"
        :key="tab.id"
        v-show="activeTab === tab.id && tab.id !== 'faq'"
        class="space-y-4"
      >
        <div class="bg-white border border-blue-200 rounded shadow">
          <div class="bg-blue-100 px-4 py-3 rounded-t flex items-center">
            <i :class="tab.headerIcon + ' mr-2 text-blue-500'"></i>
            <h5 class="font-semibold text-blue-800 mb-0">{{ tab.title }}</h5>
          </div>
          <div class="p-4 text-blue-900" v-html="tab.content"></div>
        </div>
      </div>

      <!-- FAQ tab separado -->
      <div v-if="activeTab === 'faq'" class="space-y-4">
        <div class="bg-white border border-blue-200 rounded shadow p-4">
          <h5 class="font-semibold text-blue-800 mb-4 flex items-center">
            <i class="fas fa-question-circle mr-2 text-blue-500"></i> FAQ
          </h5>
          <div v-for="(item, index) in faqItems" :key="index" class="mb-2 border-b">
            <button
              class="w-full text-left py-2 px-2 bg-blue-50 hover:bg-blue-100 rounded flex justify-between items-center"
              @click="toggleFaq(index)"
            >
              {{ item.question }}
              <i :class="[ item.open ? 'fas fa-chevron-up' : 'fas fa-chevron-down' ]"></i>
            </button>
            <div v-show="item.open" class="p-2 text-blue-900 bg-blue-100 rounded mt-1">
              {{ item.answer }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

// Layout p2p
setPageLayout('p2p')

// Sincronización de tema
const isLightMode = ref(false)
const isDark = computed(() => !isLightMode.value)
let themeObserver = null

onMounted(() => {
  if (process.client) {
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme) {
      isLightMode.value = savedTheme === 'light'
    }
    const rootEl = document.querySelector('.app-layout')
    if (rootEl) {
      isLightMode.value = rootEl.classList.contains('light-mode')
      themeObserver = new MutationObserver((mutations) => {
        for (const m of mutations) {
          if (m.type === 'attributes' && m.attributeName === 'class') {
            isLightMode.value = rootEl.classList.contains('light-mode')
          }
        }
      })
      themeObserver.observe(rootEl, { attributes: true, attributeFilter: ['class'] })
    }
  }
})

onUnmounted(() => {
  if (themeObserver) {
    themeObserver.disconnect()
    themeObserver = null
  }
})
</script>

<script>
export default {
  data() {
    return {
      activeTab: 'getting-started',
      tabs: [
        {
          id: 'getting-started',
          title: 'Comenzar',
          icon: 'fas fa-play',
          headerIcon: 'fas fa-play',
          content: `
            <h6 class="font-semibold mb-2">¿Qué es el Staking?</h6>
            <p class="mb-2">El staking es un proceso donde bloqueas tus criptomonedas por un período determinado para ganar recompensas. Es una forma de generar ingresos pasivos con tus activos digitales.</p>
            <h6 class="font-semibold mb-1">Pasos para comenzar:</h6>
            <ol class="list-decimal list-inside mb-2">
              <li><strong>Selecciona un Pool:</strong> Elige entre nuestros diferentes pools de staking</li>
              <li><strong>Deposita:</strong> Transfiere la cantidad que deseas invertir</li>
              <li><strong>Espera:</strong> Deja que tus fondos generen recompensas durante el período de bloqueo</li>
              <li><strong>Retira:</strong> Al finalizar el período, retira tu capital inicial más las ganancias</li>
            </ol>
            <div class="bg-blue-100 border-l-4 border-blue-500 p-2 text-blue-800">
              <i class="fas fa-lightbulb mr-1"></i>
              <strong>Consejo:</strong> Comienza con una cantidad pequeña para familiarizarte con el proceso.
            </div>
          `,
        },
        {
          id: 'how-staking-works',
          title: '¿Cómo funciona?',
          icon: 'fas fa-cogs',
          headerIcon: 'fas fa-cogs',
          content: `
            <h6 class="font-semibold mb-2">Proceso Detallado:</h6>
            <div class="grid md:grid-cols-2 gap-3 mb-3">
              <div class="bg-blue-50 p-3 rounded text-center">
                <i class="fas fa-deposit fa-2x text-blue-500 mb-2"></i>
                <h6 class="font-semibold">1. Depósito</h6>
                <p class="text-sm">Transfieres tus criptomonedas al pool seleccionado</p>
              </div>
              <div class="bg-blue-50 p-3 rounded text-center">
                <i class="fas fa-lock fa-2x text-blue-500 mb-2"></i>
                <h6 class="font-semibold">2. Bloqueo</h6>
                <p class="text-sm">Tus fondos se bloquean por el período establecido</p>
              </div>
              <div class="bg-blue-50 p-3 rounded text-center">
                <i class="fas fa-chart-line fa-2x text-blue-500 mb-2"></i>
                <h6 class="font-semibold">3. Generación</h6>
                <p class="text-sm">Las recompensas se calculan diariamente</p>
              </div>
              <div class="bg-blue-50 p-3 rounded text-center">
                <i class="fas fa-coins fa-2x text-blue-500 mb-2"></i>
                <h6 class="font-semibold">4. Retiro</h6>
                <p class="text-sm">Recibes tu capital inicial + ganancias</p>
              </div>
            </div>
            <h6 class="font-semibold mb-2">Tipos de Pools:</h6>
            <ul class="list-disc list-inside">
              <li><strong>Flexible:</strong> Períodos cortos (30-60 días) con APR moderado</li>
              <li><strong>Premium:</strong> Períodos largos (90-180 días) con APR alto</li>
              <li><strong>Estable:</strong> Para stablecoins con rendimientos constantes</li>
            </ul>
          `,
        },
        {
          id: 'rewards-calculation',
          title: 'Cálculo de Recompensas',
          icon: 'fas fa-calculator',
          headerIcon: 'fas fa-calculator',
          content: `
            <h6 class="font-semibold mb-2">Fórmula de Cálculo:</h6>
            <div class="bg-blue-50 p-3 rounded mb-3">
              <code>
                Recompensa Diaria = (Cantidad Invertida × APR) ÷ 365<br>
                Recompensa Total = Recompensa Diaria × Días de Staking
              </code>
            </div>
            <h6 class="font-semibold mb-1">Ejemplo Práctico:</h6>
            <div class="bg-blue-100 p-2 rounded mb-2">
              <strong>Pool Bitcoin High Yield:</strong><br>
              • Cantidad invertida: 1 BTC<br>
              • APR: 8.5%<br>
              • Período: 90 días<br>
              • Recompensa diaria: (1 × 8.5%) ÷ 365 = 0.00023288 BTC<br>
              • Recompensa total: 0.00023288 × 90 = 0.02096 BTC<br>
              • Total a retirar: 1 + 0.02096 = <strong>1.02096 BTC</strong>
            </div>
            <h6 class="font-semibold mb-1">Factores que Afectan las Recompensas:</h6>
            <ul class="list-disc list-inside">
              <li><strong>APR del Pool:</strong> Porcentaje anual ofrecido</li>
              <li><strong>Período de Staking:</strong> Días que mantienes los fondos bloqueados</li>
              <li><strong>Cantidad Invertida:</strong> Mayor cantidad = mayores recompensas</li>
              <li><strong>Comisiones:</strong> Algunas operaciones pueden tener fees mínimos</li>
            </ul>
          `,
        },
        {
          id: 'withdrawals',
          title: 'Retiros',
          icon: 'fas fa-coins',
          headerIcon: 'fas fa-coins',
          content: `
            <h6 class="font-semibold mb-2">¿Cuándo puedo retirar?</h6>
            <p>Solo puedes retirar tus fondos cuando el período de bloqueo haya terminado.</p>
            <h6 class="font-semibold mb-1">Proceso de Retiro:</h6>
            <ol class="list-decimal list-inside mb-2">
              <li>Ve a "Mis Posiciones" en el menú</li>
              <li>Busca las posiciones con estado "Disponible"</li>
              <li>Haz clic en "Retirar" en la posición deseada</li>
              <li>Confirma la operación</li>
              <li>Los fondos se transferirán automáticamente a tu wallet</li>
            </ol>
            <div class="bg-blue-100 border-l-4 border-blue-500 p-2 text-blue-800 mb-2">
              <i class="fas fa-exclamation-triangle mr-1"></i>
              <strong>Importante:</strong> Los retiros anticipados no están permitidos.
            </div>
            <h6 class="font-semibold mb-1">Notificaciones de Vencimiento:</h6>
            <p>Te notificaremos 3 días antes de que tus posiciones estén listas para retirar.</p>
          `,
        },
        {
          id: 'security',
          title: 'Seguridad',
          icon: 'fas fa-shield-alt',
          headerIcon: 'fas fa-shield-alt',
          content: `
            <h6 class="font-semibold mb-2">Medidas de Seguridad:</h6>
            <ul class="list-disc list-inside mb-2">
              <li>Autenticación segura</li>
              <li>2FA habilitado</li>
              <li>Verificación de operaciones</li>
              <li>Wallets seguros</li>
            </ul>
            <h6 class="font-semibold mb-2">Buenas Prácticas:</h6>
            <div class="grid md:grid-cols-2 gap-3">
              <div class="bg-blue-50 p-3 rounded">
                <h6 class="font-semibold">✅ Hacer:</h6>
                <ul class="list-disc list-inside">
                  <li>Verificar URLs antes de hacer login</li>
                  <li>Cerrar sesión después de usar</li>
                  <li>Revisar posiciones regularmente</li>
                  <li>Mantener software actualizado</li>
                </ul>
              </div>
              <div class="bg-blue-50 p-3 rounded">
                <h6 class="font-semibold">❌ No Hacer:</h6>
                <ul class="list-disc list-inside">
                  <li>Compartir credenciales</li>
                  <li>Usar WiFi público</li>
                  <li>Hacer clic en enlaces sospechosos</li>
                  <li>Invertir más de lo que puedes perder</li>
                </ul>
              </div>
            </div>
          `,
        },
        {
          id: 'faq',
          title: 'FAQ',
          icon: 'fas fa-question-circle',
          headerIcon: 'fas fa-question-circle',
          content: null,
        },
      ],
      faqItems: [
        { question: '¿Es seguro el staking?', answer: 'Sí, seguimos las mejores prácticas de seguridad.', open: false },
        { question: '¿Puedo retirar antes del vencimiento?', answer: 'No, los fondos permanecen bloqueados durante todo el período.', open: false },
        { question: '¿Cómo se calculan las recompensas?', answer: 'Se calculan diariamente según el APR del pool.', open: false },
        { question: '¿Hay fees o comisiones?', answer: 'No cobramos fees, solo los mínimos de la red.', open: false },
        { question: '¿Cuál es el mínimo para hacer staking?', answer: 'Cada pool tiene sus límites mínimos y máximos.', open: false },
      ],
    }
  },
  methods: {
    setActiveTab(id) {
      this.activeTab = id;
    },
    toggleFaq(index) {
      this.faqItems[index].open = !this.faqItems[index].open;
    },
  },
}
</script>

<style>
html {
  scroll-behavior: smooth;
}
</style>
