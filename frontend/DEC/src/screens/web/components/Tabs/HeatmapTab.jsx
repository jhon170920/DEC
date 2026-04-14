import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';

// Importar CSS de Leaflet (Necesario para Web)
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat';

// --- SUBCONPONENTE: CAPA DE CALOR ---
// Leaflet requiere un hook interno para manipular la instancia del mapa 'L'
const HeatLayer = ({ points }) => {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    // Usamos un pequeño delay para asegurar que el contenedor del mapa 
    // haya terminado de renderizarse y tenga una altura > 0
    const timeoutId = setTimeout(() => {
      // Forzar a Leaflet a recalcular el tamaño del contenedor
      map.invalidateSize();

      const container = map.getContainer();
      if (container.offsetHeight === 0 || container.offsetWidth === 0) {
        console.warn("El contenedor del mapa aún tiene tamaño 0. Reintentando...");
        return;
      }

      // Crear la capa de calor
      const heatLayer = L.heatLayer(points, {
        radius: 25,
        blur: 15,
        maxZoom: 17,
        gradient: { 0.4: '#3b82f6', 0.65: '#10b981', 1: '#ef4444' }
      }).addTo(map);

      // Limpieza al desmontar o actualizar
      return () => {
        if (map && heatLayer) {
          map.removeLayer(heatLayer);
        }
      };
    }, 100); // 100ms es suficiente para que el navegador asigne el tamaño

    return () => clearTimeout(timeoutId);
  }, [map, points]);

  return null;
};

const HeatmapTab = () => {
  const [selectedDisease, setSelectedDisease] = useState('Roya');
  const [selectedMonth, setSelectedMonth] = useState('Abril');

  const diseases = ['Roya', 'Minador', 'Broca', 'Sana'];
  const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio'];

  // Centro de Garzón, Huila
  const centerPosition = [2.195, -75.628];

  // LOGICA DE DATOS: Aquí filtrarías los datos reales de tu base de datos
  // Formato Leaflet Heat: [lat, lng, intensidad (0 a 1)]
  const heatmapPoints = useMemo(() => {
    if (selectedDisease === 'Roya' && selectedMonth === 'Abril') {
      return [
        [2.195, -75.628, 0.9], [2.196, -75.629, 0.8], [2.194, -75.627, 1.0],
        [2.205, -75.625, 0.7], [2.210, -75.630, 0.6], [2.200, -75.640, 0.5]
      ];
    }
    // Datos por defecto para otros filtros (Simulación)
    return [
      [2.180, -75.630, 0.8], [2.185, -75.635, 0.9], [2.190, -75.615, 0.7]
    ];
  }, [selectedDisease, selectedMonth]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Mapa de Calor (Epidemiología)</Text>
          <Text style={styles.sub}>Distribución geográfica de afecciones en Garzón</Text>
        </View>

        {/* CONTENEDOR DE FILTROS */}
        <View style={styles.filterSection}>
          {/* Filtro de Afección */}
          <View style={styles.filterBox}>
            <Text style={styles.filterLabel}>Afección:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pillScroll}>
              {diseases.map(d => (
                <TouchableOpacity 
                  key={d} 
                  onPress={() => setSelectedDisease(d)}
                  style={[styles.pill, selectedDisease === d && styles.pillActive]}
                >
                  <Text style={[styles.pillText, selectedDisease === d && styles.pillTextActive]}>{d}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Filtro de Meses */}
          <View style={styles.filterBox}>
            <Text style={styles.filterLabel}>Mes:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pillScroll}>
              {months.map(m => (
                <TouchableOpacity 
                  key={m} 
                  onPress={() => setSelectedMonth(m)}
                  style={[styles.pill, selectedMonth === m && styles.pillActive]}
                >
                  <Text style={[styles.pillText, selectedMonth === m && styles.pillTextActive]}>{m}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </View>

      {/* CONTENEDOR DEL MAPA */}
      <View style={styles.mapContainer}>
        {Platform.OS === 'web' ? (
          <MapContainer 
            center={centerPosition} 
            zoom={13} 
            style={{ height: '100%', width: '100%' }}
            scrollWheelZoom={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {/* Insertamos la capa de calor con los puntos filtrados */}
            <HeatLayer points={heatmapPoints} />
          </MapContainer>
        ) : (
          <View style={styles.fallback}>
            <Text>El mapa está optimizado para la plataforma Web.</Text>
          </View>
        )}

        {/* LEYENDA FLOTANTE */}
        <View style={styles.legend}>
          <Text style={styles.legendTitle}>Severidad del Brote</Text>
          <View style={styles.gradientBar} />
          <View style={styles.legendLabels}>
            <Text style={styles.legendText}>Baja</Text>
            <Text style={styles.legendText}>Alta (Crítica)</Text>
          </View>
          <View style={styles.statusInfo}>
             <Feather name="info" size={12} color="#6b7280" />
             <Text style={styles.statusText}>Mostrando {selectedDisease} en {selectedMonth}</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  header: { paddingBottom: 20 },
  title: { fontSize: 24, fontWeight: '800', color: '#111827' },
  sub: { color: '#6b7280', marginTop: 4 },

  filterSection: { marginTop: 15, gap: 12 },
  filterBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 8, borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb' },
  filterLabel: { fontSize: 12, fontWeight: '700', color: '#374151', width: 70, marginLeft: 10 },
  pillScroll: { gap: 8 },
  pill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: '#f3f4f6' },
  pillActive: { backgroundColor: '#16a34a' },
  pillText: { fontSize: 12, fontWeight: '600', color: '#6b7280' },
  pillTextActive: { color: '#fff' },

  mapContainer: { flex: 1, borderRadius: 24, overflow: 'hidden', borderWidth: 1, borderColor: '#e5e7eb', position: 'relative' },
  fallback: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  legend: {
    position: 'absolute',
    bottom: 25,
    right: 25,
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 15,
    width: 220,
    zIndex: 1000,
    boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
    borderWidth: 1,
    borderColor: '#e5e7eb'
  },
  legendTitle: { fontSize: 12, fontWeight: '800', color: '#1f2937', marginBottom: 10, textAlign: 'center' },
  gradientBar: { height: 8, borderRadius: 4, backgroundColor: 'linear-gradient(to right, #3b82f6, #10b981, #ef4444)' },
  legendLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  legendText: { fontSize: 10, color: '#9ca3af', fontWeight: '600' },
  statusInfo: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12, borderTopWidth: 1, borderTopColor: '#f3f4f6', paddingTop: 8 },
  statusText: { fontSize: 10, color: '#6b7280', fontStyle: 'italic' }
});

export default HeatmapTab;