import React, { useEffect, useState } from 'react';
import { Platform, View, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import * as Notifications from 'expo-notifications';
import { AuthProvider } from './src/context/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';
import { initDatabase, getAllActiveAlarms, deactivateAlarm } from './src/services/dbService';
import * as RootNavigation from './src/navigation/RootNavigation';
import { SyncManager } from './src/components/SyncManager';
import OnboardingScreen from './src/components/OnboardingScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
            trigger: { type: 'date', date: triggerDate },
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
        RootNavigation.navigate('DetectionDetail', { detectionId: data.detectionId });
      }
    });

    return () => {
      notificationListener.remove();
      responseListener.remove();
    };
  }, []);

  // Lógica para mostrar onboarding solo la primera vez (excluyendo web)
  const [isFirstLaunch, setIsFirstLaunch] = useState(null);

  useEffect(() => {
    const checkFirstLaunch = async () => {
      if (Platform.OS === 'web') {
        // En web, saltar onboarding
        setIsFirstLaunch(false);
        return;
      }
      const hasSeen = await AsyncStorage.getItem('@hasSeenOnboarding');
      setIsFirstLaunch(hasSeen === null);
    };
    checkFirstLaunch();
  }, []);

  // Si estamos en web, renderizar directamente la app
  if (Platform.OS === 'web') {
    return (
      <View style={styles.container}>
        <AuthProvider>
          <SyncManager />
          <AppNavigator />
        </AuthProvider>
      </View>
    );
  }

  // En móvil, mostrar loading mientras se determina si es primer lanzamiento
  if (isFirstLaunch === null) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#16a34a" />
      </View>
    );
  }

  // Si es primer lanzamiento, mostrar onboarding
  if (isFirstLaunch) {
    return <OnboardingScreen onDone={() => setIsFirstLaunch(false)} />;
  }

  // Si no es primer lanzamiento, mostrar app principal
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e6f3ef',
  },
});