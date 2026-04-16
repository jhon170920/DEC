import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Image,
    StyleSheet,
    Alert,
    ActivityIndicator,
    Animated,
    KeyboardAvoidingView,
    Platform,
    StatusBar,
    useWindowDimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { registerUser } from '../../api/api';
import { useNavigation } from '@react-navigation/native'; // Para navegar al login
import { Colors } from '../../constants/colors';
import { useResponsiveLayout } from '../../hooks/useResponsiveLayout';
import { StyleRegister as styles } from '../../styles/RegisterStyles';
import FloatingInput from '../../components/FloatingInput';
import BtnLoginGoogle from '../../components/BtnLoginGoogle';


export default function Register() {
    //CARGAR PRIMERO LA DIMENSION DE LA PANTALLA
    const { width, height } = useWindowDimensions();
    const navigation = useNavigation();



    // 1. Estados para el formulario
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);

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

    //ANIMACIONES ENTRADA Y CAMBIO DE PANALLAS
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(20)).current;
    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
            Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
        ]).start();
    }, []);


    // 2. Lógica de registro
    const handleRegister = async () => {
        // 1. Validaciones básicas (se mantienen igual porque son UI/UX)
        if (!name || !email || !password || !confirmPassword) {
            Alert.alert("Error", "Por favor completa todos los campos");
            return;
        }
        const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{2,50}$/;
        if (!nameRegex.test(name.trim())) {
            Alert.alert("Error", "Ingresa un nombre válido (solo letras, mínimo 2 caracteres)");
            return;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            Alert.alert("Error", "Correo electrónico no válido");
            return;
        }

        if (password.length < 6) {
            Alert.alert("Error", "La contraseña debe tener al menos 6 caracteres");
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert("Error", "Las contraseñas no coinciden");
            return;
        }

        setLoading(true);

        try {
            // 2. Llamada a la API centralizada
            await registerUser(name, email.toLowerCase().trim(), password);
             // En lugar de alertar y navegar a Login, vamos a verificación
             Alert.alert(
            "¡Registro exitoso!",
            "Se ha enviado un código de verificación a tu correo."
            );
            navigation.navigate('VerifyCode', { email: email.toLowerCase().trim() });

        } catch (error) {
            console.error("Register Error:", error);
            // Capturamos el mensaje que viene desde el backend
            const message = error.message || "Error al conectar con el servidor";
            Alert.alert("Error de Registro", message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.root}>
            <StatusBar barStyle="dark-content" backgroundColor={Colors.bg} translucent={false} />


            <LinearGradient colors={['#e8f5ec', '#f4faf5', '#f4faf5']} style={StyleSheet.absoluteFill}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >
                <KeyboardAvoidingView
                    style={{ flex: 1 }}
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                >
                    <Animated.View
                        style={[styles.container,
                        { paddingHorizontal: hPad, opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
                        ]}
                    >

               
                {/* Logo */}
                <View style={[styles.logoContainer, { marginBottom: sp(0.028) }]}>
                    <View
                    style={[
                        styles.logoRing,{
                            width: logoRingS,
                            height: logoRingS,
                            borderRadius: logoRingS / 2,
                            marginBottom: 8,
                        }
                    ]}>
                        <Image
                        source={require("../../../assets/image/logo.png")}
                       style={{ width: logoImgS, height: logoImgS }}
                        resizeMode="contain"
                    />
                    </View>
                </View>
                {/* Título */}
                <View style={{ marginBottom: sp(0.030) }}>
                    <Text style={[styles.headline, { fontSize: headlineS, lineHeight: headlineS * 1.18 }]}>Ingresa tus datos{'\n'}
                        <Text style={styles.headlineAccent}>para continuar.</Text>
                    </Text>
                </View>

                        {/* Formulario */}
                        <View style={{ gap: sp(0.014) }}>
                            <FloatingInput
                                label="Nombre"
                                value={name}
                                onChangeText={setName}
                                keyboardType="name"
                                autoCapitalize='none'
                                fieldHeight={fieldH}
                            />
                            <FloatingInput
                                label="Correo electrónico"
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                fieldHeight={fieldH}
                            />
                            <FloatingInput
                                label="Contraseña"
                                value={password}
                                onChangeText={setPassword}
                                keyboardType="password"
                                isPassword={true}
                                fieldHeight={fieldH}
                            />
                            <FloatingInput
                                label="Confirmar contraseña"
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                keyboardType="password"
                                isPassword={true}
                                fieldHeight={fieldH}
                            />

                            <TouchableOpacity
                                style={[styles.btnPrimary, { marginBottom: sp(0.014) }, loading && { opacity: 0.72 }]}
                                onPress={handleRegister}
                                disabled={loading}
                                activeOpacity={0.85}
                            >
                                <LinearGradient
                                    colors={['#22c55e', '#16a34a', '#15803d']}
                                    style={[styles.btnPrimaryGradient, { height: btnH }]}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                >
                                    {loading ? (
                                        <ActivityIndicator color="#fff" />
                                    ) : (
                                        <Text style={styles.btnPrimaryText} >Registrarse</Text>
                                    )}
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>

                        {/* Divisor */}
                        <View style={[styles.divider, { marginBottom: sp(0.022) }]}>
                            <View style={styles.divLine} />
                            <Text style={styles.divText}>Regístrate con</Text>
                            <View style={styles.divLine} />
                        </View>

                        {/* Redes Sociales */}
                        <View style={[styles.socialRow, { marginBottom: sp(0.024) }]}>
                            <BtnLoginGoogle />
                            <BtnLoginGoogle />
                        </View>

                        {/* Footer navegación al Login */}
                        <TouchableOpacity
                            style={styles.loginRow}
                            onPress={() => navigation.navigate('Login')}
                        >
                            <Text style={styles.loginText} >
                                ¿Ya tienes una cuenta?{' '} <Text style={styles.loginLink} >Inicia sesión</Text>
                            </Text>
                        </TouchableOpacity>
                    </Animated.View>
                </KeyboardAvoidingView>
            </LinearGradient>
        </View>
    );
}

