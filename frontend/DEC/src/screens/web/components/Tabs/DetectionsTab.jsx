import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Image, Platform, Linking, ActivityIndicator, Alert, Modal
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import api from '../../../../api/api';

const DetectionsTab = () => {
  const [detections, setDetections] = useState([]);
  const [filteredDetections, setFilteredDetections] = useState([]);
  const [selectedDetection, setSelectedDetection] = useState(null);
  const [sortOrder, setSortOrder] = useState('desc');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [approvedCount, setApprovedCount] = useState(0);

  // Estados para filtros de fecha
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Estados para exportación de dataset
  const [exportModalVisible, setExportModalVisible] = useState(false);
  const [exportProgress, setExportProgress] = useState({ status: '', total: 0, processed: 0, message: '' });
  const [jobId, setJobId] = useState(null);
  let intervalId = null;

  // Cargar detecciones reales desde el backend
  const fetchDetections = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('admin/get-detections');
      const detectionsData = res.data.detections || [];
      setDetections(detectionsData);
      // Inicializar contador de aprobadas
      const approved = detectionsData.filter(d => d.approved === true).length;
      setApprovedCount(approved);
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

  // Aplicar filtros de fecha y ordenamiento
  useEffect(() => {
    let filtered = [...detections];

    // Filtrar por fecha de inicio
    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      filtered = filtered.filter(d => new Date(d.createdAt) >= start);
    }

    // Filtrar por fecha de fin
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      filtered = filtered.filter(d => new Date(d.createdAt) <= end);
    }

    // Ordenar por confianza
    filtered.sort((a, b) => {
      const confA = a.confidence || 0;
      const confB = b.confidence || 0;
      return sortOrder === 'desc' ? confB - confA : confA - confB;
    });

    setFilteredDetections(filtered);
  }, [detections, startDate, endDate, sortOrder]);

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

  // Alternar aprobación
  const handleToggleApprove = async (detection) => {
    try {
      const res = await api.patch(`admin/toggle-approve/${detection._id}`);
      const updatedDetections = detections.map(d =>
        d._id === detection._id ? { ...d, approved: res.data.approved } : d
      );
      setDetections(updatedDetections);
      if (selectedDetection?._id === detection._id) {
        setSelectedDetection({ ...selectedDetection, approved: res.data.approved });
      }
      // Actualizar contador de aprobadas
      const newApprovedCount = updatedDetections.filter(d => d.approved === true).length;
      setApprovedCount(newApprovedCount);
    } catch (err) {
      Alert.alert('Error', 'No se pudo cambiar el estado de aprobación');
    }
  };
  // Exportar dataset aprobado
const handleExportDataset = async () => {
  try {
    setExportModalVisible(true);
    setExportProgress({ status: 'starting', total: 0, processed: 0, message: 'Iniciando exportación...' });
    
    // Construir query params con las fechas actuales
    let url = 'admin/export/start';
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (params.toString()) url += `?${params.toString()}`;
    
    const res = await api.get(url);
    const { jobId: newJobId } = res.data;
    setJobId(newJobId);
    if (intervalId) clearInterval(intervalId);
    intervalId = setInterval(() => checkExportStatus(newJobId), 1000);
  } catch (error) {
    console.error(error);
    Alert.alert('Error', 'No se pudo iniciar la exportación');
    setExportModalVisible(false);
  }
};
  // Consultar el estado del trabajo de exportación
  const checkExportStatus = async (jobId) => {
    try {
      const res = await api.get(`admin/export/status/${jobId}`);
      const { status, total, processed, message } = res.data;
      setExportProgress({ status, total, processed, message });
      if (status === 'completed') {
        clearInterval(intervalId);
        // Descargar el archivo
        downloadExportFile(jobId);
      } else if (status === 'error') {
        clearInterval(intervalId);
        Alert.alert('Error', message);
        setExportModalVisible(false);
      }
    } catch (error) {
      console.error(error);
      clearInterval(intervalId);
      Alert.alert('Error', 'Error consultando el estado');
      setExportModalVisible(false);
    }
  };
  // Descargar el archivo exportado
  const downloadExportFile = async (jobId) => {
    try {
      const response = await api.get(`admin/export/download/${jobId}`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `dataset_${jobId}.zip`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      Alert.alert('Éxito', 'Dataset descargado correctamente');
    } catch (error) {
      Alert.alert('Error', 'No se pudo descargar el archivo');
    } finally {
      setExportModalVisible(false);
      setJobId(null);
    }
  };
  // Limpiar el intervalo al desmontar el componente
  useEffect(() => {
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, []);

  // Calcular porcentaje de progreso
  const percent = exportProgress.total > 0 
    ? (exportProgress.processed / exportProgress.total) * 100 
    : 0;
  // Limpiar filtros de fecha
  const clearDateFilters = () => {
    setStartDate('');
    setEndDate('');
  };

  // Abrir mapa con coordenadas
  const openInMaps = (detection) => {
    let lat, lng;
    if (detection.location?.coordinates && detection.location.coordinates.length === 2) {
      lng = detection.location.coordinates[0];
      lat = detection.location.coordinates[1];
    } else {
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
      {/* CABECERA CON RESUMEN */}
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
          <TouchableOpacity style={styles.downloadBtn} onPress={handleExportDataset}>
            <Feather name="download-cloud" size={18} color="#fff" />
            <Text style={styles.downloadText}>Exportar Dataset</Text>
          </TouchableOpacity>
          <Modal
  visible={exportModalVisible}
  transparent
  animationType="fade"
  onRequestClose={() => {}}
>
  <View style={styles.modalOverlay}>
    <View style={styles.modalCard}>
      <Feather name="package" size={40} color="#16a34a" />
      <Text style={styles.modalTitle}>Exportando dataset</Text>
      <Text style={styles.modalMessage}>{exportProgress.message}</Text>
      
      {exportProgress.status === 'processing' && (
        <>
          <View style={styles.progressBarBg}>
            <View 
              style={[
                styles.progressBarFill, 
                { width: `${percent}%` }
              ]} 
            />
          </View>
          <Text style={styles.progressText}>
            {exportProgress.processed} de {exportProgress.total} imágenes
          </Text>
          <Text style={styles.percentText}>{Math.round(percent)}% completado</Text>
        </>
      )}
      
      {exportProgress.status === 'completed' && (
        <View style={styles.completedContainer}>
          <Feather name="check-circle" size={32} color="#16a34a" />
          <Text style={styles.completedText}>¡Completado! Descargando...</Text>
        </View>
      )}
      
      {exportProgress.status === 'error' && (
        <>
          <Feather name="alert-circle" size={32} color="#ef4444" />
          <Text style={styles.errorText}>{exportProgress.message}</Text>
          <TouchableOpacity 
            style={styles.closeModalBtn} 
            onPress={() => setExportModalVisible(false)}
          >
            <Text style={styles.closeModalText}>Cerrar</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  </View>
</Modal>
        </View>
      </View>

      {/* FILTROS DE FECHA */}
      <View style={styles.filterContainer}>
        <View style={styles.dateFilterRow}>
          <View style={styles.dateInputGroup}>
            <Text style={styles.filterLabel}>Fecha inicio</Text>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              style={styles.dateInput}
            />
          </View>
          <View style={styles.dateInputGroup}>
            <Text style={styles.filterLabel}>Fecha fin</Text>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              style={styles.dateInput}
            />
          </View>
          <TouchableOpacity style={styles.clearBtn} onPress={clearDateFilters}>
            <Feather name="x-circle" size={16} color="#6b7280" />
            <Text style={styles.clearBtnText}>Limpiar</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.filterInfo}>
          {filteredDetections.length} de {detections.length} detecciones
          {(startDate || endDate) && ' (filtrado por fecha)'}
        </Text>
      </View>

      <View style={styles.mainLayout}>
        {/* COLUMNA IZQUIERDA: LISTADO CON MINIATURAS */}
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
            {filteredDetections.length === 0 ? (
              <View style={styles.emptyList}>
                <Text style={styles.emptyListText}>
                  {detections.length === 0
                    ? 'No hay detecciones registradas'
                    : 'No hay detecciones en el rango de fechas seleccionado'}
                </Text>
              </View>
            ) : (
              filteredDetections.map((item) => (
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

        {/* COLUMNA DERECHA: INSPECTOR DE IMAGEN Y MAPA */}
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

// Estilos (añadir los nuevos)
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, paddingHorizontal: 20, paddingTop: 20 },
  title: { fontSize: 24, fontWeight: '800', color: '#1f2937' },
  sub: { color: '#6b7280', fontSize: 14 },
  datasetStatsCard: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 16, padding: 12, alignItems: 'center', gap: 20, borderWidth: 1, borderColor: '#e5e7eb' },
  datasetNumber: { fontSize: 24, fontWeight: '900', color: '#16a34a' },
  datasetSub: { fontSize: 10, fontWeight: '700', color: '#9ca3af', textTransform: 'uppercase' },
  downloadBtn: { backgroundColor: '#16a34a', paddingHorizontal: 15, paddingVertical: 10, borderRadius: 10, flexDirection: 'row', alignItems: 'center', gap: 8 },
  downloadText: { color: '#fff', fontWeight: '700', fontSize: 13 },

  // Filtros de fecha
  filterContainer: { backgroundColor: '#fff', marginHorizontal: 20, marginBottom: 20, padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#e5e7eb' },
  dateFilterRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 16, flexWrap: 'wrap' },
  dateInputGroup: { flex: 1, minWidth: 150 },
  filterLabel: { fontSize: 12, fontWeight: '700', color: '#374151', marginBottom: 6 },
  dateInput: { padding: 10, borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, fontSize: 14, backgroundColor: '#fff' },
  clearBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, padding: 10, backgroundColor: '#f3f4f6', borderRadius: 8, marginBottom: 0 },
  clearBtnText: { fontSize: 13, fontWeight: '500', color: '#6b7280' },
  filterInfo: { marginTop: 12, fontSize: 12, color: '#6b7280', fontStyle: 'italic' },

  mainLayout: { flexDirection: 'row', gap: 20, flex: 1, paddingHorizontal: 20 },
  listSide: { flex: 1.2, backgroundColor: '#fff', borderRadius: 20, borderWidth: 1, borderColor: '#e5e7eb', overflow: 'hidden' },
  listHeader: { padding: 18, borderBottomWidth: 1, borderBottomColor: '#f3f4f6', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  listTitle: { fontWeight: '800', color: '#374151' },
  sortToggle: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#f0fdf4', padding: 8, borderRadius: 8 },
  sortToggleText: { fontSize: 12, fontWeight: '700', color: '#16a34a' },
  scrollList: { flex: 1 },
  row: { flexDirection: 'row', padding: 12, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#f9fafb' },
  rowActive: { backgroundColor: '#f0fdf4' },
  miniThumb: { width: 55, height: 55, borderRadius: 10, backgroundColor: '#f3f4f6' },
  rowMainInfo: { flex: 1, marginLeft: 15 },
  rowDate: { fontSize: 11, color: '#9ca3af', marginBottom: 5 },
  typeBadge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  bgRoya: { backgroundColor: '#fef3c7' },
  bgMinador: { backgroundColor: '#e0f2fe' },
  typeText: { fontSize: 11, fontWeight: '800', color: '#92400e' },
  rowValueInfo: { alignItems: 'flex-end', position: 'relative' },
  confValue: { fontSize: 16, fontWeight: '800', color: '#16a34a', textAlign: 'right' },
  confSub: { fontSize: 10, color: '#9ca3af', textAlign: 'right' },
  approvedBadge: { position: 'absolute', bottom: -5, right: -5, backgroundColor: '#16a34a', borderRadius: 10, width: 18, height: 18, justifyContent: 'center', alignItems: 'center' },

  inspectorSide: { flex: 1, backgroundColor: '#fff', borderRadius: 24, borderWidth: 1, borderColor: '#e5e7eb', overflow: 'hidden' },
  inspectorContent: { paddingBottom: 20 },
  mainImageWrapper: { width: '100%', height: 320, position: 'relative' },
  fullImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  iaTag: { position: 'absolute', top: 15, left: 15, backgroundColor: 'rgba(22, 163, 74, 0.85)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6 },
  iaTagText: { color: '#fff', fontSize: 11, fontWeight: '800' },
  approvedOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  approvedOverlayText: { color: '#fff', fontWeight: 'bold', marginTop: 8 },
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
  approvedActive: { backgroundColor: '#f59e0b' },
  discardAction: { width: 60, height: 60, borderRadius: 16, borderWidth: 1, borderColor: '#fecaca', justifyContent: 'center', alignItems: 'center' },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyStateText: { textAlign: 'center', color: '#9ca3af', marginTop: 15, fontSize: 15, fontWeight: '600' },
  emptyList: { padding: 40, alignItems: 'center' },
  emptyListText: { color: '#9ca3af', textAlign: 'center' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  loadingText: { marginTop: 12, color: '#6b7280' },
  errorText: { marginTop: 12, color: '#ef4444', textAlign: 'center' },
  retryBtn: { marginTop: 20, backgroundColor: '#16a34a', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  retryText: { color: '#fff', fontWeight: '700' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 30,
    width: '90%',
    maxWidth: 400,
    alignItems: 'center'
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginTop: 16,
    marginBottom: 8,
    color: '#1f2937'
  },
  modalMessage: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 20
  },
  progressBarBg: {
    width: '100%',
    height: 10,
    backgroundColor: '#e5e7eb',
    borderRadius: 5,
    overflow: 'hidden',
    marginVertical: 16
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#16a34a',
    borderRadius: 5
  },
  progressText: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '500'
  },
  completedText: {
    fontSize: 14,
    color: '#16a34a',
    fontWeight: '600',
    marginTop: 16
  },
  percentText: {
  fontSize: 16,
  fontWeight: '700',
  color: '#16a34a',
  marginTop: 8,
  textAlign: 'center'
},
completedContainer: {
  alignItems: 'center',
  marginTop: 10
},
closeModalBtn: {
  marginTop: 20,
  backgroundColor: '#f3f4f6',
  paddingHorizontal: 20,
  paddingVertical: 10,
  borderRadius: 8
},
closeModalText: {
  color: '#374151',
  fontWeight: '600'
},
});

export default DetectionsTab;