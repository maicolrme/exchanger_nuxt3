<!-- pages/index.vue -->
<script setup>
const { $device } = useNuxtApp()

definePageMeta({
  layout: 'p2p'
});

console.log('Tipo de dispositivo:', $device.deviceType)
console.log('Sistema operativo:', $device.deviceOS)
console.log('¿Es móvil?', $device.isMobileDevice)
</script>

<template>
  <div>
    <DeviceView name="index" />
  </div>
</template>