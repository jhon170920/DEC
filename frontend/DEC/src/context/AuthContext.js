import React, { createContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [userToken, setUserToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);

  // Verificar si ya hay un token al abrir la app
  useEffect(() => {
    const checkToken = async () => {
      try {
        const token = await SecureStore.getItemAsync('userToken');
        if (token) setUserToken(token);
      } catch (e) {
        console.log("Error leyendo el token", e);
      }
      setIsLoading(false);
    };
    checkToken();
  }, []);

  return (
    <AuthContext.Provider value={{ userToken, setUserToken, isGuest, setIsGuest, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};