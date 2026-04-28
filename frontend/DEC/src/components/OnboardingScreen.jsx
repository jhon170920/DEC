import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Platform,
  Dimensions,
  Animated,
} from 'react-native';
import Onboarding from 'react-native-onboarding-swiper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

// ─────────────────────────────────────────
// COMPONENTES DE NAVEGACIÓN
// ─────────────────────────────────────────

const Dots = ({ selected }) => (
  <View
    style={[
      styles.dot,
      {
        width: selected ? 22 : 6,
        backgroundColor: selected ? '#4ade80' : 'rgba(255,255,255,0.3)',
        opacity: selected ? 1 : 0.6,
      },
    ]}
  />
);

const DotsLight = ({ selected }) => (
  <View
    style={[
      styles.dot,
      {
        width: selected ? 22 : 6,
        backgroundColor: selected ? '#16a34a' : '#d1d5db',
        opacity: selected ? 1 : 0.5,
      },
    ]}
  />
);

const NextButton = ({ ...props }) => (
  <TouchableOpacity style={styles.nextButton} {...props} activeOpacity={0.8}>
    <Feather name="chevron-right" size={22} color="#16a34a" />
  </TouchableOpacity>
);

const DoneButton = ({ ...props }) => (
  <TouchableOpacity style={styles.doneButton} {...props} activeOpacity={0.85}>
    <Text style={styles.doneButtonText}>Comenzar ahora</Text>
    <Feather name="arrow-right" size={16} color="#052e16" />
  </TouchableOpacity>
);

const SkipButton = ({ ...props }) => (
  <TouchableOpacity style={styles.skipButton} {...props} activeOpacity={0.7}>
    <Text style={styles.skipButtonText}>Saltar</Text>
  </TouchableOpacity>
);

// ─────────────────────────────────────────
// PANTALLA 1 — BIENVENIDA
// ─────────────────────────────────────────

const WelcomeIllustration = () => {
  const pulse = React.useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.08, duration: 900, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 900, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <View style={[styles.illustrationWrapper, { backgroundColor: '#052e16' }]}>
      {/* Círculos decorativos */}
      <View style={styles.ring3} />
      <View style={styles.ring2} />

      {/* Badge IA */}
      <View style={styles.iaBadge}>
        <Animated.View style={[styles.iaBadgeDot, { transform: [{ scale: pulse }] }]} />
        <Text style={styles.iaBadgeText}>IA ACTIVA</Text>
      </View>

      {/* Círculo principal */}
      <View style={styles.mainCircle}>
        <Image
          source={require('../../assets/image/logo.png')}
          style={styles.logoImage}
          resizeMode="contain"
        />
      </View>

      {/* Línea de escaneo animada */}
      <ScanLine />
    </View>
  );
};

const ScanLine = () => {
  const anim = React.useRef(new Animated.Value(0)).current;
  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration: 1800, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0, duration: 0, useNativeDriver: true }),
      ])
    ).start();
  }, []);
  const translateX = anim.interpolate({ inputRange: [0, 1], outputRange: [-width * 0.35, width * 0.35] });
  return (
    <Animated.View style={[styles.scanLine, { transform: [{ translateX }] }]} />
  );
};

// ─────────────────────────────────────────
// PANTALLA 2 — DETECCIÓN SIN INTERNET
// ─────────────────────────────────────────

const DetectionIllustration = () => {
  const scanAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scanAnim, { toValue: 1, duration: 2200, useNativeDriver: true }),
        Animated.timing(scanAnim, { toValue: 0, duration: 0, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const translateY = scanAnim.interpolate({ inputRange: [0, 1], outputRange: [-60, 60] });

  return (
    <View style={[styles.illustrationWrapper, { backgroundColor: '#f0fdf4' }]}>
      {/* Grid de fondo */}
      <View style={styles.gridOverlay} />

      {/* Marco del teléfono */}
      <View style={styles.mockPhone}>
        {/* Header del mock */}
        <View style={styles.mockPhoneHeader}>
          <Text style={styles.mockPhoneHeaderText}>DEC · ESCÁNER</Text>
        </View>

        {/* Visor */}
        <View style={styles.viewfinder}>
          {/* Esquinas */}
          <View style={[styles.corner, styles.cornerTL]} />
          <View style={[styles.corner, styles.cornerTR]} />
          <View style={[styles.corner, styles.cornerBL]} />
          <View style={[styles.corner, styles.cornerBR]} />

          {/* Hoja */}
          <Text style={{ fontSize: 44 }}>🍃</Text>

          {/* Línea de escaneo */}
          <Animated.View style={[styles.viewfinderScan, { transform: [{ translateY }] }]} />
        </View>
      </View>

      {/* Chip resultado */}
      <View style={styles.resultChip}>
        <Feather name="check-circle" size={11} color="#fff" />
        <Text style={styles.resultChipText}>ROYA DETECTADA · 87%</Text>
      </View>

      {/* Badge sin wifi */}
      <View style={styles.noWifiBadge}>
        <Feather name="wifi-off" size={14} color="#d97706" />
      </View>
    </View>
  );
};

// ─────────────────────────────────────────
// PANTALLA 3 — CONTROL DE COSECHA
// ─────────────────────────────────────────

const StatsIllustration = () => (
  <View style={[styles.illustrationWrapper, { backgroundColor: '#fefce8' }]}>
    <View style={styles.dashCard}>
      {/* Header */}
      <View style={styles.dashHeader}>
        <Text style={styles.dashHeaderTitle}>LOTE · CAFÉ PREMIUM</Text>
        <Text style={styles.dashHeaderDate}>Abr 2025</Text>
      </View>

      {/* Stats */}
      <View style={styles.dashStats}>
        <View style={styles.dashStatItem}>
          <Text style={styles.dashStatNum}>142<Text style={styles.dashStatUnit}> ha</Text></Text>
          <Text style={styles.dashStatLabel}>Área monitoreada</Text>
        </View>
        <View style={[styles.dashStatItem, { borderRightWidth: 0 }]}>
          <Text style={[styles.dashStatNum, { color: '#16a34a' }]}>94<Text style={styles.dashStatUnit}>%</Text></Text>
          <Text style={styles.dashStatLabel}>Plantas sanas</Text>
        </View>
      </View>

      {/* Barras */}
      <View style={styles.dashBars}>
        <BarRow label="Roya" pct={0.15} color="#ef4444" display="3.8%" />
        <BarRow label="Ojo de Gallo" pct={0.08} color="#f59e0b" display="1.4%" />
        <BarRow label="Sin enfermedad" pct={0.85} color="#16a34a" display="94%" />
      </View>
    </View>
  </View>
);

const BarRow = ({ label, pct, color, display }) => (
  <View style={{ marginBottom: 7 }}>
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 }}>
      <Text style={{ fontSize: 9, color: '#6b7280' }}>{label}</Text>
      <Text style={{ fontSize: 9, color, fontWeight: '700' }}>{display}</Text>
    </View>
    <View style={styles.barTrack}>
      <View style={[styles.barFill, { width: `${pct * 100}%`, backgroundColor: color }]} />
    </View>
  </View>
);

// ─────────────────────────────────────────
// PANTALLA 4 — LISTO
// ─────────────────────────────────────────

const ReadyIllustration = () => {
  const scale = React.useRef(new Animated.Value(0.85)).current;
  React.useEffect(() => {
    Animated.spring(scale, { toValue: 1, friction: 5, tension: 80, useNativeDriver: true }).start();
  }, []);

  return (
    <View style={[styles.illustrationWrapper, { backgroundColor: '#052e16' }]}>
      <View style={styles.ring3} />
      <Animated.View style={[styles.readyIconWrap, { transform: [{ scale }] }]}>
        <Text style={{ fontSize: 58 }}>☕</Text>
      </Animated.View>
      <View style={styles.readyBadge}>
        <Feather name="shield" size={11} color="#4ade80" />
        <Text style={styles.readyBadgeText}>PROTECCIÓN ACTIVA</Text>
      </View>
    </View>
  );
};

// ─────────────────────────────────────────
// COMPONENTE PRINCIPAL
// ─────────────────────────────────────────

const OnboardingScreen = ({ onDone }) => {
  const handleComplete = async () => {
    await AsyncStorage.setItem('@hasSeenOnboarding', 'true');
    onDone();
  };

  const pages = [
    // ── Página 1
    {
      backgroundColor: '#052e16',
      image: <WelcomeIllustration />,
      title: 'Bienvenido a DEC',
      subtitle: 'Tecnología de inteligencia artificial para proteger tus cafetales y maximizar tu cosecha en Garzón.',
    },
    // ── Página 2
    {
      backgroundColor: '#ffffff',
      image: <DetectionIllustration />,
      title: 'Detecta sin internet en el campo',
      subtitle: 'Nuestra IA analiza las hojas directamente en tu dispositivo. Sin señal, sin demoras, sin excusas.',
    },
    // ── Página 3
    {
      backgroundColor: '#ffffff',
      image: <StatsIllustration />,
      title: 'Control total de tu cosecha',
      subtitle: 'Sincroniza los diagnósticos y accede a estadísticas por lote, fecha y tipo de enfermedad detectada.',
    },
    // ── Página 4
    {
      backgroundColor: '#052e16',
      image: <ReadyIllustration />,
      title: 'Tu café, protegido desde hoy',
      subtitle: 'Únete a los caficultores de Garzón que ya usan DEC para cuidar sus cultivos con inteligencia artificial.',
    },
  ];

  return (
    <View style={styles.container}>
      <Onboarding
        onDone={handleComplete}
        onSkip={handleComplete}
        DotComponent={Dots}
        NextButtonComponent={NextButton}
        DoneButtonComponent={DoneButton}
        SkipButtonComponent={SkipButton}
        bottomBarHeight={90}
        bottomBarBackgroundColor="transparent"
        titleStyles={styles.title}
        subTitleStyles={styles.subtitle}
        containerStyles={styles.onboardingContainer}
        pages={pages}
      />
    </View>
  );
};

// ─────────────────────────────────────────
// ESTILOS
// ─────────────────────────────────────────

const CIRCLE_SIZE = width * 0.68;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#052e16',
  },
  onboardingContainer: {
    paddingBottom: 90,
    alignItems: 'center',
  },

  // ── Ilustraciones base
  illustrationWrapper: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    overflow: 'hidden',
    position: 'relative',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.2, shadowRadius: 24 },
      android: { elevation: 12 },
    }),
  },

  // ── Pantalla 1
  ring2: {
    position: 'absolute',
    width: CIRCLE_SIZE * 0.72,
    height: CIRCLE_SIZE * 0.72,
    borderRadius: (CIRCLE_SIZE * 0.72) / 2,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderStyle: 'dashed',
  },
  ring3: {
    position: 'absolute',
    width: CIRCLE_SIZE * 0.88,
    height: CIRCLE_SIZE * 0.88,
    borderRadius: (CIRCLE_SIZE * 0.88) / 2,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    borderStyle: 'dashed',
  },
  iaBadge: {
    position: 'absolute',
    top: 24,
    right: 28,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(74,222,128,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(74,222,128,0.35)',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    zIndex: 10,
  },
  iaBadgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4ade80',
  },
  iaBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#4ade80',
    letterSpacing: 1,
  },
  mainCircle: {
    width: CIRCLE_SIZE * 0.54,
    height: CIRCLE_SIZE * 0.54,
    borderRadius: (CIRCLE_SIZE * 0.54) / 2,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoImage: {
    width: '65%',
    height: '65%',
  },
  scanLine: {
    position: 'absolute',
    bottom: 28,
    width: 100,
    height: 2,
    borderRadius: 2,
    backgroundColor: 'rgba(74,222,128,0.55)',
  },

  // ── Pantalla 2
  gridOverlay: {
    position: 'absolute',
    inset: 0,
    top: 0, left: 0, right: 0, bottom: 0,
    opacity: 0.4,
  },
  mockPhone: {
    width: 140,
    height: 190,
    backgroundColor: '#fff',
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#bbf7d0',
    overflow: 'hidden',
    ...Platform.select({
      ios: { shadowColor: '#16a34a', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 16 },
      android: { elevation: 10 },
    }),
  },
  mockPhoneHeader: {
    height: 30,
    backgroundColor: '#052e16',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mockPhoneHeaderText: {
    fontSize: 8,
    fontWeight: '900',
    color: '#4ade80',
    letterSpacing: 1,
  },
  viewfinder: {
    flex: 1,
    backgroundColor: '#f0fdf4',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  corner: {
    position: 'absolute',
    width: 18,
    height: 18,
    borderColor: '#16a34a',
    borderStyle: 'solid',
  },
  cornerTL: { top: 8, left: 8, borderTopWidth: 2, borderLeftWidth: 2 },
  cornerTR: { top: 8, right: 8, borderTopWidth: 2, borderRightWidth: 2 },
  cornerBL: { bottom: 8, left: 8, borderBottomWidth: 2, borderLeftWidth: 2 },
  cornerBR: { bottom: 8, right: 8, borderBottomWidth: 2, borderRightWidth: 2 },
  viewfinderScan: {
    position: 'absolute',
    left: 10,
    right: 10,
    height: 1.5,
    backgroundColor: 'rgba(22,163,74,0.65)',
    borderRadius: 1,
  },
  resultChip: {
    position: 'absolute',
    bottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#16a34a',
    paddingHorizontal: 11,
    paddingVertical: 5,
    borderRadius: 14,
  },
  resultChipText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 0.5,
  },
  noWifiBadge: {
    position: 'absolute',
    top: 16,
    right: 20,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // ── Pantalla 3
  dashCard: {
    width: '84%',
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#fde68a',
    overflow: 'hidden',
    ...Platform.select({
      ios: { shadowColor: '#b45309', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.12, shadowRadius: 16 },
      android: { elevation: 8 },
    }),
  },
  dashHeader: {
    backgroundColor: '#166534',
    paddingHorizontal: 14,
    paddingVertical: 9,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dashHeaderTitle: { fontSize: 9, fontWeight: '900', color: '#fff', letterSpacing: 0.8 },
  dashHeaderDate: { fontSize: 9, color: 'rgba(255,255,255,0.6)' },
  dashStats: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  dashStatItem: {
    flex: 1,
    padding: 10,
    borderRightWidth: 1,
    borderRightColor: '#f3f4f6',
  },
  dashStatNum: { fontSize: 20, fontWeight: '800', color: '#052e16' },
  dashStatUnit: { fontSize: 10, fontWeight: '500', color: '#6b7280' },
  dashStatLabel: { fontSize: 9, color: '#9ca3af', marginTop: 1 },
  dashBars: { padding: 10 },
  barTrack: {
    height: 5,
    backgroundColor: '#f3f4f6',
    borderRadius: 3,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 3,
  },

  // ── Pantalla 4
  readyIconWrap: {
    width: CIRCLE_SIZE * 0.44,
    height: CIRCLE_SIZE * 0.44,
    borderRadius: (CIRCLE_SIZE * 0.44) / 2,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  readyBadge: {
    position: 'absolute',
    bottom: 22,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(74,222,128,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(74,222,128,0.3)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  readyBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#4ade80',
    letterSpacing: 1,
  },

  // ── Navegación
  dot: {
    height: 5,
    marginHorizontal: 3,
    borderRadius: 3,
  },
  nextButton: {
    backgroundColor: 'rgba(240,253,244,0.15)',
    padding: 11,
    borderRadius: 30,
    marginRight: 20,
    borderWidth: 1,
    borderColor: 'rgba(22,163,74,0.3)',
  },
  doneButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4ade80',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    marginRight: 20,
    gap: 8,
  },
  doneButtonText: {
    color: '#052e16',
    fontWeight: '800',
    fontSize: 14,
  },
  skipButton: {
    marginLeft: 24,
  },
  skipButtonText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.45)',
    fontWeight: '600',
  },

  // ── Textos
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#ffffff',
    textAlign: 'center',
    paddingHorizontal: 24,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    lineHeight: 21,
    paddingHorizontal: 36,
    marginTop: 8,
  },
});

export default OnboardingScreen;