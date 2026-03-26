import { useEffect, useState } from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { CommonActions, useNavigation } from "@react-navigation/native";
import { setUserToken } from '../context/AuthContext'

import * as Google from 'expo-auth-session/providers/google'
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import axios from 'axios';

WebBrowser.maybeCompleteAuthSession();

export default function BtnloginGoogle() {
    const navigation = useNavigation();
    const [loading, setLoading] = useState(false)

    const [request, response, promptAsync] = Google.useAuthRequest({
        androidClientId: '487264865082-40i1lt5m0cum9s0m5i96v4menqnvgtgc.apps.googleusercontent.com',
    })

    useEffect(() => {
        if (response) {
            if (response.type === 'success') {
                sendTokenToServer(response.authentication?.idToken || '')
                console.log('ttoken: ', response.authentication?.idToken)
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
            <Text style={{ textAlign: 'center' }}>Login con google</Text>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    btn: {
        backgroundColor: 'blue',
        padding: 20,
        borderRadius: 10,
    }
})