import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, Image, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, Linking, Alert, ActivityIndicator
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import * as Notifications from 'expo-notifications';
import { Colors } from '../../constants/colors';
import {
  getTreatmentLogByDetectionId,
  saveAlarm,
  getAlarmsByDetection,
  deleteAlarm as deleteAlarmFromDB,
  getRemoteDetectionById
} from '../../services/dbService';

export default function DetectionDetail() {
  const route = useRoute();
  const navigation = useNavigation();
  const { detection, detectionId } = route.params;

  const [detectionData, setDetectionData] = useState(detection || null);
  const [loading, setLoading] = useState(!detection);
  const [logData, setLogData] = useState(null);
  const [alarms, setAlarms] = useState([]);
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const isMounted = useRef(true);

  // Cargar detección desde SQLite si solo tenemos el ID
  useEffect(() => {
    const fetchDetection = async () => {
      if (!detectionData && detectionId) {
        const data = await getRemoteDetectionById(detectionId);
        if (isMounted.current) {
          setDetectionData(data);
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };
    fetchDetection();
  }, []);

  // Una vez que tenemos los datos de la detección, cargar seguimiento y alarmas
  useEffect(() => {
    if (detectionData) {
      loadLogAndAlarms();
    }
  }, [detectionData]);

  const loadLogAndAlarms = async () => {
    const detId = detectionData._id || detectionData.id; // normalizar ID
    const log = await getTreatmentLogByDetectionId(detId);
    if (isMounted.current) setLogData(log);
    const alarmList = await getAlarmsByDetection(detId);
    if (isMounted.current) setAlarms(alarmList);
  };

  if (loading || !detectionData) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  // Normalizar ID para usarlo en todas las funciones
  const normalizedDetectionId = detectionData._id || detectionData.id;

  // Extraer nombre de enfermedad (desde SQLite o MongoDB)
  const diseaseName = detectionData.disease_name || detectionData.pathologyId?.name || 'Planta Sana';
  const confidence = detectionData.confidence ?? 0;
  const imageUrl = detectionData.image_url || detectionData.imageUrl || '';
  const date = detectionData.created_at || detectionData.createdAt;
  const lat = detectionData.lat || 0;
  const lng = detectionData.lng || 0;
  const isDiseased = diseaseName !== 'Planta Sana';
  const mainColor = isDiseased ? Colors.warning : Colors.success;

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    return d.toLocaleDateString('es-CO', {
      day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  const openMaps = () => {
    const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
    Linking.openURL(url);
  };

  const scheduleReminder = async (date) => {
    if (!date) {
      Alert.alert('Error', 'No se seleccionó una fecha válida');
      return;
    }
    const now = new Date();
    if (date <= now) {
      Alert.alert('Error', 'La fecha debe ser posterior al momento actual');
      return;
    }
    try {
      const triggerDate = date.toISOString();
      const alarmId = await saveAlarm({
        detection_id: normalizedDetectionId,
        title: '📢 Recordatorio de seguimiento',
        message: `Revisa la evolución de "${diseaseName}"`,
        trigger_date: triggerDate,
      });
      await Notifications.scheduleNotificationAsync({
        identifier: alarmId.toString(),
        content: {
          title: '📢 Seguimiento de enfermedad',
          body: `Revisa la evolución de "${diseaseName}"`,
          data: { detectionId: normalizedDetectionId, screen: 'DetectionDetail' },
        },
        trigger: { type: 'date', date: date },
      });
      Alert.alert('Éxito', 'Recordatorio programado correctamente');
      loadLogAndAlarms();
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'No se pudo programar el recordatorio');
    }
  };

  const handleDeleteAlarm = async (alarmId, notificationId) => {
    Alert.alert(
      'Eliminar recordatorio',
      '¿Estás seguro de que quieres eliminar este recordatorio?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await Notifications.cancelScheduledNotificationAsync(notificationId);
              await deleteAlarmFromDB(alarmId);
              loadLogAndAlarms();
              Alert.alert('Éxito', 'Recordatorio eliminado');
            } catch (error) {
              console.error(error);
              Alert.alert('Error', 'No se pudo eliminar el recordatorio');
            }
          }
        }
      ]
    );
  };

  const showDatePicker = () => setDatePickerVisible(true);
  const hideDatePicker = () => setDatePickerVisible(false);
  const handleConfirmDate = (date) => {
    hideDatePicker();
    if (date) {
      setSelectedDate(date);
      scheduleReminder(date);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.bg} />
      <LinearGradient colors={['#e8f5ec', '#f4faf5']} style={StyleSheet.absoluteFill} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Botón de retroceso */}
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={24} color={Colors.primary} />
        </TouchableOpacity>

        {/* Imagen principal */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="cover" />
          <View style={[styles.badge, { backgroundColor: mainColor }]}>
            <Text style={styles.badgeText}>{isDiseased ? 'Enfermedad detectada' : 'Planta sana'}</Text>
          </View>
        </View>

        {/* Tarjeta de información */}
        <View style={styles.infoCard}>
          <Text style={[styles.diseaseName, { color: mainColor }]}>{diseaseName}</Text>
          <Text style={styles.date}>{formatDate(date)}</Text>

          <View style={styles.confidenceContainer}>
            <Text style={styles.label}>Precisión del análisis</Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${confidence * 100}%`, backgroundColor: mainColor }]} />
            </View>
            <Text style={styles.confidenceText}>{(confidence * 100).toFixed(1)}%</Text>
          </View>

          <View style={styles.divider} />
          <View style={styles.sectionHeader}>
            <Feather name="edit-3" size={20} color={Colors.primary} />
            <Text style={styles.sectionTitle}>Mi seguimiento</Text>
          </View>

          {logData ? (
            <View style={styles.notePreview}>
              <Text style={styles.noteProduct}>🧪 Productos: {logData.products?.length || 0}</Text>
              <Text style={styles.noteDate}>
                📅 Último seguimiento: {new Date(logData.created_at).toLocaleDateString()}
              </Text>
              {logData.general_notes ? (
                <Text style={styles.noteText} numberOfLines={2}>
                  📝 {logData.general_notes}
                </Text>
              ) : null}
              <TouchableOpacity
                onPress={() => navigation.navigate('TreatmentForm', { logId: logData.id })}
              >
                <Text style={styles.linkText}>Ver / Editar bitácora completa</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.followUpButton}
              onPress={() => navigation.navigate('TreatmentForm', {
                detectionId: normalizedDetectionId,
                initialDiseaseName: diseaseName
              })}
            >
              <Feather name="calendar" size={20} color="#fff" />
              <Text style={styles.followUpButtonText}>Crear seguimiento en bitácora</Text>
            </TouchableOpacity>
          )}

          {/* Sección de recordatorios */}
          <View style={styles.sectionHeader}>
            <Feather name="bell" size={20} color={Colors.primary} />
            <Text style={styles.sectionTitle}>Recordatorios</Text>
          </View>

          <TouchableOpacity style={styles.reminderButton} onPress={showDatePicker}>
            <Feather name="clock" size={18} color="#fff" />
            <Text style={styles.reminderButtonText}>Programar recordatorio</Text>
          </TouchableOpacity>

          {alarms.length > 0 && (
            <View style={styles.alarmList}>
              {alarms.map((alarm) => (
                <View key={alarm.id} style={styles.alarmItem}>
                  <View style={styles.alarmInfo}>
                    <Feather name="bell" size={14} color={Colors.primary} />
                    <Text style={styles.alarmText}>{new Date(alarm.trigger_date).toLocaleString()}</Text>
                  </View>
                  <TouchableOpacity onPress={() => handleDeleteAlarm(alarm.id, alarm.id.toString())}>
                    <Feather name="trash-2" size={16} color="#dc2626" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          <DateTimePickerModal
            isVisible={isDatePickerVisible}
            mode="datetime"
            onConfirm={handleConfirmDate}
            onCancel={hideDatePicker}
            minimumDate={new Date()}
            locale="es_ES"
          />

          {/* Ubicación */}
          {lat !== 0 && lng !== 0 && (
            <>
              <View style={styles.divider} />
              <Text style={styles.sectionTitle}>Ubicación del análisis</Text>
              <TouchableOpacity style={styles.mapButton} onPress={openMaps}>
                <Feather name="map-pin" size={18} color="#fff" />
                <Text style={styles.mapButtonText}>Ver en mapa</Text>
              </TouchableOpacity>
              <Text style={styles.coords}>Lat: {lat.toFixed(6)}, Lng: {lng.toFixed(6)}</Text>
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  scrollContent: { paddingBottom: 30 },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 30,
    padding: 8,
    elevation: 5,
  },
  imageContainer: { width: '100%', height: 350, position: 'relative' },
  image: { width: '100%', height: '100%' },
  badge: { position: 'absolute', bottom: 20, left: 20, paddingHorizontal: 15, paddingVertical: 6, borderRadius: 20 },
  badgeText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  infoCard: {
    backgroundColor: '#fff',
    marginTop: -20,
    marginHorizontal: 16,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  diseaseName: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 5 },
  date: { textAlign: 'center', color: '#7F8C8D', fontSize: 14, marginBottom: 20 },
  confidenceContainer: { marginBottom: 15 },
  label: { fontSize: 14, fontWeight: '600', color: '#2C3E50', marginBottom: 5 },
  progressBar: { height: 10, backgroundColor: '#E0E0E0', borderRadius: 5, overflow: 'hidden', marginVertical: 5 },
  progressFill: { height: '100%', borderRadius: 5 },
  confidenceText: { fontSize: 14, fontWeight: 'bold', color: '#2C3E50', textAlign: 'right' },
  divider: { height: 1, backgroundColor: '#E0E0E0', marginVertical: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#2C3E50', marginBottom: 8 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  followUpButton: {
    flexDirection: 'row',
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10,
  },
  followUpButtonText: { color: '#fff', fontWeight: 'bold', marginLeft: 8 },
  notePreview: { backgroundColor: '#f0fdf4', padding: 12, borderRadius: 10, marginTop: 10 },
  noteProduct: { fontSize: 16, fontWeight: 'bold', color: '#2C3E50' },
  noteDate: { fontSize: 12, color: '#7F8C8D', marginTop: 4 },
  noteText: { fontSize: 14, color: '#333', marginTop: 6, fontStyle: 'italic' },
  linkText: { fontSize: 13, color: Colors.primary, marginTop: 8, textDecorationLine: 'underline' },
  reminderButton: {
    flexDirection: 'row',
    backgroundColor: '#3b82f6',
    paddingVertical: 10,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  reminderButtonText: { color: '#fff', fontWeight: 'bold', marginLeft: 8 },
  alarmList: { marginTop: 12, gap: 6 },
  alarmItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8fafc',
    padding: 8,
    borderRadius: 8,
  },
  alarmInfo: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  alarmText: { fontSize: 13, color: '#475569' },
  mapButton: {
    flexDirection: 'row',
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10,
  },
  mapButtonText: { color: '#fff', fontWeight: 'bold', marginLeft: 8 },
  coords: { fontSize: 12, color: '#7F8C8D', textAlign: 'center', marginTop: 5 },
});