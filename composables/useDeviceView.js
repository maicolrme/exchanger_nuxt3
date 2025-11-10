// composables/useDeviceView.js
import { computed, defineAsyncComponent, h } from 'vue'

export const useDeviceView = (viewPath, options = {}) => {
  const {
    baseFolder = 'pages',
    mobileCustom = null,
    desktopCustom = null,
    tabletCustom = null,
    useTabletView = false
  } = options

  const { $device } = useNuxtApp()

  // Función helper para cargar componentes
  const loadComponent = (path) => {
    // import.meta.glob pre-carga todos los módulos en build time
    const modules = import.meta.glob('~/pages/**/*.vue')
    
    const fullPath = `~/pages/${path}.vue`
    const moduleLoader = modules[fullPath]
    
    if (!moduleLoader) {
      console.error(`Component not found: ${fullPath}`)
      return defineAsyncComponent(() => 
        Promise.resolve({
          setup() {
            return () => h('div', { 
              style: 'padding: 20px; border: 2px solid red; color: red;' 
            }, `Component not found: ${path}`)
          }
        })
      )
    }
    
    return defineAsyncComponent(moduleLoader)
  }

  const deviceComponent = computed(() => {
    const isMobile = $device.isMobileDevice
    const isTablet = $device.isTabletDevice

    // Si se especifican rutas personalizadas
    if (mobileCustom && desktopCustom) {
      let path
      
      if (useTabletView && tabletCustom && isTablet) {
        path = tabletCustom
      } else {
        path = isMobile ? mobileCustom : desktopCustom
      }
      
      // Si la ruta personalizada ya incluye baseFolder, usarla directamente
      return loadComponent(path)
    }

    // Usar estructura de carpetas por defecto
    let device
    if (useTabletView && isTablet) {
      device = 'tablet'
    } else {
      device = isMobile ? 'mobile' : 'desktop'
    }
    
    const path = `${device}/${viewPath}`
    return loadComponent(path)
  })

  const deviceInfo = computed(() => ({
    type: $device.deviceType,
    os: $device.deviceOS,
    isMobile: $device.isMobileDevice,
    isTablet: $device.isTabletDevice,
    isDesktop: $device.isDesktopDevice,
    isPhone: $device.isPhoneDevice
  }))

  return {
    deviceComponent,
    deviceInfo,
    device: $device
  }
}

// Composable alternativo para detección simple
export const useDevice = () => {
  const { $device } = useNuxtApp()
  
  return computed(() => ({
    isMobile: $device.isMobileDevice,
    isTablet: $device.isTabletDevice,
    isDesktop: $device.isDesktopDevice,
    isPhone: $device.isPhoneDevice,
    type: $device.deviceType,
    os: $device.deviceOS
  }))
}