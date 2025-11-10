// plugins/mobile-detect.js
import MobileDetect from 'mobile-detect'

export default defineNuxtPlugin({
  name: 'mobile-detect',
  enforce: 'pre', // Ejecutar antes que otros plugins
  setup(nuxtApp) {
    // Evitar redefinición
    if (nuxtApp.$device) {
      return
    }

    // Obtener User Agent
    let userAgent = ''
    
    if (process.server) {
      // SSR: obtener del request
      userAgent = nuxtApp.ssrContext?.event?.node?.req?.headers['user-agent'] || ''
    } else {
      // Cliente: obtener del navegador
      userAgent = navigator.userAgent || ''
    }

    const md = new MobileDetect(userAgent)

    // Crear objeto de detección reactivo
    const device = reactive({
      // Métodos de detección
      isMobile: () => md.mobile() !== null,
      isTablet: () => md.tablet() !== null,
      isDesktop: () => md.mobile() === null && md.tablet() === null,
      isPhone: () => md.phone() !== null,
      
      // Información detallada
      os: () => md.os(),
      userAgent: () => md.userAgent(),
      phone: () => md.phone(),
      tablet: () => md.tablet(),
      mobile: () => md.mobile(),
      
      // Métodos útiles
      is: (key) => md.is(key),
      match: (pattern) => md.match(pattern),
      isPhoneSized: () => md.phone() !== null,
      version: (key) => md.version(key),
      versionStr: (key) => md.versionStr(key),
      
      // Propiedades computadas
      get isMobileDevice() { 
        return md.mobile() !== null 
      },
      get isTabletDevice() { 
        return md.tablet() !== null 
      },
      get isDesktopDevice() { 
        return md.mobile() === null && md.tablet() === null 
      },
      get isPhoneDevice() { 
        return md.phone() !== null 
      },
      get deviceOS() { 
        return md.os() 
      },
      get deviceType() {
        if (md.phone()) return 'phone'
        if (md.tablet()) return 'tablet'
        if (md.mobile()) return 'mobile'
        return 'desktop'
      }
    })

    // Proporcionar globalmente
    return {
      provide: {
        device,
        md
      }
    }
  }
})