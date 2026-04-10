import { useEffect, useState, useContext } from "react";
import { TouchableOpacity, Text, Image, StyleSheet, Alert } from "react-native";
import { AuthContext } from '../context/AuthContext.js';
import { Colors } from '../constants/colors.js'
import { useResponsiveLayout } from '../hooks/useResponsiveLayout';

import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// LOGIN GOOGLE PLAY SERVICES (ANDROID PROMEDIO)
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
// LLOGIN SI NO TIENE GOOGLE PLAY SERVICES (MOTOROLA MODERNO, IOS, ROOM PERSONALIZADO)
import { makeRedirectUri } from 'expo-auth-session';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
// funciona si no tiene google play services
WebBrowser.maybeCompleteAuthSession();

GoogleSignin.configure({
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID, // SE USA EL ID DEL CLIENTE DE WEB PARA EL BACKEND
    offlineAccess: true, // Si necesitas que el backend pida tokens nuevos
});

export default function BtnloginGoogle() {
    // ----RESPONSIVE LAYOUT
    const { iconS } = useResponsiveLayout();
    // traemos la funcion que actualiza el estado del token
    const { setUserToken } = useContext(AuthContext);
    // para el disabled del login y seguridad
    const [loading, setLoading] = useState(false);

    const [request, response, promptAsync] = Google.useAuthRequest({
        androidClientId: process.env.EXPO_PUBLIC_GOOGLE_APP_CLIENT_ID,
        webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
        responseType: 'code', 
    
        // CAMBIO 2: Asegúrate de que el Proxy esté activo
        useProxy: true,
        
        scopes: ['profile', 'email'],
        redirectUri: makeRedirectUri({
        useProxy: true,
        }),
    });

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
            const response = await axios.post('http://10.4.1.148:8089/api/users/auth/google',
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
            await promptAsync();
        } catch (error) {
            // SI NO TIENE PLAY SERVICES
            if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
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


    // ver si ya tiene sesion con google para que no vuelva a iniciar sesion
    useEffect(() => {
        const checkCurrentSessionGoogle = async () => {
            try {
                // buscamos token local
                const localToken = await SecureStore.getItemAsync('userToken');
                if (localToken) {
                    // Si existe el token de nuestra DB, lo cargamos al estado global
                    await setUserToken(localToken);
                    return; // Ya está logueado en nuestra App, no molestamos a Google.
                }
                // Revisar si el usuario ya inició sesión previamente en este dispositivo
                const hasGoogleSession = await GoogleSignin.isSignedIn();
                if (hasGoogleSession) {
                    const userInfo = await GoogleSignin.signInSilently();
                    const idToken = userInfo?.data?.idToken;
                    // Mandamos el token al servidor para obtener el JWT de nuestra DB
                    if (idToken) {
                        await sendTokenToServer(idToken);
                    }
                    console.log("sesion de google detectada");
                }
            } catch (error) {
                console.log("No hay sesión previa activa con Google");
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