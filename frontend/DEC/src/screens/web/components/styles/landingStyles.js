import { StyleSheet, Platform } from "react-native";

export const C = {
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

export const landingStyle = StyleSheet.create({
  root: { minHeight: '100vh', height: '100vh', width: '100%', backgroundColor: C.bg, position: 'relative' },
  scrollView: { width: '100%', height: '100%', maxHeight: '100vh', overflowY: 'auto' },
  scrollContainer: { flexGrow: 1, width: '100%' },
  mainContainer: { width: '100%', maxWidth: 1280, alignSelf: 'center', paddingHorizontal: 24 },

  // Hero
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

  // Secciones
  section: { paddingVertical: 100 },
  sectionTag: { color: C.primary, fontWeight: '700', letterSpacing: 2, marginBottom: 16, fontSize: 14 },
  sectionTitle: { fontSize: 40, fontWeight: '800', color: C.text, marginBottom: 56, lineHeight: 48 },

  // Cards enfermedades
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 24, justifyContent: 'center' },
  card: {
    backgroundColor: '#ffffff', borderRadius: 20, padding: 28,
    overflow: 'hidden', position: 'relative',alignItems: 'center',
    ...Platform.select({
      web: { boxShadow: '0 4px 12px rgba(22,163,74,0.06)' },
      default: { shadowColor: '#16a34a', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 4 },
    }),
  },
  cardIconBox: { width: 56, height: 56, borderRadius: 16, backgroundColor: '#f0faf3', borderWidth: 1.5, borderColor: '#dceee2', alignItems: 'center', justifyContent: 'center', marginBottom: 18 },
  cardIcon: { fontSize: 26 },
  cardTitle: { fontSize: 20, fontWeight: '700', color: '#0f2d1a', marginBottom: 6, letterSpacing: -0.2 },
  cardLatin: { fontSize: 12, color: '#8aad96', fontStyle: 'italic', marginBottom: 12 },
  cardDesc:  { fontSize: 14, color: '#5a8a6a', lineHeight: 22, marginBottom: 18 },
  cardTag:   { alignSelf: 'flex-start', paddingVertical: 5, paddingHorizontal: 12, borderRadius: 100, borderWidth: 1 },
  cardTagText: { fontSize: 11, fontWeight: '700' },

  // Steps
  stepsRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 32 },
  stepCard: {
    backgroundColor: '#fff', borderRadius: 36, padding: 28,
    width: 260, alignItems: 'center',
    ...Platform.select({
      web: { boxShadow: '0 15px 30px rgba(0,0,0,0.05)' },
      default: { shadowColor: '#000', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.05, shadowRadius: 15, elevation: 5 },
    }),
  },
  stepNumber: { position: 'absolute', top: 16, left: 20, backgroundColor: C.accent, width: 36, height: 36, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  stepNumberText: { color: '#fff', fontWeight: '800' },
  stepIcon: { padding: 20, borderRadius: 60, marginBottom: 20 },
  stepTitle: { fontSize: 22, fontWeight: '700', marginBottom: 12, color: C.text },
  stepDesc:  { textAlign: 'center', color: C.muted },

  // Stats
  statsContainer: { paddingVertical: 80, position: 'relative' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 24 },
  statCard: { flex: 1, minWidth: 150, alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 32, padding: 24 },
  statNumber: { fontSize: 44, fontWeight: '800', color: '#fff', marginTop: 16 },
  statLabel:  { color: 'rgba(255,255,255,0.85)', marginTop: 8, fontSize: 14, fontWeight: '500' },

  // Benefits
  benefitsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 28, justifyContent: 'center' },
  benefitCard: {
    backgroundColor: '#fff', borderRadius: 32, padding: 28, width: 270, alignItems: 'center',
    ...Platform.select({
      web: { boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)' },
      default: { shadowColor: '#000', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 4 },
    }),
  },
  benefitIcon:  { padding: 18, borderRadius: 60, marginBottom: 20 },
  benefitTitle: { fontSize: 20, fontWeight: '700', marginVertical: 16, color: C.text },
  benefitDesc:  { textAlign: 'center', color: C.muted },

  // CTA
  ctaSection: { paddingVertical: 100, alignItems: 'center', position: 'relative' },
  ctaTitle: { fontSize: 44, fontWeight: '800', color: '#fff', textAlign: 'center', marginBottom: 16, letterSpacing: -1 },
  ctaSub:   { fontSize: 18, color: 'rgba(255,255,255,0.9)', textAlign: 'center', marginBottom: 40, lineHeight: 28 },
  ctaButton: { backgroundColor: C.accent, flexDirection: 'row', paddingVertical: 18, paddingHorizontal: 48, borderRadius: 60, alignSelf: 'center', gap: 12 },
  ctaButtonText: { color: '#fff', fontWeight: '700', fontSize: 18 },

  // Footer
  footer: { backgroundColor: '#022c22', paddingVertical: 48 },
  footerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: 32, flexWrap: 'wrap' },
  footerLogo: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  footerLogoText: { color: '#fff', fontWeight: '700', fontSize: 18 },
  socialIcons: { flexDirection: 'row', gap: 16 },
  socialIcon:  { backgroundColor: 'rgba(255,255,255,0.1)', padding: 10, borderRadius: 40 },
  footerText:  { color: 'rgba(255,255,255,0.4)', fontSize: 13, textAlign: 'center' },
});