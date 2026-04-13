import React, { createContext, useState, useEffect } from 'react';
import { Platform } from 'react-native'; // 👈 IMPORTANTE
import * as SecureStore from 'expo-secure-store';
import { syncPathologiesLocal } from '../services/dbService';
import api from '../api/api';
import { syncDetections } from '../services/syncService';
import { registerForPushNotificationsAsync } from '../services/notificationService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [userToken, setUserToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);

useEffect(() => {
  const checkToken = async () => {
    try {
      let token;
      if (Platform.OS === 'web') {
        token = localStorage.getItem('userToken'); // Usar localStorage nativo en Web
      } else {
        token = await SecureStore.getItemAsync('userToken');
      }

      if (token) {
        setUserToken(token);
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

  const fetchAndSyncPathologies = async (token) => {
    try {
      const response = await api.get('pathologies');
      
      if (response.data && response.data.length > 0) {
        
        // --- BLOQUE PROTEGIDO PARA MÓVIL ---
        if (Platform.OS !== 'web') {
          // Solo intentamos tocar SQLite si NO estamos en la web
          await syncPathologiesLocal(response.data); 
          console.log("✅ Catálogo SQLite actualizado (Móvil)");
          await syncDetections(); 
        } else {
          // En la web solo guardamos en el estado o simplemente confirmamos
          console.log("✅ Datos recibidos en Web (Sin usar SQLite)");
        }
        // -----------------------------------

      }
    } catch (error) {
      console.log("❌ Error en la petición:", error.message);
    }
  };

 const login = async (token) => {
  if (Platform.OS === 'web') {
    localStorage.setItem('userToken', token);
  } else {
    await SecureStore.setItemAsync('userToken', token);
  }
  setUserToken(token);
  setIsGuest(false);
  fetchAndSyncPathologies(token); 

  // Registrar para notificaciones push después del login
  if (Platform.OS !== 'web'){
    await registerForPushNotificationsAsync(token);
  }
};

 const logout = async () => {
  if (Platform.OS === 'web') {
    localStorage.removeItem('userToken');
  } else {
    await SecureStore.deleteItemAsync('userToken');
  }
  setUserToken(null);
  setIsGuest(false);
};

  const enterAsGuest = () => {
    setIsGuest(true);
    setUserToken(null);
  };

  return (
    <AuthContext.Provider value={{ userToken, isLoading, isGuest, login, logout, enterAsGuest }}>
      {children}
    </AuthContext.Provider>
  );
};