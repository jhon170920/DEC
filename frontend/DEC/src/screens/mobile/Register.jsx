import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Image,
    StyleSheet,
    ActivityIndicator,
    Animated,
    KeyboardAvoidingView,
    Platform,
    StatusBar,
    Modal,
    ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { registerUser } from '../../api/api';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../../constants/colors';
import { useResponsiveLayout } from '../../hooks/useResponsiveLayout';
import { StyleRegister as styles } from '../../styles/RegisterStyles';
import BtnLoginFacebook from '../../components/BtnLoginFacebook.jsx';
import BtnLoginGoogle from '../../components/BtnLoginGoogle.jsx';
import FloatingInput from '../../components/FloatingInput.jsx';

export default function Register() {
    const navigation = useNavigation();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [modalTitle, setModalTitle] = useState('');
    const [modalMessage, setModalMessage] = useState('');
    const [modalType, setModalType] = useState('error');

    const {
        sp,
        hPad,
        logoRingS,
        logoImgS,
        headlineS,
        fieldH,
        btnH
    } = useResponsiveLayout();

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(20)).current;
    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
            Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
        ]).start();
    }, []);

    const showModal = (title, message, type = 'error') => {
        setModalTitle(title);
        setModalMessage(message);
        setModalType(type);
        setModalVisible(true);
    };

    const handleRegister = async () => {
        if (!name || !email || !password || !confirmPassword) {
            showModal("Error", "Por favor completa todos los campos");
            return;
        }
        const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{2,50}$/;
        if (!nameRegex.test(name.trim())) {
            showModal("Error", "Ingresa un nombre válido (solo letras, mínimo 2 caracteres)");
            return;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showModal("Error", "Correo electrónico no válido");
            return;
        }
        if (password.length < 6) {
            showModal("Error", "La contraseña debe tener al menos 6 caracteres");
            return;
        }
        if (password !== confirmPassword) {
            showModal("Error", "Las contraseñas no coinciden");
            return;
        }

        setLoading(true);
        try {
            await registerUser(name, email.toLowerCase().trim(), password);
            showModal(
                "¡Registro exitoso!",
                "Se ha enviado un código de verificación a tu correo.",
                "success"
            );
            setTimeout(() => {
                setModalVisible(false);
                navigation.navigate('VerifyCode', { email: email.toLowerCase().trim() });
            }, 2000);
        } catch (error) {
            console.error("Register Error:", error);
            const message = error.message || "Error al conectar con el servidor";
            showModal("Error de Registro", message);
        } finally {
            setLoading(false);
        }
    };

    const getModalIcon = () => {
        if (modalType === 'success') {
            return <Feather name="check-circle" size={48} color={Colors.primary} style={{ alignSelf: 'center', marginBottom: 12 }} />;
        }
        return <Feather name="alert-circle" size={48} color="#dc2626" style={{ alignSelf: 'center', marginBottom: 12 }} />;
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
                    keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
                >
                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
                        keyboardShouldPersistTaps="handled"
                    >
                        <Animated.View
                            style={[
                                styles.container,
                                { paddingHorizontal: hPad, opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
                            ]}
                        >
                            {/* Logo */}
                            <View style={[styles.logoContainer, { marginBottom: sp(0.028) }]}>
                                <View style={[styles.logoRing, {
                                    width: logoRingS,
                                    height: logoRingS,
                                    borderRadius: logoRingS / 2,
                                    marginBottom: 8,
                                }]}>
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
                                        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnPrimaryText}>Registrarse</Text>}
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
                                <BtnLoginFacebook />
                            </View>

                            {/* Footer navegación al Login */}
                            <TouchableOpacity style={styles.loginRow} onPress={() => navigation.goBack()}>
                                <Text style={styles.loginText}>
                                    ¿Ya tienes una cuenta? <Text style={styles.loginLink}>Inicia sesión</Text>
                                </Text>
                            </TouchableOpacity>
                        </Animated.View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </LinearGradient>

            {/* Modal personalizado */}
            <Modal transparent animationType="fade" visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
                <View style={modalStyles.overlay}>
                    <View style={modalStyles.modalBox}>
                        {getModalIcon()}
                        <Text style={[modalStyles.title, modalType === 'error' && { color: '#dc2626' }]}>
                            {modalTitle}
                        </Text>
                        <Text style={modalStyles.message}>{modalMessage}</Text>
                        <TouchableOpacity
                            style={modalStyles.button}
                            onPress={() => setModalVisible(false)}
                            activeOpacity={0.85}
                        >
                            <LinearGradient
                                colors={modalType === 'success' ? ['#22c55e', '#16a34a'] : ['#dc2626', '#b91c1c']}
                                style={modalStyles.buttonGradient}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                            >
                                <Text style={modalStyles.buttonText}>Aceptar</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const modalStyles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalBox: {
        width: '80%',
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 24,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1e293b',
        marginBottom: 8,
        textAlign: 'center',
    },
    message: {
        fontSize: 15,
        color: '#475569',
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 22,
    },
    button: {
        width: '100%',
        borderRadius: 12,
        overflow: 'hidden',
    },
    buttonGradient: {
        paddingVertical: 12,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
});
