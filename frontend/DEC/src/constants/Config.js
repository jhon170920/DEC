import Constants from 'expo-constants';

// La URL del backend. Cambia esto según tu configuración de desarrollo.
const API_URL = "http://localhost:8081"; 

// Si se esta usando Expo Go en un dispositivo físico, necesitas usar la IP de tu máquina en lugar de localhost.
// const API_URL = `http://${Constants.manifest.debuggerHost.split(':').shift()}:8081`;

export default {
  API_URL,
  // Otras constantes de configuración pueden ir aquí
};