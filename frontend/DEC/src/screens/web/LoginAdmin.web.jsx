import React, { useState, useContext, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  Platform, Modal, ActivityIndicator,
  useWindowDimensions, Animated, Image
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import api from '../../api/api';
import { C, LoginAdminStyles as styles } from './components/styles/loginAdminStyles';
import { AuthContext } from '../../context/AuthContext';

// ── Fila de stat para el panel izquierdo ──────────────────────
// ✅ Declarado afuera correctamente
const StatRow = ({ icon, value, label }) => (
  <View style={styles.statRow}>
    <View style={styles.statIconBox}>
      <Feather name={icon} size={14} color={C.amber} />
    </View>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

// ── Componente principal ───────────────────────────────────────
export default function LoginAdmin() {
  const navigation = useNavigation();
  const { login } = useContext(AuthContext);
  const { width } = useWindowDimensions();

  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [focusedField, setFocusedField] = useState(null); // 'email' | 'password'

  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle]     = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [modalType, setModalType]       = useState('error');

  // Animación de entrada del panel de formulario
  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;
  useEffect(() => {
    const useNative = Platform.OS !== 'web';
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 600, delay: 120, useNativeDriver: useNative }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, delay: 120, useNativeDriver: useNative }),
    ]).start();
  }, []);

  const isDesktop = width >= 900;
  const isMobile  = width < 480;

  // ── Validación y submit ──────────────────────────────────────
  const validateEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

  const showModal = (title, message, type = 'error') => {
    setModalTitle(title); setModalMessage(message); setModalType(type);
    setModalVisible(true);
  };

  const getModalIcon = () => {
    const iconProps = { size: 48, style: { alignSelf: 'center', marginBottom: 12 } };
    if (modalType === 'success') return <Feather name="check-circle" color={C.primary} {...iconProps} />;
    if (modalType === 'error')   return <Feather name="alert-circle" color={C.danger}  {...iconProps} />;
    return                               <Feather name="info"         color={C.mid}     {...iconProps} />;
  };

  const handleSubmit = async () => {
    if (!email.trim())              return showModal('Campo requerido', 'Ingresa tu correo electrónico.');
    if (!validateEmail(email.trim())) return showModal('Correo inválido', 'Ingresa un correo electrónico válido.');
    if (!password.trim())           return showModal('Campo requerido', 'Ingresa tu contraseña.');

    setLoading(true);
    try {
      const response = await api.post('users/login', { email, password });
      const { token, user } = response.data;
      if (user.role !== 'admin') return showModal('Acceso denegado', 'No tienes permisos de administrador.');
      await login(token);
      navigation.navigate('AdminDashboard');
    } catch (error) {
      const msg = error.response?.data?.message || error.message || 'Error al iniciar sesión. Verifica tus credenciales.';
      showModal('Error de autenticación', msg);
    } finally {
      setLoading(false);
    }
  };

  // ── Funciones de Renderizado (Evitan el desmontaje del DOM) ──
  const renderLeftPanel = () => (
    <LinearGradient
      colors={['#022c22', '#064e3b', '#047857']}
      style={styles.leftPanel}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      {/* Círculos decorativos de fondo */}
      <View style={styles.decorCircleLg} />
      <View style={styles.decorCircleSm} />

      {/* Marca */}
      <View style={styles.brandSection}>
        <View style={styles.brandLeafRing}>
          <Image
            source={require('../../../assets/play_logo.png')}
            style={{width: '100%', height: '100%', borderRadius: '100%'}}
            resizeMode="contain"
          />
        </View>
        <Text style={styles.brandName}>DEC</Text>
        <Text style={styles.brandFull}>
          Detector de Enfermedades{'\n'}en Cafetales
        </Text>

        {/* Línea acento ámbar — firma visual */}
        <View style={styles.amberAccentLine} />

        <Text style={styles.brandTagline}>
          Inteligencia artificial aplicada{'\n'}
          a la sanidad del café colombiano.
        </Text>
      </View>

      {/* Stats del modelo */}
      <View style={styles.statsBlock}>
        <StatRow icon="trending-up" value="92%"   label="Precisión del modelo" />
        <StatRow icon="image"       value="18.5K" label="Imágenes de entrenamiento" />
        <StatRow icon="clock"       value="3 s"   label="Tiempo de diagnóstico" />
        <StatRow icon="map-pin"     value="100%"  label="Cobertura regional" />
      </View>

      {/* Footer del panel */}
      <Text style={styles.leftFooter}>
        SENA Regional Huila · Ficha 3063679
      </Text>
    </LinearGradient>
  );

  const renderFormPanel = () => (
    <Animated.View
      style={[
        styles.formWrapper,
        isDesktop && styles.formWrapperDesktop,
        isMobile  && styles.formWrapperMobile,
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
      ]}
    >
      {/* Badge de acceso restringido */}
      <View style={styles.adminBadge}>
        <View style={styles.badgeDot} />
        <Text style={styles.adminBadgeText}>Acceso restringido</Text>
      </View>

      <Text style={[styles.title, isMobile && styles.titleMobile]}>
        Panel Admin
      </Text>
      <Text style={[styles.subtitle, isMobile && styles.subtitleMobile]}>
        Ingresa tus credenciales para administrar el sistema.
      </Text>

      {/* Campo correo */}
      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>Correo electrónico</Text>
        <View style={[
          styles.inputWrapper,
          focusedField === 'email' && styles.inputWrapperFocused,
        ]}>
          <Feather
            name="mail"
            size={16}
            color={focusedField === 'email' ? C.primary : C.muted}
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.input}
            placeholder="admin@ejemplo.com"
            placeholderTextColor={C.placeholder}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            onFocus={() => setFocusedField('email')}
            onBlur={() => setFocusedField(null)}
          />
        </View>
      </View>

      {/* Campo contraseña */}
      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>Contraseña</Text>
        <View style={[
          styles.inputWrapper,
          focusedField === 'password' && styles.inputWrapperFocused,
        ]}>
          <Feather
            name="lock"
            size={16}
            color={focusedField === 'password' ? C.primary : C.muted}
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            placeholderTextColor={C.placeholder}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            onFocus={() => setFocusedField('password')}
            onBlur={() => setFocusedField(null)}
          />
        </View>
      </View>

      {/* Botón submit */}
      <TouchableOpacity
        style={[styles.button, loading && { opacity: 0.75 }]}
        onPress={handleSubmit}
        disabled={loading}
        activeOpacity={0.85}
      >
        <LinearGradient
          colors={['#059669', '#047857', '#065f46']}
          style={styles.buttonGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <>
              <Feather name="log-in" size={18} color="#fff" />
              <Text style={styles.buttonText}>Ingresar al sistema</Text>
            </>
          )}
        </LinearGradient>
      </TouchableOpacity>

      {/* Volver */}
      <TouchableOpacity
        style={styles.backLink}
        onPress={() => navigation.navigate('Home')}
        activeOpacity={0.7}
      >
        <Feather name="arrow-left" size={14} color={C.primary} />
        <Text style={styles.backLinkText}>Regresar al inicio</Text>
      </TouchableOpacity>
    </Animated.View>
  );

  // ── Render Principal ─────────────────────────────────────────
  return (
    <View style={styles.root}>

      {/* Split layout */}
      {isDesktop ? (
        <View style={styles.splitContainer}>
          {renderLeftPanel()} {/* Cambiado de <LeftPanel /> a función evitando renderizados innecesarios */}
          <View style={styles.rightPanel}>
            {renderFormPanel()} {/*Cambiado de <FormPanel /> a función para evitar que se renderize de forma innecesaria */}
          </View>
        </View>
      ) : (
        // Mobile: header compacto + formulario
        <View style={{ flex: 1, width: '100%' }}>
          <LinearGradient
            colors={['#022c22', '#047857']}
            style={styles.mobileHeader}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Image
              source={require('../../../assets/play_logo.png')}
              style={{ width: 32, height: 32, borderRadius: 16 }}
              resizeMode="contain"
            />
            <Text style={styles.mobileHeaderTitle}>DEC · Admin</Text>
          </LinearGradient>
          <View style={styles.mobileFormContainer}>
            {renderFormPanel()} {/*Cambiado de <FormPanel /> a función para evitar que se renderize de forma innecesaria */}
          </View>
        </View>
      )}

      {/* ── Modal de feedback ─────────────────────────────────── */}
      {modalVisible && (
        <Modal
          transparent
          animationType="fade"
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[
              styles.modalContainer,
              isMobile && styles.modalContainerMobile,
              !isMobile && !isDesktop && styles.modalContainerTablet,
            ]}>
              {getModalIcon()}
              <Text style={[
                styles.modalTitle,
                modalType === 'error' && { color: C.danger },
                modalType === 'success' && { color: C.primary },
              ]}>
                {modalTitle}
              </Text>
              <Text style={styles.modalMessage}>{modalMessage}</Text>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => setModalVisible(false)}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={modalType === 'error' ? [C.danger, '#b91c1c'] : ['#059669', '#047857']}
                  style={styles.modalButtonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Text style={styles.modalButtonText}>Aceptar</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

