import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Linking,
  Animated,
  Platform,
  StatusBar,
  useWindowDimensions,
  Image,
  Modal
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { landingStyle as styles } from './components/styles/landingStyles';
import { C } from './components/styles/landingStyles';
import ParticlesBackground from './components/ParticlesBackground.web';
import QRCode from 'react-native-qrcode-svg';

// --- FADE IN UP ---
const FadeInUp = ({ children, delay = 0, style }) => {
  const anim = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(30)).current;
  useEffect(() => {
    const useNative = Platform.OS !== 'web';
    Animated.parallel([
      Animated.timing(anim,  { toValue: 1, duration: 700, delay, useNativeDriver: useNative }),
      Animated.timing(slide, { toValue: 0, duration: 700, delay, useNativeDriver: useNative }),
    ]).start();
  }, []);
  return (
    <Animated.View style={[style, { opacity: anim, transform: [{ translateY: slide }] }]}>
      {children}
    </Animated.View>
  );
};

// --- CONTADOR ANIMADO ---
const CountUp = ({ end, duration = 1500, suffix = '' }) => {
  const [count, setCount] = useState(0);
  const hasAnimated = useRef(false);
  useEffect(() => {
    if (hasAnimated.current) return;
    hasAnimated.current = true;
    let startTime;
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min(1, (timestamp - startTime) / duration);
      setCount(Math.floor(progress * end));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [end, duration]);
  return <Text style={styles.statNumber}>{count}{suffix}</Text>;
};

// --- FONDO ANIMADO ---
const AnimatedGradientBackground = () => {
  const animatedValue = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const useNative = Platform.OS !== 'web';
    Animated.loop(
      Animated.timing(animatedValue, { toValue: 1, duration: 10000, useNativeDriver: useNative })
    ).start();
  }, []);
  const rotate = animatedValue.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  return (
    <Animated.View style={[StyleSheet.absoluteFillObject, { transform: [{ rotate }], opacity: 0.15 }]}>
      <LinearGradient
        colors={['#fcd34d', '#10b981', '#059669']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ flex: 1 }}
      />
    </Animated.View>
  );
};

// ─────────────────────────────────────────────
// MODAL DE DESCARGA CON QR
// ─────────────────────────────────────────────

// 🔗 URL del grupo de testers en Google Groups — cambia esto por el enlace real
const TESTER_GROUP_URL = 'https://groups.google.com/g/tester-app-dec';

const DownloadModal = ({ visible, onClose, githubURL, playStoreURL }) => {
  const slideAnim = useRef(new Animated.Value(0)).current;
  const { width: screenWidth } = useWindowDimensions();

  // ✅ Estado para alternar entre la vista principal y la vista de acceso anticipado
  const [showTesterInfo, setShowTesterInfo] = useState(false);

  const isMobile = screenWidth < 640;
  const isTablet = screenWidth >= 640 && screenWidth < 1024;
  const modalStyles = downloadModalStyles({ width: screenWidth, isMobile, isTablet });

  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 1,
        useNativeDriver: Platform.OS !== 'web',
        speed: 12,
        bounciness: 8,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: Platform.OS !== 'web',
      }).start();
      // Resetear la vista al cerrar para que la próxima apertura empiece desde el inicio
      setTimeout(() => setShowTesterInfo(false), 350);
    }
  }, [visible]);

  const modalScale = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.85, 1],
  });

  const modalOpacity = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const qrSize = isMobile ? 120 : isTablet ? 140 : 160;

  // ─────────────────────────────────────────────
  // VISTA: ACCESO ANTICIPADO (Play Store)
  // ─────────────────────────────────────────────
  const TesterInfoView = () => (
    <>
      {/* Botón volver */}
      <TouchableOpacity
        style={modalStyles.backButton}
        onPress={() => setShowTesterInfo(false)}
        activeOpacity={0.7}
      >
        <Feather name="arrow-left" size={isMobile ? 16 : 18} color={C.text} />
        <Text style={modalStyles.backButtonText}>Volver</Text>
      </TouchableOpacity>

      {/* Badge de acceso anticipado */}
      <View style={modalStyles.earlyAccessBadge}>
        <MaterialCommunityIcons name="google-play" size={14} color="#34a853" />
        <Text style={modalStyles.earlyAccessBadgeText}>Google Play · Acceso Anticipado</Text>
      </View>

      <Text style={modalStyles.title}>App en pruebas 🧪</Text>
      <Text style={modalStyles.testerSubtitle}>
        DEC está actualmente en{' '}
        <Text style={{ fontWeight: '700', color: C.primary }}>acceso anticipado</Text>{' '}
        en Google Play. Solo los testers registrados pueden instalarla desde la tienda.
      </Text>

      {/* Separador */}
      <View style={modalStyles.testerDivider} />

      <Text style={modalStyles.testerStepTitle}>¿Cómo convertirme en tester?</Text>

      {/* Paso 1 */}
      <View style={modalStyles.testerStep}>
        <View style={[modalStyles.testerStepNum, { backgroundColor: '#34a853' }]}>
          <Text style={modalStyles.testerStepNumText}>1</Text>
        </View>
        <Text style={modalStyles.testerStepText}>
          Únete al grupo de testers de Google y espera la confirmación (puede tardar unos minutos).
        </Text>
      </View>

      {/* Paso 2 */}
      <View style={modalStyles.testerStep}>
        <View style={[modalStyles.testerStepNum, { backgroundColor: '#4285F4' }]}>
          <Text style={modalStyles.testerStepNumText}>2</Text>
        </View>
        <Text style={modalStyles.testerStepText}>
          Una vez aceptado, podrás descargar e instalar DEC directamente desde Google Play.
        </Text>
      </View>

      {/* Botón unirse al grupo */}
      <TouchableOpacity
        style={modalStyles.testerGroupBtn}
        onPress={() => Linking.openURL(TESTER_GROUP_URL)}
        activeOpacity={0.85}
      >
        <MaterialCommunityIcons name="google" size={isMobile ? 18 : 20} color="#fff" />
        <Text style={modalStyles.testerGroupBtnText}>Unirme al grupo de testers</Text>
        <Feather name="external-link" size={isMobile ? 14 : 16} color="rgba(255,255,255,0.8)" style={{ marginLeft: 'auto' }} />
      </TouchableOpacity>

      <Text style={modalStyles.testerNote}>
        💡 ¿Prefieres instalación inmediata? Descarga el APK gratis desde GitHub.
      </Text>
    </>
  );

  // ─────────────────────────────────────────────
  // VISTA: DESCARGA PRINCIPAL
  // ─────────────────────────────────────────────
  const DownloadOptionsView = () => (
    <>
      <TouchableOpacity
        style={modalStyles.closeButton}
        onPress={onClose}
      >
        <Feather name="x" size={isMobile ? 20 : 24} color={C.text} />
      </TouchableOpacity>

      <Text style={modalStyles.title}>Descarga DEC</Text>
      <Text style={modalStyles.subtitle}>
        Elige tu método de instalación preferido
      </Text>

      <View style={modalStyles.optionsContainer}>
        {/* Opción GitHub */}
        <View style={modalStyles.downloadOption}>
          {!isMobile && (
            <View style={modalStyles.qrContainer}>
              <QRCode
                value={githubURL}
                size={qrSize}
                color={C.text}
                backgroundColor="#fff"
                quietZone={8}
              />
            </View>
          )}
          <TouchableOpacity
            style={[modalStyles.downloadBtn, modalStyles.githubBtn]}
            onPress={() => {
              Linking.openURL(githubURL);
              onClose();
            }}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="github" size={isMobile ? 20 : 24} color="#fff" />
            <View style={modalStyles.btnLabelContainer}>
              <Text style={modalStyles.btnLabel}>Descargar desde</Text>
              <Text style={modalStyles.btnTitle}>GitHub</Text>
            </View>
            <Feather
              name="arrow-right"
              size={isMobile ? 0 : 20}
              color="#fff"
              style={[{ marginLeft: 'auto' }, modalStyles.arrowIcon]}
            />
          </TouchableOpacity>
          <Text style={modalStyles.optionDesc}>
            Descarga directa • APK • Última versión
          </Text>
        </View>

        {/* Divisor */}
        <View style={modalStyles.divider} />

        {/* Opción Play Store → muestra aviso de acceso anticipado */}
        <View style={modalStyles.downloadOption}>
          {!isMobile && (
            <View style={modalStyles.qrContainer}>
              <QRCode
                value={playStoreURL}
                size={qrSize}
                color={C.text}
                backgroundColor="#fff"
                quietZone={8}
              />
            </View>
          )}
          <TouchableOpacity
            style={[modalStyles.downloadBtn, modalStyles.playStoreBtn]}
            onPress={() => setShowTesterInfo(true)}   // ✅ Cambia la vista en lugar de abrir la URL
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="google-play" size={isMobile ? 20 : 24} color="#fff" />
            <View style={modalStyles.btnLabelContainer}>
              <Text style={modalStyles.btnLabel}>Descargar desde</Text>
              <Text style={modalStyles.btnTitle}>Google Play</Text>
            </View>
            <Feather
              name="arrow-right"
              size={isMobile ? 0 : 20}
              color="#fff"
              style={[{ marginLeft: 'auto' }, modalStyles.arrowIcon]}
            />
          </TouchableOpacity>
          <Text style={modalStyles.optionDesc}>
            Actualizaciones automáticas • Verificado • Seguro
          </Text>
        </View>
      </View>

      <View style={modalStyles.footer}>
        <View style={modalStyles.featureRow}>
          <View style={modalStyles.featureBadge}>
            <Feather name="smartphone" size={isMobile ? 14 : 16} color={C.primary} />
          </View>
          <Text style={modalStyles.featureText}>Compatible Android 8+</Text>
        </View>
        <View style={modalStyles.featureRow}>
          <View style={modalStyles.featureBadge}>
            <Feather name="wifi-off" size={isMobile ? 14 : 16} color={C.primary} />
          </View>
          <Text style={modalStyles.featureText}>Funciona sin conexión</Text>
        </View>
        <View style={modalStyles.featureRow}>
          <View style={modalStyles.featureBadge}>
            <Feather name="lock" size={isMobile ? 14 : 16} color={C.primary} />
          </View>
          <Text style={modalStyles.featureText}>100% gratuito y seguro</Text>
        </View>
      </View>
    </>
  );

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <View style={modalStyles.container}>
        {/* Fondo oscuro con opacidad */}
        <Animated.View style={[modalStyles.overlay, { opacity: modalOpacity }]}>
          <TouchableOpacity activeOpacity={1} onPress={onClose} style={{ flex: 1 }} />
        </Animated.View>

        {/* Modal principal */}
        <Animated.View
          style={[
            modalStyles.modalContent,
            { transform: [{ scale: modalScale }], opacity: modalOpacity },
          ]}
        >
          {/* ✅ Alterna entre las dos vistas */}
          {showTesterInfo ? <TesterInfoView /> : <DownloadOptionsView />}
        </Animated.View>
      </View>
    </Modal>
  );
};

// Estilos del Modal - Responsivo
const downloadModalStyles = ({ width, isMobile, isTablet }) => StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: isMobile ? 16 : 24,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: isMobile ? 20 : 28,
    padding: isMobile ? 20 : 32,
    width: '100%',
    maxHeight: isMobile ? '85vh' : '90vh',
    maxWidth: isMobile ? '100%' : isTablet ? 600 : 520,
    ...Platform.select({
      web: {
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 30,
        elevation: 10,
      },
    }),
  },
  closeButton: {
    position: 'absolute',
    top: isMobile ? 12 : 16,
    right: isMobile ? 12 : 16,
    width: isMobile ? 36 : 40,
    height: isMobile ? 36 : 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  title: {
    fontSize: isMobile ? 24 : 28,
    fontWeight: '800',
    color: C.text,
    marginBottom: 8,
    marginTop: isMobile ? 4 : 8,
  },
  subtitle: {
    fontSize: isMobile ? 13 : 14,
    color: '#6b7280',
    marginBottom: isMobile ? 20 : 28,
    lineHeight: 20,
  },
  optionsContainer: {
    marginBottom: isMobile ? 20 : 28,
  },
  downloadOption: {
    alignItems: 'center',
    paddingVertical: isMobile ? 8 : 12,
  },
  qrContainer: {
    backgroundColor: '#f9fafb',
    borderRadius: isMobile ? 12 : 16,
    padding: isMobile ? 10 : 12,
    marginBottom: isMobile ? 12 : 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    ...Platform.select({
      web: {
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 2,
      },
    }),
  },
  downloadBtn: {
    flexDirection: isMobile ? 'column' : 'row',
    alignItems: 'center',
    paddingVertical: isMobile ? 16 : 14,
    paddingHorizontal: isMobile ? 16 : 18,
    borderRadius: isMobile ? 12 : 14,
    marginBottom: isMobile ? 12 : 10,
    gap: isMobile ? 8 : 12,
    width: '100%',
  },
  githubBtn: {
    backgroundColor: '#1f2937',
  },
  playStoreBtn: {
    backgroundColor: '#34a853',
  },
  btnLabelContainer: {
    alignItems: isMobile ? 'center' : 'flex-start',
    flex: isMobile ? 1 : 0,
  },
  btnLabel: {
    fontSize: isMobile ? 10 : 11,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  btnTitle: {
    fontSize: isMobile ? 14 : 16,
    fontWeight: '700',
    color: '#fff',
    marginTop: 2,
    textAlign: isMobile ? 'center' : 'left',
  },
  arrowIcon: {
    display: isMobile ? 'none' : 'flex',
  },
  // ── Estilos vista Tester Info ──────────────────
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: isMobile ? 16 : 20,
    alignSelf: 'flex-start',
  },
  backButtonText: {
    fontSize: isMobile ? 13 : 14,
    color: C.text,
    fontWeight: '600',
  },
  earlyAccessBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#86efac',
    borderRadius: 40,
    paddingVertical: 5,
    paddingHorizontal: 12,
    alignSelf: 'flex-start',
    marginBottom: isMobile ? 12 : 16,
  },
  earlyAccessBadgeText: {
    fontSize: isMobile ? 11 : 12,
    color: '#16a34a',
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  testerSubtitle: {
    fontSize: isMobile ? 13 : 14,
    color: '#374151',
    lineHeight: isMobile ? 20 : 22,
    marginBottom: isMobile ? 16 : 20,
  },
  testerDivider: {
    height: 1,
    backgroundColor: '#f3f4f6',
    marginBottom: isMobile ? 16 : 20,
  },
  testerStepTitle: {
    fontSize: isMobile ? 14 : 15,
    fontWeight: '700',
    color: C.text,
    marginBottom: isMobile ? 12 : 16,
  },
  testerStep: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: isMobile ? 12 : 14,
  },
  testerStepNum: {
    width: isMobile ? 22 : 24,
    height: isMobile ? 22 : 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: 1,
  },
  testerStepNumText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: isMobile ? 11 : 12,
  },
  testerStepText: {
    flex: 1,
    fontSize: isMobile ? 13 : 14,
    color: '#4b5563',
    lineHeight: isMobile ? 19 : 21,
  },
  testerGroupBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4285F4',
    paddingVertical: isMobile ? 14 : 15,
    paddingHorizontal: isMobile ? 16 : 20,
    borderRadius: isMobile ? 12 : 14,
    gap: 10,
    marginTop: isMobile ? 4 : 8,
    marginBottom: isMobile ? 14 : 16,
  },
  testerGroupBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: isMobile ? 14 : 15,
    flex: 1,
  },
  testerNote: {
    fontSize: isMobile ? 11 : 12,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: isMobile ? 16 : 18,
  },
  // ── Fin estilos Tester Info ─────────────────
  optionDesc: {
    fontSize: isMobile ? 11 : 12,
    color: '#9ca3af',
    textAlign: 'center',
    marginTop: isMobile ? 8 : 6,
    paddingHorizontal: isMobile ? 8 : 0,
  },
  divider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: isMobile ? 16 : 20,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: isMobile ? 16 : 20,
    gap: isMobile ? 10 : 12,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: isMobile ? 8 : 10,
  },
  featureBadge: {
    width: isMobile ? 28 : 32,
    height: isMobile ? 28 : 32,
    borderRadius: 8,
    backgroundColor: '#f0fdf4',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  featureText: {
    fontSize: isMobile ? 12 : 13,
    color: '#374151',
    fontWeight: '500',
    flex: 1,
  },
});

// ─────────────────────────────────────────────
// CARD DE ENFERMEDAD
// ─────────────────────────────────────────────
const Card = ({ icon, title, latin, desc, tagIcon, tagText, tagColors, accentColors, revealDelay = 0 }) => {
  const hoverAnim   = useRef(new Animated.Value(0)).current;
  const revealAnim  = useRef(new Animated.Value(0)).current;
  const revealSlide = useRef(new Animated.Value(32)).current;
  const borderScale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const useNative = Platform.OS !== 'web';
    Animated.parallel([
      Animated.timing(revealAnim,  { toValue: 1, duration: 700, delay: revealDelay, useNativeDriver: useNative }),
      Animated.timing(revealSlide, { toValue: 0, duration: 700, delay: revealDelay, useNativeDriver: useNative }),
    ]).start();
  }, []);

  const handleMouseEnter = () => {
    const useNative = Platform.OS !== 'web';
    Animated.parallel([
      Animated.spring(hoverAnim,   { toValue: 1, useNativeDriver: useNative, speed: 20, bounciness: 8 }),
      Animated.timing(borderScale, { toValue: 1, duration: 400, useNativeDriver: useNative }),
    ]).start();
  };

  const handleMouseLeave = () => {
    const useNative = Platform.OS !== 'web';
    Animated.parallel([
      Animated.spring(hoverAnim,   { toValue: 0, useNativeDriver: useNative, speed: 20, bounciness: 6 }),
      Animated.timing(borderScale, { toValue: 0, duration: 300, useNativeDriver: useNative }),
    ]).start();
  };

  const translateY  = hoverAnim.interpolate({ inputRange: [0, 1], outputRange: [0, -6] });
  const borderColor = hoverAnim.interpolate({ inputRange: [0, 1], outputRange: ['rgba(220,238,226,1)', 'rgba(34,197,94,1)'] });

  return (
    <Animated.View
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        opacity: revealAnim,
        transform: [{ translateY: revealSlide }, { translateY }],
        width: Platform.OS === 'web' ? 300 : '100%',
        minWidth: 260,
      }}
    >
      <Animated.View style={[styles.card, { borderColor, borderWidth: 1.5 }]}>
        {/* Borde superior animado */}
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, overflow: 'hidden' }}>
          <Animated.View style={{ height: 3, width: '100%', transform: [{ scaleX: borderScale }] }}>
            <LinearGradient
              colors={accentColors || ['#22c55e', '#16a34a']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={{ flex: 1 }}
            />
          </Animated.View>
        </View>
        <View style={styles.cardIconBox}>
          <Text style={styles.cardIcon}>{icon}</Text>
        </View>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardLatin}>{latin}</Text>
        <Text style={styles.cardDesc}>{desc}</Text>
        <View style={[styles.cardTag, { backgroundColor: tagColors?.bg, borderColor: tagColors?.border }]}>
          <Text style={[styles.cardTagText, { color: tagColors?.text }]}>{tagIcon} {tagText}</Text>
        </View>
      </Animated.View>
    </Animated.View>
  );
};

// ─────────────────────────────────────────────
// STEP CARD ANIMADA
// ─────────────────────────────────────────────
const StepCard = ({ icon, step, title, desc, delay = 0 }) => {
  const hoverAnim   = useRef(new Animated.Value(0)).current;
  const revealAnim  = useRef(new Animated.Value(0)).current;
  const revealSlide = useRef(new Animated.Value(32)).current;

  useEffect(() => {
    const useNative = Platform.OS !== 'web';
    Animated.parallel([
      Animated.timing(revealAnim,  { toValue: 1, duration: 700, delay, useNativeDriver: useNative }),
      Animated.timing(revealSlide, { toValue: 0, duration: 700, delay, useNativeDriver: useNative }),
    ]).start();
  }, []);

  const handleMouseEnter = () => {
    Animated.spring(hoverAnim, { toValue: 1, useNativeDriver: Platform.OS !== 'web', speed: 20, bounciness: 10 }).start();
  };
  const handleMouseLeave = () => {
    Animated.spring(hoverAnim, { toValue: 0, useNativeDriver: Platform.OS !== 'web', speed: 20, bounciness: 6 }).start();
  };

  const translateY  = hoverAnim.interpolate({ inputRange: [0, 1], outputRange: [0, -6] });
  const borderColor = hoverAnim.interpolate({ inputRange: [0, 1], outputRange: ['rgba(255,255,255,1)', 'rgba(5,150,105,0.3)'] });
  const iconScale   = hoverAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.15] });
  const iconBg      = hoverAnim.interpolate({ inputRange: [0, 1], outputRange: ['rgba(236,253,245,1)', 'rgba(5,150,105,0.15)'] });

  return (
    <Animated.View
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={[
        styles.stepCard,
        {
          opacity: revealAnim,
          borderWidth: 1.5,
          borderColor,
          transform: [{ translateY: revealSlide }, { translateY }],
        },
      ]}
    >
      <View style={styles.stepNumber}>
        <Text style={styles.stepNumberText}>{step}</Text>
      </View>
      <Animated.View style={[styles.stepIcon, { backgroundColor: iconBg, transform: [{ scale: iconScale }] }]}>
        <Feather name={icon} size={36} color={C.primary} />
      </Animated.View>
      <Text style={styles.stepTitle}>{title}</Text>
      <Text style={styles.stepDesc}>{desc}</Text>
    </Animated.View>
  );
};

// ─────────────────────────────────────────────
// STAT CARD
// ─────────────────────────────────────────────
const StatCard = ({ end, suffix, label, icon }) => (
  <View style={styles.statCard}>
    <Feather name={icon} size={32} color="#fff" />
    <CountUp end={end} suffix={suffix} />
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

// ─────────────────────────────────────────────
// BENEFIT CARD ANIMADA
// ─────────────────────────────────────────────
const BenefitCard = ({ icon, title, desc, delay = 0 }) => {
  const hoverAnim   = useRef(new Animated.Value(0)).current;
  const revealAnim  = useRef(new Animated.Value(0)).current;
  const revealSlide = useRef(new Animated.Value(32)).current;

  useEffect(() => {
    const useNative = Platform.OS !== 'web';
    Animated.parallel([
      Animated.timing(revealAnim,  { toValue: 1, duration: 700, delay, useNativeDriver: useNative }),
      Animated.timing(revealSlide, { toValue: 0, duration: 700, delay, useNativeDriver: useNative }),
    ]).start();
  }, []);

  const handleMouseEnter = () => {
    Animated.spring(hoverAnim, { toValue: 1, useNativeDriver: Platform.OS !== 'web', speed: 20, bounciness: 10 }).start();
  };
  const handleMouseLeave = () => {
    Animated.spring(hoverAnim, { toValue: 0, useNativeDriver: Platform.OS !== 'web', speed: 20, bounciness: 6 }).start();
  };

  const translateY  = hoverAnim.interpolate({ inputRange: [0, 1], outputRange: [0, -6] });
  const borderColor = hoverAnim.interpolate({ inputRange: [0, 1], outputRange: ['rgba(255,255,255,1)', 'rgba(5,150,105,0.35)'] });
  const iconBg      = hoverAnim.interpolate({ inputRange: [0, 1], outputRange: ['rgba(236,253,245,1)', 'rgba(5,150,105,0.15)'] });
  const iconScale   = hoverAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.15] });

  const IconComponent = icon === 'leaf' ? MaterialCommunityIcons : Feather;

  return (
    <Animated.View
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={[
        styles.benefitCard,
        {
          opacity: revealAnim,
          borderWidth: 1.5,
          borderColor,
          transform: [{ translateY: revealSlide }, { translateY }],
        },
      ]}
    >
      <Animated.View style={[styles.benefitIcon, { backgroundColor: iconBg, transform: [{ scale: iconScale }] }]}>
        <IconComponent name={icon} size={32} color={C.primary} />
      </Animated.View>
      <Text style={styles.benefitTitle}>{title}</Text>
      <Text style={styles.benefitDesc}>{desc}</Text>
    </Animated.View>
  );
};

// ===== ESTILOS DEL PHONE MOCKUP =====
const phoneStyles = StyleSheet.create({
  mockupWrapper: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    position: 'relative', minHeight: 500,
  },
  glowRing: {
    position: 'absolute', borderRadius: 9999,
    borderWidth: 1, borderColor: 'rgba(34,197,94,0.08)',
    top: '50%', left: '50%',
  },
  phoneShell: {
    width: 220, backgroundColor: '#0f1f12',
    borderRadius: 40, borderWidth: 2,
    borderColor: 'rgba(52,168,83,0.4)', padding: 16,
    ...Platform.select({
      web: { boxShadow: '0 40px 80px rgba(0,0,0,0.6)' },
      default: { shadowColor: '#000', shadowOffset: { width: 0, height: 20 }, shadowOpacity: 0.6, shadowRadius: 40, elevation: 20 },
    }),
  },
  notch: {
    width: 70, height: 20, backgroundColor: '#000',
    borderBottomLeftRadius: 10, borderBottomRightRadius: 10,
    alignSelf: 'center', marginBottom: 12,
  },
  screen: {
    backgroundColor: '#071510', borderRadius: 22, overflow: 'hidden',
    aspectRatio: 9 / 16, alignItems: 'center', justifyContent: 'center',
    gap: 10, padding: 16, position: 'relative', height: 400,
  },
  scanBar: {
    position: 'absolute', left: 0, right: 0, height: 2,
    backgroundColor: 'rgba(116,250,158,0.8)',
  },
  scanRing: {
    width: 100, height: 100, borderRadius: 50,
    borderWidth: 2, borderColor: 'rgba(34,197,94,0.5)',
    alignItems: 'center', justifyContent: 'center', position: 'relative',
  },
  scanRingInner: {
    position: 'absolute', top: 8, bottom: 8, left: 8, right: 8,
    borderRadius: 50, borderWidth: 1, borderColor: 'rgba(116,250,158,0.3)',
  },
  scanCore: {
    width: 66, height: 66, borderRadius: 33,
    backgroundColor: 'rgba(34,197,94,0.1)',
    alignItems: 'center', justifyContent: 'center',
  },
  resultBox: {
    width: '100%', backgroundColor: 'rgba(22,163,74,0.15)',
    borderWidth: 1, borderColor: 'rgba(22,163,74,0.3)',
    borderRadius: 10, padding: 8,
  },
  resultBoxAlt: { backgroundColor: 'rgba(34,197,94,0.08)', borderColor: 'rgba(34,197,94,0.2)' },
  resultLabel: { fontSize: 8, color: 'rgba(255,255,255,0.4)', letterSpacing: 1, textTransform: 'uppercase' },
  resultValue: { fontSize: 13, fontWeight: '700', color: '#74fa9e', marginTop: 2 },
  resultConf:  { fontSize: 9, color: 'rgba(255,255,255,0.4)' },
});

// ===== COMPONENTE PRINCIPAL =====
export default function LandingPage({ navigation }) {
  const { width, height } = useWindowDimensions();
  const isDesktop = width > 1024;
  const [modalVisible, setModalVisible] = useState(false);

  const scanBarAnim    = useRef(new Animated.Value(0)).current;
  const scanPulseAnim  = useRef(new Animated.Value(0)).current;
  const phoneFloatAnim = useRef(new Animated.Value(0)).current;
  const glowAnim       = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const useNative = true;

    scanBarAnim.setValue(0);
    Animated.loop(Animated.sequence([
      Animated.timing(scanBarAnim, { toValue: 1, duration: 3000, useNativeDriver: useNative }),
      Animated.timing(scanBarAnim, { toValue: 0, duration: 0,    useNativeDriver: useNative }),
    ])).start();

    scanPulseAnim.setValue(0);
    Animated.loop(Animated.sequence([
      Animated.timing(scanPulseAnim, { toValue: 1, duration: 1500, useNativeDriver: useNative }),
      Animated.timing(scanPulseAnim, { toValue: 0, duration: 1500, useNativeDriver: useNative }),
    ])).start();

    phoneFloatAnim.setValue(0);
    Animated.loop(Animated.sequence([
      Animated.timing(phoneFloatAnim, { toValue: 1, duration: 2500, useNativeDriver: useNative }),
      Animated.timing(phoneFloatAnim, { toValue: 0, duration: 2500, useNativeDriver: useNative }),
    ])).start();

    glowAnim.setValue(0);
    Animated.loop(Animated.sequence([
      Animated.timing(glowAnim, { toValue: 1, duration: 2000, useNativeDriver: useNative }),
      Animated.timing(glowAnim, { toValue: 0, duration: 2000, useNativeDriver: useNative }),
    ])).start();

    return () => {
      scanBarAnim.stopAnimation();
      scanPulseAnim.stopAnimation();
      phoneFloatAnim.stopAnimation();
      glowAnim.stopAnimation();
    };
  }, []);

  const handleDownloadAPK = () => setModalVisible(true);

  const handleAdminAccess = () => {
    if (navigation && navigation.navigate) {
      navigation.navigate('LoginAdmin');
    } else {
      alert('Acceso para administradores. Demo disponible próximamente.');
    }
  };

  // URLs para descargar
  const githubURL = 'https://github.com/jhon170920/DEC/releases/download/apk/DEC.apk';
  const playStoreURL = 'https://play.google.com/store/apps/details?id=com.decapp.com'; // Reemplazar con URL real

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <AnimatedGradientBackground />
      <ParticlesBackground /> 
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >

        {/* ── HERO ── */}
        <View style={[styles.hero, { minHeight: isDesktop ? 750 : height }]}>
          <LinearGradient
            colors={['#022c22', '#064e3b', '#047857']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <View style={[styles.mainContainer, isDesktop && styles.heroRow]}>
            <View style={isDesktop ? { flex: 1.2, zIndex: 2 } : { width: '100%' }}>
              <FadeInUp delay={100}>
                <View style={styles.badge}>
                  <MaterialCommunityIcons name="robot-outline" size={14} color={C.accent} />
                  <Text style={styles.badgeText}>Proyecto DEC • IA DE ÚLTIMA GENERACIÓN </Text>
                </View>
                <Text style={[styles.heroTitle, isDesktop && { fontSize: 64, lineHeight: 76 }]}>
                  Protege tu cosecha con{' '}
                  <Text style={{ color: '#fcd34d', fontStyle: 'italic' }}>Inteligencia Artificial</Text>
                </Text>
                <Text style={styles.heroSub}>
                  Detecta Roya, Mancha de Hierro (cercospora) y Minador en segundos con precisión superior al 92%.
                  Una herramienta diseñada para el caficultor moderno.
                </Text>
                <View style={styles.btnRow}>
                  <TouchableOpacity style={styles.primaryBtn} onPress={handleDownloadAPK} activeOpacity={0.9}>
                    <LinearGradient colors={[C.accent, C.accentDark]} style={styles.btnGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                      <Feather name="download-cloud" size={22} color="#fff" />
                      <Text style={styles.btnText}>Descargar APK Gratis</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.adminLink} onPress={handleAdminAccess}>
                    <Text style={styles.adminLinkText}>Acceso Administradores →</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.heroStats}>
                  <View style={styles.heroStatItem}>
                    <View style={styles.statIconBg}><Feather name="check-circle" size={18} color={C.accent} /></View>
                    <Text style={styles.heroStatText}>Precisión 90%</Text>
                  </View>
                  <View style={styles.heroStatItem}>
                    <View style={styles.statIconBg}><Feather name="zap" size={18} color={C.accent} /></View>
                    <Text style={styles.heroStatText}>Respuesta 3.5s</Text>
                  </View>
                </View>
              </FadeInUp>
            </View>

            {/* Phone mockup */}
            {isDesktop && (
              <View style={phoneStyles.mockupWrapper}>
                {[300, 400, 500].map((size, i) => (
                  <Animated.View
                    key={i}
                    style={[phoneStyles.glowRing, {
                      width: size, height: size,
                      marginLeft: -size / 2, marginTop: -size / 2,
                      opacity: glowAnim.interpolate({ inputRange: [0, 1], outputRange: [0.3, 0.7] }),
                    }]}
                  />
                ))}
                <Animated.View style={[phoneStyles.phoneShell, {
                  transform: [{ translateY: phoneFloatAnim.interpolate({ inputRange: [0, 1], outputRange: [0, -14] }) }],
                }]}>
                  <View style={phoneStyles.notch} />
                  <View style={phoneStyles.screen}>
                    <Animated.View style={[phoneStyles.scanBar, {
                      transform: [{ translateY: scanBarAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 280] }) }],
                      opacity: scanBarAnim.interpolate({ inputRange: [0, 0.1, 0.9, 1], outputRange: [0, 1, 1, 0] }),
                      ...(Platform.OS === 'web' && { background: 'linear-gradient(90deg, transparent, rgba(116,250,158,0.8), transparent)' }),
                    }]} />
                    <Animated.View style={[phoneStyles.scanRing, {
                      opacity: scanPulseAnim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.6, 1, 0.6] }),
                      transform: [{ scale: scanPulseAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.2] }) }],
                    }]}>
                      <View style={phoneStyles.scanRingInner} />
                      <View style={phoneStyles.scanCore}>
                        <Text style={{ fontSize: 28 }}>🍃</Text>
                      </View>
                    </Animated.View>
                    <View style={phoneStyles.resultBox}>
                      <Text style={phoneStyles.resultLabel}>Resultado del análisis</Text>
                      <Text style={phoneStyles.resultValue}>Roya del Cafeto</Text>
                      <Text style={phoneStyles.resultConf}>Confianza: 98.%</Text>
                    </View>
                    <View style={[phoneStyles.resultBox, phoneStyles.resultBoxAlt]}>
                      <Text style={phoneStyles.resultLabel}>Tratamiento sugerido</Text>
                      <Text style={[phoneStyles.resultValue, { fontSize: 10, lineHeight: 15 }]}>
                        Aplicar fungicida cúprico sistémico
                      </Text>
                    </View>
                  </View>
                </Animated.View>
              </View>
            )}
          </View>
        </View>

        {/* ── ENFERMEDADES ── */}
        <View style={styles.section}>
          <View style={styles.mainContainer}>
            <FadeInUp delay={200}>
              <Text style={styles.sectionTag}>TECNOLOGÍA YOLOv11 + TRANSFER LEARNING</Text>
              <Text style={styles.sectionTitle}>Enfermedades que detectamos con alta precisión</Text>
            </FadeInUp>
            <View style={styles.grid}>
              <Card
                icon="🍂" title="Roya del Cafeto" latin="Hemileia vastatrix"
                desc="Hongo que ataca las hojas formando manchas anaranjadas en el envés. Provoca defoliación severa y puede devastar una cosecha entera en semanas."
                tagIcon="⚠" tagText="Alta severidad"
                tagColors={{ bg: '#fffbeb', text: '#d97706', border: '#fde68a' }}
                accentColors={['#f59e0b', '#d97706']} revealDelay={100}
              />
              <Card
                icon="🌿" title="Mancha de hierro" latin="Cercospora coffeicola"
                desc="Enfermedad fúngica que afecta principalmente al cultivo de café. Se caracterizan por la aparición en las hojas de pequeñas lesiones circulares de color pardo claro o marrón rojizo, ataca tanto hojas como frutos, siendo un factor limitante en la producción"
                tagIcon="⚡" tagText="Media severidad"
                tagColors={{ bg: '#fef2f2', text: '#ef4444', border: '#fecaca' }}
                accentColors={['#ef4444', '#dc2626']} revealDelay={200}
              />
              <Card
                icon="🐛" title="Minador de la Hoja" latin="Leucoptera coffeella"
                desc="Larva que excava galerías dentro del tejido foliar creando minas características. Reduce la capacidad fotosintética de la planta afectando el rendimiento."
                tagIcon="✓" tagText="Detectable temprano"
                tagColors={{ bg: '#f0fdf4', text: '#16a34a', border: '#dceee2' }}
                accentColors={['#22c55e', '#16a34a']} revealDelay={300}
              />
            </View>
          </View>
        </View>

        {/* ── CÓMO FUNCIONA ── */}
        <View style={[styles.section, { backgroundColor: '#f8fafc' }]}>
          <View style={styles.mainContainer}>
            <FadeInUp delay={100}>
              <Text style={styles.sectionTag}>SIMPLE Y PODEROSO</Text>
              <Text style={styles.sectionTitle}>Tecnología que llega al campo en simples pasos</Text>
            </FadeInUp>
            <View style={styles.stepsRow}>
              <StepCard icon="camera"    step="01" title="Captura"    desc="Enfoca la hoja del cafeto con tu celular."    delay={100} />
              <StepCard icon="cpu"       step="02" title="IA Analiza" desc="Modelo YOLOv11 procesa en tiempo real."        delay={200} />
              <StepCard icon="clipboard" step="03" title="Solución"   desc="Diagnóstico preciso y plan de tratamiento."    delay={300} />
            </View>
          </View>
        </View>

        {/* ── ESTADÍSTICAS ── */}
        <View style={styles.statsContainer}>
          <LinearGradient colors={['#064e3b', '#047857', '#059669']} style={StyleSheet.absoluteFill} />
          <View style={styles.mainContainer}>
            <View style={styles.statsGrid}>
              <StatCard end={92}    suffix="%" label="Precisión"           icon="trending-up" />
              <StatCard end={18500} suffix="+" label="Imágenes entrenadas" icon="image" />
              <StatCard end={3}     suffix="s" label="Diagnóstico"         icon="clock" />
              <StatCard end={100}   suffix="%" label="Cobertura regional"  icon="map-pin" />
            </View>
          </View>
        </View>

        {/* ── BENEFICIOS ── */}
        <View style={styles.section}>
          <View style={styles.mainContainer}>
            <FadeInUp delay={100}>
              <Text style={styles.sectionTag}>VENTAJAS PARA EL CAFICULTOR</Text>
              <Text style={styles.sectionTitle}>¿Por qué elegir DEC?</Text>
            </FadeInUp>
            <View style={styles.benefitsGrid}>
              <BenefitCard icon="wifi-off"    title="Sin conexión"    desc="Funciona offline, ideal para zonas remotas."  delay={100} />
              <BenefitCard icon="leaf"        title="Ecológico"       desc="Recomendaciones amigables con el entorno."    delay={200} />
              <BenefitCard icon="bar-chart-2" title="Historial"       desc="Monitorea la evolución de tus cultivos."      delay={300} />
              <BenefitCard icon="shield"      title="Alerta temprana" desc="Prevención antes de la propagación."          delay={400} />
            </View>
          </View>
        </View>

        {/* ── CTA ── */}
        <View style={styles.ctaSection}>
          <LinearGradient colors={['#022c22', '#064e3b', '#047857']} style={StyleSheet.absoluteFill} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} />
          <View style={styles.mainContainer}>
            <FadeInUp delay={0}>
              <Text style={styles.ctaTitle}>Descarga DEC ahora</Text>
              <Text style={styles.ctaSub}>Protege tu cultivo de café con tecnología de vanguardia.</Text>
              <TouchableOpacity style={styles.ctaButton} onPress={handleDownloadAPK}>
                <Feather name="download-cloud" size={28} color="#fff" />
                <Text style={styles.ctaButtonText}>Descargar APK Gratis</Text>
              </TouchableOpacity>
            </FadeInUp>
          </View>
        </View>

        {/* ── FOOTER ── */}
        <View style={styles.footer}>
          <View style={[styles.mainContainer, { alignItems: 'center' }]}>
            <View style={styles.footerContent}>
              <View style={styles.footerLogo}>
                <Image source={require("../../../assets/play_logo.png")} 
                style={{borderRadius: 10, width:40, height: 40}}/>
                <Text style={styles.footerLogoText}>DEC • Detección en Café Para el pueblo colombiano</Text>
              </View>
            </View>
            <Text style={styles.footerText}>© {new Date().getFullYear()} Proyecto DEC - SENA Regional Huila. Tecnología al servicio del campo colombiano.</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Legal')}>
              <Text style={{color: C.primary, marginTop: 10, backgroundColor:'transparent'}}>Terminos y Política de Privacidad.</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Modal de descarga con QR */}
      <DownloadModal 
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        githubURL={githubURL}
        playStoreURL={playStoreURL}
      />
    </View>
  );
}