import React, { useState, useMemo } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, ScrollView, 
  Image, TextInput, Platform, Linking 
} from 'react-native';
import { Feather } from '@expo/vector-icons';

const DetectionsTab = () => {
  const [selectedDetection, setSelectedDetection] = useState(null);
  const [approvedCount, setApprovedCount] = useState(145);
  const [sortOrder, setSortOrder] = useState('desc'); // 'desc' para mayor a menor

  // Lógica de ordenamiento dinámico por confianza
  const sortedDetections = useMemo(() => {
    return [...MOCK_DETECTIONS].sort((a, b) => {
      return sortOrder === 'desc' ? b.confidence - a.confidence : a.confidence - b.confidence;
    });
  }, [sortOrder]);

  const openInMaps = (locationName) => {
    // Genera el enlace para Google Maps con el pin en la ubicación
    const query = encodeURIComponent(`${locationName}, Garzón, Huila, Colombia`);
    const url = Platform.select({
      ios: `maps:0?q=${query}`,
      android: `geo:0,0?q=${query}`,
      web: `https://www.google.com/maps/search/?api=1&query=${query}`
    });
    Linking.openURL(url);
  };

  return (
    <View style={styles.container}>
      {/* CABECERA CON RESUMEN DE DATASET */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Auditoría y Dataset</Text>
          <Text style={styles.sub}>Curación de datos para mejora de YOLOv11</Text>
        </View>
        
        <View style={styles.datasetStatsCard}>
          <View style={styles.datasetInfo}>
            <Text style={styles.datasetNumber}>{approvedCount}</Text>
            <Text style={styles.datasetSub}>Imágenes Listas</Text>
          </View>
          <TouchableOpacity style={styles.downloadBtn}>
            <Feather name="download-cloud" size={18} color="#fff" />
            <Text style={styles.downloadText}>Exportar Dataset</Text>
          </TouchableOpacity>
        </View>
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
            {sortedDetections.map((item) => (
              <TouchableOpacity 
                key={item.id} 
                style={[styles.row, selectedDetection?.id === item.id && styles.rowActive]}
                onPress={() => setSelectedDetection(item)}
              >
                <Image source={{ uri: item.image }} style={styles.miniThumb} />
                
                <View style={styles.rowMainInfo}>
                  <Text style={styles.rowDate}>{item.date}</Text>
                  <View style={[styles.typeBadge, item.type === 'Roya' ? styles.bgRoya : styles.bgMinador]}>
                    <Text style={styles.typeText}>{item.type}</Text>
                  </View>
                </View>

                <View style={styles.rowValueInfo}>
                  <Text style={styles.confValue}>{item.confidence}%</Text>
                  <Text style={styles.confSub}>Confianza</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* COLUMNA DERECHA: INSPECTOR DE IMAGEN Y MAPA */}
        <View style={styles.inspectorSide}>
          {selectedDetection ? (
            <ScrollView contentContainerStyle={styles.inspectorContent}>
              <View style={styles.mainImageWrapper}>
                <Image source={{ uri: selectedDetection.image }} style={styles.fullImage} />
                <View style={styles.iaTag}>
                  <Text style={styles.iaTagText}>Detección IA</Text>
                </View>
              </View>

              <TouchableOpacity 
                style={styles.mapCard} 
                onPress={() => openInMaps(selectedDetection.location)}
              >
                <View style={styles.mapIconCircle}>
                  <Feather name="map-pin" size={20} color="#ef4444" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.mapLabel}>Ubicación en Garzón (Abrir Mapa)</Text>
                  <Text style={styles.mapValue}>{selectedDetection.location}</Text>
                </View>
                <Feather name="external-link" size={16} color="#d1d5db" />
              </TouchableOpacity>

              <View style={styles.dataGrid}>
                <View style={styles.dataItem}>
                  <Text style={styles.dataLabel}>Afección</Text>
                  <Text style={styles.dataValue}>{selectedDetection.type}</Text>
                </View>
                <View style={styles.dataItem}>
                  <Text style={styles.dataLabel}>Precisión</Text>
                  <Text style={[styles.dataValue, { color: '#16a34a' }]}>{selectedDetection.confidence}%</Text>
                </View>
              </View>

              <View style={styles.actionRow}>
                <TouchableOpacity 
                  style={styles.approveAction}
                  onPress={() => setApprovedCount(prev => prev + 1)}
                >
                  <Feather name="check-circle" size={20} color="#fff" />
                  <Text style={styles.approveActionText}>Aprobar para Dataset</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.discardAction}>
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

// --- DATOS MOCK ---
const MOCK_DETECTIONS = [
  { id: '1', date: '08 Abr, 10:15 AM', type: 'Roya', confidence: 98.4, location: 'Vereda El Recreo', image: 'https://images.unsplash.com/photo-1592819695396-064b9570a5d0?w=400' },
  { id: '2', date: '08 Abr, 09:30 AM', type: 'Minador', confidence: 82.1, location: 'Sector La Jagua', image: 'https://images.unsplash.com/photo-1521503862181-2cdd007b0555?w=400' },
  { id: '3', date: '07 Abr, 04:20 PM', type: 'Roya', confidence: 91.5, location: 'Vereda Zuluaga', image: 'https://images.unsplash.com/photo-1592819695396-064b9570a5d0?w=400' },
];

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
  title: { fontSize: 24, fontWeight: '800', color: '#1f2937' },
  sub: { color: '#6b7280', fontSize: 14 },
  
  // Card Dataset
  datasetStatsCard: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 16, padding: 12, alignItems: 'center', gap: 20, borderWidth: 1, borderColor: '#e5e7eb' },
  datasetNumber: { fontSize: 24, fontWeight: '900', color: '#16a34a' },
  datasetSub: { fontSize: 10, fontWeight: '700', color: '#9ca3af', textTransform: 'uppercase' },
  downloadBtn: { backgroundColor: '#16a34a', paddingHorizontal: 15, paddingVertical: 10, borderRadius: 10, flexDirection: 'row', alignItems: 'center', gap: 8 },
  downloadText: { color: '#fff', fontWeight: '700', fontSize: 13 },

  mainLayout: { flexDirection: 'row', gap: 20, flex: 1 },

  // Lista
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

  // Inspector
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
  emptyStateText: { textAlign: 'center', color: '#9ca3af', marginTop: 15, fontSize: 15, fontWeight: '600' }
});

export default DetectionsTab;