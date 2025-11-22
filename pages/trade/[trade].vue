<template>
  

  <DeviceView name="trade" :market="formattedMarket" />
   
</template>

<script setup lang="ts">
import { computed } from 'vue';
// 1. Asignar el layout 'simple' (sin navbar) a esta página

const route = useRoute();
const marketFromRoute = computed(() => route.params.trade);

const formattedMarket = computed(() => {
  const market = marketFromRoute.value;
  if (typeof market === 'string') {
    return market.replace(/_/g, '/');
  }
  return market;
});

</script>

<style scoped>
/* Estilos específicos de esta página, si fueran necesarios */
</style>
