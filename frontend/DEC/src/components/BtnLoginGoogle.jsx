import { useEffect } from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";

import * as Google from 'expo-auth-session/providers/google'
import * as AuthSession from 'expo-auth-session';

export default function BtnloginGoogle() {
    const navigation = useNavigation();

    const [request, response, promptAsync] = Google.useAuthRequest({
        androidClientId: '487264865082-40i1lt5m0cum9s0m5i96v4menqnvgtgc.apps.googleusercontent.com',
        redirectUri: AuthSession.makeRedirectUri({
            scheme: 'com.decapp.app',
        }),
        scopes: ['openid', 'profile', 'email']
    })

    const sendTokenToServer = async (token) => {
        console.log(token)


        navigation.navigate('MainApp')

    }
    useEffect(() => {
        if (response) {
            if (response.type === 'success') {
                sendTokenToServer(response.authentication?.idToken || '')
            } else {
                console.log("error en l autenticacion: ", response)
            }
        }
    }, [response])



    return (
        <TouchableOpacity style={styles.btn}
            onPress={() => promptAsync().catch((e) => {
                console.error("Error al iniciar sesion:", e);
            })}

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