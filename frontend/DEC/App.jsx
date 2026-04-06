import React, { useEffect } from 'react';
import { Platform, View, StyleSheet } from 'react-native';
import { AuthProvider } from './src/context/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';
import { initDatabase } from './src/services/dbService';

export default function App() {
  useEffect(() => {
    // Solo inicializar DB en dispositivos móviles
    if (Platform.OS !== 'web') {
      initDatabase(); 
    }
  }, []);

  return (
    <View style={styles.container}> 
      <AuthProvider>
        <AppNavigator />
      </AuthProvider>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: '100vh',
    width: '100%',
    // Esto asegura que el contenedor raíz siempre ocupe el espacio disponible
    backgroundColor: '#e6f3ef', 
  },
});
