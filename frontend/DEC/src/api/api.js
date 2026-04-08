import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// 1. REGLA DE ORO: Usa tu IP privada (Ej: 192.168.1.XX) 
// 'localhost' solo funciona dentro del emulador, no en tu celular físico.
const BASE_URL = 'http://10.4.1.234:8089/api/'; 

const api = axios.create({
    baseURL: BASE_URL,
    timeout: 15000, // Si el internet en el campo es lento, espera 10s antes de fallar
});

// 2. INTERCEPTOR: Este código se ejecuta ANTES de cada petición
api.interceptors.request.use(
  async (config) => {
      let token;
      // 👈 Validación híbrida para evitar el error en Web
      if (Platform.OS === 'web') {
          token = localStorage.getItem('userToken');
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
    // Lanzamos el error para que el componente lo capture
    throw error.response ? error.response.data : new Error('Error de conexión');
  }
};

export default api;