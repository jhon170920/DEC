import React, { useState, useContext, useRef, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Image,
    StyleSheet,
    ActivityIndicator,
    Animated,
    KeyboardAvoidingView,
    Platform,
    StatusBar,
    Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { loginUser } from '../../api/api';

import { AuthContext } from '../../context/AuthContext';
import { useResponsiveLayout } from '../../hooks/useResponsiveLayout';
import { Colors } from '../../constants/colors';
import { LoginStyles as styles } from '../../styles/Loginstyles';
//BOTONES DE LOGIN/REGISTRO SOCIAL
import BtnLoginFacebook from '../../components/BtnLoginFacebook.jsx';
import BtnLoginGoogle from '../../components/BtnLoginGoogle.jsx';
//COMPONENTE REUTILIZABLE
import FloatingInput from '../../components/FloatingInput.jsx';
// import ParticlesBackground from '../../components/Layout/ParticlesBackground.native.jsx';
import ToolTipBubbleAuth from '../../components/Tour/ToolTipBubbleAuth.jsx';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [modalTitle, setModalTitle] = useState('');
    const [modalMessage, setModalMessage] = useState('');

    const navigation = useNavigation();
    const { enterAsGuest, login } = useContext(AuthContext);

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

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(20)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
            Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
        ]).start();
    }, []);

    const showErrorModal = (message) => {
        setModalTitle('Error');
        setModalMessage(message);
        setModalVisible(true);
    };

    const handleLogin = async () => {
        if (!email || !password) {
            showErrorModal('Por favor, completa todos los campos');
            return;
        }

        setLoading(true);

        try {
            const data = await loginUser(email.toLowerCase().trim(), password);
            if (data.token) {
                await login(data.token);
                // El navegador redirigirá automáticamente a MainApp
            }
        } catch (error) {
            console.error("Login Error:", error);
            const message = error.message || "No se pudo conectar con el servidor";
            showErrorModal(message);
        } finally {
            setLoading(false);
        }
    };

    const handleGuestEntry = () => enterAsGuest(true);

    return (
        <View style={styles.root}>
            <StatusBar barStyle="dark-content" backgroundColor={Colors.bg} translucent={false} />
            
            <LinearGradient
                colors={['#e8f5ec', '#f4faf5', '#f4faf5']}
                style={StyleSheet.absoluteFill}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            />
            {/* <ParticlesBackground/> */}
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <Animated.View
                    style={[
                        styles.container,
                        { paddingHorizontal: hPad, opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
                    ]}
                >
                    {/* LOGO */}
                    <View style={[styles.logoContainer, { marginBottom: sp(0.028) }]}>
                        <View style={[
                            styles.logoRing,
                            { width: logoRingS, height: logoRingS, borderRadius: logoRingS / 2, marginBottom: 8 },
                        ]}>
                            <Image
                                source={require("../../../assets/image/logo.png")}
                                style={{ width: logoImgS, height: logoImgS }}
                                resizeMode="contain"
                            />
                        </View>
                    </View>

                    {/* TITULAR */}
                    <View style={{ marginBottom: sp(0.030) }}>
                        <Text style={[styles.headline, { fontSize: headlineS, lineHeight: headlineS * 1.18 }]}>
                            Hola, bienvenido{'\n'}
                            <Text style={styles.headlineAccent}>de vuelta.</Text>
                        </Text>
                        <Text style={[styles.subline, { fontSize: sublineS }]}>
                            Ingresa para continuar.
                        </Text>
                    </View>

                    {/* CAMPOS */} 
                    <ToolTipBubbleAuth
                        stepNumber={0}
                        nextStep={1}
                        text="Ingresa los datos que utilizaste para registrarte. ¡Si NO te has registrado, no dudes en hacerlo al final de estos mensajes!"
                    >
                        <View style={{ gap: sp(0.014) }}>
                            <FloatingInput
                                label="Correo electrónico"
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize='none'
                                fieldHeight={fieldH}
                            />
                            <FloatingInput
                                label="Contraseña"
                                value={password}
                                onChangeText={setPassword}
                                isPassword={true}
                                fieldHeight={fieldH}
                            />
                        </View>
                    </ToolTipBubbleAuth>

                    {/* OLVIDÉ CONTRASEÑA */}
                    <View style={[styles.metaRow, { marginVertical: sp(0.016) }]}>
                        <ToolTipBubbleAuth
                            stepNumber={1}
                            nextStep={2}
                            text="Si olvidaste tu contraseña, puedes restaurarla aquí."
                        >
                            <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
                                <Text style={styles.forgotText}>
                                    ¿Olvidaste tu contraseña?{' '}
                                    <Text style={styles.forgotLink}>Recupérala</Text>
                                </Text>
                            </TouchableOpacity>
                        </ToolTipBubbleAuth>
                    </View>

                    {/* BOTÓN INGRESAR */}
                    <ToolTipBubbleAuth
                        stepNumber={2}
                        nextStep={3}
                        text="Si escribiste tus datos correctamente, inicia sesión. ¡Recuerda que debes tener tu cuenta registrada previamente!"
                        placement='top'
                    >
                        <TouchableOpacity
                            style={[styles.btnPrimary, { marginBottom: sp(0.014) }, loading && { opacity: 0.72 }]}
                            onPress={handleLogin}
                            disabled={loading}
                            activeOpacity={0.85}
                        >
                            <LinearGradient
                                colors={['#22c55e', '#16a34a', '#15803d']}
                                style={[styles.btnPrimaryGradient, { height: btnH }]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                            >
                                {loading
                                    ? <ActivityIndicator color="#fff" />
                                    : <Text style={styles.btnPrimaryText}>Ingresar</Text>
                                }
                            </LinearGradient>
                        </TouchableOpacity>
                    </ToolTipBubbleAuth>

                    {/* BOTÓN INVITADO */}
                    <ToolTipBubbleAuth
                        stepNumber={3}
                        nextStep={4}
                        text="Si decides No registrar ni ingresar tus datos puedes iniciar sesión como invitado, pero con algunas funciones limitadas."
                        placement='top'
                    >
                        <TouchableOpacity
                            style={[styles.btnGhost, { height: ghostH, marginBottom: sp(0.024) }]}
                            onPress={handleGuestEntry}
                            activeOpacity={0.75}
                        >
                            <Text style={styles.btnGhostText}>Continuar como Invitado</Text>
                        </TouchableOpacity>
                    </ToolTipBubbleAuth>

                    {/* DIVISOR */}
                    <View style={[styles.divider, { marginBottom: sp(0.022) }]}>
                        <View style={styles.divLine} />
                        <Text style={styles.divText}>o ingresa con</Text>
                        <View style={styles.divLine} />
                    </View>

                    {/* SOCIAL */}
                    <ToolTipBubbleAuth
                        stepNumber={4}
                        nextStep={5}
                        text="Si prefieres un registro y un inicio rápido, !Puedes continuar con tu cuenta de Google o Facebook!"
                        placement='top'
                    >
                        <View style={[styles.socialRow, { marginBottom: sp(0.024) }]}>
                            <BtnLoginGoogle />
                            <BtnLoginFacebook />
                        </View>
                    </ToolTipBubbleAuth>

                    {/* FOOTER */}
                    <ToolTipBubbleAuth
                        stepNumber={5}
                        nextStep={'finishScreen'}
                        text="Si no te has registrado y si No deseas hacerlo con tu cuenta de Google o Facebook. ¡Puedes registrarte manualmente aquí!"
                        placement='top'
                    >
                        <TouchableOpacity style={styles.registerRow} onPress={() => navigation.navigate('Register')}>
                            <Text style={styles.registerText}>
                                ¿No tienes una cuenta?{' '}
                                <Text style={styles.registerLink}>Regístrate</Text>
                            </Text>
                        </TouchableOpacity>
                    </ToolTipBubbleAuth>
                </Animated.View>
            </KeyboardAvoidingView>

            {/* MODAL DE ERROR PERSONALIZADO */}
            <Modal
                transparent
                animationType="fade"
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={modalStyles.overlay}>
                    <View style={modalStyles.modalBox}>
                        <Feather name="alert-circle" size={48} color="#dc2626" style={{ alignSelf: 'center', marginBottom: 12 }} />
                        <Text style={modalStyles.title}>{modalTitle}</Text>
                        <Text style={modalStyles.message}>{modalMessage}</Text>
                        <TouchableOpacity
                            style={modalStyles.button}
                            onPress={() => setModalVisible(false)}
                            activeOpacity={0.85}
                        >
                            <LinearGradient
                                colors={['#22c55e', '#16a34a']}
                                style={modalStyles.buttonGradient}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                            >
                                <Text style={modalStyles.buttonText}>Entendido</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

// Estilos específicos para el modal (pueden ir en LoginStyles si se prefiere)
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

