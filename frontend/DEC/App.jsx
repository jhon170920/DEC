import React, { useEffect } from 'react';
import { Platform, View, StyleSheet, Alert } from 'react-native';
import * as Notifications from 'expo-notifications';
import { AuthProvider } from './src/context/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';
import { initDatabase } from './src/services/dbService';

export default function App() {
  useEffect(() => {
    if (Platform.OS !== 'web') {
      initDatabase();
    }

    // Listener para notificaciones en primer plano
    const notificationListener = Notifications.addNotificationReceivedListener(notification => {
      const { title, body } = notification.request.content;
      Alert.alert(title, body);
    });

    // Listener para cuando el usuario toca la notificación
    const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      const { data } = response.notification.request.content;
      console.log('Notificación tocada:', data);
      // Aquí puedes agregar navegación si lo deseas
    });

    // ✅ CORRECTO: limpiar los listeners
    return () => {
      notificationListener.remove();
      responseListener.remove();
    };
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
    backgroundColor: '#e6f3ef',
  },
});