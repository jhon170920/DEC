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
import { registerUser } from '../api/api';
import { useNavigation } from '@react-navigation/native'; // Para navegar al login
import axios from 'axios';
import { Colors } from '../constants/colors';
import { useResponsiveLayout } from '../hooks/useResponsiveLayout';
import { StyleRegister as styles } from '../styles/RegisterStyles';

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
      const fadeAnim  = useRef(new Animated.Value(0)).current;
      const slideAnim = useRef(new Animated.Value(20)).current;
        useEffect(() => {
            Animated.parallel([
              Animated.timing(fadeAnim,  { toValue: 1, duration: 600, useNativeDriver: true }),
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

            // 3. Éxito
            Alert.alert("¡Éxito!", "Cuenta creada correctamente. Ahora puedes iniciar sesión.");
            navigation.navigate('Login');

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
                        KeyboardType="default"
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
                        KeyboardType="email-address"
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
                        KeyboardType="default"
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

