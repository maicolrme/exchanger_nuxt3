// composables/useDeviceView.js
import { computed, defineAsyncComponent } from 'vue'

export const useDeviceView = (viewPath, options = {}) => {
  const {
    baseFolder = 'views',
    mobileCustom = null,
    desktopCustom = null
  } = options

  const { isMobile, isTablet } = useDevice()

  const deviceComponent = computed(() => {
    const mobile = isMobile.value || isTablet.value

    // Si se especifican rutas personalizadas
    if (mobileCustom && desktopCustom) {
      const path = mobile ? mobileCustom : desktopCustom
      return defineAsyncComponent(() => import(`~/${path}.vue`))
    }

    // Usar estructura de carpetas por defecto
    const device = mobile ? 'mobile' : 'desktop'
    return defineAsyncComponent(() =>
      import(`~/${baseFolder}/${device}/${viewPath}.vue`)
    )
  })

  const deviceType = computed(() => {
    if (isMobile.value) return 'mobile'
    if (isTablet.value) return 'tablet'
    return 'desktop'
  })

  return {
    deviceComponent,
    deviceType,
    isMobile,
    isTablet
  }
}