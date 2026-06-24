import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// 1. REGLA DE ORO: Usa tu IP privada (Ej: 192.168.1.XX) 
// 'localhost' solo funciona dentro del emulador, no en tu celular físico.
const BASE_URL = 'https://dec-production.up.railway.app/api/'; 

const api = axios.create({
    baseURL: BASE_URL,
    timeout: 20000, // Si el internet en el campo es lento, espera 20s antes de fallar
});

// 2. INTERCEPTOR: Este código se ejecuta ANTES de cada petición
api.interceptors.request.use(
  async (config) => {
      let token;
      // Validación híbrida para evitar el error en Web
      if (Platform.OS === 'web') {
          token = sessionStorage.getItem('userToken');
      } else {
          token = await SecureStore.getItemAsync('userToken');
      }

      if (token) {
          config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
  },
  (error) => Promise.reject(error)
);

// INTERCEPTOR DE TOKEN ESPIRADO
api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      if (Platform.OS === 'web') {
        sessionStorage.removeItem('userToken');
        window.location.href = '/login';
      } else {
        await SecureStore.deleteItemAsync('userToken');
      }
      return Promise.reject(error);
    }
    return Promise.reject(error);
  }
);

// LOGIN DE USUARIO
export const loginUser = async (email, password) => {
  try {
    const response = await api.post('users/login', { email, password });
    return response.data; 
  } catch (error) {
    throw error.response ? error.response.data : new Error('Error de conexión');
  }
};

// REGISTRO DE USUARIO
export const registerUser = async (name, email, password) => {
  try {
    const response = await api.post('users/register', { 
      name, 
      email, 
      password 
    });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('Error de conexión');
  }
};

// VERIFICAR CODIGO PARA CULMINAR REGISTRO
export const verifyCode = async (email, code) => {
  try {
    const response = await api.post('users/verify-code', { email, code });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('Error de conexión');
  }
};

// RECUPERACIÓN DE CONTRASEÑA
export const requestRecoveryCode = async (email) => {
  try {
      const response = await api.post('recover/req-code', { email });
      return response.data;
  } catch (error) {
      throw error.response ? error.response.data : new Error('Error de conexión');
  }
};

// CAMBIAR CONTRASEÑA
export const changePasswordWithCode = async (email, code, newPass) => {
  try {
      const response = await api.post('recover/change-pass', { email, code, newPass });
      return response.data;
  } catch (error) {
      throw error.response ? error.response.data : new Error('Error de conexión');
  }
};

// CERRAR SESIÓN
export const logoutUser = async () => {
    return Promise.resolve();
};

// ELIMINAR LA CUENTA SI LA CREO CON EL FORMULARIO
export const deleteUserAccount = async (password) => {
    try {
      const response = await api.delete('users/delete', {
        data: { password }
      });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Error de conexión');
    }
};

// ELIMINAR LA CUENTA SI LA CREO CON GOOGLE O FACEBOOK
export const deleteUserAccountSocial = async () => {
  try {
    const response = await api.delete('users/delete-social');
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('Error de conexión');
  }
};

// ESTADISTICAS PARA EL PANEL WEB
export const statsService = {
  getIncidence: (start, end, groupBy) => 
      api.get(`/stats/incidence?startDate=${start}&endDate=${end}&groupBy=${groupBy}`),
  getMapData: (start, end) => 
      api.get(`/stats/map?startDate=${start}&endDate=${end}`),
  getKPIs: (start, end) => 
      api.get(`/stats/kpis?startDate=${start}&endDate=${end}`)
};

// ENVIAR MENSAJE DE CONTACTO (solo usuarios logueados — el email viene del token)
export const sendMessage = async (name, message) => {
    try {
        const response = await api.post('users/send-message', { name, message });
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : new Error('Error de conexión');
    }
};

export default api;