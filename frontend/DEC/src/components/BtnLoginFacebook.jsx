import { useEffect, useState, useContext } from "react";
import { TouchableOpacity, Text, Image, StyleSheet, Alert } from "react-native";
import { AuthContext } from '../context/AuthContext.js';
import { Colors } from '../constants/colors.js'
import { useResponsiveLayout } from '../hooks/useResponsiveLayout';
import axios from 'axios';
import { LoginManager, AccessToken } from 'react-native-fbsdk-next';
import * as SecureStore from 'expo-secure-store';
// PARA QUE FUNCIONE: SE DEBE INSTALAR LIBRERIAS NATIVAS, react-native-fbsdk-next. Además de modificar un poco el AppJson y volver a hacer un Build con expo. 3h masomenos. Hacer el build con el de Google de una vez
export default function BtnLoginFacebook() {
    // diseño responsivo
    const { iconS } = useResponsiveLayout();
    // traemos la funcion que actualiza el estado del token
    const { setUserToken } = useContext(AuthContext);
    // para el disabled del login y seguridad
    const [loading, setLoading] = useState(false);

    // Enviar al backend y validar el token de google
    const sendTokenToServer = async (fbToken) => {
        setLoading(true);a
        try {
            // mandamos el tken al backend y lo validamos
            const response = await axios.post('http://10.4.1.148:8089/api/users/auth/facebook', 
            {}, 
            { headers: { 'Authorization': `Bearer ${fbToken}` }, timeout: 10000});
            // obtenemos el token de la respuesta del backend
            const sessionToken = response.data.token;
            if (sessionToken) {
                await SecureStore.setItemAsync('userToken', sessionToken); // Actualizamos el token en el almacenamiento
                setUserToken(sessionToken); // Actualizamos el contexto global de DEC
            }
        } catch (error) {
            console.log("Error", error.response?.data?.message);
            Alert.alert("Error: No se pudo conectar con el servidor DEC (FB)", error.response?.data?.message);
        } finally {
            setLoading(false);
        }
    }
    // funcion del boton de facebook
    const handleFacebookLogin = async () => {
        setLoading(true);
        try {
            LoginManager.logOut(); // cerrar alguna sesion por si algo
            // obtenemos el resultado
            const result = await LoginManager.logInWithPermissions(['public_profile', 'email']);
            // validamos si canceló el login
            if (result.isCancelled) {
                console.log("El usuario canceló el inicio de sesión");
                setLoading(false)
                return;
            }
            // obtener el Token de Acceso y validarlo
            const data = await AccessToken.getCurrentAccessToken();
            if (!data) throw new Error("No se pudo obtener el token de acceso");

            sendTokenToServer(data.accessToken.toString());
        } catch (error) {
            Alert.alert("Error de Conexión", "Asegúrate de estar usando tu Development Build: " + error?.message);
        } finally{
            setLoading(false)
        }
    };
    // ver si ya tiene sesion con facebook para que no vuelva a iniciar sesion
    useEffect(() => {
        const checkCurrentSessionFb = async () => {
            try {
                const localToken = await SecureStore.getItemAsync('userToken');
                if (localToken) {
                    setUserToken(localToken);
                    return;
                }
                const data = await AccessToken.getCurrentAccessToken();
                if(data){
                    console.log("sesion de facebook detectada");
                    await sendTokenToServer(data.accessToken.toString());
                }
            } catch (error) {
                console.log("No hay sesión previa activa con Fb");
            }
        }
        checkCurrentSessionFb();
    }, [])

 
    // BOTON
    return (
        <TouchableOpacity style={styles.btn}
            onPress={handleFacebookLogin}
            disabled={loading}
        >
            <Image
                source={require("../../assets/image/facebook.png")}
                style={{ width: iconS, height: iconS, resizeMode: 'contain' }}
            />
            <Text style={styles.label}>Facebook</Text>
        </TouchableOpacity>
    );
};

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
});