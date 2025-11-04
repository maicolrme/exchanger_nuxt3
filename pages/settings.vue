<template>
  <div class="w-full">
    <div class="max-w-5xl mx-auto px-4">
      <!-- Encabezado -->
      <div class="bg-gray-800 border border-gray-700 rounded-lg p-4 mb-6">
        <h2 class="text-xl font-semibold text-white">Configuración</h2>
        <p class="text-sm text-gray-400">Administra tu cuenta, seguridad y preferencias.</p>
      </div>

      <!-- Tabs -->
      <div class="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
        <div class="border-b border-gray-700">
          <nav class="flex flex-wrap gap-2 p-2">
            <button @click="activeTab = 'account'" class="px-4 py-2 rounded-lg transition"
                    :class="activeTab === 'account' ? 'bg-yellow-500 text-gray-900 font-semibold' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'">
              Cuenta
            </button>
            <button @click="activeTab = 'security'" class="px-4 py-2 rounded-lg transition"
                    :class="activeTab === 'security' ? 'bg-yellow-500 text-gray-900 font-semibold' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'">
              Seguridad
            </button>
            <button @click="activeTab = 'preferences'" class="px-4 py-2 rounded-lg transition"
                    :class="activeTab === 'preferences' ? 'bg-yellow-500 text-gray-900 font-semibold' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'">
              Preferencias
            </button>
          </nav>
        </div>

        <!-- Contenido de tabs -->
        <div class="p-4">
          <!-- Tab Cuenta -->
          <section v-show="activeTab === 'account'" class="space-y-4">
            <div class="grid md:grid-cols-2 gap-4">
              <div class="bg-gray-700 border border-gray-700 rounded-lg p-4">
                <h3 class="text-white font-medium mb-3">Datos personales</h3>
                <div class="space-y-3">
                  <div>
                    <label class="block text-sm text-gray-400 mb-1">Nombre</label>
                    <input v-model="formAccount.name" type="text" placeholder="Tu nombre"
                           class="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500" />
                  </div>
                  <div>
                    <label class="block text-sm text-gray-400 mb-1">Email</label>
                    <input v-model="formAccount.email" type="email" placeholder="tu@correo.com"
                           class="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500" />
                  </div>
                  <div>
                    <label class="block text-sm text-gray-400 mb-1">Teléfono</label>
                    <input v-model="formAccount.phone" type="tel" placeholder="+00 000 000 000"
                           class="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500" />
                  </div>
                </div>
                <div class="mt-4 flex justify-end">
                  <button @click="saveAccount" class="px-4 py-2 bg-yellow-500 text-gray-900 rounded font-semibold hover:bg-yellow-400">Guardar cambios</button>
                </div>
              </div>

              <div class="bg-gray-700 border border-gray-700 rounded-lg p-4">
                <h3 class="text-white font-medium mb-3">Información de perfil</h3>
                <div class="space-y-3 text-sm">
                  <p class="text-gray-300">Estado de verificación: <span class="text-yellow-400 font-semibold">No verificado</span></p>
                  <p class="text-gray-300">Plan: <span class="text-white">Estándar</span></p>
                  <p class="text-gray-300">Último acceso: <span class="text-white">hoy</span></p>
                </div>
              </div>
            </div>
          </section>

          <!-- Tab Seguridad -->
          <section v-show="activeTab === 'security'" class="space-y-4">
            <div class="bg-gray-700 border border-gray-700 rounded-lg p-4">
              <h3 class="text-white font-medium mb-3">Cambiar contraseña</h3>
              <div class="grid md:grid-cols-3 gap-4">
                <div>
                  <label class="block text-sm text-gray-400 mb-1">Contraseña actual</label>
                  <input v-model="securityForm.currentPassword" type="password"
                         class="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500" />
                </div>
                <div>
                  <label class="block text-sm text-gray-400 mb-1">Nueva contraseña</label>
                  <input v-model="securityForm.newPassword" type="password"
                         class="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500" />
                </div>
                <div>
                  <label class="block text-sm text-gray-400 mb-1">Confirmar nueva</label>
                  <input v-model="securityForm.confirmPassword" type="password"
                         class="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500" />
                </div>
              </div>
              <div class="mt-4 flex justify-end">
                <button @click="saveSecurity" class="px-4 py-2 bg-yellow-500 text-gray-900 rounded font-semibold hover:bg-yellow-400">Actualizar contraseña</button>
              </div>
            </div>

            <div class="bg-gray-700 border border-gray-700 rounded-lg p-4">
              <h3 class="text-white font-medium mb-3">Autenticación en dos pasos (2FA)</h3>
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-gray-300 text-sm">Añade una capa extra de seguridad con 2FA.</p>
                </div>
                <button @click="enable2FA = !enable2FA" class="w-16 h-7 rounded-full flex items-center"
                        :class="enable2FA ? 'bg-yellow-500' : 'bg-gray-700'">
                  <span class="inline-block w-6 h-6 bg-white rounded-full transform transition"
                        :class="enable2FA ? 'translate-x-9' : 'translate-x-1'"></span>
                </button>
              </div>
            </div>
          </section>

          <!-- Tab Preferencias -->
          <section v-show="activeTab === 'preferences'" class="space-y-4">
            <div class="bg-gray-700 border border-gray-700 rounded-lg p-4">
              <h3 class="text-white font-medium mb-3">Preferencias generales</h3>
              <div class="grid md:grid-cols-3 gap-4">
                <div>
                  <label class="block text-sm text-gray-400 mb-1">Idioma</label>
                  <select v-model="prefs.language" class="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none">
                    <option value="es">ES</option>
                    <option value="en">EN</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm text-gray-400 mb-1">Moneda</label>
                  <select v-model="prefs.currency" class="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none">
                    <option value="USDT">USDT</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm text-gray-400 mb-1">Notificaciones</label>
                  <div class="flex items-center gap-3">
                    <button @click="prefs.notifications = !prefs.notifications" class="w-16 h-7 rounded-full flex items-center"
                            :class="prefs.notifications ? 'bg-yellow-500' : 'bg-gray-700'">
                      <span class="inline-block w-6 h-6 bg-white rounded-full transform transition"
                            :class="prefs.notifications ? 'translate-x-9' : 'translate-x-1'"></span>
                    </button>
                    <span class="text-sm text-gray-300">Activar notificaciones</span>
                  </div>
                </div>
              </div>
              <div class="mt-4 flex justify-end">
                <button @click="savePreferences" class="px-4 py-2 bg-yellow-500 text-gray-900 rounded font-semibold hover:bg-yellow-400">Guardar preferencias</button>
              </div>
              <p class="text-xs text-gray-400 mt-3">Nota: El tema claro/oscuro se controla desde el header del layout.</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'p2p' })

const activeTab = ref('account')
const formAccount = ref({ name: '', email: '', phone: '' })
const securityForm = ref({ currentPassword: '', newPassword: '', confirmPassword: '' })
const enable2FA = ref(false)
const prefs = ref({ language: 'es', currency: 'USDT', notifications: true })

const saveAccount = () => {
  // TODO: Integrar con API real si aplica
  console.log('Guardar cuenta:', formAccount.value)
}

const saveSecurity = () => {
  // TODO: Integrar con API real si aplica
  console.log('Actualizar seguridad:', securityForm.value)
}

const savePreferences = () => {
  // TODO: Integrar con API real si aplica
  console.log('Guardar preferencias:', prefs.value)
}
</script>

<style scoped>
/* Sin estilos específicos: usamos el sistema de colores del layout p2p */
</style>