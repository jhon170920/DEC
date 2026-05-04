import { StyleSheet, Platform } from "react-native";

export const C = {
    bg: '#f4faf5',
    surface: '#ffffff',
    p: '#16a34a',
    text: '#0f2d1a',
    mid: '#2d6a4f',
    danger: '#dc2626',
  };

export const LoginAdminStyles = StyleSheet.create({
    root: {
      flex: 1,
      minHeight: '100vh',
      backgroundColor: C.bg,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 24,
    },
    cardResponsiveSmall:{
      width: '95%',
      justifyContent: 'center',
    },
    card: {
      width: Platform.OS === 'web' ? 420 : '100%',
      backgroundColor: C.surface,
      borderRadius: 24,
      padding: 32,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 16 },
      shadowOpacity: 0.08,
      shadowRadius: 24,
      elevation: 8,
    },
    titleResponsiveSmall: {
      fontSize: '120%',
      textAlign: 'center',
    },
    title: {
      fontSize: 28,
      fontWeight: '800',
      color: C.text,
      marginBottom: 8,
    },
    subtitleResponsiveSmall:{
        fontSize: '90%',
        textAlign: 'center',
    },
    subtitle: {
      fontSize: 15,
      color: C.mid,
      marginBottom: 28,
      lineHeight: 22,
    },
    input: {
      height: 52,
      borderWidth: 1,
      borderColor: '#dceee2',
      borderRadius: 14,
      paddingHorizontal: 16,
      marginBottom: 16,
      fontSize: 15,
      color: C.text,
      backgroundColor: '#f7fcf8',
    },
    button: {
      borderRadius: 14,
      overflow: 'hidden',
      marginTop: 8,
      marginBottom: 16,
    },
    buttonGradient: {
      paddingVertical: 16,
      alignItems: 'center',
    },
    buttonText: {
      color: '#fff',
      fontWeight: '700',
      fontSize: 16,
    },
    link: {
      color: C.p,
      textAlign: 'center',
      fontWeight: '600',
      fontSize: '100%'
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContainerResponsiveSmall:{
        width: '90%',
    },
    modalContainerResponsiveMedium:{
        width: '40%',
    },
    modalContainer: {
      width: '20%',
      backgroundColor: '#fff',
      borderRadius: 20,
      padding: 24,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 5,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 8,
      textAlign: 'center',
      color: C.text,
    },
    modalMessage: {
      fontSize: 15,
      color: '#475569',
      textAlign: 'center',
      marginBottom: 24,
      lineHeight: 22,
    },
    modalButton: {
      width: '100%',
      borderRadius: 12,
      overflow: 'hidden',
    },
    modalButtonGradient: {
      paddingVertical: 12,
      alignItems: 'center',
    },
    modalButtonText: {
      color: '#fff',
      fontWeight: 'bold', 
      fontSize: 16,
    },
  });