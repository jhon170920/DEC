import React, { createContext, useState, useEffect } from 'react';
import { Platform, Alert } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { syncPathologiesLocal } from '../services/dbService';
import api from '../api/api';
import { syncDetections, syncServerToLocal } from '../services/syncService';
import { registerForPushNotificationsAsync } from '../services/notificationService';

// LOGIN CON FACEBOOK
import { LoginManager, AccessToken } from 'react-native-fbsdk-next';
// LOGIN GOOGLE PLAY SERVICES (ANDROID PROMEDIO)
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
// LLOGIN SI NO TIENE GOOGLE PLAY SERVICES (HUAWEI MODERNO, ROOM PERSONALIZADO)
import { makeRedirectUri } from 'expo-auth-session';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
// Login con navegador
WebBrowser.maybeCompleteAuthSession();
// Login con PlayServices
GoogleSignin.configure({
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID, // SE USA EL ID DEL CLIENTE DE WEB PARA EL BACKEND
    offlineAccess: true, // Si necesita que el backend pida tokens nuevos
});
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [userToken, setUserToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    //Configurar Google al arrancar la App
    if (Platform.OS !== 'web') {
      GoogleSignin.configure({
        webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
        offlineAccess: true,
      });
    }
    const checkToken = async () => {
      try {
        // Validar si hay token en el almacenamiento
        let token = Platform.OS === 'web'
          ? localStorage.getItem('userToken')
          : await SecureStore.getItemAsync('userToken')
        // Si hay, pues normal seguimos
        if (token) {
          setUserToken(token)
          await fetchAndSyncPathologies(token);
        // Si no hay token local, vemos si hay una sesion previa con fb o google
        }else{
          await checkSocialLogin();
        }
      } catch (e) {
        console.log("Error leyendo el token", e);
      } finally {
        setIsLoading(false);
      }
    };
    checkToken();
  }, []);

  // Enviar al backend y validar el token de google o facebook
  const sendTokenToServer = async (token, social) => {
    try {
        // mandamos el token para el backend y validarlo
        // IMPORTANTE CAMBIAR LA IP DE LA URL PARA QUE FUNCIONE
        const response = await api.post(`users/auth/${social}`,
            {},
            { headers: { 'Authorization': `Bearer ${token}` }, timeout: 10000 }
        );
        // traemos nuestro propio token de la session del usuario
        const sessionToken = response.data.token
        if (sessionToken) {
            // guardamos el token tanto en el secure store como en nuestro estado del token
            await SecureStore.setItemAsync('userToken', response.data.token);
            await setUserToken(sessionToken)
        }
    } catch (error) {
        if (!error.response) {
            // Error de red (el servidor está caído o no hay internet)
            Alert.alert("Error de conexión", "No se pudo conectar con el servidor DEC. Verifica tu internet.");
        } else if (error.response.status === 401) {
            Alert.alert("Sesión inválida", "La autenticación con Google/Facebook falló o expiró.");
        } else {
            Alert.alert("Error", "Ocurrió un problema al iniciar sesión. Inténtalo de nuevo.", error.response);
        }
    }
  }
  const checkSocialLogin = async () => {
    if (Platform.OS === 'web') return;
    // SOLO EN LA APP
    try {
      // verificar Facebook
      const fbData = await AccessToken.getCurrentAccessToken();
      if (fbData) {
        await console.log("Sesión persistente de Facebook detectada");
        // Si hay, validamos el token de facebook. La función sendToken ya guarda el token propio creado de nuestra app
        await sendTokenToServer(fbData.accessToken.toString(), 'facebook')
        return;
      }

      // Verificar Google
      const hasGoogle = await GoogleSignin.hasPreviousSignIn();
      if (hasGoogle) {
        console.log("Sesión persistente de Google detectada");
        const googleUser = await GoogleSignin.signInSilently();
        const idToken = googleUser.data?.idToken || googleUser.idToken;
        // Si hay, validamos el token de Google. La función sendToken ya guarda el token propio creado de nuestra app
        await sendTokenToServer(idToken, 'google')
      }
    } catch (error) {
      console.log("No hay sesión silenciosa de Google disponible");
    }
  };

  const fetchAndSyncPathologies = async (token) => {
    try {
      const response = await api.get('pathologies');
      if (response.data && response.data.length > 0) {
        if (Platform.OS !== 'web') {
          await syncPathologiesLocal(response.data);
          console.log("✅ Catálogo SQLite actualizado (Móvil)");
          await syncDetections();               // local → servidor
          await syncServerToLocal(token);       // servidor → local (nuevo)
        } else {
          console.log("✅ Datos recibidos en Web (Sin usar SQLite)");
        }
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
    if (Platform.OS !== 'web') {
      await registerForPushNotificationsAsync(token);
    }
  };

  const logout = async () => {
    try {
      if (Platform.OS === 'web') {
        localStorage.removeItem('userToken');
      } else {
        // PARA APP:  
        // --- LOGOUT FACEBOOK --- (PRIMERO VALIDAR SI HAY)
        const fbToken = await AccessToken.getCurrentAccessToken();
          if (fbToken) {
            LoginManager.logOut(); 
            console.log("Facebook Session Closed");
          }
  
        // --- LOGOUT GOOGLE --- (PRIMERO VALIDAR SI HAY)
        const hasGoogle = await GoogleSignin.hasPreviousSignIn();
          if (hasGoogle) {
            await GoogleSignin.signOut();
            console.log("Google Session Closed");
          }
        // LIMPIAR EL TOKEN DEL SECURESTORE
        await SecureStore.deleteItemAsync('userToken');
      }
      // LIMPIAR ESTADOS GLOBALES
      setUserToken(null);
      setIsGuest(false);
    } catch (error) {
      console.error("Error durante logout:", error);
    }
  };

  const enterAsGuest = () => {
    setIsGuest(true);
    setUserToken(null);
  };

  return (
    <AuthContext.Provider value={{ userToken, setUserToken, isLoading, isGuest, login, logout, enterAsGuest, sendTokenToServer }}>
      {children}
    </AuthContext.Provider>
  );
};