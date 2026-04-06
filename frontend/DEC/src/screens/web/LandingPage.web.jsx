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
  bg: '#f4faf5',
  surface: '#ffffff',
  p: '#16a34a',
  pl: '#22c55e',
  pd: '#15803d',
  pxd: '#064e3b',
  text: '#0f2d1a',
  mid: '#2d6a4f',
  soft: '#5a8a6a',
  muted: '#8aad96',
  lime: '#74fa9e',
  hero1: '#0a2318',
  hero2: '#0d3320',
  hero3: '#1a5c38',
};

// --- COMPONENTES DE APOYO ---
const FadeInView = ({ children, delay = 0, style }) => {
  const anim = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(20)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(anim, { toValue: 1, duration: 800, delay, useNativeDriver: Platform.OS !== 'web', }),
      Animated.timing(slide, { toValue: 0, duration: 800, delay, useNativeDriver: Platform.OS !== 'web', }),
    ]).start();
  }, []);
  return <Animated.View style={[style, { opacity: anim, transform: [{ translateY: slide }] }]}>{children}</Animated.View>;
};

// --- PANTALLA PRINCIPAL ---
export default function LandingPage({ navigation }) {
  const { width, height } = useWindowDimensions();
  const isDesktop = width > 1024;
  const isTablet = width > 768;

  const handleDownloadAPK = () => {
    Linking.openURL('http://TU_IP:8089/download/dec-app.apk');
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />
      
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={true} 
        contentContainerStyle={styles.scrollContainer}
      >
        
        {/* HERO SECTION */}
        <View style={[styles.hero, { minHeight: isDesktop ? 700 : height }]}>
          <LinearGradient colors={[C.hero1, C.hero2, C.hero3]} style={StyleSheet.absoluteFill} />
          
          <View style={[styles.mainContainer, isDesktop && styles.heroRow]}>
            <View style={isDesktop ? { flex: 1.2 } : { width: '100%' }}>
              <FadeInView delay={200}>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>SENA HUILA • GARZÓN</Text>
                </View>
                <Text style={[styles.heroTitle, isDesktop && { fontSize: 60, lineHeight: 70 }]}>
                  Protege tu cosecha con{"\n"}
                  <Text style={{ color: C.lime, fontStyle: 'italic' }}>Inteligencia Artificial</Text>
                </Text>
                <Text style={styles.heroSub}>
                  Detecta Roya, Araña Roja y Minador en segundos. Una herramienta diseñada para el caficultor moderno.
                </Text>
                
                <View style={styles.btnRow}>
                  <TouchableOpacity style={styles.primaryBtn} onPress={handleDownloadAPK}>
                    <Feather name="download" size={20} color="#fff" />
                    <Text style={styles.btnText}>Descargar APK</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.adminLink} onPress={() => navigation.navigate('AdminDashboard')}>
                    <Text style={styles.adminLinkText}>Acceso Admin</Text>
                  </TouchableOpacity>
                </View>
              </FadeInView>
            </View>

            {isDesktop && (
              <View style={styles.heroImageSide}>
                {/* Aquí iría tu ScanAnimation o una imagen representativa */}
                <View style={styles.webMockup}>
                    <MaterialCommunityIcons name="cellphone-marker" size={120} color={C.lime} />
                    <Text style={{color: '#fff', marginTop: 20}}>Sistema DEC v1.0</Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* SECCIÓN ENFERMEDADES (GRID RESPONSIVO) */}
        <View style={styles.section}>
          <View style={styles.mainContainer}>
            <Text style={styles.sectionTag}>TECNOLOGÍA YOLOv11</Text>
            <Text style={styles.sectionTitle}>Enfermedades Identificadas</Text>
            
            <View style={styles.grid}>
              <Card icon="🍂" title="Roya del Cafeto" desc="Análisis foliar instantáneo para detectar Hemileia vastatrix." />
              <Card icon="🕷️" title="Araña Roja" desc="Detección de focos de ácaros antes de la defoliación." />
              <Card icon="🐛" title="Minador" desc="Identificación de galerías larvarias en tiempo real." />
            </View>
          </View>
        </View>

        {/* FOOTER */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>© 2026 Proyecto DEC</Text>
        </View>

      </ScrollView>
    </View>
  );
}

// --- SUB-COMPONENTES ---
const Card = ({ icon, title, desc }) => (
  <View style={styles.card}>
    <Text style={{ fontSize: 40, marginBottom: 15 }}>{icon}</Text>
    <Text style={styles.cardTitle}>{title}</Text>
    <Text style={styles.cardDesc}>{desc}</Text>
  </View>
);

// --- ESTILOS ---
const styles = StyleSheet.create({
  root: { minHeight: '100vh', height: '100vh', width: '100%', backgroundColor: C.bg },
  scrollView: { width: '100%', height: '100%', maxHeight: '100vh', overflowY: 'auto' },
  scrollContainer: { flexGrow: 1, width: '100%' },
  
  mainContainer: {
    width: '100%',
    maxWidth: 1200,
    alignSelf: 'center',
    paddingHorizontal: 24,
  },

  // HERO
  hero: {
    justifyContent: 'center',
    paddingVertical: 60,
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 40,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 20,
  },
  heroSub: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.7)',
    lineHeight: 28,
    marginBottom: 40,
    maxWidth: 500,
  },
  badge: {
    backgroundColor: 'rgba(116,250,158,0.15)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: C.lime,
  },
  badgeText: { color: C.lime, fontSize: 12, fontWeight: '700' },
  
  btnRow: { flexDirection: 'row', alignItems: 'center', gap: 20 },
  primaryBtn: {
    backgroundColor: C.p,
    flexDirection: 'row',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
    gap: 10,
  },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  adminLink: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  adminLinkText: { color: 'rgba(255,255,255,0.6)', textDecorationLine: 'underline' },

  heroImageSide: {
    flex: 1,
    alignItems: 'flex-end',
  },
  webMockup: {
    width: 300,
    height: 500,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 40,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // SECCIONES
  section: { paddingVertical: 80 },
  sectionTag: { color: C.p, fontWeight: '700', letterSpacing: 2, marginBottom: 10 },
  sectionTitle: { fontSize: 32, fontWeight: '800', color: C.text, marginBottom: 50 },
  
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 20,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: '#fff',
    padding: 30,
    borderRadius: 24,
    width: Platform.OS === 'web' ? 350 : '100%',
    ...Platform.select({
      web: {
        boxShadow: '0px 10px 20px rgba(0,0,0,0.05)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.05,
        shadowRadius: 20,
        elevation: 5,
      }
    }),
  },
  cardTitle: { fontSize: 20, fontWeight: '700', color: C.text, marginBottom: 10 },
  cardDesc: { color: C.soft, lineHeight: 22 },

  footer: {
    padding: 40,
    backgroundColor: C.hero1,
    alignItems: 'center',
  },
  footerText: { color: 'rgba(255,255,255,0.4)', fontSize: 12, textAlign: 'center' },
});