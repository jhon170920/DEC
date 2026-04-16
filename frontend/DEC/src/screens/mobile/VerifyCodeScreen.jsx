import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Animated,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  useWindowDimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Colors } from '../../constants/colors';
import { useResponsiveLayout } from '../../hooks/useResponsiveLayout';
import { verifyCode } from '../../api/api';
import { StyleRegister as styles } from '../../styles/RegisterStyles'; // reutilizamos estilos

export default function VerifyCodeScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { email } = route.params; // email recibido desde Register

  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);

  const { sp, fieldH, btnH } = useResponsiveLayout();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();
  }, []);

  // Temporizador para reenvío
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setCanResend(true);
    }
  }, [timer]);

  const handleVerify = async () => {
    if (!code || code.length !== 6) {
      Alert.alert('Error', 'Ingresa el código de 6 dígitos que recibiste en tu correo');
      return;
    }

    setLoading(true);
    try {
      await verifyCode(email, code);
      Alert.alert('¡Éxito!', 'Cuenta verificada correctamente. Ahora puedes iniciar sesión.');
      navigation.navigate('Login');
    } catch (error) {
      const message = error.message || 'Código inválido o expirado';
      Alert.alert('Error de verificación', message);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    // Aquí deberías llamar a un endpoint de reenvío de código
    // Por ahora simulamos o mostramos mensaje
    Alert.alert('Reenvío', 'Se ha enviado un nuevo código a tu correo');
    setTimer(30);
    setCanResend(false);
    // Podrías llamar a una API: await resendCode(email);
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.bg} translucent={false} />
      <LinearGradient
        colors={['#e8f5ec', '#f4faf5', '#f4faf5']}
        style={{ flex: 1 }}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <Animated.View
            style={[
              styles.container,
              {
                paddingHorizontal: sp(0.05),
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <View style={{ marginBottom: sp(0.05) }}>
              <Text style={[styles.headline, { fontSize: 28, textAlign: 'center' }]}>
                Verifica tu correo
              </Text>
              <Text style={[styles.subline, { textAlign: 'center', marginTop: 8 }]}>
                Ingresa el código de 6 dígitos enviado a{'\n'}
                <Text style={{ fontWeight: 'bold' }}>{email}</Text>
              </Text>
            </View>

            <TextInput
              style={[
                styles.input,
                {
                  height: fieldH,
                  fontSize: 20,
                  textAlign: 'center',
                  letterSpacing: 8,
                },
              ]}
              placeholder="000000"
              keyboardType="number-pad"
              maxLength={6}
              value={code}
              onChangeText={setCode}
              autoFocus
            />

            <TouchableOpacity
              style={[
                styles.btnPrimary,
                { marginTop: sp(0.04), marginBottom: sp(0.02) },
                loading && { opacity: 0.72 },
              ]}
              onPress={handleVerify}
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
                  <Text style={styles.btnPrimaryText}>Verificar</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 16 }}>
              {canResend ? (
                <TouchableOpacity onPress={handleResend}>
                  <Text style={{ color: '#16a34a', fontWeight: '600' }}>
                    Reenviar código
                  </Text>
                </TouchableOpacity>
              ) : (
                <Text style={{ color: '#888' }}>Reenviar en {timer} segundos</Text>
              )}
            </View>

            <TouchableOpacity
              style={{ marginTop: 24 }}
              onPress={() => navigation.navigate('Login')}
            >
              <Text style={{ textAlign: 'center', color: '#555' }}>
                ← Volver al inicio de sesión
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </KeyboardAvoidingView>
      </LinearGradient>
    </View>
  );
}