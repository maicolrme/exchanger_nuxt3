<!-- components/DeviceView.vue -->
<script setup>
import { computed, defineAsyncComponent, h } from 'vue'

const props = defineProps({
  // Ruta del componente: 'Home', 'products/ProductDetail', 'user/profile/Settings'
  name: {
    type: String,
    required: true
  },
  // Ruta personalizada para mobile (opcional)
  mobile: {
    type: String,
    default: null
  },
  // Ruta personalizada para desktop (opcional)
  desktop: {
    type: String,
    default: null
  },
  // Ruta personalizada para tablet (opcional)
  tablet: {
    type: String,
    default: null
  },
  // Carpeta base personalizada (por defecto 'views')
  baseFolder: {
    type: String,
    default: 'pages'
  },
  // Usar vista separada para tablets
  useTabletView: {
    type: Boolean,
    default: false
  }
})

const { $device } = useNuxtApp()

// Función para cargar componente de forma dinámica con Vite
const loadComponent = (path) => {
  // Usar import.meta.glob para que Vite pueda resolverlo en build time
  const modules = import.meta.glob('../pages/**/*.vue')
  
  // Construir la ruta completa
  const fullPath = `../${path}.vue`
  
  // Buscar el módulo
  const moduleLoader = modules[fullPath]
  
  if (!moduleLoader) {
    console.error(`Component not found: ${fullPath}`)
    console.log('Available modules:', Object.keys(modules))
    // Devolver un componente de error
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

// Componente dinámico según dispositivo
const deviceComponent = computed(() => {
  const isMobile = $device.isMobileDevice
  const isTablet = $device.isTabletDevice
  
  // Si se especifican rutas personalizadas completas
  if (props.mobile && props.desktop) {
    let path
    
    if (props.useTabletView && props.tablet && isTablet) {
      path = props.tablet
    } else {
      path = isMobile ? props.mobile : props.desktop
    }
    
    return loadComponent(path)
  }
  
  // Usar estructura de carpetas por defecto
  let device
  if (props.useTabletView && isTablet) {
    device = 'tablet'
  } else {
    device = isMobile ? 'mobile' : 'desktop'
  }
  
  const path = `${props.baseFolder}/${device}/${props.name}`
  return loadComponent(path)
})

// Información del dispositivo disponible
const deviceInfo = computed(() => ({
  type: $device.deviceType,
  os: $device.deviceOS,
  isMobile: $device.isMobileDevice,
  isTablet: $device.isTabletDevice,
  isDesktop: $device.isDesktopDevice
}))
</script>

<template>
  <component :is="deviceComponent" v-bind="$attrs">
    <!-- Pass through slots -->
    <template v-for="(_, slot) in $slots" #[slot]="scope">
      <slot :name="slot" v-bind="scope" :device="deviceInfo" />
    </template>
  </component>
</template>