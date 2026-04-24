import React, { createContext, useState, useEffect } from 'react';
import { Platform, Alert } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { syncPathologiesLocal } from '../services/dbService';
import api from '../api/api';
import { syncDetections, syncServerToLocal, syncLocalTreatments, syncRemoteTreatments } from '../services/syncService';
import { registerForPushNotificationsAsync } from '../services/notificationService';

// -------- MÓDULOS NATIVOS (SOLO MÓVIL) ----------
let LoginManager, AccessToken, GoogleSignin, makeRedirectUri, Google, WebBrowser, GraphRequest, GraphRequestManager, Settings;

if (Platform.OS !== 'web') {
  // Importaciones dinámicas para evitar que webpack/metro las incluya en web
  const fbsdk = require('react-native-fbsdk-next');
  LoginManager = fbsdk.LoginManager;
  AccessToken = fbsdk.AccessToken;
  GraphRequest = fbsdk.GraphRequest;
  GraphRequestManager = fbsdk.GraphRequestManager;
  Settings = fbsdk.Settings;


  const googleSignin = require('@react-native-google-signin/google-signin');
  GoogleSignin = googleSignin.GoogleSignin;

  const expoAuth = require('expo-auth-session');
  makeRedirectUri = expoAuth.makeRedirectUri;
  Google = expoAuth.Google;

  const webBrowser = require('expo-web-browser');
  WebBrowser = webBrowser;
  WebBrowser.maybeCompleteAuthSession();
}

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [userToken, setUserToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    // Configurar Google y Facebook solo en móvil
    if (Platform.OS !== 'web' && GoogleSignin && Settings) {
      GoogleSignin.configure({
        webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
        offlineAccess: true,
      });
      Settings.initializeSDK()
    }

    const checkToken = async () => {
      try {
        let token = Platform.OS === 'web'
          ? localStorage.getItem('userToken')
          : await SecureStore.getItemAsync('userToken');

        if (token) {
          await setUserToken(token);
          await fetchAndSyncPathologies(token);
        } else if (Platform.OS !== 'web') {
          // Solo revisar sesiones sociales en móvil
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

  // Enviar token al backend (funciona igual en móvil y web, pero las llamadas sociales solo en móvil)
  const sendTokenToServer = async (token, social) => {
    try {
      const response = await api.post(`users/auth/${social}`, {},
        { headers: { 'Authorization': `Bearer ${token}` }, timeout: 10000 }
      );
      const sessionToken = response.data.token;
      if (sessionToken) {
        if (Platform.OS === 'web') {
          localStorage.setItem('userToken', sessionToken);
        } else {
          await SecureStore.setItemAsync('userToken', sessionToken);
        }
        await setUserToken(sessionToken);
      }
    } catch (error) {
      if (!error.response) {
        Alert.alert("Error de conexión", "No se pudo conectar con el servidor DEC. Verifica tu internet.");
      } else if (error.response.status === 401) {
        Alert.alert("Sesión inválida", "La autenticación con Google/Facebook falló o expiró.");
      } else {
        Alert.alert("Error", "Ocurrió un problema al iniciar sesión. Inténtalo de nuevo.");
      }
    }
  };

  // Solo se ejecuta en móvil
  const checkSocialLogin = async () => {
    if (Platform.OS === 'web') return;

    try {
      // Verificar Facebook
      if (AccessToken) {
        const fbData = await AccessToken.getCurrentAccessToken();
        if (fbData) {
          console.log("Sesión persistente de Facebook detectada");
          await sendTokenToServer(fbData.accessToken.toString(), 'facebook');
          return;
        }
      }

      // Verificar Google
      if (GoogleSignin) {
        const hasGoogle = await GoogleSignin.hasPreviousSignIn();
        if (hasGoogle) {
          console.log("Sesión persistente de Google detectada");
          const googleUser = await GoogleSignin.signInSilently();
          const idToken = googleUser.data?.idToken || googleUser.idToken;
          await sendTokenToServer(idToken, 'google');
        }
      }
    } catch (error) {
      console.log("No hay sesión silenciosa disponible", error);
    }
  };

  const fetchAndSyncPathologies = async (token) => {
    try {
      const response = await api.get('pathologies');
      if (response.data && response.data.length > 0) {
        if (Platform.OS !== 'web') {
          await syncPathologiesLocal(response.data);
          console.log("✅ Catálogo SQLite actualizado (Móvil)");
          await syncDetections();
          await syncServerToLocal(token);
          await syncLocalTreatments();
          await syncRemoteTreatments(token);
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
      // Cerrar sesiones sociales (Facebook, Google)
      if (LoginManager && AccessToken) {
        const fbToken = await AccessToken.getCurrentAccessToken();
        if (fbToken) {
          await LoginManager.logOut();
        }
      }
      if (GoogleSignin) {
        const hasGoogle = await GoogleSignin.hasPreviousSignIn();
        if (hasGoogle) {
          await GoogleSignin.signOut();
        }
      }
      await SecureStore.deleteItemAsync('userToken');
      
      // Limpiar la base de datos local
      const { resetDatabase } = require('../services/dbService');
      resetDatabase();
    }
    setUserToken(null);
    setIsGuest(false);
  } catch (error) {
    console.error("Error durante logout:", error);
  }
};
  // Elmininar permisos si se  si se creó con fb/google
  const RevokeAccessSocial = async () => {
    try {
      if(Platform.OS !== 'web'){
        // Solo intentamos revocar Google si hay sesión activa
        const hasGoogle = await GoogleSignin.hasPreviousSignIn();
        if (hasGoogle) {
            await GoogleSignin.revokeAccess(); // Elimina el permiso de la App en su cuenta de Google
            console.log("Cuenta con Google eliminada") 
        }
        // Función de facebook (Revocación de los permisos mediante Graph API)
        const revokeFB = (tokenData) => new Promise((resolve, reject) => {
          const token = tokenData?.accessToken.toString();
          const request = new GraphRequest('/me/permissions', { accessToken: token, httpMethod: 'DELETE' }, (err, res) => {
            if (err) {
              console.error('Error Graph API:', err);
              reject(err);
            } else {
              console.log('Acceso a los datos de Facebook eliminado con éxito.');
              resolve(res);
            }
          });
          new GraphRequestManager().addRequest(request).start();
        });
        // Solo intentamos revocar FB si hay sesión activa
        const fbData = await AccessToken.getCurrentAccessToken();
        console.log(fbData)
        if (fbData) await revokeFB(fbData);
      }
    } catch (error) {
      console.error("Error durante eliminar cuentas sociales", error);
    }
  }

  const enterAsGuest = () => {
    setIsGuest(true);
    setUserToken(null);
  };

  return (
    <AuthContext.Provider value={{ userToken, setUserToken, isLoading, isGuest, login, logout, RevokeAccessSocial, enterAsGuest, sendTokenToServer }}>
      {children}
    </AuthContext.Provider>
  );
};
