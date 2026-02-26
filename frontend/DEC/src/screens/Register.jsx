import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native'; // Para navegar al login
import axios from 'axios';

// Cambia por tu IP real de la computadora
const API_URL = "http://192.168.1.XX:8081/api/register"; 

export default function Register() {
    const navigation = useNavigation();

    // 1. Estados para el formulario
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    // 2. Lógica de registro
    const handleRegister = async () => {
        // Validaciones básicas
        if (!name || !email || !password || !confirmPassword) {
            Alert.alert("Error", "Por favor completa todos los campos");
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert("Error", "Las contraseñas no coinciden");
            return;
        }

        setLoading(true);

        try {
            const response = await axios.post(API_URL, {
                username: name, // Ajusta según como reciba tu backend (ej: username o name)
                email: email.toLowerCase().trim(),
                password: password
            });

            Alert.alert("¡Éxito!", "Cuenta creada correctamente. Ahora puedes iniciar sesión.");
            navigation.navigate('Login'); // Regresar al login tras éxito

        } catch (error) {
            console.error(error);
            const message = error.response?.data?.message || "Error al conectar con el servidor";
            Alert.alert("Error de Registro", message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <LinearGradient colors={["#e6f3ef", "#5b8f6a"]} style={styles.container}>
            <View style={styles.content}>
                {/* Logo */}
                <View style={styles.logoContainer}>
                    <Image
                        source={require("../../assets/image/logo.png")}
                        style={styles.logo}
                        resizeMode="contain"
                    />
                </View>

                {/* Formulario */}
                <View style={styles.inputContainer}>
                    <TextInput
                        placeholder="Ingrese su nombre"
                        placeholderTextColor="#4b6b5a"
                        style={styles.input}
                        value={name}
                        onChangeText={setName}
                    />
                    <TextInput
                        placeholder="Ingrese su correo"
                        placeholderTextColor="#4b6b5a"
                        style={styles.input}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        value={email}
                        onChangeText={setEmail}
                    />
                    <TextInput
                        placeholder="Ingrese la contraseña"
                        placeholderTextColor="#4b6b5a"
                        secureTextEntry
                        style={styles.input}
                        value={password}
                        onChangeText={setPassword}
                    />
                    <TextInput
                        placeholder="Confirme su contraseña"
                        placeholderTextColor="#4b6b5a"
                        secureTextEntry
                        style={styles.input}
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                    />

                    <TouchableOpacity 
                        style={[styles.button, loading && { opacity: 0.7 }]} 
                        onPress={handleRegister}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.buttonText}>Registrarse</Text>
                        )}
                    </TouchableOpacity>
                </View>

                {/* Divisor */}
                <View style={styles.divider}>
                    <View style={styles.dividerLine} />
                    <Text style={styles.dividerText}>Regístrate con</Text>
                    <View style={styles.dividerLine} />
                </View>

                {/* Redes Sociales */}
                <View style={styles.SocialContainer}>
                    <TouchableOpacity style={styles.socialBtn}>
                        <Image source={require("../../assets/image/google.png")} style={styles.SocialIcon} />
                        <Text style={styles.socialLabel}>Google</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.socialBtn}>
                        <Image source={require("../../assets/image/facebook.png")} style={styles.SocialIcon} />
                        <Text style={styles.socialLabel}>Facebook</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.socialBtn}>
                        <Image source={require("../../assets/image/x.png")} style={styles.SocialIcon} />
                        <Text style={styles.socialLabel}>Twitter</Text>
                    </TouchableOpacity>
                </View>

                {/* Footer navegación al Login */}
                <TouchableOpacity 
                    onPress={() => navigation.navigate('Login')}
                    style={styles.footerClickable}
                >
                    <Text style={styles.textFooter}>
                        ¿Ya tienes una cuenta? <Text style={styles.LinkText}>Inicia sesión</Text>
                    </Text>
                </TouchableOpacity>
            </View>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: { flex: 1, justifyContent: 'center' },
    logoContainer: { alignItems: 'center', marginBottom: 20 },
    logo: { width: 100, height: 100 },
    inputContainer: { paddingHorizontal: 32 },
    input: {
        backgroundColor: 'rgba(167, 243, 208, 0.7)',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        marginBottom: 12,
        color: '#065f46',
    },
    button: {
        backgroundColor: '#16a34a',
        paddingVertical: 14,
        borderRadius: 12,
        marginTop: 10,
    },
    buttonText: {
        textAlign: 'center',
        color: '#ffffff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 24,
        paddingHorizontal: 32,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: 'rgba(15, 78, 51, 0.4)',
    },
    dividerText: {
        marginHorizontal: 8,
        color: '#065f46',
        fontSize: 14,
    },
    SocialContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingHorizontal: 30,
        marginBottom: 30,
    },
    socialBtn: { alignItems: 'center' },
    socialLabel: { color: '#065f46', fontSize: 12, fontWeight: '600', marginTop: 4 },
    SocialIcon: { width: 45, height: 45 },
    footerClickable: { marginTop: 10 },
    textFooter: { textAlign: 'center', color: '#065f46' },
    LinkText: { fontWeight: 'bold', textDecorationLine: 'underline' }
});