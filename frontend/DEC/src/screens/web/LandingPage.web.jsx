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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

// --- TOKENS DE DISEÑO ---
const C = {
  bg: '#f0fdf4',
  surface: '#ffffff',
  primary: '#059669',
  primaryLight: '#10b981',
  primaryDark: '#047857',
  accent: '#f59e0b',
  accentDark: '#d97706',
  text: '#064e3b',
  textLight: '#374151',
  muted: '#6b7280',
  white: '#ffffff',
  black: '#111827',
};

// --- COMPONENTE DE ANIMACIÓN SIN WARNINGS ---
const FadeInUp = ({ children, delay = 0, style }) => {
  const anim = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(30)).current;
  useEffect(() => {
    const useNative = Platform.OS !== 'web';
    Animated.parallel([
      Animated.timing(anim, { toValue: 1, duration: 700, delay, useNativeDriver: useNative }),
      Animated.timing(slide, { toValue: 0, duration: 700, delay, useNativeDriver: useNative }),
    ]).start();
  }, []);
  return <Animated.View style={[style, { opacity: anim, transform: [{ translateY: slide }] }]}>{children}</Animated.View>;
};

// --- CONTADOR CON ANIMACIÓN ---
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

// --- FONDO ANIMADO (GRADIENTE MÓVIL) ---
const AnimatedGradientBackground = () => {
  const animatedValue = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const useNative = Platform.OS !== 'web';
    Animated.loop(
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 10000,
        useNativeDriver: useNative,
      })
    ).start();
  }, []);
  const rotate = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });
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

// --- COMPONENTE PRINCIPAL ---
export default function LandingPage({ navigation }) {
  const { width, height } = useWindowDimensions();
  const isDesktop = width > 1024;

  // Animaciones del teléfono
  const scanBarAnim = useRef(new Animated.Value(0)).current;
  const scanPulseAnim = useRef(new Animated.Value(0)).current;
  const phoneFloatAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Para web usamos useNativeDriver: true (funciona perfecto)
    const useNative = true; // Web soporta native driver con translateY y scale

    // Barra de escaneo: se mueve de Y=0 a Y=280 (altura aproximada de la pantalla del teléfono)
    // Reiniciamos por si acaso
    scanBarAnim.setValue(0);
    Animated.loop(
      Animated.sequence([
        Animated.timing(scanBarAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: useNative,
        }),
        Animated.timing(scanBarAnim, {
          toValue: 0,
          duration: 0,
          useNativeDriver: useNative,
        }),
      ])
    ).start();

    // Pulso del anillo (opacidad y escala)
    scanPulseAnim.setValue(0);
    Animated.loop(
      Animated.sequence([
        Animated.timing(scanPulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: useNative,
        }),
        Animated.timing(scanPulseAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: useNative,
        }),
      ])
    ).start();

    // Flotación del teléfono
    phoneFloatAnim.setValue(0);
    Animated.loop(
      Animated.sequence([
        Animated.timing(phoneFloatAnim, {
          toValue: 1,
          duration: 2500,
          useNativeDriver: useNative,
        }),
        Animated.timing(phoneFloatAnim, {
          toValue: 0,
          duration: 2500,
          useNativeDriver: useNative,
        }),
      ])
    ).start();

    // Glow rings
    glowAnim.setValue(0);
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: useNative,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: useNative,
        }),
      ])
    ).start();

    return () => {
      scanBarAnim.stopAnimation();
      scanPulseAnim.stopAnimation();
      phoneFloatAnim.stopAnimation();
      glowAnim.stopAnimation();
    };
  }, []);

  const handleDownloadAPK = () => {
    Linking.openURL('http://192.168.101.210:8089/download/dec-app.apk');
  };

  const handleAdminAccess = () => {
    if (navigation && navigation.navigate) {
      navigation.navigate('LoginAdmin');
    } else {
      alert('Acceso para administradores. Demo disponible próximamente.');
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <AnimatedGradientBackground />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {/* ── HERO ── */}
        <View style={[styles.hero, { minHeight: isDesktop ? 750 : height }]}>
          <LinearGradient
            colors={['#022c22', '#064e3b', '#047857']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <View style={[styles.mainContainer, isDesktop && styles.heroRow]}>
            <View style={isDesktop ? { flex: 1.2, zIndex: 2 } : { width: '100%' }}>
              <FadeInUp delay={100}>
                <View style={styles.badge}>
                  <MaterialCommunityIcons name="robot-outline" size={14} color={C.accent} />
                  <Text style={styles.badgeText}>Proyecto DEC • IA DE ÚLTIMA GENERACIÓN</Text>
                </View>
                <Text style={[styles.heroTitle, isDesktop && { fontSize: 64, lineHeight: 76 }]}>
                  Protege tu cosecha con{' '}
                  <Text style={{ color: '#fcd34d', fontStyle: 'italic' }}>
                    Inteligencia Artificial
                  </Text>
                </Text>
                <Text style={styles.heroSub}>
                  Detecta Roya, Araña Roja y Minador en segundos con precisión superior al 92%.
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
                    <Text style={styles.heroStatText}>Precisión 92%</Text>
                  </View>
                  <View style={styles.heroStatItem}>
                    <View style={styles.statIconBg}><Feather name="zap" size={18} color={C.accent} /></View>
                    <Text style={styles.heroStatText}>Respuesta 3.5s</Text>
                  </View>
                </View>
              </FadeInUp>
            </View>

            {/* ── PHONE MOCKUP ANIMADO ── */}
            {isDesktop && (
              <View style={phoneStyles.mockupWrapper}>
                {/* Glow rings */}
                {[300, 400, 500].map((size, i) => (
                  <Animated.View
                    key={i}
                    style={[
                      phoneStyles.glowRing,
                      {
                        width: size,
                        height: size,
                        marginLeft: -size / 2,
                        marginTop: -size / 2,
                        opacity: glowAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0.3, 0.7],
                        }),
                      },
                    ]}
                  />
                ))}

                {/* Teléfono flotante */}
                <Animated.View
                  style={[
                    phoneStyles.phoneShell,
                    {
                      transform: [{
                        translateY: phoneFloatAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, -14],
                        }),
                      }],
                    },
                  ]}
                >
                  {/* Notch */}
                  <View style={phoneStyles.notch} />

                  {/* Pantalla */}
                  <View style={phoneStyles.screen}>
                    {/* Barra de escaneo animada: se mueve de arriba (0) a abajo (280px) */}
                    <Animated.View
                      style={[
                        phoneStyles.scanBar,
                        {
                          transform: [
                            {
                              translateY: scanBarAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [0, 280], // Altura fija aproximada
                              }),
                            },
                          ],
                          opacity: scanBarAnim.interpolate({
                            inputRange: [0, 0.1, 0.9, 1],
                            outputRange: [0, 1, 1, 0],
                          }),
                        },
                      ]}
                    />

                    {/* Anillo de escaneo con pulso (opacidad y escala) */}
                    <Animated.View
                      style={[
                        phoneStyles.scanRing,
                        {
                          opacity: scanPulseAnim.interpolate({
                            inputRange: [0, 0.5, 1],
                            outputRange: [0.6, 1, 0.6],
                          }),
                          transform: [
                            {
                              scale: scanPulseAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [1, 1.2],
                              }),
                            },
                          ],
                        },
                      ]}
                    >
                      <View style={phoneStyles.scanRingInner} />
                      <View style={phoneStyles.scanCore}>
                        <Text style={{ fontSize: 28 }}>🍃</Text>
                      </View>
                    </Animated.View>

                    {/* Resultado: enfermedad */}
                    <View style={phoneStyles.resultBox}>
                      <Text style={phoneStyles.resultLabel}>Resultado del análisis</Text>
                      <Text style={phoneStyles.resultValue}>Roya del Cafeto</Text>
                      <Text style={phoneStyles.resultConf}>Confianza: 94.7%</Text>
                    </View>

                    {/* Resultado: tratamiento */}
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
              <Card icon="🍂" title="Roya del Cafeto" desc="Hemileia vastatrix: manchas anaranjadas. Solución: fungicidas sistémicos." gradient={['#fef3c7', '#fffbeb']} />
              <Card icon="🕷️" title="Araña Roja" desc="Oligonychus coffeae: manchas amarillentas y telarañas. Control biológico." gradient={['#fed7aa', '#fff7ed']} />
              <Card icon="🐛" title="Minador" desc="Leucoptera coffeella: galerías sinuosas. Trampas feromonas." gradient={['#d1fae5', '#ecfdf5']} />
            </View>
          </View>
        </View>

        {/* ── CÓMO FUNCIONA ── */}
        <View style={[styles.section, { backgroundColor: '#f8fafc' }]}>
          <View style={styles.mainContainer}>
            <FadeInUp delay={100}>
              <Text style={styles.sectionTag}>SIMPLE Y PODEROSO</Text>
              <Text style={styles.sectionTitle}>Tecnología que llega al campo en 3 pasos</Text>
            </FadeInUp>
            <View style={styles.stepsRow}>
              <StepCard icon="camera"    step="01" title="Captura"   desc="Enfoca la hoja del cafeto con tu celular." />
              <StepCard icon="cpu"       step="02" title="IA Analiza" desc="Modelo YOLOv11 procesa en tiempo real." />
              <StepCard icon="clipboard" step="03" title="Solución"  desc="Diagnóstico preciso y plan de tratamiento." />
            </View>
          </View>
        </View>

        {/* ── ESTADÍSTICAS ── */}
        <View style={styles.statsContainer}>
          <LinearGradient colors={['#064e3b', '#047857', '#059669']} style={StyleSheet.absoluteFill} />
          <View style={styles.mainContainer}>
            <View style={styles.statsGrid}>
              <StatCard end={92}    suffix="%" label="Precisión"            icon="trending-up" />
              <StatCard end={18500} suffix="+" label="Imágenes entrenadas"  icon="image" />
              <StatCard end={3}     suffix="s" label="Diagnóstico"          icon="clock" />
              <StatCard end={100}   suffix="%" label="Cobertura regional"   icon="map-pin" />
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
              <BenefitCard icon="wifi-off"    title="Sin conexión" desc="Funciona offline, ideal para zonas remotas." />
              <BenefitCard icon="leaf"        title="Ecológico"    desc="Recomendaciones amigables con el entorno." />
              <BenefitCard icon="bar-chart-2" title="Historial"    desc="Monitorea la evolución de tus cultivos." />
              <BenefitCard icon="shield"      title="Alerta temprana" desc="Prevención antes de la propagación." />
            </View>
          </View>
        </View>

        {/* ── CTA ── */}
        <View style={styles.ctaSection}>
          <LinearGradient colors={['#022c22', '#064e3b', '#047857']} style={StyleSheet.absoluteFill} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} />
          <View style={styles.mainContainer}>
            <FadeInUp delay={0}>
              <Text style={styles.ctaTitle}>Descarga DEC ahora</Text>
              <Text style={styles.ctaSub}>y protege tu cultivo de café con tecnología de vanguardia.</Text>
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
                <MaterialCommunityIcons name="leaf" size={24} color={C.accent} />
                <Text style={styles.footerLogoText}>DEC • Detección en Café</Text>
              </View>
              <View style={styles.socialIcons}>
                <TouchableOpacity style={styles.socialIcon}><Feather name="facebook"  size={20} color="rgba(255,255,255,0.7)" /></TouchableOpacity>
                <TouchableOpacity style={styles.socialIcon}><Feather name="instagram" size={20} color="rgba(255,255,255,0.7)" /></TouchableOpacity>
                <TouchableOpacity style={styles.socialIcon}><Feather name="youtube"   size={20} color="rgba(255,255,255,0.7)" /></TouchableOpacity>
              </View>
            </View>
            <Text style={styles.footerText}>© {new Date().getFullYear()} Proyecto DEC - SENA Regional Huila. Tecnología al servicio del campo colombiano.</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

// ===== SUBCOMPONENTES =====

const Card = ({ icon, title, desc, gradient }) => (
  <View style={styles.card}>
    <LinearGradient colors={gradient || ['#ffffff', '#f9fafb']} style={styles.cardGradient} />
    <View style={styles.cardContent}>
      <Text style={styles.cardIcon}>{icon}</Text>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardDesc}>{desc}</Text>
    </View>
  </View>
);

const StepCard = ({ icon, step, title, desc }) => (
  <View style={styles.stepCard}>
    <View style={styles.stepNumber}><Text style={styles.stepNumberText}>{step}</Text></View>
    <View style={styles.stepIcon}><Feather name={icon} size={36} color={C.primary} /></View>
    <Text style={styles.stepTitle}>{title}</Text>
    <Text style={styles.stepDesc}>{desc}</Text>
  </View>
);

const StatCard = ({ end, suffix, label, icon }) => (
  <View style={styles.statCard}>
    <Feather name={icon} size={32} color="#fff" />
    <CountUp end={end} suffix={suffix} />
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const BenefitCard = ({ icon, title, desc }) => {
  const IconComponent = icon === 'leaf' ? MaterialCommunityIcons : Feather;
  return (
    <View style={styles.benefitCard}>
      <View style={styles.benefitIcon}>
        <IconComponent name={icon} size={32} color={C.primary} />
      </View>
      <Text style={styles.benefitTitle}>{title}</Text>
      <Text style={styles.benefitDesc}>{desc}</Text>
    </View>
  );
};

// ===== ESTILOS DEL PHONE MOCKUP ANIMADO =====

const phoneStyles = StyleSheet.create({
  mockupWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    minHeight: 500,
  },
  glowRing: {
    position: 'absolute',
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: 'rgba(34,197,94,0.08)',
    top: '50%',
    left: '50%',
  },
  phoneShell: {
    width: 220,
    backgroundColor: '#0f1f12',
    borderRadius: 40,
    borderWidth: 2,
    borderColor: 'rgba(52,168,83,0.4)',
    padding: 16,
    ...Platform.select({
      web: { boxShadow: '0 40px 80px rgba(0,0,0,0.6)' },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 20 },
        shadowOpacity: 0.6,
        shadowRadius: 40,
        elevation: 20,
      },
    }),
  },
  notch: {
    width: 70,
    height: 20,
    backgroundColor: '#000',
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    alignSelf: 'center',
    marginBottom: 12,
  },
  screen: {
    backgroundColor: '#071510',
    borderRadius: 22,
    overflow: 'hidden',
    aspectRatio: 9 / 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    padding: 16,
    position: 'relative',
    height: 400, // Altura fija para que la barra se mueva bien
  },
  scanBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2,
    ...Platform.select({
      web: { background: 'linear-gradient(90deg, transparent, rgba(116,250,158,0.8), transparent)' },
      default: { backgroundColor: 'rgba(116,250,158,0.8)' },
    }),
  },
  scanRing: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: 'rgba(34,197,94,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  scanRingInner: {
    position: 'absolute',
    top: 8,
    bottom: 8,
    left: 8,
    right: 8,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: 'rgba(116,250,158,0.3)',
  },
  scanCore: {
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: 'rgba(34,197,94,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultBox: {
    width: '100%',
    backgroundColor: 'rgba(22,163,74,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(22,163,74,0.3)',
    borderRadius: 10,
    padding: 8,
  },
  resultBoxAlt: {
    backgroundColor: 'rgba(34,197,94,0.08)',
    borderColor: 'rgba(34,197,94,0.2)',
  },
  resultLabel: {
    fontSize: 8,
    color: 'rgba(255,255,255,0.4)',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  resultValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#74fa9e',
    marginTop: 2,
  },
  resultConf: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.4)',
  },
});

// ===== ESTILOS GENERALES =====

const styles = StyleSheet.create({
  root: { minHeight: '100vh', height: '100vh', width: '100%', backgroundColor: C.bg, position: 'relative' },
  scrollView: { width: '100%', height: '100%', maxHeight: '100vh', overflowY: 'auto' },
  scrollContainer: { flexGrow: 1, width: '100%' },
  mainContainer: { width: '100%', maxWidth: 1280, alignSelf: 'center', paddingHorizontal: 24 },

  hero: { justifyContent: 'center', paddingVertical: 80, position: 'relative', overflow: 'hidden' },
  heroRow: { flexDirection: 'row', alignItems: 'center', gap: 60 },
  heroTitle: { fontSize: 48, fontWeight: '800', color: '#fff', marginBottom: 24, lineHeight: 56 },
  heroSub: { fontSize: 18, color: 'rgba(255,255,255,0.9)', lineHeight: 28, marginBottom: 36, maxWidth: 560 },
  badge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.12)', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 40, alignSelf: 'flex-start', marginBottom: 28, gap: 8 },
  badgeText: { color: '#fcd34d', fontSize: 12, fontWeight: '700' },
  btnRow: { flexDirection: 'row', alignItems: 'center', gap: 20, flexWrap: 'wrap' },
  primaryBtn: { borderRadius: 60, overflow: 'hidden' },
  btnGradient: { flexDirection: 'row', paddingVertical: 14, paddingHorizontal: 32, alignItems: 'center', gap: 12 },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  adminLink: { paddingVertical: 12, paddingHorizontal: 20, borderRadius: 60, borderWidth: 1, borderColor: 'rgba(255,255,255,0.4)' },
  adminLinkText: { color: 'rgba(255,255,255,0.85)', fontWeight: '500' },
  heroStats: { flexDirection: 'row', gap: 28, marginTop: 42, flexWrap: 'wrap' },
  heroStatItem: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  statIconBg: { backgroundColor: 'rgba(245,158,11,0.2)', padding: 6, borderRadius: 30 },
  heroStatText: { color: '#fff', fontWeight: '600' },

  section: { paddingVertical: 100 },
  sectionTag: { color: C.primary, fontWeight: '700', letterSpacing: 2, marginBottom: 16, fontSize: 14 },
  sectionTitle: { fontSize: 40, fontWeight: '800', color: C.text, marginBottom: 56, lineHeight: 48 },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 30, justifyContent: 'center' },
  card: { borderRadius: 32, overflow: 'hidden', width: Platform.OS === 'web' ? 340 : '100%', ...Platform.select({ web: { boxShadow: '0 20px 35px -12px rgba(0,0,0,0.15)' }, default: { shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.15, shadowRadius: 20, elevation: 10 } }) },
  cardGradient: { ...StyleSheet.absoluteFillObject },
  cardContent: { padding: 28, backgroundColor: 'rgba(255,255,255,0.85)' },
  cardIcon: { fontSize: 48, marginBottom: 16 },
  cardTitle: { fontSize: 24, fontWeight: '800', color: C.text, marginBottom: 12 },
  cardDesc: { color: C.textLight, lineHeight: 22 },

  stepsRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 32 },
  stepCard: { backgroundColor: '#fff', borderRadius: 36, padding: 28, width: 260, alignItems: 'center', ...Platform.select({ web: { boxShadow: '0 15px 30px rgba(0,0,0,0.05)' }, default: { shadowColor: '#000', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.05, shadowRadius: 15, elevation: 5 } }) },
  stepNumber: { position: 'absolute', top: 16, left: 20, backgroundColor: C.accent, width: 36, height: 36, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  stepNumberText: { color: '#fff', fontWeight: '800' },
  stepIcon: { backgroundColor: '#ecfdf5', padding: 20, borderRadius: 60, marginBottom: 20 },
  stepTitle: { fontSize: 22, fontWeight: '700', marginBottom: 12, color: C.text },
  stepDesc: { textAlign: 'center', color: C.muted },

  statsContainer: { paddingVertical: 80, position: 'relative' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 24 },
  statCard: { flex: 1, minWidth: 150, alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 32, padding: 24 },
  statNumber: { fontSize: 44, fontWeight: '800', color: '#fff', marginTop: 16 },
  statLabel: { color: 'rgba(255,255,255,0.85)', marginTop: 8, fontSize: 14, fontWeight: '500' },

  benefitsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 28, justifyContent: 'center' },
  benefitCard: { backgroundColor: '#fff', borderRadius: 32, padding: 28, width: 270, alignItems: 'center', ...Platform.select({ web: { boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)' }, default: { shadowColor: '#000', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 4 } }) },
  benefitIcon: { backgroundColor: '#ecfdf5', padding: 18, borderRadius: 60, marginBottom: 20 },
  benefitTitle: { fontSize: 20, fontWeight: '700', marginVertical: 16, color: C.text },
  benefitDesc: { textAlign: 'center', color: C.muted },

  ctaSection: { paddingVertical: 100, alignItems: 'center', position: 'relative' },
  ctaTitle: { fontSize: 44, fontWeight: '800', color: '#fff', textAlign: 'center', marginBottom: 16, letterSpacing: -1 },
  ctaSub: { fontSize: 18, color: 'rgba(255,255,255,0.9)', textAlign: 'center', marginBottom: 40, maxWidth: 640, lineHeight: 28 },
  ctaButton: { backgroundColor: C.accent, flexDirection: 'row', paddingVertical: 18, paddingHorizontal: 48, borderRadius: 60, alignSelf: 'center', gap: 12 },
  ctaButtonText: { color: '#fff', fontWeight: '700', fontSize: 18 },

  footer: { backgroundColor: '#022c22', paddingVertical: 48 },
  footerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: 32, flexWrap: 'wrap' },
  footerLogo: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  footerLogoText: { color: '#fff', fontWeight: '700', fontSize: 18 },
  socialIcons: { flexDirection: 'row', gap: 16 },
  socialIcon: { backgroundColor: 'rgba(255,255,255,0.1)', padding: 10, borderRadius: 40 },
  footerText: { color: 'rgba(255,255,255,0.4)', fontSize: 13, textAlign: 'center' },
});