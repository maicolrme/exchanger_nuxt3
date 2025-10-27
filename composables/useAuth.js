// composables/useAuth.js
import { ref } from 'vue';
import axios from 'axios';

export const useAuth = () => {
  const user = ref(null);
  const isAuthenticated = ref(false);
  const loading = ref(false);
  const error = ref(null);

  // Cargar usuario desde el token almacenado
  const loadUser = async () => {
    const token = localStorage.getItem('auth_token');
    if (!token) return;
    
    loading.value = true;
    error.value = null;
    
    try {
      const response = await axios.get('/user');
      user.value = response.data;
      isAuthenticated.value = true;
    } catch (err) {
      console.error('Error al cargar usuario:', err);
      localStorage.removeItem('auth_token');
      user.value = null;
      isAuthenticated.value = false;
      error.value = 'Sesión expirada. Por favor inicie sesión nuevamente.';
    } finally {
      loading.value = false;
    }
  };

  // Iniciar sesión
  const login = async (email, password) => {
    loading.value = true;
    error.value = null;
    
    try {
      const response = await axios.post('/login', { email, password });
      
      if (response.data.success && response.data.token) {
        localStorage.setItem('auth_token', response.data.token);
        user.value = response.data.user;
        isAuthenticated.value = true;
        return true;
      } else {
        throw new Error('Respuesta inválida del servidor');
      }
    } catch (err) {
      console.error('Error de inicio de sesión:', err);
      error.value = err.response?.data?.message || 'Error al iniciar sesión. Verifique sus credenciales.';
      return false;
    } finally {
      loading.value = false;
    }
  };

  // Registrar usuario
  const register = async (name, email, password, password_confirmation) => {
    loading.value = true;
    error.value = null;
    
    try {
      const response = await axios.post('/register', {
        name,
        email,
        password,
        password_confirmation
      });
      
      if (response.data.success && response.data.token) {
        localStorage.setItem('auth_token', response.data.token);
        user.value = response.data.user;
        isAuthenticated.value = true;
        return true;
      } else {
        throw new Error('Respuesta inválida del servidor');
      }
    } catch (err) {
      console.error('Error de registro:', err);
      error.value = err.response?.data?.message || 'Error al registrar usuario.';
      return false;
    } finally {
      loading.value = false;
    }
  };

  // Cerrar sesión
  const logout = async () => {
    loading.value = true;
    error.value = null;
    
    try {
      await axios.post('/logout');
    } catch (err) {
      console.error('Error al cerrar sesión:', err);
    } finally {
      localStorage.removeItem('auth_token');
      user.value = null;
      isAuthenticated.value = false;
      loading.value = false;
    }
  };

  return {
    user,
    isAuthenticated,
    loading,
    error,
    loadUser,
    login,
    register,
    logout
  };
};