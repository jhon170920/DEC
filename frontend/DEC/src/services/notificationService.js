import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform, Alert } from 'react-native';
import api from '../api/api';

// Configurar cómo se muestran las notificaciones cuando la app está en primer plano
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Esta función se llamará después del login
export async function registerForPushNotificationsAsync(jwtToken) {
  // 1. Verificar que sea un dispositivo real (no emulador)
  if (!Device.isDevice) {
    Alert.alert('Debes usar un dispositivo físico para recibir notificaciones push');
    return;
  }

  // 2. Solicitar permisos
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== 'granted') {
    Alert.alert('No se otorgaron permisos para notificaciones');
    return;
  }

  // 3. Obtener el token push de Expo
  const tokenData = await Notifications.getExpoPushTokenAsync();
  const pushToken = tokenData.data;
  console.log('Expo Push Token:', pushToken);

  // 4. Enviar el token a tu backend (asociado al usuario)
  try {
    await api.post('/users/save-push-token', { pushToken }, {
      headers: { Authorization: `Bearer ${jwtToken}` }
    });
    console.log('Token guardado en el servidor');
  } catch (error) {
    console.error('Error guardando token:', error);
  }

  // 5. Configurar canal para Android (necesario para Android 8+)
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#16a34a',
    });
  }

  return pushToken;
}