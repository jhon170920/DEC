import { StyleSheet } from "react-native";

export const COLORS = {
    primary: '#16a34a',
    secondary: '#064e3b',
    bg: '#f0f9f1',
    surface: '#ffffff',
    text: '#1f2937',
    danger: '#ef4444',
    warning: '#f59e0b'
  };  

export const adminStyles = StyleSheet.create({
    container: {
      flex: 1,
      flexDirection: 'row',
      height: Platform.OS === 'web' ? '100vh' : '100%', 
      width: '100%',
      backgroundColor: COLORS.bg,
      overflow: 'auto',
    },
    sidebar: {
      width: 260,
      backgroundColor: '#fff',
      padding: 20,
      borderRightWidth: 1,
      borderRightColor: '#e5e7eb',
      height: '100%',
    },
    contentWrapper: {
      flex: 1,
      maxHeight: Platform.OS === 'web' ? '100vh' : '100%',
      overflow: Platform.OS === 'web' ? 'auto' : undefined,
    },
    mainScroll: {
      flex: 1,
      width: '100%',
    },
    scrollPadding: {
      padding: 30,
      paddingBottom: 50,
    },
    logo: {
      fontSize: 22,
      fontWeight: '800',
      color: COLORS.primary,
      marginBottom: 40,
      textAlign: 'center'
    },
    sidebarItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 15,
      borderRadius: 12,
      marginBottom: 8
    },
    sidebarItemActive: {
      backgroundColor: COLORS.primary,
    },
    sidebarItemDanger: {
      marginTop: 20,
      borderTopWidth: 1,
      borderTopColor: '#e5e7eb',
    },
    sidebarLabel: {
      marginLeft: 15,
      fontWeight: '600',
      color: COLORS.secondary
    },
    mobileLogoutButton: {
      position: 'absolute',
      bottom: 20,
      right: 20,
      backgroundColor: COLORS.danger,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 30,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 5,
    },
    mobileLogoutText: {
      color: '#fff',
      fontWeight: 'bold',
      marginLeft: 8,
    },
  });