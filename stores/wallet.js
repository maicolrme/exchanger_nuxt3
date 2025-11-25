import { defineStore } from 'pinia';

export const useWalletStore = defineStore('wallet', {
  state: () => ({
    wallets: [],
    loading: true,
    error: null,
    showBalance: true,
    searchQuery: '',
  }),
  getters: {
    totalBalance(state) {
      if (!state.wallets) return 0;
      return state.wallets.reduce((sum, w) => sum + parseFloat(w.fiat_ || 0), 0);
    },
    availableBalance(state) {
      if (!state.wallets) return 0;
      return state.wallets.reduce((sum, w) => sum + parseFloat(w.fiat_ || 0), 0);
    },
    lockedBalance(state) {
      if (!state.wallets) return 0;
      return state.wallets.reduce((sum, w) => {
        return sum + parseFloat(w.locked_fiat || 0);
      }, 0);
    },
    filteredWallets(state) {
      if (!state.wallets) return [];
      return state.wallets.filter(w => {
        const matchesSearch = w.name.toLowerCase().includes(state.searchQuery.toLowerCase()) || w.symbol.toLowerCase().includes(state.searchQuery.toLowerCase());
        return matchesSearch;
      });
    },
  },
  actions: {
    async fetchWallets() {
      this.loading = true;
      this.error = null;
      try {
        const { $axios } = useNuxtApp();
        const response = await $axios.get('/wallets');
        this.wallets = response.data.wallets.map(w => ({
          ...w,
          balance: parseFloat(w.balance || 0),
          locked: parseFloat(w.locked || 0),
        }));
      } catch (e) {
        this.error = 'Error al cargar los datos. Por favor, inténtalo de nuevo más tarde.';
        console.error(e);
      } finally {
        this.loading = false;
      }
    },
    toggleBalanceVisibility() {
      this.showBalance = !this.showBalance;
    },
    setSearchQuery(query) {
      this.searchQuery = query;
    },
  },
});