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
import { Feather } from '@expo/vector-icons';
import ParticlesBackground from './Layout/ParticlesBackground.native';

const { width } = Dimensions.get('window');

const DARK_PAGES = [0, 3];
const isDark = (index) => DARK_PAGES.includes(index);

// ─────────────────────────────────────────
// COMPONENTES DE NAVEGACIÓN (corregidos para que se vean en fondos claros)
// ─────────────────────────────────────────
const Dots = ({ selected, pageIndex }) => {
  const dark = isDark(pageIndex);
  return (
    <View
      style={[
        styles.dot,
        {
          width: selected ? 22 : 6,
          backgroundColor: selected
            ? (dark ? '#4ade80' : '#16a34a')
            : (dark ? 'rgba(255,255,255,0.25)' : 'rgba(5,46,22,0.2)'),
        },
      ]}
    />
  );
};

const NextButton = ({ pageIndex, ...props }) => {
  const dark = isDark(pageIndex);
  return (
    <TouchableOpacity
      style={[
        styles.nextButton,
        {
          // En fondos claros: fondo negro, flecha blanca
          // En fondos oscuros: fondo verde translúcido, flecha verde
          backgroundColor: dark ? 'rgba(74,222,128,0.15)' : '#1a1a1a',
          borderColor: dark ? 'rgba(74,222,128,0.35)' : 'transparent',
          borderWidth: dark ? 1 : 0,
          shadowColor: dark ? 'transparent' : '#000',
          shadowOpacity: dark ? 0 : 0.2,
          elevation: dark ? 0 : 4,
        },
      ]}
      {...props}
      activeOpacity={0.8}
    >
      <Feather
        name="chevron-right"
        size={22}
        color={dark ? '#4ade80' : '#ffffff'}
      />
    </TouchableOpacity>
  );
};

const DoneButton = ({ pageIndex, ...props }) => {
  const dark = isDark(pageIndex);
  return (
    <TouchableOpacity
      style={[
        styles.doneButton,
        {
          backgroundColor: dark ? '#4ade80' : '#1a1a1a',
        },
      ]}
      {...props}
      activeOpacity={0.85}
    >
      <Text style={[styles.doneButtonText, { color: dark ? '#052e16' : '#ffffff' }]}>
        Comenzar ahora
      </Text>
      <Feather name="arrow-right" size={16} color={dark ? '#052e16' : '#ffffff'} />
    </TouchableOpacity>
  );
};

const SkipButton = ({ ...props }) => {
  return (
    <TouchableOpacity
      style={{
        marginLeft: 24,
        backgroundColor: '#e5e5e5',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
      }}
      {...props}
    >
      <Text style={{ color: '#000000', fontSize: 14, fontWeight: '600' }}>Saltar</Text>
    </TouchableOpacity>
  );
};

// ─────────────────────────────────────────
// PANTALLA 1 — BIENVENIDA (círculo blanco)
// ─────────────────────────────────────────
const ScanLine = () => {
  const anim = React.useRef(new Animated.Value(0)).current;
  React.useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration: 1800, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0, duration: 0, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [anim]);
  const translateX = anim.interpolate({ inputRange: [0, 1], outputRange: [-width * 0.35, width * 0.35] });
  return <Animated.View style={[styles.scanLine, { transform: [{ translateX }] }]} />;
};

const WelcomeIllustration = () => {
  const pulse = React.useRef(new Animated.Value(1)).current;
  React.useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.08, duration: 900, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 900, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  return (
    <View style={[styles.illustrationWrapper, { backgroundColor: '#052e16', overflow: 'visible' }]}>
      <View style={styles.ring3} />
      <View style={styles.ring2} />
      <View style={styles.iaBadge}>
        <Animated.View style={[styles.iaBadgeDot, { transform: [{ scale: pulse }] }]} />
        <Text style={styles.iaBadgeText}>IA ACTIVA</Text>
      </View>
      <View style={styles.mainCircle}>
        <Image
          source={require('../../assets/image/logo.png')} // Ajusta la ruta
          style={styles.logoImage}
          resizeMode="contain"
        />
      </View>
      <ScanLine />
    </View>
  );
};

// ─────────────────────────────────────────
// PANTALLA 2 — DETECCIÓN SIN INTERNET
// ─────────────────────────────────────────
const DetectionIllustration = () => {
  const scanAnim = React.useRef(new Animated.Value(0)).current;
  React.useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(scanAnim, { toValue: 1, duration: 2200, useNativeDriver: true }),
        Animated.timing(scanAnim, { toValue: 0, duration: 0, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [scanAnim]);
  const translateY = scanAnim.interpolate({ inputRange: [0, 1], outputRange: [-60, 60] });

  return (
    <View style={[styles.illustrationWrapper, { backgroundColor: '#f0fdf4' }]}>
      <View style={styles.mockPhone}>
        <View style={styles.mockPhoneHeader}>
          <Text style={styles.mockPhoneHeaderText}>DEC · ESCÁNER</Text>
        </View>
        <View style={styles.viewfinder}>
          <View style={[styles.corner, styles.cornerTL]} />
          <View style={[styles.corner, styles.cornerTR]} />
          <View style={[styles.corner, styles.cornerBL]} />
          <View style={[styles.corner, styles.cornerBR]} />
          <Text style={{ fontSize: 44 }}>🍃</Text>
          <Animated.View style={[styles.viewfinderScan, { transform: [{ translateY }] }]} />
        </View>
      </View>
      <View style={styles.resultChip}>
        <Feather name="check-circle" size={11} color="#fff" />
        <Text style={styles.resultChipText}>ROYA DETECTADA · 87%</Text>
      </View>
      <View style={styles.noWifiBadge}>
        <Feather name="wifi-off" size={14} color="#d97706" />
      </View>
    </View>
  );
};

// ─────────────────────────────────────────
// PANTALLA 3 — CONTROL DE COSECHA
// ─────────────────────────────────────────
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

const StatsIllustration = () => (
  <View style={styles.statsWrapper}>
    <View style={styles.dashCard}>
      <View style={styles.dashHeader}>
        <Text style={styles.dashHeaderTitle}>LOTE · CAFÉ PREMIUM</Text>
        <Text style={styles.dashHeaderDate}>Abr 2025</Text>
      </View>
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
      <View style={styles.dashBars}>
        <BarRow label="Roya" pct={0.15} color="#ef4444" display="3.8%" />
        <BarRow label="Ojo de Gallo" pct={0.08} color="#f59e0b" display="1.4%" />
        <BarRow label="Sin enfermedad" pct={0.85} color="#16a34a" display="94%" />
      </View>
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
  const [pageIndex, setPageIndex] = React.useState(0);

  const handleComplete = async () => {
    try {
      await AsyncStorage.setItem('@hasSeenOnboarding', 'true');
      onDone();
    } catch (error) {
      console.error('Error guardando onboarding', error);
      onDone();
    }
  };

  return (
    <View style={styles.container}>
      {/* <ParticlesBackground /> */}
      <Onboarding
        onDone={handleComplete}
        onSkip={handleComplete}
        onPageChange={(index) => setPageIndex(index)}
        DotComponent={(props) => <Dots {...props} pageIndex={pageIndex} />}
        NextButtonComponent={(props) => <NextButton {...props} pageIndex={pageIndex} />}
        DoneButtonComponent={(props) => <DoneButton {...props} pageIndex={pageIndex} />}
        SkipButtonComponent={(props) => <SkipButton {...props} pageIndex={pageIndex} />}
        bottomBarHeight={70}
        bottomBarBackgroundColor="transparent"
        titleStyles={pageIndex === 0 || pageIndex === 3 ? styles.title : styles.titleDark}
        subTitleStyles={pageIndex === 0 || pageIndex === 3 ? styles.subtitle : styles.subtitleDark}
        containerStyles={styles.onboardingContainer}
        pages={[
          {
            backgroundColor: '#052e16',
            image: <WelcomeIllustration />,
            title: 'Bienvenido a DEC',
            subtitle: 'Tecnología de inteligencia artificial para proteger tus cafetales y maximizar tu cosecha en Garzón.',
          },
          {
            backgroundColor: '#ffffff',
            image: <DetectionIllustration />,
            title: <Text style={styles.titleDark}>Detecta sin internet en el campo</Text>,
            subtitle: <Text style={styles.subtitleDark}>Nuestra IA analiza las hojas directamente en tu dispositivo. Sin señal, sin demoras, sin excusas.</Text>,
          },
          {
            backgroundColor: '#ffffff',
            image: <StatsIllustration />,
            title: <Text style={styles.titleDark}>Control total de tu cosecha</Text>,
            subtitle: <Text style={styles.subtitleDark}>Sincroniza los diagnósticos y accede a estadísticas por lote, fecha y tipo de enfermedad detectada.</Text>,
          },
          {
            backgroundColor: '#052e16',
            image: <ReadyIllustration />,
            title: 'Tu café, protegido desde hoy',
            subtitle: 'Únete a los caficultores de Garzón que ya usan DEC para cuidar sus cultivos con inteligencia artificial.',
          },
        ]}
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
    zIndex: 2,
  },
  onboardingContainer: {
    paddingBottom: 90,
    alignItems: 'center',
  },
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
  statsWrapper: {
    width: CIRCLE_SIZE,
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
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
    top: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#000000aa',
    borderWidth: 1,
    borderColor: '#ffffff',
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
    fontSize: 10,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 1,
  },
  mainCircle: {
    width: CIRCLE_SIZE * 0.58,
    height: CIRCLE_SIZE * 0.58,
    borderRadius: (CIRCLE_SIZE * 0.58) / 2,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
      android: { elevation: 3 },
    }),
  },
  logoImage: {
    width: '70%',
    height: '70%',
  },
  scanLine: {
    position: 'absolute',
    bottom: 28,
    width: 100,
    height: 2,
    borderRadius: 2,
    backgroundColor: 'rgba(74,222,128,0.55)',
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
  dashCard: {
    width: '100%',
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
  dot: {
    height: 5,
    marginHorizontal: 3,
    borderRadius: 3,
  },
  nextButton: {
    padding: 11,
    borderRadius: 30,
    marginRight: 20,
  },
  doneButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4ade80',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 25,
    marginRight: 20,
    gap: 6,
  },
  doneButtonText: {
    fontWeight: '800',
    fontSize: 12,
  },
  skipButton: {
    marginLeft: 24,
  },
  skipButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
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
  titleDark: {
    fontSize: 26,
    fontWeight: '800',
    color: '#052e16',
    textAlign: 'center',
    paddingHorizontal: 24,
    letterSpacing: -0.3,
  },
  subtitleDark: {
    fontSize: 14,
    color: '#4b5563',
    textAlign: 'center',
    lineHeight: 21,
    paddingHorizontal: 36,
    marginTop: 8,
  },
});

export default OnboardingScreen;