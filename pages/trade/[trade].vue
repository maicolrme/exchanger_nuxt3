<template>
  

  <DeviceView name="trade" :market="route.params.market" />
   
</template>

<script setup lang="ts">
// 1. Asignar el layout 'simple' (sin navbar) a esta página

const route = useRoute();
const market = route.params.market; // Esto te dará 'btc-usdt' si la URL es /trade/btc-usdt




// 2. Establecer el título de la pestaña del navegador
useHead({
  title: '¡Felicitaciones!'
});
</script>

<style scoped>
/* Estilos específicos de esta página, si fueran necesarios */
</style>
