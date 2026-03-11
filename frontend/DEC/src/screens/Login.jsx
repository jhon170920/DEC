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
import { useResponsiveLayout } from '../hooks/useResponsiveLayout';
import { Colors } from '../constants/colors';

const API_URL = "http://10.4.1.208:8089/api/login";


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
      const response = await axios.post(API_URL, {
        email: email.toLowerCase().trim(),
        password: password,
      });
      if (response.data.token) {
        await SecureStore.setItemAsync('userToken', response.data.token);
        setUserToken(response.data.token);
      }
      navigation.navigate('MainApp');
    } catch (error) {
      console.error(error);
      const message = error.response?.data?.message || "No se pudo conectar con el servidor";
      Alert.alert("Error", message);
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
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
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
              { width: logoRingS, height: logoRingS, borderRadius: logoRingS / 2, marginBottom: 8 },
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
            <TouchableOpacity onPress={() => Alert.alert("Próximamente", "Función de recuperación en desarrollo")}>
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

// ─── ESTILOS BASE ──────────────────────────────────────────
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.bg,
  },

  // flex:1 + justifyContent:'center' = todo centrado en pantalla
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
  registerRow: { alignItems: 'center' },
  registerText: { fontSize: 13, color: Colors.textMuted, fontWeight: '500' },
  registerLink: { color: Colors.primary, fontWeight: '800' },
});