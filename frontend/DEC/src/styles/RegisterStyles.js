import { StyleSheet, Platform } from "react-native";
import { Colors } from "../constants/colors";

export const StyleRegister = StyleSheet.create({
    root:{
            flex:1,
            backgroundColor: Colors.bg,
        },
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
          loginRow: { alignItems: 'center' },
          loginText: { fontSize: 13, color: Colors.textMuted, fontWeight: '500' },
          loginLink: { color: Colors.primary, fontWeight: '800' },
})