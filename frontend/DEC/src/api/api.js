import axios from 'axios';

const BASE_URL = 'http://localhost:8000/api';   //Remplaza con tu IP local si usas expo GO desde un movil. 
                                                // EJEMPLO: 'http://192.168.1.XX:8081/api'
const api = axios.create({
    baseURL: BASE_URL,
});

export const loginUser = async (email, password) => {
  try {
    const response = await api.post('/login', { email, password });
    return response.data; // Aquí viene el TOKEN que generamos en el backend
  } catch (error) {
    throw error.response ? error.response.data : new Error('Error de conexión');
  }
};

export default api;