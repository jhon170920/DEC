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
import { registerUser } from '../../../api/api.js';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../../../constants/colors.js';
import { useResponsiveLayout } from '../../../hooks/useResponsiveLayout.js';
import { StyleRegister as styles } from '../../../styles/RegisterStyles.js';
import BtnLoginFacebook from '../../../components/BtnLoginFacebook.jsx';
import BtnLoginGoogle from '../../../components/BtnLoginGoogle.jsx';
import FloatingInput from '../../../components/FloatingInput.jsx';
import ToolTipBubbleAuth from '../../../components/Tour/ToolTipBubbleAuth.jsx';

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

    // Estado para aceptación de términos
    const [termsAccepted, setTermsAccepted] = useState(false);

    // Estado para errores por campo (validación en cliente)
    const [fieldErrors, setFieldErrors] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

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

    // ✅ VALIDACIONES MEJORADAS (más flexible)
    const validateField = (fieldName, value) => {
        let error = '';

        switch (fieldName) {
            case 'name':
                // Solo letras y espacios
                if (!value) {
                    error = 'El nombre es requerido';
                } else if (value.trim().length < 2) {
                    error = 'Mínimo 2 caracteres';
                } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value)) {
                    error = 'Solo letras y espacios permitidos';
                }
                break;

            case 'email':
                // Email válido (formato general)
                if (!value) {
                    error = 'El email es requerido';
                } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                    error = 'Email inválido (ejemplo: usuario@ejemplo.com)';
                }
                break;

            case 'password':
                // Mínimo 6 caracteres
                if (!value) {
                    error = 'La contraseña es requerida';
                } else if (value.length < 6) {
                    error = 'Mínimo 6 caracteres';
                } else if (!/[a-z]/.test(value)) {
                    error = 'Debe contener minúsculas (a-z)';
                } else if (!/[A-Z]/.test(value)) {
                    error = 'Debe contener mayúsculas (A-Z)';
                }
                break;

            case 'confirmPassword':
                if (!value) {
                    error = 'Confirma tu contraseña';
                } else if (value !== password) {
                    error = 'Las contraseñas no coinciden';
                }
                break;

            default:
                break;
        }

        return error;
    };

    // Validar campo en tiempo real
    const handleFieldChange = (fieldName, value) => {
        switch (fieldName) {
            case 'name':
                setName(value);
                break;
            case 'email':
                setEmail(value);
                break;
            case 'password':
                setPassword(value);
                break;
            case 'confirmPassword':
                setConfirmPassword(value);
                break;
        }

        // Validar y actualizar error
        const error = validateField(fieldName, value);
        setFieldErrors(prev => ({
            ...prev,
            [fieldName]: error
        }));
    };

    // Validar todos los campos antes de enviar
    const validateAllFields = () => {
        const errors = {
            name: validateField('name', name),
            email: validateField('email', email),
            password: validateField('password', password),
            confirmPassword: validateField('confirmPassword', confirmPassword)
        };

        setFieldErrors(errors);

        // Retornar true si no hay errores
        return Object.values(errors).every(error => !error);
    };

    const handleRegister = async () => {
        // Validar términos
        if (!termsAccepted) {
            showModal("Aceptación requerida", "Debes aceptar los términos y condiciones para registrarte.");
            return;
        }

        // Validar todos los campos
        if (!validateAllFields()) {
            showModal("Validación fallida", "Por favor, revisa los campos marcados con error");
            return;
        }

        setLoading(true);
        try {
            // Llamar al API
            await registerUser(name.trim(), email.toLowerCase().trim(), password);

            // Éxito
            showModal(
                "¡Registro exitoso!",
                "Se ha enviado un código de verificación a tu correo.",
                "success"
            );

            // Navegar a verificación después de 2 segundos
            setTimeout(() => {
                setModalVisible(false);
                navigation.navigate('VerifyCode', { email: email.toLowerCase().trim() });
            }, 2000);

        } catch (error) {
            console.error("Register Error:", error);

            // Extraer mensaje de error más descriptivo
            let errorMessage = error.message || "Error al conectar con el servidor";

            // Si es un objeto con propiedades específicas
            if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.response?.data?.fields) {
                // Si hay errores por campo desde el backend
                const fieldError = error.response.data.fields;
                const firstError = Object.values(fieldError).find(e => e);
                if (firstError) {
                    errorMessage = firstError;
                }
            }

            showModal("Error de Registro", errorMessage);
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

    // Componente para mostrar error de campo
    const FieldError = ({ error }) => {
        if (!error) return null;
        return (
            <View style={{ marginTop: 6, marginLeft: 4, flexDirection: 'row', alignItems: 'center' }}>
                <Feather name="alert-circle" size={14} color="#dc2626" />
                <Text style={{ fontSize: 12, color: '#dc2626', marginLeft: 4 }}>
                    {error}
                </Text>
            </View>
        );
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
                                        source={require("../../../../assets/image/logo.png")}
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
                            <ToolTipBubbleAuth
                                stepNumber={0}
                                nextStep={1}
                                text="Ingresa correctamente tu nombre, tu correo electrónico para enviarte un código de verificación, y crea una contraseña. ¡Que no se te olviden estos datos!"
                                placement='top'
                            >
                                <View style={{ gap: sp(0.014) }}>
                                    {/* Campo Nombre */}
                                    <View>
                                        <FloatingInput
                                            label="Nombre"
                                            value={name}
                                            onChangeText={(value) => handleFieldChange('name', value)}
                                            fieldHeight={fieldH}
                                        />
                                        <FieldError error={fieldErrors.name} />
                                    </View>

                                    {/* Campo Email */}
                                    <View>
                                        <FloatingInput
                                            label="Correo electrónico"
                                            value={email}
                                            onChangeText={(value) => handleFieldChange('email', value)}
                                            keyboardType="email-address"
                                            autoCapitalize='none'
                                            fieldHeight={fieldH}
                                        />
                                        <FieldError error={fieldErrors.email} />
                                    </View>

                                    {/* Campo Contraseña */}
                                    <View>
                                        <FloatingInput
                                            label="Contraseña"
                                            value={password}
                                            onChangeText={(value) => handleFieldChange('password', value)}
                                            isPassword={true}
                                            fieldHeight={fieldH}
                                        />
                                        <FieldError error={fieldErrors.password} />
                                        {/* Requisitos de contraseña */}
                                        <View style={{ marginTop: 8, marginLeft: 4 }}>
                                            <ReqCheck text="Mínimo 6 caracteres" met={password.length >= 6} />
                                            <ReqCheck text="Una mayúscula (A-Z)" met={/[A-Z]/.test(password)} />
                                            <ReqCheck text="Una minúscula (a-z)" met={/[a-z]/.test(password)} />
                                        </View>
                                    </View>

                                    {/* Campo Confirmar Contraseña */}
                                    <View>
                                        <FloatingInput
                                            label="Confirmar contraseña"
                                            value={confirmPassword}
                                            onChangeText={(value) => handleFieldChange('confirmPassword', value)}
                                            isPassword={true}
                                            fieldHeight={fieldH}
                                        />
                                        <FieldError error={fieldErrors.confirmPassword} />
                                    </View>
                                </View>
                            </ToolTipBubbleAuth>

                            {/* Términos */}
                            <ToolTipBubbleAuth
                                stepNumber={1}
                                nextStep={2}
                                text="Para proteger tus datos, debes aceptar nuestros términos y condiciones."
                                placement='top'
                            >
                                <View style={termsStyles.container}>
                                    <TouchableOpacity
                                        style={termsStyles.checkbox}
                                        onPress={() => setTermsAccepted(!termsAccepted)}
                                    >
                                        <Feather
                                            name={termsAccepted ? "check-square" : "square"}
                                            size={20}
                                            color={termsAccepted ? Colors.primary : Colors.border}
                                        />
                                    </TouchableOpacity>
                                    <Text style={termsStyles.termsText}>
                                        Acepto los{" "}
                                        <Text
                                            style={termsStyles.link}
                                            onPress={() => navigation.navigate('Terminos')}
                                        >
                                            Términos y Condiciones
                                        </Text>
                                    </Text>
                                </View>
                            </ToolTipBubbleAuth>

                            {/* Botón Registrar */}
                            <ToolTipBubbleAuth
                                stepNumber={2}
                                nextStep={3}
                                text="Una vez completes los campos correctamente y aceptes nuestros Términos y Condiciones. ¡Puedes registrarte y disfrutar de la app!"
                                placement='top'
                            >
                                <TouchableOpacity
                                    style={[styles.btnPrimary, { marginBottom: sp(0.014) }, (loading || !termsAccepted) && { opacity: 0.72 }]}
                                    onPress={handleRegister}
                                    disabled={loading || !termsAccepted}
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
                            </ToolTipBubbleAuth>

                            {/* Divisor */}
                            <View style={[styles.divider, { marginBottom: sp(0.022) }]}>
                                <View style={styles.divLine} />
                                <Text style={styles.divText}>Regístrate con</Text>
                                <View style={styles.divLine} />
                            </View>

                            {/* Redes Sociales */}
                            <ToolTipBubbleAuth
                                stepNumber={3}
                                nextStep={4}
                                text="Si prefieres registrarte sin esperar un código de verificación y rápidamente, puedes continuar con tu cuenta de Google"
                                placement='top'
                            >
                                <View style={[styles.socialRow, { marginBottom: sp(0.024) }, { justifyContent: 'space-around' }]}>
                                    <TouchableOpacity
                                        activeOpacity={1}
                                        onPress={() => {
                                            if (!termsAccepted) {
                                                showModal("Aceptación requerida", "Debes aceptar los términos y condiciones para continuar.");
                                            }
                                        }}
                                        style={{ width: '50%', }}
                                    >
                                        <View style={{ height: 45 }} pointerEvents={termsAccepted ? 'auto' : 'none'}>
                                            <BtnLoginGoogle />
                                        </View>
                                    </TouchableOpacity>
                                </View>
                            </ToolTipBubbleAuth>

                            {/* Footer */}
                            <ToolTipBubbleAuth
                                stepNumber={4}
                                nextStep={'finishScreen'}
                                text="¡Inicia sesión si ya tienes una cuenta!"
                                placement='top'
                            >
                                <TouchableOpacity style={styles.loginRow} onPress={() => navigation.goBack()}>
                                    <Text style={styles.loginText}>
                                        ¿Ya tienes una cuenta? <Text style={styles.loginLink}>Inicia sesión</Text>
                                    </Text>
                                </TouchableOpacity>
                            </ToolTipBubbleAuth>
                        </Animated.View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </LinearGradient>

            {/* Modal de resultado */}
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

// ========== COMPONENTES HELPER ==========

// Componente para mostrar requisitos de contraseña
const ReqCheck = ({ text, met }) => (
    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
        <Feather
            name={met ? "check" : "x"}
            size={14}
            color={met ? "#16a34a" : "#9ca3af"}
        />
        <Text style={{
            fontSize: 12,
            marginLeft: 6,
            color: met ? "#16a34a" : "#9ca3af"
        }}>
            {text}
        </Text>
    </View>
);

// ========== ESTILOS ==========

const termsStyles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 12,
        marginTop: 16,
    },
    checkbox: {
        padding: 4,
        marginRight: 8,
    },
    termsText: {
        fontSize: 14,
        color: Colors.textMuted,
        flex: 1,
        flexWrap: 'wrap',
    },
    link: {
        color: Colors.primary,
        fontWeight: '600',
        textDecorationLine: 'underline',
    },
});

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
