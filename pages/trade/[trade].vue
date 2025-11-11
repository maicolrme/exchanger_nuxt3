<template>
  

  <DeviceView name="trade" :market="route.params.market" />
   
</template>

<script setup lang="ts">
// 1. Asignar el layout 'simple' (sin navbar) a esta página

const route = useRoute();
const market = route.params.market; // Esto te dará 'btc-usdt' si la URL es /trade/btc-usdt

</script>

<style scoped>
/* Estilos específicos de esta página, si fueran necesarios */
</style>
