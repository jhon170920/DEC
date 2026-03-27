import { useEffect, useState, useContext } from "react";
import { TouchableOpacity, Text, Image, StyleSheet } from "react-native";
import { CommonActions, useNavigation } from "@react-navigation/native";
import { AuthContext } from '../context/AuthContext.js';
import { Colors } from '../constants/colors.js'
import { useResponsiveLayout } from '../hooks/useResponsiveLayout';

import * as Google from 'expo-auth-session/providers/google'
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import axios from 'axios';

WebBrowser.maybeCompleteAuthSession();

export default function BtnloginGoogle() {
    // ----RESPONSIVE LAYOUT
    const {
        sp,
        hPad,
        logoRingS,
        logoImgS,
        headlineS,
        sublineS,
        fieldH,
        btnH,
        ghostH,
        socialH,
        iconS
    } = useResponsiveLayout();
    // traemos la funcion que actualiza el estado del token
    const { setUserToken } = useContext(AuthContext);
    // navigation jajja
    const navigation = useNavigation();
    // para el disabled del login y seguridad
    const [loading, setLoading] = useState(false)
    // funcion de google, le enviamos el id del cliente Android
    const [request, response, promptAsync] = Google.useAuthRequest({
        androidClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID,
    })

    // esto se realiza cuando se uno se loguea CORRECTAMENTE con google
    useEffect(() => {
        if (response) {
            if (response.type === 'success') {
                // mandamos el token a nuestra funcion para verificar en el backend si es de google
                sendTokenToServer(response.authentication?.idToken || '')
            } else {
                //para el debug, no sé si quitarlo o poner otra cosa o no sé
                console.log("error en l autenticacion: ", response)
            }
        }
    }, [response])

    const sendTokenToServer = async (googleToken) => {
        // cuando se loguea correctamente
        setLoading(true)
        try {
            // mandamos el googleToken para el backend
            const response = await axios.post('http://10.4.1.148:8089/api/users/auth/google', 
            {},
            {
                headers: {
                    'Authorization' : `Bearer ${googleToken}`
                }
            });
            const token = response.data.token
            if (token){
                setUserToken(token)
                console.log("Sesion iniciada con éxito")
            }
        } catch (error) {
            console.log("Error No se pudo conectar con el servidor DEC", error.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <TouchableOpacity style={styles.btn}
            onPress={() => {
                promptAsync().catch((e) => {
                    console.error("Error al iniciar sesion:", e);
                })
                console.log("Iniciando propmt......")
            }}
            disabled={loading}

        >
            <Image
                source={require("../../assets/image/google.png")}
                style={{ width: iconS, height: iconS, resizeMode: 'contain' }} 
            />
            <Text style={styles.label}>Login con google</Text>
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