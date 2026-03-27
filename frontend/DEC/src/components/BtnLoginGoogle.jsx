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
    const { setUserToken } = useContext(AuthContext);

    const navigation = useNavigation();
    const [loading, setLoading] = useState(false)

    const [request, response, promptAsync] = Google.useAuthRequest({
        androidClientId: process.env.EXPO_PUBLIC_ANDROID_CLIENT_ID,
    })

    useEffect(() => {
        if (response) {
            if (response.type === 'success') {
                console.log(response)
                console.log('ttoken: ', response.authentication?.idToken)
                sendTokenToServer(response.authentication?.idToken || '')
            } else {
                console.log("error en l autenticacion: ", response)
            }
        } else {
            console.log("errrrrrorrr:")
        }
    }, [response])

    const sendTokenToServer = async (token) => {
        setLoading(true)
        try {
            console.log('ttokenn al backend: ', token)
            const response = await axios.post('http://10.4.1.148:8089/api/users/auth/google', {
                token: token
            })
            console.log(response.data.token);
            console.log(response.data.message);
            setUserToken(response.data.token)
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