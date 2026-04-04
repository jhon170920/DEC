import React, { createContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { syncPathologiesLocal } from '../services/dbService';
import api from '../api/api';
import { syncDetections } from '../services/syncService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [userToken, setUserToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    const checkToken = async () => {
      try {
        const token = await SecureStore.getItemAsync('userToken');
        if (token) {
          setUserToken(token);
          // Si hay token, intentamos actualizar el catálogo de tratamientos de fondo
          fetchAndSyncPathologies(token);
        }
      } catch (e) {
        console.log("Error leyendo el token", e);
      } finally {
        setIsLoading(false);
      }
    };
    checkToken();
  }, []);

  // --- FUNCIONES DE ACCIÓN ---
  // 1. Descarga el catálogo de enfermedades de MongoDB a SQLite
const fetchAndSyncPathologies = async (token) => {
  try {
    console.log("Intentando descargar catálogo de:", api.defaults.baseURL + 'pathologies');
    
    const response = await api.get('pathologies');
//     const response = await api.get('pathologies', {
//   headers: { Authorization: `Bearer ${token}` }
// }); 
    
    // ESTO ES CLAVE: Mira qué llega exactamente
    console.log("Datos recibidos del servidor:", JSON.stringify(response.data, null, 2));

    if (response.data && response.data.length > 0) {
      await syncPathologiesLocal(response.data); 
      console.log("✅ Catálogo sincronizado desde Atlas");
      await syncDetections(); // Sincroniza detecciones pendientes después de actualizar el catálogo
    } else {
      console.log("❓ El servidor respondió, pero el array de patologías está vacío.");
    }
  } catch (error) {
    console.log("❌ Error en la petición:", error.message);
    if (error.response) {
       console.log("Status error:", error.response.status); // 404, 401, 500...
    }
  }
};

  // 2. Función de Login exitoso
  const login = async (token) => {
    await SecureStore.setItemAsync('userToken', token);
    setUserToken(token);
    setIsGuest(false);
    fetchAndSyncPathologies(token); // Descarga tratamientos apenas entra
    
  };

  // 3. Función para salir (Esto arreglará tu navegación en Result.jsx)
  const logout = async () => {
    await SecureStore.deleteItemAsync('userToken');
    setUserToken(null);
    setIsGuest(false);
    // Al setear userToken a null, AppNavigator te enviará automáticamente al Login
  };

  // 4. Entrar como invitado
  const enterAsGuest = () => {
    setIsGuest(true);
    setUserToken(null);
  };

  return (
    <AuthContext.Provider value={{ 
      userToken, 
      isLoading, 
      isGuest, 
      login, 
      logout, 
      enterAsGuest 
    }}>
      {children}
    </AuthContext.Provider>
  );
};