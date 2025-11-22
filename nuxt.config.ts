// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
  devtools: { enabled: true },
  app: {
    head: {
      title: 'Exchanger - Plataforma de Intercambio de Criptomonedas',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { hid: 'description', name: 'description', content: 'Plataforma segura para el intercambio de criptomonedas' }
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
      ],
      script: [
        { src: 'https://js.pusher.com/8.2.0/pusher.min.js' }
      ]
    },
    pageTransition: { 
      name: 'slide', 
      mode: 'out-in', 
      duration: 400,
      css: false
    },
    layoutTransition: { 
      name: 'layout', 
      mode: 'out-in', 
      duration: 300 
    }
  },
  // Registrar plugins
  plugins: [
    '~/plugins/axios.js',
    '~/plugins/pusher.client.js'
  ],
  // Configuración de rutas
  router: {
    middleware: ['auth']
  },
  // Configuración de módulos
  modules: [
    '@nuxtjs/tailwindcss', 
    '@pinia/nuxt', 
    'pinia-plugin-persistedstate/nuxt'
    
  ],

  
  
  // Configuración de Tailwind CSS
  tailwindcss: {
    cssPath: '~/assets/css/tailwind.css',
    configPath: 'tailwind.config.js',
    exposeConfig: false,
    injectPosition: 0,
    viewer: true,
  },
  // Variables de entorno
  runtimeConfig: {
    public: {
      apiBase: 'https://exchanger.test/api',
      apiUrl: 'https://exchanger.test/api',
      pusher: {
        key: 'fbd283439499f54faa27',
        cluster: 'mt1'
      }
    }
  }
})
