import React, { useState, useRef, useEffect} from 'react';
import { View,
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
  useWindowDimensions, } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native'; // Para navegar al login
import axios from 'axios';
import { Colors } from '../constants/colors';

// Cambia por tu IP real de la computadora
const API_URL = "http://10.4.1.208:8081/api/register"; 

// ─── CAMPO CON FLOATING LABEL ──────────────────────────────
const Field = ({ label, value, onChangeText, secureTextEntry, keyboardType, rightSlot, fieldHeight }) => {
  const [focused, setFocused] = useState(false);
  const labelAnim  = useRef(new Animated.Value(value ? 1 : 0)).current;
  const borderAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(labelAnim,  { toValue: focused || value ? 1 : 0, duration: 180, useNativeDriver: false }).start();
    Animated.timing(borderAnim, { toValue: focused ? 1 : 0,          duration: 180, useNativeDriver: false }).start();
  }, [focused, value]);

  const labelTop    = labelAnim.interpolate({ inputRange: [0, 1], outputRange: [fieldHeight * 0.28, fieldHeight * 0.10] });
  const labelSize   = labelAnim.interpolate({ inputRange: [0, 1], outputRange: [14, 10] });
  const labelColor  = labelAnim.interpolate({ inputRange: [0, 1], outputRange: [Colors.textMuted, Colors.primaryLight] });
  const borderColor = borderAnim.interpolate({ inputRange: [0, 1], outputRange: [Colors.border, Colors.borderFocus] });

  return (
    <Animated.View style={[styles.field, { borderColor, height: fieldHeight }]}>
      <Animated.Text
        style={[styles.floatingLabel, { top: labelTop, fontSize: labelSize, color: labelColor }]}
        pointerEvents="none"
      >
        {focused || value ? label.toUpperCase() : label}
      </Animated.Text>
      <View style={styles.fieldRow}>
        <TextInput
          style={styles.fieldInput}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType || 'default'}
          autoCapitalize="none"
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          selectionColor={Colors.primary}
        />
        {rightSlot}
      </View>
    </Animated.View>
  );
};

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

    //ANIMACIONES ENTRADA Y CAMBIO DE PANALLAS
      const fadeAnim  = useRef(new Animated.Value(0)).current;
      const slideAnim = useRef(new Animated.Value(20)).current;
        useEffect(() => {
            Animated.parallel([
              Animated.timing(fadeAnim,  { toValue: 1, duration: 600, useNativeDriver: true }),
              Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
            ]).start();
        }, []);

            // ── Escala proporcional según altura de pantalla ──────────
            const statusH  = Platform.OS === 'ios' ? 44 : (StatusBar.currentHeight ?? 24);
            const usableH  = height - statusH;
          
            const isSmall  = usableH < 680;   // ej: iPhone SE, pantallas <5.5"
            const isMed    = usableH >= 680 && usableH < 780;
          
            const logoRingS = isSmall ? 68  : isMed ? 80  : 92;
            const logoImgS  = isSmall ? 44  : isMed ? 54  : 62;
            const headlineS = isSmall ? 26  : isMed ? 30  : 34;
            const sublineS  = isSmall ? 12  : 13.5;
            const fieldH    = isSmall ? 52  : isMed ? 56  : 60;
            const btnH      = isSmall ? 46  : isMed ? 50  : 56;
            const ghostH    = isSmall ? 40  : isMed ? 44  : 50;
            const socialH   = isSmall ? 42  : isMed ? 46  : 52;
            const iconS     = isSmall ? 18  : 22;
            const brandS    = isSmall ? 15  : 17;
          
            // Espacios verticales como % de la altura útil
            const sp = (pct) => usableH * pct;

            const hPad = width * 0.072;
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
                username: name, // Ajusta según como reciba tu backend
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
        <View style={styles.root}>
            <StatusBar barStyle="dark-content" backgroundColor={Colors.bg} translucent={false} />

        
        <LinearGradient colors={['#e8f5ec', '#f4faf5', '#f4faf5']} style={StyleSheet.absoluteFill}
        start={{x:0, y:0}}
        end={{x:1, y:1}}
        >
        <KeyboardAvoidingView
        style={{flex:1}}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <Animated.View
            style={[styles.container,
                {paddingHorizontal: hPad, opacity: fadeAnim, transform: [{translateY: slideAnim}]},
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
                        source={require("../../assets/image/logo.png")}
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
                    <Field
                        label="Nombre"
                        keyboardType="name"
                        placeholder="Ingrese su nombre"
                        placeholderTextColor="#4b6b5a"
                        fieldHeight={fieldH}
                        value={name}
                        onChangeText={setName}
                    />
                    <Field
                        label="Correo electrónico"
                        placeholder="Ingrese su correo"
                        placeholderTextColor="#4b6b5a"
                        fieldHeight={fieldH}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        value={email}
                        onChangeText={setEmail}
                    />
                    <Field
                        label="Contraseña"
                        placeholder="Ingrese la contraseña"
                        placeholderTextColor="#4b6b5a"
                        secureTextEntry={!showPass}
                        fieldHeight={fieldH}
                        value={password}
                        onChangeText={setPassword}
                        rightSlot={
                            <TouchableOpacity onPress={()=>setShowPass(!showPass)}
                            style={styles.eyeBtn}>
                                <Text>{showPass? '⌣' : '👁'}</Text>
                            </TouchableOpacity>
                        }
                    />
                    <Field
                        label="Confirmar contraseña"
                        placeholder="Confirme su contraseña"
                        placeholderTextColor="#4b6b5a"
                        secureTextEntry={!showPass}
                        fieldHeight={fieldH}
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        keyboardType="password"
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
                    <View  style={styles.divLine}/>
                </View>

                {/* Redes Sociales */}
                <View style={[styles.socialRow, { marginBottom: sp(0.024) }]}>
                            {[
                              { img: require("../../assets/image/google.png"),   label: 'Google'   },
                              { img: require("../../assets/image/facebook.png"), label: 'Facebook' },
                              
                            ].map(({ img, label }) => (
                              <TouchableOpacity key={label} style={[styles.socialBtn, { height: socialH }]}>
                                <Image source={img} style={{ width: iconS, height: iconS, resizeMode: 'contain' }} />
                                <Text style={styles.socialLabel}>{label}</Text>
                              </TouchableOpacity>
                            ))}
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

const styles = StyleSheet.create({
    root:{
        flex:1,
        backgroundColor: Colors.bg,
    },
    container: {
        flex: 1,
        justifyContent: 'center',
    },
    // Logo
      logoContainer: { alignItems: 'center' },
      logoRing: {
        backgroundColor: Colors.surfaceAlt,
        borderWidth: 1.5,
        borderColor: Colors.border,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 12,
        elevation: 4,
      },
      brandName: {
        fontWeight: '800',
        color: Colors.text,
        letterSpacing: -0.3,
      },
      tagline: {
        color: Colors.textMuted,
        marginTop: 2,
        letterSpacing: 0.3,
      },
    
      // Headline
      headline: {
        fontWeight: '300',
        color: Colors.text,
        letterSpacing: -0.5,
        marginBottom: 6,
        fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
      },
      headlineAccent: {
        fontStyle: 'italic',
        color: Colors.primary,
        fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
      },
      subline: {
        color: Colors.textSoft,
        lineHeight: 19,
      },
    
      // Campos
      field: {
        backgroundColor: Colors.surface,
        borderRadius: 16,
        borderWidth: 1.5,
        paddingHorizontal: 16,
        paddingTop: 18,
        paddingBottom: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
        elevation: 1,
      },
      floatingLabel: {
        position: 'absolute',
        left: 16,
        fontWeight: '500',
        letterSpacing: 0.2,
      },
      fieldRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
      },
      fieldInput: {
        flex: 1,
        fontSize: 15,
        fontWeight: '600',
        color: Colors.text,
        paddingTop: 8,
        paddingBottom: 0,
      },
      eyeBtn:  { paddingLeft: 8, paddingVertical: 4 },
      eyeIcon: { fontSize: 15 },
    
      // Meta
      metaRow:    { alignItems: 'flex-end' },
      forgotText: { fontSize: 12.5, color: Colors.textSoft, fontWeight: '500' },
      forgotLink: { color: Colors.primary, fontWeight: '700' },
    
      // Botón primario
      btnPrimary: {
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.32,
        shadowRadius: 14,
        elevation: 6,
      },
      btnPrimaryGradient: { alignItems: 'center', justifyContent: 'center' },
      btnPrimaryText: { color: '#fff', fontSize: 15, fontWeight: '700', letterSpacing: 0.4 },
    
      // Botón invitado
      btnGhost: {
        borderRadius: 16,
        borderWidth: 1.5,
        borderColor: '#c8e6ce',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent',
      },
      btnGhostText: { color: Colors.textMid, fontSize: 14, fontWeight: '600', letterSpacing: 0.2 },
    
      // Divisor
      divider: { flexDirection: 'row', alignItems: 'center', gap: 12 },
      divLine: { flex: 1, height: 1, backgroundColor: Colors.border },
      divText: { fontSize: 10.5, fontWeight: '600', color: Colors.textMuted, letterSpacing: 1, textTransform: 'uppercase' },
    
      // Social
      socialRow: { flexDirection: 'row', gap: 10 },
      socialBtn: {
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
      socialLabel: { fontSize: 11, fontWeight: '700', color: Colors.textMid, letterSpacing: 0.2 },
    
      // Footer
      loginRow: { alignItems: 'center' },
      loginText: { fontSize: 13, color: Colors.textMuted, fontWeight: '500' },
      loginLink: { color: Colors.primary, fontWeight: '800' },
    });