<template>
  <div class="app-layout">
    <AppNavbar />
    <div class="container main-content">
      <slot />
    </div>
  </div>
</template>

<script setup>
// El componente AppNavbar se importa automáticamente gracias a la convención de nombres de Nuxt
</script>

<style>
/* Estilos globales */
body {
  background-color: #121212;
  color: #ffffff;
  font-family: Arial, sans-serif;
  margin: 0;
  padding: 0;
}

.app-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
  padding: 20px 0;
}

/* Estilos para las tablas */
.custom-table {
  color: white;
}

.custom-table thead th {
  color: #fff;
  background-color: #444;
}

.custom-table tbody tr {
  background-color: #222;
}

.custom-table tbody tr:nth-child(even) {
  background-color: #333;
}

.custom-table tbody td {
  color: white;
}

/* Estilos para las tarjetas */
.card {
  background-color: #1e1e1e;
  border-color: #333;
  border-radius: 5px;
  margin-bottom: 15px;
}

.card-header {
  background-color: #333;
  border-bottom-color: #444;
  color: #00ff00;
}

.card-body {
  color: #ffffff;
}

/* Estilos para los formularios */
.form-control {
  background-color: #333;
  border-color: #444;
  color: white;
}

.form-control:focus {
  background-color: #444;
  border-color: #00ff00;
  color: white;
  box-shadow: 0 0 0 0.2rem rgba(0, 255, 0, 0.25);
}

/* Estilos para los botones */
.btn-primary {
  background-color: #00ff00;
  border-color: #00ff00;
  color: #000;
}

.btn-primary:hover, .btn-primary:focus {
  background-color: #00cc00;
  border-color: #00cc00;
  color: #000;
}

.btn-primary:disabled {
  background-color: #006600;
  border-color: #006600;
}

/* Estilos para los enlaces */
a {
  color: #00ff00;
}

a:hover {
  color: #00cc00;
  text-decoration: none;
}
</style>