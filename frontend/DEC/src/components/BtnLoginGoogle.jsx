import { useEffect, useState, useContext } from "react";
import { TouchableOpacity, Text, Image, StyleSheet, Alert } from "react-native";
import { AuthContext } from '../context/AuthContext.js';
import { Colors } from '../constants/colors.js'
import { useResponsiveLayout } from '../hooks/useResponsiveLayout';

import * as SecureStore from 'expo-secure-store';

// LOGIN GOOGLE PLAY SERVICES (ANDROID PROMEDIO)
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
// LLOGIN SI NO TIENE GOOGLE PLAY SERVICES (HUAWEI MODERNO, ROOM PERSONALIZADO)
import { makeRedirectUri } from 'expo-auth-session';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import api from "../api/api.js";
// Login con navegador
WebBrowser.maybeCompleteAuthSession();
// Login con PlayServices
GoogleSignin.configure({
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID, // SE USA EL ID DEL CLIENTE DE WEB PARA EL BACKEND
    offlineAccess: true, // Si necesita que el backend pida tokens nuevos
});

// PARA QUE FUNCIONE: INSTALAR LIBRERIAS NATIVAS, expo-auth-session Y '@react-native-google-signin/google-signin'. Modificar un poco el AppJson y volver a hacer un Build con expo. 3h masomenos. Hacerlo el build con el de Facebook de una vez
export default function BtnloginGoogle() {
    // ----RESPONSIVE LAYOUT
    const { iconS } = useResponsiveLayout();
    // traemos la funcion que actualiza el estado del token
    const { setUserToken } = useContext(AuthContext);
    // para el disabled del login y seguridad
    const [loading, setLoading] = useState(false);
    // Login con navegador
    const [request, response, promptAsync] = Google.useAuthRequest({
        androidClientId: process.env.EXPO_PUBLIC_GOOGLE_APP_CLIENT_ID,
        webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
        responseType: 'code',
        useProxy: true,
        scopes: ['profile', 'email'],
        redirectUri: makeRedirectUri({
            useProxy: true,
        }),
    });
    // Login con navegador
    useEffect(() => {
        if (response?.type === 'success') {
          const { id_token } = response.params;
          sendTokenToServer(id_token);
        }
    }, [response]);

    // Enviar al backend y validar el token de google
    const sendTokenToServer = async (googleToken) => {
        setLoading(true);
        try {
            // mandamos el googleToken para el backend y validarlo
            // IMPORTANTE CAMBIAR LA IP DE LA URL PARA QUE FUNCIONE
            const response = await api.post('users/auth/google',
                {},
                { headers: { 'Authorization': `Bearer ${googleToken}` }, timeout: 10000 }
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
                Alert.alert("Sesión inválida", "La autenticación con Google falló o expiró.");
            } else {
                Alert.alert("Error", "Ocurrió un problema al iniciar sesión. Inténtalo de nuevo.");
            }
        } finally {
            setLoading(false);
        }
    }
    // funcion del boton de google
    const handleGoogleLogin = async () => {
        setLoading(true)
        try {
            // vemos si tiene servicios de google
            await GoogleSignin.hasPlayServices();
            const userInfo = await GoogleSignin.signIn();
            // extraemos el token
            const idToken = userInfo.data?.idToken || userInfo.idToken;
            // verificamos si hay token 
            if (idToken) {
                // y se lo mandamos al backend
                await sendTokenToServer(idToken);
            }

        } catch (error) {
            // SI NO TIENE PLAY SERVICES
            if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
                await promptAsync();
                console.log("Play Services no disponibles, activando navegador...");
            }
            // Validaciones silenciosas (donde no necesitas alarmar al usuario)
            if (error.code === statusCodes.SIGN_IN_CANCELLED) {
                return; // El usuario simplemente cerró la ventana
            }

            if (error.code === statusCodes.IN_PROGRESS) {
                return; // Ya se está intentando loguear
            }

        } finally {
            setLoading(false)
        }
    }
    // Función para recuperar sesion de Google
    const refreshGoogleToken = async () => {
        try {
            const userInfo = await GoogleSignin.signInSilently();
            // Si hay regresamos el token de la sesion de Google
            return userInfo?.data?.idToken;
        } catch (error) {
            if (error.code === statusCodes.SIGN_IN_REQUIRED) {
                await GoogleSignin.signOut(); // Limpia el estado del SDK
                await SecureStore.deleteItemAsync('userToken'); // Limpiar el token que está en el dispositivo
                setUserToken(null);// Limpiar el estado global de la app
            }
        }
    };

    // ver si ya tiene sesion con google para que no vuelva a iniciar sesion
    useEffect(() => {
        const checkCurrentSessionGoogle = async () => {
            try {
                // Buscamos token local
                const localToken = await SecureStore.getItemAsync('userToken');
                if (localToken) {
                    // Si existe el token en el dispositivo, lo cargamos al estado global de la app
                    await setUserToken(localToken);
                    return; // Si ya está logueado en nuestra App, no molestamos a Google.
                }
                // Si no hay. Revisar si el usuario tiene sesión iniciada con Google previamente en este dispositivo
                const idToken = await refreshGoogleToken();
                // Mandamos el token al servidor para obtener el JWT de nuestra DB
                if (idToken) {
                    await sendTokenToServer(idToken);
                }
            } catch (error) {
                console.error("Error en el chequeo de sesión:", error);
                // Limpieza por si algo, por si no hay token de local ni de google
                await GoogleSignin.signOut();
                await SecureStore.deleteItemAsync('userToken'); 
                setUserToken(null);
            }
        };
        checkCurrentSessionGoogle();
    }, []);
    return (
        <TouchableOpacity style={styles.btn}
            onPress={handleGoogleLogin}
            disabled={loading}

        >
            <Image
                source={require("../../assets/image/google.png")}
                style={{ width: iconS, height: iconS, resizeMode: 'contain' }}
            />
            <Text style={styles.label}>Google</Text>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    btn: {
        flex: 1,
        backgroundColor: Colors.surface,
        borderWidth: 1.5,
        borderColor: Colors.border,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 3,
        elevation: 1,
    },
    label: { fontSize: 11, fontWeight: '700', color: Colors.textMid, letterSpacing: 0.2 },
})