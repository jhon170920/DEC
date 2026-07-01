import { StyleSheet, Platform } from "react-native";

// ── Tokens de color (alineados con landing page y app) ────────
export const C = {
  // Verdes (hereda del landing)
  bg:          '#f0fdf4',
  surface:     '#ffffff',
  primary:     '#059669',
  primaryDark: '#047857',
  deepest:     '#022c22',
  mid:         '#2d6a4f',
  text:        '#0f2d1a',
  textLight:   '#374151',
  // Acento ámbar (igual que el landing)
  amber:       '#f59e0b',
  amberDark:   '#d97706',
  // Utilidades
  muted:       '#6b7280',
  placeholder: 'rgba(15,45,26,0.35)',
  border:      '#dceee2',
  inputBg:     '#f7fcf8',
  danger:      '#dc2626',
};

export const LoginAdminStyles = StyleSheet.create({

  // ── Layout raíz ─────────────────────────────────────────────
  root: {
    flex: 1,
    minHeight: '100vh',
    backgroundColor: C.bg,
  },

  // ── Split container (desktop) ────────────────────────────────
  splitContainer: {
    flex: 1,
    flexDirection: 'row',
    minHeight: '100vh',
  },

  // ── Panel izquierdo ─────────────────────────────────────────
  leftPanel: {
    width: '42%',
    minHeight: '100vh',
    paddingHorizontal: 48,
    paddingVertical: 56,
    justifyContent: 'space-between',
    overflow: 'hidden',
    position: 'relative',
  },

  // Círculos decorativos de fondo
  decorCircleLg: {
    position: 'absolute',
    width: 340,
    height: 340,
    borderRadius: 170,
    backgroundColor: 'rgba(16,185,129,0.07)',
    top: -80,
    right: -100,
  },
  decorCircleSm: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(245,158,11,0.06)',
    bottom: 80,
    left: -50,
  },

  // Sección de marca
  brandSection: {
    flex: 1,
    justifyContent: 'center',
    paddingTop: 20,
  },
  brandLeafRing: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  brandName: {
    fontSize: 52,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: -1,
    lineHeight: 56,
    marginBottom: 6,
  },
  brandFull: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.7)',
    lineHeight: 22,
    marginBottom: 28,
    fontWeight: '500',
  },

  // Línea ámbar — firma visual
  amberAccentLine: {
    width: 48,
    height: 3,
    borderRadius: 2,
    backgroundColor: C.amber,
    marginBottom: 20,
  },

  brandTagline: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    lineHeight: 22,
    fontStyle: 'italic',
  },

  // Stats
  statsBlock: {
    gap: 14,
    marginBottom: 40,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  statIconBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: 'rgba(245,158,11,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
    width: 44,
  },
  statLabel: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
    flex: 1,
  },

  // Footer panel izquierdo
  leftFooter: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.35)',
    letterSpacing: 0.4,
    fontWeight: '500',
  },

  // ── Panel derecho ────────────────────────────────────────────
  rightPanel: {
    flex: 1,
    backgroundColor: C.surface,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 48,
    minHeight: '100vh',
  },

  // ── Wrapper del formulario ───────────────────────────────────
  formWrapper: {
    width: '100%',
    maxWidth: 400,
  },
  formWrapperDesktop: {
    maxWidth: 380,
  },
  formWrapperMobile: {
    maxWidth: '100%',
  },

  // Badge "Acceso restringido"
  adminBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 40,
    paddingVertical: 5,
    paddingHorizontal: 12,
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
  badgeDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: C.primary,
  },
  adminBadgeText: {
    fontSize: 12,
    color: C.mid,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  // Título y subtítulo
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: C.text,
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  titleMobile: {
    fontSize: 26,
  },
  subtitle: {
    fontSize: 14,
    color: C.muted,
    marginBottom: 32,
    lineHeight: 21,
  },
  subtitleMobile: {
    fontSize: 13,
    marginBottom: 24,
  },

  // ── Campos de formulario ─────────────────────────────────────
  fieldGroup: {
    marginBottom: 18,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: C.mid,
    letterSpacing: 0.5,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.inputBg,
    borderWidth: 1.5,
    borderColor: C.border,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 52,
    // Borde izquierdo acento (firma del diseño)
    borderLeftWidth: 3,
    borderLeftColor: C.border,
    ...Platform.select({
      web: { transition: 'border-color 0.2s, box-shadow 0.2s' },
    }),
  },
  inputWrapperFocused: {
    borderColor: C.primary,
    borderLeftColor: C.amber,
    backgroundColor: '#fff',
    ...Platform.select({
      web: { boxShadow: '0 0 0 3px rgba(5,150,105,0.08)' },
    }),
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: C.text,
    height: '100%',
    ...Platform.select({
      web: { outlineStyle: 'none' },
    }),
  },

  // ── Botón submit ─────────────────────────────────────────────
  button: {
    borderRadius: 14,
    overflow: 'hidden',
    marginTop: 10,
    marginBottom: 18,
    ...Platform.select({
      web: { boxShadow: '0 4px 14px rgba(5,150,105,0.3)' },
      default: {
        shadowColor: '#059669',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 6,
      },
    }),
  },
  buttonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },

  // ── Link de volver ───────────────────────────────────────────
  backLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 4,
  },
  backLinkText: {
    color: C.primary,
    fontWeight: '600',
    fontSize: 14,
  },

  // ── Mobile ───────────────────────────────────────────────────
  mobileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 56 : 32,
    paddingBottom: 24,
  },
  mobileHeaderTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -0.3,
  },
  mobileFormContainer: {
    flex: 1,
    backgroundColor: C.surface,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 24,
    alignItems: 'center',
  },

  // ── Modal ────────────────────────────────────────────────────
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalContainer: {
    width: Platform.OS === 'web' ? 360 : '100%',
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    ...Platform.select({
      web: { boxShadow: '0 20px 60px rgba(0,0,0,0.2)' },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 20,
        elevation: 8,
      },
    }),
  },
  modalContainerMobile: {
    width: '100%',
    borderRadius: 20,
    padding: 24,
  },
  modalContainerTablet: {
    width: '45%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: C.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 14,
    color: C.muted,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 21,
  },
  modalButton: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
  },
  modalButtonGradient: {
    paddingVertical: 13,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
});