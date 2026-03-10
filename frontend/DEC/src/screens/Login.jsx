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
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { AuthContext } from '../context/AuthContext';

const API_URL = "http://10.4.1.208:8089/api/login";

// ─── TOKENS DE DISEÑO ──────────────────────────────────────
const C = {
  bg:          '#f4faf5',
  surface:     '#ffffff',
  surfaceAlt:  '#f0faf3',
  border:      '#dceee2',
  borderFocus: '#22c55e',
  primary:     '#16a34a',
  primaryLight:'#22c55e',
  text:        '#0f2d1a',
  textMid:     '#2d6a4f',
  textSoft:    '#5a8a6a',
  textMuted:   '#8aad96',
  tabBg:       '#e2f0e6',
};

// ─── CAMPO CON FLOATING LABEL ──────────────────────────────
const Field = ({ label, value, onChangeText, secureTextEntry, keyboardType, rightSlot }) => {
  const [focused, setFocused] = useState(false);
  const labelAnim = useRef(new Animated.Value(value ? 1 : 0)).current;
  const borderAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(labelAnim, {
      toValue: focused || value ? 1 : 0,
      duration: 180,
      useNativeDriver: false,
    }).start();
    Animated.timing(borderAnim, {
      toValue: focused ? 1 : 0,
      duration: 180,
      useNativeDriver: false,
    }).start();
  }, [focused, value]);

  const labelTop   = labelAnim.interpolate({ inputRange: [0, 1], outputRange: [19, 7] });
  const labelSize  = labelAnim.interpolate({ inputRange: [0, 1], outputRange: [15, 10] });
  const labelColor = labelAnim.interpolate({ inputRange: [0, 1], outputRange: [C.textMuted, C.primaryLight] });
  const borderColor= borderAnim.interpolate({ inputRange: [0, 1], outputRange: [C.border, C.borderFocus] });

  return (
    <Animated.View style={[styles.field, { borderColor }]}>
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
          selectionColor={C.primary}
        />
        {rightSlot}
      </View>
    </Animated.View>
  );
};

// ─── PANTALLA PRINCIPAL ────────────────────────────────────
export default function Login() {
  const [email, setEmail]           = useState('');
  const [password, setPassword]     = useState('');
  const [showPass, setShowPass]     = useState(false);
  const [loading, setLoading]       = useState(false);

  const navigation = useNavigation();
  const { setUserToken, setIsGuest } = useContext(AuthContext);

  // Animación de entrada (simple fade + slide) MODIFICAR LOS VALORES.
  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(80)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();
  }, []);

  // ── Lógica del Login──
  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Por favor, completa todos los campos");
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post(API_URL, {
        email: email.toLowerCase().trim(),
        password,
      });
      if (response.data.token) {
        await SecureStore.setItemAsync('userToken', response.data.token);
        setUserToken(response.data.token);
      }
    } catch (error) {
      console.error(error);
      const message = error.response?.data?.message || "No se pudo conectar con el servidor";
      Alert.alert("Error", message);
    } finally {
      setLoading(false);
    }
  };

  const handleGuestEntry = () => {
    setIsGuest(true);
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />

      {/* Fondo con degradado suave */}
      <LinearGradient
        colors={['#e8f5ec', '#f4faf5', '#f4faf5']}
        style={StyleSheet.absoluteFill}
        start={{ x: 2, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
    
          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>

            {/* ── LOGO ── */}
            <View style={styles.logoContainer}>
              <View style={styles.logoRing}>
                <Image
                  source={require("../../assets/image/logo.png")}
                  style={styles.logo}
                  resizeMode="contain"
                />
              </View>
              <Text style={styles.brandName}>EcoVerde</Text>
              <Text style={styles.tagline}>Conectado con la naturaleza</Text>
            </View>

            {/* ── CAMPOS ── */}
            <View style={styles.form}>
              <Field
                label="Correo electrónico"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
              />
              <Field
                label="Contraseña"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPass}
                rightSlot={
                  <TouchableOpacity onPress={() => setShowPass(!showPass)} style={styles.eyeBtn}>
                    <Text style={styles.eyeIcon}>{showPass ? '🙈' : '👁'}</Text>
                  </TouchableOpacity>
                }
              />
            </View>

            {/* ── OLVIDÉ CONTRASEÑA ── */}
            <View style={styles.metaRow}>
              <TouchableOpacity onPress={() => Alert.alert("Próximamente", "Función de recuperación en desarrollo")}>
                <Text style={styles.forgotText}>
                  ¿Olvidaste tu contraseña?{' '}
                  <Text style={styles.forgotLink}>Recuperala</Text>
                </Text>
              </TouchableOpacity>
            </View>

            {/* ── BOTÓN INGRESAR ── */}
            <TouchableOpacity
              style={[styles.btnPrimary, loading && { opacity: 0.72 }]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={['#22c55e', '#16a34a', '#15803d']}
                style={styles.btnPrimaryGradient}
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
              style={styles.btnGhost}
              onPress={handleGuestEntry}
              activeOpacity={0.75}
            >
              <Text style={styles.btnGhostText}>Continuar como Invitado</Text>
            </TouchableOpacity>

            {/* ── DIVISOR ── */}
            <View style={styles.divider}>
              <View style={styles.divLine} />
              <Text style={styles.divText}>o ingresa con</Text>
              <View style={styles.divLine} />
            </View>

            {/* ── SOCIAL ── */}
            <View style={styles.socialRow}>
              <TouchableOpacity style={styles.socialBtn}>
                <Image source={require("../../assets/image/google.png")} style={styles.socialIcon} />
                <Text style={styles.socialLabel}>Google</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialBtn}>
                <Image source={require("../../assets/image/facebook.png")} style={styles.socialIcon} />
                <Text style={styles.socialLabel}>Facebook</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialBtn}>
                <Image source={require("../../assets/image/x.png")} style={styles.socialIcon} />
                <Text style={styles.socialLabel}>X</Text>
              </TouchableOpacity>
            </View>

            {/* ── REGISTRO ── */}
            <TouchableOpacity
              style={styles.registerRow}
              onPress={() => navigation.navigate('Register')}
            >
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

// ─── ESTILOS ───────────────────────────────────────────────
const styles = StyleSheet.create({
  root: {
    flex: 1,
    padding: 10,
    backgroundColor: C.bg,
    paddingVertical:30,
  },
  // Logo
  logoContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoRing: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: C.surfaceAlt,
    borderWidth: 1.5,
    borderColor: C.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
  },
  logo: {
    width: 56,
    height: 56,
  },
  brandName: {
    fontSize: 18,
    fontWeight: '800',
    color: C.text,
    letterSpacing: -0.3,
  },
  tagline: {
    fontSize: 12,
    color: C.textMuted,
    marginTop: 3,
    letterSpacing: 0.3,
  },

  // Headline
  headlineBlock: {
    marginBottom: 28,
  },
  headline: {
    fontSize: 34,
    lineHeight: 40,
    fontWeight: '300',
    color: C.text,
    letterSpacing: -0.5,
    marginBottom: 8,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  headlineAccent: {
    fontStyle: 'italic',
    color: C.primary,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  subline: {
    fontSize: 14,
    color: C.textSoft,
    lineHeight: 20,
  },

  // Form
  form: {
    gap: 14,
    marginBottom: 12,
  },
  field: {
    backgroundColor: C.surface,
    borderRadius: 16,
    borderWidth: 1.5,
    paddingHorizontal: 16,
    paddingTop: 22,
    paddingBottom: 10,
    minHeight: 62,
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
  },
  fieldInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: C.text,
    paddingTop: 4,
    paddingBottom: 0,
  },
  eyeBtn: {
    paddingLeft: 8,
    paddingVertical: 4,
  },
  eyeIcon: {
    fontSize: 16,
  },

  // Meta
  metaRow: {
    alignItems: 'flex-end',
    marginBottom: 22,
    marginTop: 4,
  },
  forgotText: {
    fontSize: 13,
    color: C.textSoft,
    fontWeight: '500',
  },
  forgotLink: {
    color: C.primary,
    fontWeight: '700',
  },

  // Botón primario
  btnPrimary: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 6,
  },
  btnPrimaryGradient: {
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnPrimaryText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.4,
  },

  // Botón invitado
  btnGhost: {
    height: 50,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#c8e6ce',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 26,
    backgroundColor: 'transparent',
  },
  btnGhostText: {
    color: C.textMid,
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.2,
  },

  // Divisor
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  divLine: {
    flex: 1,
    height: 1,
    backgroundColor: C.border,
  },
  divText: {
    fontSize: 11,
    fontWeight: '600',
    color: C.textMuted,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },

  // Social
  socialRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 28,
  },
  socialBtn: {
    flex: 1,
    height: 52,
    backgroundColor: C.surface,
    borderWidth: 1.5,
    borderColor: C.border,
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
  socialIcon: {
    width: 22,
    height: 22,
    resizeMode: 'contain',
  },
  socialLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: C.textMid,
    letterSpacing: 0.2,
  },

  // Footer
  registerRow: {
    alignItems: 'center',
  },
  registerText: {
    fontSize: 13.5,
    color: C.textMuted,
    fontWeight: '500',
  },
  registerLink: {
    color: C.primary,
    fontWeight: '800',
  },
});