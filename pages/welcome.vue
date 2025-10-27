<template>
  <div class="welcome-container">
    <div class="welcome-header">
      <h1>Trading Exchanger</h1>
      <p class="lead">La plataforma de intercambio de criptomonedas más avanzada</p>
    </div>

    <div class="features-section">
      <div class="row">
        <div class="col-md-4">
          <div class="feature-card">
            <div class="feature-icon">
              <i class="bi bi-graph-up"></i>
            </div>
            <h3>Gráficos en Tiempo Real</h3>
            <p>Visualiza los movimientos del mercado con nuestros gráficos interactivos actualizados en tiempo real.</p>
          </div>
        </div>
        <div class="col-md-4">
          <div class="feature-card">
            <div class="feature-icon">
              <i class="bi bi-shield-lock"></i>
            </div>
            <h3>Seguridad Garantizada</h3>
            <p>Tu seguridad es nuestra prioridad. Implementamos las mejores prácticas de seguridad para proteger tus activos.</p>
          </div>
        </div>
        <div class="col-md-4">
          <div class="feature-card">
            <div class="feature-icon">
              <i class="bi bi-lightning"></i>
            </div>
            <h3>Operaciones Rápidas</h3>
            <p>Ejecuta órdenes de compra y venta con la mayor velocidad del mercado.</p>
          </div>
        </div>
      </div>
    </div>

    <div class="markets-preview">
      <h2>Mercados Disponibles</h2>
      <div class="table-responsive">
        <table class="table custom-table">
          <thead>
            <tr>
              <th>Par</th>
              <th>Último Precio</th>
              <th>Cambio 24h</th>
              <th>Volumen 24h</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>BTC/USDT</td>
              <td>50,245.32</td>
              <td class="text-success">+2.5%</td>
              <td>1,245,678.45</td>
            </tr>
            <tr>
              <td>ETH/USDT</td>
              <td>3,245.67</td>
              <td class="text-success">+1.8%</td>
              <td>987,654.32</td>
            </tr>
            <tr>
              <td>BSC/USDT</td>
              <td>412.89</td>
              <td class="text-danger">-0.7%</td>
              <td>456,789.12</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="cta-section">
      <h2>Comienza a operar ahora</h2>
      <p>Únete a miles de traders que confían en nuestra plataforma</p>
      <div class="cta-buttons">
        <NuxtLink to="/register" class="btn btn-primary btn-lg">Registrarse</NuxtLink>
        <NuxtLink to="/login" class="btn btn-outline-light btn-lg ms-3">Iniciar Sesión</NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useAuth } from '~/composables/useAuth';

// Usar el composable de autenticación
const { isAuthenticated } = useAuth();

// Definir middleware de invitado
definePageMeta({
  middleware: ['guest']
});
</script>

<style scoped>
.welcome-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.welcome-header {
  text-align: center;
  margin-bottom: 3rem;
  padding: 3rem 0;
}

.welcome-header h1 {
  font-size: 3.5rem;
  margin-bottom: 1rem;
  color: #00ff00;
}

.welcome-header .lead {
  font-size: 1.5rem;
  color: #cccccc;
}

.features-section {
  margin-bottom: 4rem;
}

.feature-card {
  background-color: #1e1e1e;
  border-radius: 10px;
  padding: 2rem;
  height: 100%;
  transition: transform 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-10px);
}

.feature-icon {
  font-size: 3rem;
  margin-bottom: 1.5rem;
  color: #00ff00;
}

.feature-card h3 {
  margin-bottom: 1rem;
  color: #ffffff;
}

.feature-card p {
  color: #cccccc;
}

.markets-preview {
  margin-bottom: 4rem;
}

.markets-preview h2 {
  text-align: center;
  margin-bottom: 2rem;
  color: #ffffff;
}

.custom-table {
  color: white;
  background-color: #1e1e1e;
  border-radius: 10px;
  overflow: hidden;
}

.custom-table thead th {
  color: #fff;
  background-color: #444;
  border-bottom: none;
}

.custom-table tbody tr {
  background-color: #222;
}

.custom-table tbody tr:nth-child(even) {
  background-color: #333;
}

.custom-table tbody td {
  color: white;
  border-top: 1px solid #444;
}

.cta-section {
  text-align: center;
  padding: 4rem 0;
  background-color: #1e1e1e;
  border-radius: 10px;
  margin-bottom: 2rem;
}

.cta-section h2 {
  color: #00ff00;
  margin-bottom: 1rem;
}

.cta-section p {
  color: #cccccc;
  margin-bottom: 2rem;
  font-size: 1.2rem;
}

.cta-buttons {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.text-success {
  color: #00ff00 !important;
}

.text-danger {
  color: #ff0000 !important;
}
</style>