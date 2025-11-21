import { defineStore } from 'pinia'
import { useNuxtApp } from '#app'

export const useP2pStore = defineStore('p2p', {
  state: () => ({
    ads: [],
    myAds: [],
    currentAd: null,
    isLightMode: false,
    // Listas dinámicas de monedas
    fiatCoins: [],
    fiatLoading: false,
    fiatError: null,
    cryptoCoins: [],
    cryptoLoading: false,
    cryptoError: null,
    formData: {
      type: 'buy',
      crypto: 'BTC',
      minAmount: null,
      maxAmount: null,
      fiat: 'USD',
      fiatId: null,
      price: null,
      paymentMethods: [],
      terms: '',
      paymentWindow: 15,
      priceType: 'fixed',
      pricePremium: null
    }
  }),
  
  actions: {
    toggleTheme() {
      this.isLightMode = !this.isLightMode
      localStorage.setItem('isLightMode', this.isLightMode)
    },
    
    publishAd(adData) {
      // Aquí se enviaría el anuncio a un backend en una aplicación real
      const newAd = {
        id: Date.now().toString(),
        userId: 'current-user', // En una app real, esto vendría del usuario autenticado
        createdAt: new Date().toISOString(),
        status: 'active',
        ...adData
      }
      
      this.ads.push(newAd)
      this.myAds.push(newAd)
      return newAd
    },
    
    resetForm() {
      this.formData = {
        type: 'buy',
        crypto: 'BTC',
        minAmount: null,
        maxAmount: null,
        fiat: 'USD',
        fiatId: null,
        price: null,
        paymentMethods: [],
        terms: '',
        paymentWindow: 15,
        priceType: 'fixed',
        pricePremium: null
      }
    },
    
    validateAdForm() {
      const errors = []
      const { minAmount, maxAmount, paymentMethods, terms, paymentWindow, price, priceType, pricePremium } = this.formData
      
      if (!minAmount || !maxAmount || paymentMethods.length === 0 || !terms || !paymentWindow) {
        errors.push('Por favor, completa todos los campos requeridos.')
      }
      
      if (!price && priceType === 'fixed') {
        errors.push('Por favor, ingresa un precio fijo.')
      }
      
      if (!pricePremium && priceType === 'variable') {
        errors.push('Por favor, ingresa un margen de precio variable.')
      }
      
      if (minAmount <= 0 || maxAmount <= 0 || paymentWindow <= 0) {
        errors.push('Los valores de cantidad y tiempo límite deben ser mayores que cero.')
      }
      
      if (priceType === 'fixed' && price <= 0) {
        errors.push('El precio fijo debe ser mayor que cero.')
      }
      
      if (priceType === 'variable' && pricePremium <= 0) {
        errors.push('El margen de precio variable debe ser mayor que cero.')
      }
      
      if (minAmount > maxAmount) {
        errors.push('La cantidad mínima no puede ser mayor que la cantidad máxima.')
      }
      
      return {
        isValid: errors.length === 0,
        errors
      }
    },
    
    // Cargar el tema desde localStorage al iniciar
    initTheme() {
      const savedTheme = localStorage.getItem('isLightMode')
      if (savedTheme !== null) {
        this.isLightMode = JSON.parse(savedTheme)
      }
    },

    // Cargar monedas desde /coin y separar fiat/crypto
    async fetchFiats() {
      const { $axios } = useNuxtApp()
      this.fiatLoading = true
      this.fiatError = null
      try {
        const resp = await $axios.get('/coin')
        // Soporta múltiples formatos de respuesta del backend
        const root = resp?.data
        let list = []
        if (Array.isArray(root)) {
          list = root
        } else if (Array.isArray(root?.data)) {
          list = root.data
        } else if (Array.isArray(root?.coins)) {
          list = root.coins
        } else if (Array.isArray(root?.payload)) {
          list = root.payload
        } else {
          list = []
        }
        // Usar los datos crudos: clasificar con heurísticas
        const isFiat = (c) => {
          const type = typeof c.type === 'string' ? c.type.toLowerCase() : ''
          const network = c.network ?? c.chain ?? null
          const decimals = c.decimal_places ?? c.decimals ?? null
          return (
            type === 'fiat' || type === 'fiat_currency' ||
            c.is_fiat === 1 || c.is_fiat === true || c.isFiat === true ||
            c.offLedger === 1 || c.off_ledger === 1 ||
            network === null || network === '' ||
            decimals === 2
          )
        }

        this.fiatCoins = list.filter(isFiat)
        this.cryptoCoins = list.filter(c => !isFiat(c) && (c.enable_to_post === 1 || c.enable_to_post === true || c.enable_to_post === '1'))

        // Si por alguna razón no se detectaron fiats pero sí hay lista, usar fallback
        if (this.fiatCoins.length === 0 && list.length > 0) {
          // Considerar como fiat aquellos sin network o con 2 decimales
          this.fiatCoins = list.filter(c => (c.network == null || c.network === '') || ((c.decimal_places ?? c.decimals) === 2))
        }

        // Seleccionar fiat por defecto si no hay uno asignado
        if (!this.formData.fiatId && this.fiatCoins.length > 0) {
          const first = this.fiatCoins[0]
          this.formData.fiatId = first.id ?? first.currency_id ?? first._id ?? null
          this.formData.fiat = first?.symbol || first?.code || first?.name || this.formData.fiat
        }
        if (!this.formData.crypto && this.cryptoCoins.length > 0) {
          const firstC = this.cryptoCoins[0]
          this.formData.crypto = firstC?.symbol || firstC?.code || firstC?.name
        }
        
      } catch (e) {
        console.error('Error cargando monedas /coin:', e)
        this.fiatError = e?.response?.data?.message || 'Error al cargar monedas'
      } finally {
        this.fiatLoading = false
      }
    }
  }
})