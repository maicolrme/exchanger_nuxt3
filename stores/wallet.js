import { defineStore } from 'pinia';
import { ref, computed } from 'vue'; // Importa ref y computed

// Asegúrate de que useNuxtApp() esté disponible en tu entorno Nuxt.
// Si no estás en un archivo .vue, es posible que necesites importarlo aquí.
// const { $axios } = useNuxtApp(); // Descomenta si es necesario

export const useWalletStore = defineStore('wallet', () => {
    // --- State ---
    const wallets = ref([]);
    const loading = ref(true);
    const error = ref(null);
    const showBalance = ref(true);
    const searchQuery = ref('');
    // Campos para el total del servidor
    const totalBalanceFiat = ref(0);
    const fiatCurrency = ref('');

    // --- Getters (Computed) ---

    // Calcula el saldo total bloqueado sumando el campo 'locked' de cada cartera.
    const lockedBalance = computed(() => {
        return wallets.value.reduce((sum, w) => sum + parseFloat(w.locked || 0), 0);
    });

    // Filtra las carteras por nombre o símbolo, independientemente de mayúsculas/minúsculas.
    const filteredWallets = computed(() => {
        if (!wallets.value || !searchQuery.value) return wallets.value;
        const query = searchQuery.value.toLowerCase();
        return wallets.value.filter(w => {
            const matchesSearch = w.name.toLowerCase().includes(query) || w.symbol.toLowerCase().includes(query);
            return matchesSearch;
        });
    });

    // --- Actions ---

    async function fetchWallets() {
        loading.value = true;
        error.value = null;
        try {
            // Asegúrate de importar o obtener useNuxtApp() correctamente
            const { $axios } = useNuxtApp(); 
            const response = await $axios.get('/wallets');

            // Mapea y almacena los datos de las carteras
            wallets.value = response.data.wallets.map(w => ({
                icon: w.icon,
                symbol: w.symbol,
                name: w.name,
                // Usamos 'fiat_' para la visualización en fiat, 'balance' para el balance en cripto
                fiatValue: parseFloat(w.fiat_ || 0), 
                balance: parseFloat(w.balance || 0),
                locked: parseFloat(w.locked_balance || 0), // Usamos 'locked_balance'
                // Puedes añadir más campos que necesites...
            }));

            // Almacena los totales globales de la respuesta del servidor
            totalBalanceFiat.value = response.data.total_currency || 0;
            fiatCurrency.value = response.data._currency || 'USD'; 

        } catch (e) {
            error.value = 'Error al cargar los datos. Por favor, inténtalo de nuevo más tarde.';
            console.error(e);
        } finally {
            loading.value = false;
        }
    }

    function toggleBalanceVisibility() {
        showBalance.value = !showBalance.value;
    }

    function setSearchQuery(query) {
        searchQuery.value = query;
    }

    // Retorna todas las propiedades y funciones para que estén disponibles
    return {
        // State
        wallets,
        loading,
        error,
        showBalance,
        searchQuery,
        totalBalanceFiat,
        fiatCurrency,
        
        // Getters
        lockedBalance,
        filteredWallets,
        
        // Actions
        fetchWallets,
        toggleBalanceVisibility,
        setSearchQuery,
    };
});