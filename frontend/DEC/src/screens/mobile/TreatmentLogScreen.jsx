import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, Alert, StatusBar,
  ActivityIndicator, StyleSheet, RefreshControl
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Colors } from '../../constants/colors';
import { getAllTreatmentLogs, deleteTreatmentLog } from '../../services/dbService';

export default function TreatmentLogScreen() {
  const navigation = useNavigation();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadLogs = async () => {
    const data = await getAllTreatmentLogs();
    setLogs(data);
    setLoading(false);
  };

  useFocusEffect(
    useCallback(() => {
      loadLogs();
    }, [])
  );

  const handleDelete = (id, diseaseName) => {
    Alert.alert(
      'Eliminar seguimiento',
      `¿Eliminar el seguimiento de "${diseaseName}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            await deleteTreatmentLog(id);
            loadLogs();
          }
        }
      ]
    );
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('TreatmentForm', { logId: item.id })}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.diseaseName}>{item.disease_name}</Text>
        <TouchableOpacity onPress={() => handleDelete(item.id, item.disease_name)}>
          <Feather name="trash-2" size={20} color="#dc2626" />
        </TouchableOpacity>
      </View>
      <Text style={styles.date}>{new Date(item.created_at).toLocaleDateString()}</Text>
      {item.general_notes ? (
        <Text style={styles.notes} numberOfLines={2}>{item.general_notes}</Text>
      ) : null}
      {item.detection_id ? (
        <TouchableOpacity
          style={styles.linkDetection}
          onPress={() => navigation.navigate('DetectionDetail', { detectionId: item.detection_id })}
        >
          <Feather name="link" size={14} color={Colors.primary} />
          <Text style={styles.linkText}>Ver detección asociada</Text>
        </TouchableOpacity>
      ) : null}
    </TouchableOpacity>
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
        <Text style={styles.title}>Bitácora de cultivo</Text>
        <TouchableOpacity onPress={() => navigation.navigate('TreatmentForm')} style={styles.addBtn}>
          <Feather name="plus" size={24} color={Colors.primary} />
        </TouchableOpacity>
      </View>
      {logs.length === 0 ? (
        <View style={styles.empty}>
          <Feather name="clipboard" size={60} color={Colors.textMuted} />
          <Text style={styles.emptyText}>No hay seguimientos registrados</Text>
          <TouchableOpacity style={styles.emptyBtn} onPress={() => navigation.navigate('TreatmentForm')}>
            <Text style={styles.emptyBtnText}>Crear primer seguimiento</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={logs}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadLogs} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    marginTop: 20,
  },
  backBtn: { padding: 5 },
  title: { fontSize: 20, fontWeight: 'bold', color: Colors.text },
  addBtn: { padding: 5 },
  list: { paddingHorizontal: 16, paddingBottom: 20 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  diseaseName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary,
    flex: 1,
  },
  date: {
    fontSize: 12,
    color: Colors.textMuted,
    marginBottom: 8,
  },
  notes: {
    fontSize: 14,
    color: '#555',
  },
  linkDetection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  linkText: {
    fontSize: 12,
    color: Colors.primary,
    marginLeft: 5,
    textDecorationLine: 'underline',
  },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 },
  emptyText: { fontSize: 16, color: Colors.textMuted, marginTop: 16, textAlign: 'center' },
  emptyBtn: { marginTop: 20, backgroundColor: Colors.primary, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 25 },
  emptyBtnText: { color: '#fff', fontWeight: 'bold' },
});