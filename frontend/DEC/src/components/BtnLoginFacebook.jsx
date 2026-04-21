import { useEffect, useState, useContext } from "react";
import { TouchableOpacity, Text, Image, StyleSheet, Alert } from "react-native";
import { AuthContext } from '../context/AuthContext.js';
import { Colors } from '../constants/colors.js'
import { useResponsiveLayout } from '../hooks/useResponsiveLayout';
import { LoginManager, AccessToken } from 'react-native-fbsdk-next';
import * as SecureStore from 'expo-secure-store';
import api from "../api/api.js";

// PARA QUE FUNCIONE: SE DEBE INSTALAR LIBRERIAS NATIVAS, react-native-fbsdk-next. Además de modificar un poco el AppJson y volver a hacer un Build con expo. 3h masomenos. Hacer el build con el de Google de una vez
export default function BtnLoginFacebook() {
    // diseño responsivo
    const { iconS } = useResponsiveLayout();
    // traemos la funcion que actualiza el estado del token
    const { sendTokenToServer } = useContext(AuthContext);
    // para el disabled del login y seguridad
    const [loading, setLoading] = useState(false);

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

            sendTokenToServer(data.accessToken.toString(), 'facebook');
        } catch (error) {
            Alert.alert("Error de Conexión", "Asegúrate de estar usando tu Development Build: " + error?.message);
        } finally{
            setLoading(false)
        }
    };
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
