// src/screens/mobile/AlarmsScreen.jsx
import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StatusBar,
  ActivityIndicator, StyleSheet, Alert, Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import * as Notifications from 'expo-notifications';
import { Colors } from '../../constants/colors';
import { getAllActiveAlarms, deleteAlarm } from '../../services/dbService';

export default function AlarmsScreen() {
  const navigation = useNavigation();
  const [alarms, setAlarms] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadAlarms = async () => {
    setLoading(true);
    try {
      const data = await getAllActiveAlarms();
      setAlarms(data);
    } catch (error) {
      console.error('Error cargando alarmas:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadAlarms();
    }, [])
  );

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
              await deleteAlarm(alarmId);
              loadAlarms(); // Recargar lista
            } catch (error) {
              console.error('Error eliminando alarma:', error);
              Alert.alert('Error', 'No se pudo eliminar el recordatorio');
            }
          }
        }
      ]
    );
  };

  const renderItem = ({ item }) => (
    <View style={styles.alarmCard}>
      <View style={styles.alarmInfo}>
        <Feather name="bell" size={20} color={Colors.primary} />
        <View style={styles.alarmDetails}>
          <Text style={styles.alarmMessage}>{item.message}</Text>
          <Text style={styles.alarmDate}>
            {new Date(item.trigger_date).toLocaleString()}
          </Text>
          <Text style={styles.alarmTitle}>{item.title}</Text>
        </View>
      </View>
      <TouchableOpacity
        onPress={() => handleDeleteAlarm(item.id, item.id.toString())}
        style={styles.deleteBtn}
      >
        <Feather name="trash-2" size={20} color="#dc2626" />
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.bg} />
      <LinearGradient colors={['#e8f5ec', '#f4faf5']} style={StyleSheet.absoluteFill} />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Feather name="arrow-left" size={24} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>Recordatorios programados</Text>
        <View style={{ width: 40 }} />
      </View>

      {alarms.length === 0 ? (
        <View style={styles.empty}>
          <Feather name="bell-off" size={60} color={Colors.textMuted} />
          <Text style={styles.emptyText}>No hay recordatorios activos</Text>
          <Text style={styles.emptySub}>Programa recordatorios desde el detalle de una detección</Text>
        </View>
      ) : (
        <FlatList
          data={alarms}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    marginTop: 20,
  },
  backBtn: { padding: 5 },
  title: { fontSize: 20, fontWeight: 'bold', color: Colors.text },
  list: { paddingHorizontal: 16, paddingBottom: 20 },
  alarmCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginVertical: 6,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  alarmInfo: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: 12 },
  alarmDetails: { flex: 1 },
  alarmTitle: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
  alarmMessage: { fontSize: 15, fontWeight: '600', color: '#1f2937' },
  alarmDate: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  deleteBtn: { padding: 8 },
  separator: { height: 1, backgroundColor: '#e5e7eb', marginVertical: 4 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 },
  emptyText: { fontSize: 16, color: Colors.textMuted, marginTop: 16, textAlign: 'center' },
  emptySub: { fontSize: 13, color: Colors.textMuted, textAlign: 'center', marginTop: 8 },
});