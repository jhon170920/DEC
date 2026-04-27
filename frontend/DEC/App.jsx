import React, { useEffect, useState } from 'react';
import { Platform, View, StyleSheet, Alert } from 'react-native';
import * as Notifications from 'expo-notifications';
import { AuthProvider } from './src/context/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';
import { initDatabase, getAllActiveAlarms, deactivateAlarm } from './src/services/dbService';
import * as RootNavigation from './src/navigation/RootNavigation';
import { SyncManager } from './src/components/SyncManager';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function App() {
  useEffect(() => {
    if (Platform.OS !== 'web') {
      initDatabase();
    }

    const setupNotifications = async () => {
      if (Platform.OS === 'web') return;

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        console.warn('Permiso de notificaciones denegado');
        return;
      }

      const activeAlarms = await getAllActiveAlarms();
      for (const alarm of activeAlarms) {
        const triggerDate = new Date(alarm.trigger_date);
        if (triggerDate > new Date()) {
          await Notifications.scheduleNotificationAsync({
            identifier: alarm.id.toString(),
            content: {
              title: alarm.title,
              body: alarm.message,
              data: { detectionId: alarm.detection_id, screen: 'DetectionDetail' },
            },
            trigger: { type: 'date', date: triggerDate }, // ✅ Formato correcto
          });
          console.log(`🔔 Alarma reprogramada: ${alarm.id}`);
        } else {
          await deactivateAlarm(alarm.id);
        }
      }
    };

    setupNotifications();

    const notificationListener = Notifications.addNotificationReceivedListener(notification => {
      const { title, body } = notification.request.content;
      Alert.alert(title, body);
    });

    const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      const { data } = response.notification.request.content;
      console.log('Notificación tocada:', data);
      if (data?.detectionId && data?.screen === 'DetectionDetail') {
        // Navegar usando el ref global
        RootNavigation.navigate('DetectionDetail', { detectionId: data.detectionId });
      }
    });

    return () => {
      notificationListener.remove();
      responseListener.remove();
    };
  }, []);

  return (
    <View style={styles.container}>
      <AuthProvider>
        <SyncManager />
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