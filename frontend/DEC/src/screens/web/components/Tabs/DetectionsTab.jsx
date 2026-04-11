import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Image, TextInput, Platform, Linking, ActivityIndicator, Alert
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import api from '../../../../api/api';

const DetectionsTab = () => {
  const [detections, setDetections] = useState([]);
  const [selectedDetection, setSelectedDetection] = useState(null);
  const [sortOrder, setSortOrder] = useState('desc');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const approvedCount = detections.filter(d => d.approved === true).length;

  // Cargar detecciones reales desde el backend
const fetchDetections = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('admin/get-detections');
      setDetections(res.data.detections || []);
    } catch (err) {
      console.error(err);
      setError('Error al cargar las detecciones');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDetections();
  }, [fetchDetections]);

  // Eliminar detección
  const handleDelete = async (id) => {
    if (Platform.OS === 'web') {
      if (!window.confirm('¿Eliminar esta detección permanentemente?')) return;
    } else {
      Alert.alert('Confirmar', '¿Eliminar esta detección?', [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: () => performDelete(id) }
      ]);
      return;
    }
    await performDelete(id);
  };

  const performDelete = async (id) => {
    try {
      await api.delete(`admin/delete-detection/${id}`);
      const updatedDetections = detections.filter(d => d._id !== id);
      setDetections(updatedDetections);
      if (selectedDetection?._id === id) setSelectedDetection(null);
    } catch (err) {
      Alert.alert('Error', 'No se pudo eliminar la detección');
    }
  };

  // Aprobar para dataset (solo frontend por ahora)
  const handleToggleApprove = async (detection) => {
    try {
      const res = await api.patch(`admin/toggle-approve/${detection._id}`); // Ajusta la ruta según tu backend
      // Actualizar estado local
      const updatedDetections = detections.map(d =>
        d._id === detection._id ? { ...d, approved: res.data.approved } : d
      );
      setDetections(updatedDetections);
      if (selectedDetection?._id === detection._id) {
        setSelectedDetection({ ...selectedDetection, approved: res.data.approved });
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'No se pudo cambiar el estado de aprobación');
    }
  };

  // Ordenar detecciones según confianza
  const sortedDetections = React.useMemo(() => {
    return [...detections].sort((a, b) => {
      const confA = a.confidence || 0;
      const confB = b.confidence || 0;
      return sortOrder === 'desc' ? confB - confA : confA - confB;
    });
  }, [detections, sortOrder]);

  // Abrir mapa con coordenadas (si existen) o con texto
  const openInMaps = (detection) => {
    let lat, lng;
    if (detection.location?.coordinates && detection.location.coordinates.length === 2) {
      lng = detection.location.coordinates[0];
      lat = detection.location.coordinates[1];
    } else {
      // Si no hay coordenadas, usamos un texto genérico
      const query = encodeURIComponent('Garzón, Huila, Colombia');
      const url = Platform.select({
        ios: `maps:0?q=${query}`,
        android: `geo:0,0?q=${query}`,
        web: `https://www.google.com/maps/search/?api=1&query=${query}`
      });
      Linking.openURL(url);
      return;
    }
    const url = Platform.select({
      ios: `maps:0?q=${lat},${lng}`,
      android: `geo:${lat},${lng}?q=${lat},${lng}`,
      web: `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
    });
    Linking.openURL(url);
  };

  // Formatear ubicación para mostrar
  const formatLocation = (detection) => {
    if (detection.location?.coordinates) {
      const [lng, lat] = detection.location.coordinates;
      return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    }
    return 'Ubicación no disponible';
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#16a34a" />
        <Text style={styles.loadingText}>Cargando detecciones...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Feather name="alert-circle" size={40} color="#ef4444" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={fetchDetections}>
          <Text style={styles.retryText}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Cabecera */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Auditoría y Dataset</Text>
          <Text style={styles.sub}>Curación de datos para mejora de YOLOv11</Text>
        </View>
        <View style={styles.datasetStatsCard}>
          <View style={styles.datasetInfo}>
            <Text style={styles.datasetNumber}>{approvedCount}</Text>
            <Text style={styles.datasetSub}>Imágenes Aprobadas</Text>
          </View>
          <TouchableOpacity style={styles.downloadBtn}>
            <Feather name="download-cloud" size={18} color="#fff" />
            <Text style={styles.downloadText}>Exportar Dataset</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.mainLayout}>
        {/* Lista izquierda */}
        <View style={styles.listSide}>
          <View style={styles.listHeader}>
            <Text style={styles.listTitle}>Detecciones Recientes</Text>
            <TouchableOpacity 
              style={styles.sortToggle} 
              onPress={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
            >
              <Feather name="bar-chart-2" size={14} color="#16a34a" />
              <Text style={styles.sortToggleText}>
                {sortOrder === 'desc' ? 'Confianza: Max' : 'Confianza: Min'}
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollList}>
            {sortedDetections.length === 0 ? (
              <View style={styles.emptyList}>
                <Text style={styles.emptyListText}>No hay detecciones registradas</Text>
              </View>
            ) : (
              sortedDetections.map((item) => (
                <TouchableOpacity 
                  key={item._id} 
                  style={[styles.row, selectedDetection?._id === item._id && styles.rowActive]}
                  onPress={() => setSelectedDetection(item)}
                >
                  <Image source={{ uri: item.imageUrl }} style={styles.miniThumb} />
                  <View style={styles.rowMainInfo}>
                    <Text style={styles.rowDate}>{new Date(item.createdAt).toLocaleString()}</Text>
                    <View style={[styles.typeBadge, item.pathologyId?.name === 'Roya' ? styles.bgRoya : styles.bgMinador]}>
                      <Text style={styles.typeText}>{item.pathologyId?.name || 'Desconocida'}</Text>
                    </View>
                  </View>
                  <View style={styles.rowValueInfo}>
                    <Text style={styles.confValue}>{Math.round((item.confidence || 0) * 100)}%</Text>
                    <Text style={styles.confSub}>Confianza</Text>
                    {item.approved && (
                      <View style={styles.approvedBadge}>
                        <Feather name="check" size={10} color="#fff" />
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        </View>

        {/* Inspector derecho */}
        <View style={styles.inspectorSide}>
          {selectedDetection ? (
            <ScrollView contentContainerStyle={styles.inspectorContent}>
              <View style={styles.mainImageWrapper}>
                <Image source={{ uri: selectedDetection.imageUrl }} style={styles.fullImage} />
                <View style={styles.iaTag}>
                  <Text style={styles.iaTagText}>Detección IA</Text>
                </View>
                {selectedDetection.approved && (
                  <View style={styles.approvedOverlay}>
                    <Feather name="check-circle" size={40} color="#16a34a" />
                    <Text style={styles.approvedOverlayText}>Aprobada</Text>
                  </View>
                )}
              </View>

              <TouchableOpacity style={styles.mapCard} onPress={() => openInMaps(selectedDetection)}>
                <View style={styles.mapIconCircle}>
                  <Feather name="map-pin" size={20} color="#ef4444" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.mapLabel}>Ubicación (Abrir Mapa)</Text>
                  <Text style={styles.mapValue}>{formatLocation(selectedDetection)}</Text>
                </View>
                <Feather name="external-link" size={16} color="#d1d5db" />
              </TouchableOpacity>

              <View style={styles.dataGrid}>
                <View style={styles.dataItem}>
                  <Text style={styles.dataLabel}>Afección</Text>
                  <Text style={styles.dataValue}>{selectedDetection.pathologyId?.name || '—'}</Text>
                </View>
                <View style={styles.dataItem}>
                  <Text style={styles.dataLabel}>Precisión</Text>
                  <Text style={[styles.dataValue, { color: '#16a34a' }]}>
                    {Math.round((selectedDetection.confidence || 0) * 100)}%
                  </Text>
                </View>
              </View>

              <View style={styles.actionRow}>
                <TouchableOpacity 
                  style={[styles.approveAction, selectedDetection.approved && styles.approvedActive]}
                  onPress={() => handleToggleApprove(selectedDetection)}
                >
                  <Feather name={selectedDetection.approved ? "x-circle" : "check-circle"} size={20} color="#fff" />
                  <Text style={styles.approveActionText}>
                    {selectedDetection.approved ? 'Desaprobar' : 'Aprobar para Dataset'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.discardAction} onPress={() => handleDelete(selectedDetection._id)}>
                  <Feather name="trash-2" size={20} color="#ef4444" />
                </TouchableOpacity>
              </View>
            </ScrollView>
          ) : (
            <View style={styles.emptyState}>
              <Feather name="layers" size={50} color="#e5e7eb" />
              <Text style={styles.emptyStateText}>Selecciona una imagen de la lista para auditar</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

// Estilos (se mantienen los mismos, solo añadimos algunos extras)
const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
  title: { fontSize: 24, fontWeight: '800', color: '#1f2937' },
  sub: { color: '#6b7280', fontSize: 14 },
  datasetStatsCard: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 16, padding: 12, alignItems: 'center', gap: 20, borderWidth: 1, borderColor: '#e5e7eb' },
  datasetNumber: { fontSize: 24, fontWeight: '900', color: '#16a34a' },
  datasetSub: { fontSize: 10, fontWeight: '700', color: '#9ca3af', textTransform: 'uppercase' },
  downloadBtn: { backgroundColor: '#16a34a', paddingHorizontal: 15, paddingVertical: 10, borderRadius: 10, flexDirection: 'row', alignItems: 'center', gap: 8 },
  downloadText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  mainLayout: { flexDirection: 'row', gap: 20, flex: 1 },
  listSide: { flex: 1.2, backgroundColor: '#fff', borderRadius: 20, borderWidth: 1, borderColor: '#e5e7eb', overflow: 'hidden' },
  listHeader: { padding: 18, borderBottomWidth: 1, borderBottomColor: '#f3f4f6', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  listTitle: { fontWeight: '800', color: '#374151' },
  sortToggle: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#f0fdf4', padding: 8, borderRadius: 8 },
  sortToggleText: { fontSize: 12, fontWeight: '700', color: '#16a34a' },
  row: { flexDirection: 'row', padding: 12, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#f9fafb' },
  rowActive: { backgroundColor: '#f0fdf4' },
  miniThumb: { width: 55, height: 55, borderRadius: 10, backgroundColor: '#f3f4f6' },
  rowMainInfo: { flex: 1, marginLeft: 15 },
  rowDate: { fontSize: 11, color: '#9ca3af', marginBottom: 5 },
  typeBadge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  bgRoya: { backgroundColor: '#fef3c7' },
  bgMinador: { backgroundColor: '#e0f2fe' },
  typeText: { fontSize: 11, fontWeight: '800', color: '#92400e' },
  confValue: { fontSize: 16, fontWeight: '800', color: '#16a34a', textAlign: 'right' },
  confSub: { fontSize: 10, color: '#9ca3af', textAlign: 'right' },
  inspectorSide: { flex: 1, backgroundColor: '#fff', borderRadius: 24, borderWidth: 1, borderColor: '#e5e7eb', overflow: 'hidden' },
  mainImageWrapper: { width: '100%', height: 320, position: 'relative' },
  fullImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  iaTag: { position: 'absolute', top: 15, left: 15, backgroundColor: 'rgba(22, 163, 74, 0.85)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6 },
  iaTagText: { color: '#fff', fontSize: 11, fontWeight: '800' },
  mapCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f9fafb', margin: 20, padding: 15, borderRadius: 16, gap: 15, borderWidth: 1, borderColor: '#f3f4f6' },
  mapIconCircle: { width: 45, height: 45, borderRadius: 22, backgroundColor: '#fee2e2', justifyContent: 'center', alignItems: 'center' },
  mapLabel: { fontSize: 11, fontWeight: '700', color: '#9ca3af', marginBottom: 3 },
  mapValue: { fontWeight: '800', color: '#1f2937', fontSize: 14 },
  dataGrid: { flexDirection: 'row', paddingHorizontal: 20, gap: 15 },
  dataItem: { flex: 1, backgroundColor: '#f9fafb', padding: 15, borderRadius: 16 },
  dataLabel: { fontSize: 11, fontWeight: '700', color: '#9ca3af', marginBottom: 5 },
  dataValue: { fontSize: 18, fontWeight: '900', color: '#1f2937' },
  actionRow: { flexDirection: 'row', padding: 20, gap: 12 },
  approveAction: { flex: 1, backgroundColor: '#16a34a', padding: 18, borderRadius: 16, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10 },
  approveActionText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  discardAction: { width: 60, height: 60, borderRadius: 16, borderWidth: 1, borderColor: '#fecaca', justifyContent: 'center', alignItems: 'center' },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyStateText: { textAlign: 'center', color: '#9ca3af', marginTop: 15, fontSize: 15, fontWeight: '600' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  loadingText: { marginTop: 12, color: '#6b7280' },
  errorText: { marginTop: 12, color: '#ef4444', textAlign: 'center' },
  retryBtn: { marginTop: 20, backgroundColor: '#16a34a', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  retryText: { color: '#fff', fontWeight: '700' },
  emptyList: { padding: 40, alignItems: 'center' },
  emptyListText: { color: '#9ca3af' },
  approvedDisabled: { backgroundColor: '#9ca3af' },
  approvedBadge: {
    position: 'absolute',
    bottom: -5,
    right: -5,
    backgroundColor: '#16a34a',
    borderRadius: 10,
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  approvedOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  approvedOverlayText: {
    color: '#fff',
    fontWeight: 'bold',
    marginTop: 8,
  },
  approvedActive: {
    backgroundColor: '#f59e0b', // color naranja para "desaprobar"
  }, // Naranja para desaprobar
});

export default DetectionsTab;