import { defineStore } from 'pinia'

export const useP2pStore = defineStore('p2p', {
  state: () => ({
    ads: [],
    myAds: [],
    currentAd: null,
    isLightMode: false,
    formData: {
      type: 'buy',
      crypto: 'BTC',
      minAmount: null,
      maxAmount: null,
      fiat: 'USD',
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
    }
  }
})