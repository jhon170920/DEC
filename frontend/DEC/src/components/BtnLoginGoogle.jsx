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
    const { sendTokenToServer } = useContext(AuthContext);
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
          sendTokenToServer(id_token, 'google');
        }
    }, [response]);

    // funcion del boton de google
    const handleGoogleLogin = async () => {
        setLoading(true)
        try {
            // vemos si tiene servicios de google
            await GoogleSignin.hasPlayServices();
            const userInfo = await GoogleSignin.signIn();
            // extraemos el token
            const idToken = userInfo.data?.idToken || userInfo.idToken;
            // verificamos si hay token y se lo mandamos al backend
            if (idToken) {
                await sendTokenToServer(idToken, 'google');
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