import React, { useState, useContext, useRef, useEffect } from 'react';
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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { loginUser } from '../api/api';
import * as SecureStore from 'expo-secure-store';
import { AuthContext } from '../context/AuthContext';
import { useResponsiveLayout } from '../hooks/useResponsiveLayout';
import { Colors } from '../constants/colors';
import { LoginStyles as styles } from '../styles/Loginstyles';

const API_URL = "http://10.4.1.202:8089/api/users/login";

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

// ─── PANTALLA PRINCIPAL ────────────────────────────────────
export default function Login() {

  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading,  setLoading]  = useState(false);

  const navigation = useNavigation();
  const { setUserToken, setIsGuest } = useContext(AuthContext);

// ----RESPONSIVE LAYOUT
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


  // ── Lógica original intacta ───────────────────────────────
  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Por favor, completa todos los campos");
      return;
    }

    setLoading(true);

    try {
      // 2. Llamamos a la función centralizada
      // No necesitas poner la URL aquí, api.js ya la sabe
      const data = await loginUser(email.toLowerCase().trim(), password);

      if (data.token) {
        // Guardamos el token de forma segura
        await SecureStore.setItemAsync('userToken', data.token);
        
        // Actualizamos el contexto global
        setUserToken(data.token);
        
        // Opcional: Si tu backend devuelve el nombre del usuario
        // Alert.alert("Éxito", `Bienvenido de nuevo`);
      }
      
    } catch (error) {
      // 3. El error ya viene procesado desde el catch de api.js
      console.error("Login Error:", error);
      
      // Si en api.js hiciste: throw error.response.data, aquí recibes el JSON del backend
      const message = error.message || "No se pudo conectar con el servidor";
      Alert.alert("Error de acceso", message);
      
    } finally {
      setLoading(false);
    }
  };

  const handleGuestEntry = () => setIsGuest(true);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.bg} translucent={false} />

      <LinearGradient
        colors={['#e8f5ec', '#f4faf5', '#f4faf5']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' :  'height'}
      >
        <Animated.View
          style={[
            styles.container,
            { paddingHorizontal: hPad, opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >

          {/* ── LOGO ── */}
          <View style={[styles.logoContainer, { marginBottom: sp(0.028) }]}>
            <View style={[
              styles.logoRing,
              { width: logoRingS, 
                height: logoRingS, 
                borderRadius: logoRingS / 2, 
                marginBottom: 8 },
            ]}>
              {/* LOGO */}
              <Image
                source={require("../../assets/image/logo.png")}
                style={{ width: logoImgS, height: logoImgS }}
                resizeMode="contain"
              />
            </View>
          </View>

          {/* ── TITULAR ── */}
          <View style={{ marginBottom: sp(0.030) }}>
            <Text style={[styles.headline, { fontSize: headlineS, lineHeight: headlineS * 1.18 }]}>
              Hola, bienvenido{'\n'}
              <Text style={styles.headlineAccent}>de vuelta.</Text>
            </Text>
            <Text style={[styles.subline, { fontSize: sublineS }]}>
              Ingresa para continuar.
            </Text>
          </View>

          {/* ── CAMPOS ── */}
          <View style={{ gap: sp(0.014) }}>
            <Field
              label="Correo electrónico"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              fieldHeight={fieldH}
              
            />
            <Field
              label="Contraseña"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPass}
              fieldHeight={fieldH}
              rightSlot={
                <TouchableOpacity onPress={() => setShowPass(!showPass)} style={styles.eyeBtn}>
                  <Text style={styles.eyeIcon}>{showPass ? '⌣' : '👁'}</Text>
                </TouchableOpacity>
              }
            />
          </View>

          {/* ── OLVIDÉ CONTRASEÑA ── */}
          <View style={[styles.metaRow, { marginVertical: sp(0.016) }]}>
            <TouchableOpacity onPress={() =>  navigation.navigate('ForgotPassword')}>
              <Text style={styles.forgotText}>
                ¿Olvidaste tu contraseña?{' '}
                <Text style={styles.forgotLink}>Recuperala</Text>
              </Text>
            </TouchableOpacity>
          </View>

          {/* ── BOTÓN INGRESAR ── */}
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

          {/* ── BOTÓN INVITADO ── */}
          <TouchableOpacity
            style={[styles.btnGhost, { height: ghostH, marginBottom: sp(0.024) }]}
            onPress={handleGuestEntry}
            activeOpacity={0.75}
          >
            <Text style={styles.btnGhostText}>Continuar como Invitado</Text>
          </TouchableOpacity>

          {/* ── DIVISOR ── */}
          <View style={[styles.divider, { marginBottom: sp(0.022) }]}>
            <View style={styles.divLine} />
            <Text style={styles.divText}>o ingresa con</Text>
            <View style={styles.divLine} />
          </View>

          {/* ── SOCIAL ── */}
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

          {/* ── FOOTER ── */}
          <TouchableOpacity style={styles.registerRow} onPress={() => navigation.navigate('Register')}>
            <Text style={styles.registerText}>
              ¿No tienes una cuenta?{' '}
              <Text style={styles.registerLink}>Regístrate</Text>
            </Text>
          </TouchableOpacity>

        </Animated.View>
      </KeyboardAvoidingView>
    </View>
  );
}

