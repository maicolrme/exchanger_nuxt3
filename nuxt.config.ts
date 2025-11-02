// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
  devtools: { enabled: true },
  app: {
    head: {
      title: 'Trading Exchanger',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' }
      ],
      link: [
      //  { rel: 'stylesheet', href: 'https://cdn.jsdelivr.net/npm/bootstrap@4.6.2/dist/css/bootstrap.min.css' }
      ],
      script: [
        { src: 'https://code.jquery.com/jquery-3.6.0.slim.min.js', body: true },
        { src: 'https://cdn.jsdelivr.net/npm/popper.js@1.16.1/dist/umd/popper.min.js', body: true },
     //   { src: 'https://cdn.jsdelivr.net/npm/bootstrap@4.6.2/dist/js/bootstrap.min.js', body: true }
      ]
    }
  },
  // Registrar plugins
  plugins: [
    '~/plugins/axios.js',
    '~/plugins/pusher.js'
  ],
  // Configuración de rutas
  router: {
    middleware: ['auth']
  },
  // Configuración de módulos
  modules: ['@nuxtjs/tailwindcss', '@pinia/nuxt'],
  
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
      pusherAppKey: '8b7a912a1b66ce5ad679',
      pusherCluster: 'mt1'
    }
  }
})
