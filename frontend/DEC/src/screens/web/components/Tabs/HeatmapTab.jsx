import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Platform, ActivityIndicator, Alert
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import api from '../../../../api/api';

// ============================================
// COMPONENTE PRINCIPAL
// ============================================
const HeatmapTab = () => {
  // Estados de datos y filtros
  const [selectedDisease, setSelectedDisease] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [allDetections, setAllDetections] = useState([]);
  const [pathologies, setPathologies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mapKey, setMapKey] = useState(0);
  const [heatRadius, setHeatRadius] = useState(25);

  // Estados para Leaflet (carga dinámica)
  const [leafletReady, setLeafletReady] = useState(false);
  const [L, setL] = useState(null);
  const [MapContainer, setMapContainer] = useState(null);
  const [TileLayer, setTileLayer] = useState(null);
  const [useMap, setUseMap] = useState(null);

  // ========== CARGA DINÁMICA DE LEAFLET (SOLO WEB) ==========
  useEffect(() => {
    if (Platform.OS !== 'web') return;

    const loadLeaflet = async () => {
      try {
        // 1. Importar Leaflet y sus estilos
        const leafletModule = await import('leaflet');
        const L_ = leafletModule.default;
        await import('leaflet/dist/leaflet.css');
        await import('leaflet.heat');

        // 2. Configurar iconos (evitar problemas con imágenes)
        delete L_.Icon.Default.prototype._getIconUrl;
        L_.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        });

        // 3. Importar componentes de react-leaflet
        const ReactLeaflet = await import('react-leaflet');

        setL(L_);
        setMapContainer(() => ReactLeaflet.MapContainer);
        setTileLayer(() => ReactLeaflet.TileLayer);
        setUseMap(() => ReactLeaflet.useMap);
        setLeafletReady(true);
      } catch (err) {
        console.error('Error cargando Leaflet:', err);
        Alert.alert('Error', 'No se pudo cargar el mapa. Verifica tu conexión.');
      }
    };

    loadLeaflet();
  }, []);

  // ========== OBTENER DATOS DEL BACKEND ==========
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [resPath, resDet] = await Promise.all([
        api.get('admin/get-pathologies'),
        api.get('admin/get-detections')
      ]);
      setPathologies(resPath.data.pathologies || []);
      setAllDetections(resDet.data.detections || []);
      if (resPath.data.pathologies.length > 0) {
        setSelectedDisease(resPath.data.pathologies[0].name);
      }
      // Fechas por defecto: último mes
      const now = new Date();
      const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
      setStartDate(oneMonthAgo.toISOString().slice(0, 10));
      setEndDate(now.toISOString().slice(0, 10));
    } catch (err) {
      console.error(err);
      setError('Error cargando datos del mapa');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Forzar refresco del mapa cuando cambian filtros o radio
  useEffect(() => {
    setMapKey(prev => prev + 1);
  }, [selectedDisease, selectedMonth, startDate, endDate, heatRadius]);

  // ========== PROCESAR DATOS PARA EL MAPA ==========
  const { heatmapPoints, detectionMarkers } = useMemo(() => {
    if (!allDetections.length) return { heatmapPoints: [], detectionMarkers: [] };

    const selectedPathology = pathologies.find(p => p.name === selectedDisease);
    const pathologyId = selectedPathology?._id;

    let filtered = [...allDetections];

    // Filtro por enfermedad
    if (pathologyId) {
      filtered = filtered.filter(d =>
        d.pathologyId?._id === pathologyId || d.pathologyId === pathologyId
      );
    }

    // Filtro por mes (nombre del mes)
    if (selectedMonth) {
      filtered = filtered.filter(d => {
        const monthName = new Date(d.createdAt).toLocaleString('es-ES', { month: 'long' });
        return monthName.toLowerCase() === selectedMonth.toLowerCase();
      });
    }

    // Filtro por rango de fechas
    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      filtered = filtered.filter(d => new Date(d.createdAt) >= start);
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      filtered = filtered.filter(d => new Date(d.createdAt) <= end);
    }

    // Puntos para el mapa de calor (lat, lng, intensidad)
    const points = filtered.map(d => {
      const coords = d.location?.coordinates;
      if (coords?.length === 2) return [coords[1], coords[0], d.confidence || 0.5];
      return null;
    }).filter(p => p !== null);

    // Marcadores para tooltips (sin agrupar aún)
    const markers = filtered.map(d => {
      const coords = d.location?.coordinates;
      if (coords?.length === 2) {
        return { lat: coords[1], lng: coords[0], intensity: d.confidence || 0.5 };
      }
      return null;
    }).filter(m => m !== null);

    if (points.length === 0) {
      return { heatmapPoints: [[2.195, -75.628, 0.1]], detectionMarkers: [] };
    }
    return { heatmapPoints: points, detectionMarkers: markers };
  }, [allDetections, selectedDisease, selectedMonth, startDate, endDate, pathologies]);

  // ========== LISTAS ÚNICAS PARA FILTROS ==========
  const availableMonths = useMemo(() => {
    const monthsSet = new Set();
    allDetections.forEach(d => {
      const monthName = new Date(d.createdAt).toLocaleString('es-ES', { month: 'long' });
      monthsSet.add(monthName);
    });
    const order = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    return Array.from(monthsSet).sort((a, b) =>
      order.indexOf(a.toLowerCase()) - order.indexOf(b.toLowerCase())
    );
  }, [allDetections]);

  const availableDiseases = useMemo(() => {
    const set = new Set();
    allDetections.forEach(d => {
      if (d.pathologyId?.name) set.add(d.pathologyId.name);
    });
    return Array.from(set);
  }, [allDetections]);

  // ========== EXPORTAR MAPA COMO IMAGEN ==========
  const exportMapAsImage = async () => {
    if (Platform.OS !== 'web') return Alert.alert('Solo disponible en web');
    try {
      const html2canvas = (await import('html2canvas')).default;
      const mapElement = document.querySelector('.leaflet-container');
      if (!mapElement) throw new Error('Mapa no encontrado');
      const canvas = await html2canvas(mapElement, { scale: 2, backgroundColor: '#ffffff' });
      const link = document.createElement('a');
      link.download = `mapa_${selectedDisease}_${selectedMonth || 'general'}.png`;
      link.href = canvas.toDataURL();
      link.click();
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'No se pudo exportar el mapa');
    }
  };

  // ========== COMPONENTE DE CAPA DE CALOR (usando props L y useMap) ==========
  const HeatLayerWithMarkers = useCallback(({ points, detections, disease, month, radius, leafletL, leafletUseMap }) => {
    const map = leafletUseMap();
    useEffect(() => {
      if (!map || !leafletL) return;

      const timeoutId = setTimeout(() => {
        map.invalidateSize();

        // Capa de calor
        const heatLayer = leafletL.heatLayer(points, {
          radius: radius,
          blur: 15,
          maxZoom: 17,
          gradient: { 0.4: '#3b82f6', 0.65: '#10b981', 1: '#ef4444' }
        }).addTo(map);

        // Agrupar detecciones para tooltips
        const grouped = groupDetectionsByLocation(detections);
        const markers = [];

        grouped.forEach(group => {
          const circleMarker = leafletL.circleMarker([group.lat, group.lng], {
            radius: 8,
            fillColor: getIntensityColor(group.avgIntensity),
            color: '#fff',
            weight: 2,
            opacity: 1,
            fillOpacity: 0.7
          }).addTo(map);

          const tooltipContent = `
            <div style="font-family: system-ui; padding: 8px 12px; min-width: 200px;">
              <div style="font-weight: bold; font-size: 14px; color: #1f2937; border-bottom: 1px solid #e5e7eb; padding-bottom: 6px; margin-bottom: 8px;">
                📍 Zona de Incidencia
              </div>
              <div style="font-size: 12px; color: #4b5563; margin-bottom: 6px;">
                <span style="font-weight: 600;">Afección:</span> ${disease}
              </div>
              <div style="font-size: 12px; color: #4b5563; margin-bottom: 6px;">
                <span style="font-weight: 600;">Detecciones:</span> ${group.count}
              </div>
              <div style="font-size: 12px; color: #4b5563; margin-bottom: 6px;">
                <span style="font-weight: 600;">Confianza promedio:</span> ${Math.round(group.avgIntensity * 100)}%
              </div>
              <div style="font-size: 12px; color: #4b5563; margin-bottom: 6px;">
                <span style="font-weight: 600;">Mes:</span> ${month}
              </div>
              <div style="font-size: 11px; color: #6b7280; margin-top: 6px; padding-top: 4px; border-top: 1px solid #f3f4f6;">
                🔬 Severidad: ${getSeverityText(group.avgIntensity)}
              </div>
            </div>
          `;

          circleMarker.bindTooltip(tooltipContent, {
            permanent: false,
            direction: 'top',
            offset: [0, -10],
            opacity: 0.95,
            className: 'custom-tooltip'
          });

          markers.push(circleMarker);
        });

        return () => {
          if (map) {
            map.removeLayer(heatLayer);
            markers.forEach(m => map.removeLayer(m));
          }
        };
      }, 200);

      return () => clearTimeout(timeoutId);
    }, [map, points, detections, disease, month, radius, leafletL]);

    return null;
  }, []);

  // ========== FUNCIONES AUXILIARES (sin cambios) ==========
  const groupDetectionsByLocation = (detections, radiusKm = 0.05) => {
    const groups = [];
    detections.forEach(detection => {
      const { lat, lng, intensity } = detection;
      let found = null;
      for (const g of groups) {
        const dist = calculateDistance(lat, lng, g.lat, g.lng);
        if (dist <= radiusKm) { found = g; break; }
      }
      if (found) {
        found.count++;
        found.avgIntensity = (found.avgIntensity * (found.count - 1) + intensity) / found.count;
        found.lat = (found.lat + lat) / 2;
        found.lng = (found.lng + lng) / 2;
      } else {
        groups.push({ lat, lng, count: 1, avgIntensity: intensity });
      }
    });
    return groups;
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const getIntensityColor = (intensity) => {
    if (intensity >= 0.7) return '#ef4444';
    if (intensity >= 0.4) return '#f59e0b';
    return '#3b82f6';
  };

  const getSeverityText = (intensity) => {
    if (intensity >= 0.7) return 'Alta (Crítica) 🚨';
    if (intensity >= 0.4) return 'Media ⚠️';
    return 'Baja ℹ️';
  };

  // ========== RENDERIZADO ==========
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#16a34a" />
        <Text>Cargando datos...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={{ color: 'red' }}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mapa de Calor (Epidemiología)</Text>
        <Text style={styles.sub}>Distribución geográfica de afecciones en Garzón</Text>
      </View>

      <ScrollView style={styles.filterSection} contentContainerStyle={{ paddingBottom: 20 }}>
        {/* Filtro enfermedad */}
        <View style={styles.filterRow}>
          <Text style={styles.filterLabel}>Afección:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pillScroll}>
            {availableDiseases.map(d => (
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

        {/* Filtro mes */}
        {availableMonths.length > 0 && (
          <View style={styles.filterRow}>
            <Text style={styles.filterLabel}>Mes:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pillScroll}>
              <TouchableOpacity
                onPress={() => setSelectedMonth('')}
                style={[styles.pill, selectedMonth === '' && styles.pillActive]}
              >
                <Text style={[styles.pillText, selectedMonth === '' && styles.pillTextActive]}>Todos</Text>
              </TouchableOpacity>
              {availableMonths.map(m => (
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
        )}

        {/* Filtro fechas */}
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
        </View>

        {/* Slider para radio del mapa de calor */}
        <View style={styles.sliderContainer}>
          <Text style={styles.filterLabel}>Radio del mapa de calor: {heatRadius}px</Text>
          <input
            type="range"
            min="10"
            max="60"
            step="1"
            value={heatRadius}
            onChange={(e) => setHeatRadius(parseInt(e.target.value))}
            style={{ width: '100%', marginTop: 8 }}
          />
        </View>

        {/* Botón exportar */}
        <TouchableOpacity style={styles.exportBtn} onPress={exportMapAsImage}>
          <Feather name="camera" size={18} color="#fff" />
          <Text style={styles.exportBtnText}>Exportar mapa como imagen</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Contenedor del mapa */}
      <View style={styles.mapContainer}>
        {Platform.OS === 'web' && leafletReady && MapContainer && L && useMap ? (
          <MapContainer
            key={mapKey}
            center={[2.195, -75.628]}
            zoom={13}
            style={{ height: '100%', width: '100%' }}
            scrollWheelZoom
            zoomControl
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            />
            <HeatLayerWithMarkers
              points={heatmapPoints}
              detections={detectionMarkers}
              disease={selectedDisease}
              month={selectedMonth || 'todos'}
              radius={heatRadius}
              leafletL={L}
              leafletUseMap={useMap}
            />
          </MapContainer>
        ) : (
          <View style={styles.fallback}>
            <Feather name="map" size={48} color="#9ca3af" />
            <Text style={styles.fallbackText}>Cargando mapa...</Text>
          </View>
        )}

        {/* Leyenda flotante */}
        <View style={styles.legend}>
          <Text style={styles.legendTitle}>Severidad del Brote</Text>
          <View style={styles.gradientBar}>
            <View style={[styles.gradientSegment, { backgroundColor: '#3b82f6', flex: 1 }]} />
            <View style={[styles.gradientSegment, { backgroundColor: '#f59e0b', flex: 1 }]} />
            <View style={[styles.gradientSegment, { backgroundColor: '#ef4444', flex: 1 }]} />
          </View>
          <View style={styles.legendLabels}>
            <Text style={styles.legendText}>Baja</Text>
            <Text style={styles.legendText}>Media</Text>
            <Text style={styles.legendText}>Alta</Text>
          </View>
          <Text style={styles.legendNote}>💡 Pasa el mouse sobre los puntos</Text>
          <Text style={styles.legendNote}>📍 {detectionMarkers.length} puntos activos</Text>
        </View>
      </View>
    </View>
  );
};

// ========== ESTILOS ==========
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  header: { padding: 20, paddingBottom: 0 },
  title: { fontSize: 24, fontWeight: '800', color: '#111827' },
  sub: { color: '#6b7280', marginTop: 4 },
  filterSection: { padding: 20, maxHeight: 280 },
  filterRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', marginBottom: 16, gap: 10 },
  filterLabel: { fontSize: 14, fontWeight: '700', color: '#374151', width: 70 },
  pillScroll: { flex: 1, flexDirection: 'row' },
  pill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: '#f3f4f6', marginRight: 8 },
  pillActive: { backgroundColor: '#16a34a' },
  pillText: { fontSize: 12, fontWeight: '600', color: '#6b7280' },
  pillTextActive: { color: '#fff' },
  dateFilterRow: { flexDirection: 'row', gap: 16, marginBottom: 16, flexWrap: 'wrap', alignItems: 'flex-end' },
  dateInputGroup: { flex: 1, minWidth: Platform.OS === 'web' ? 200 : '100%' },
  dateInput: { padding: 10, borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, fontSize: 14, backgroundColor: '#fff', width: '100%', boxSizing: 'border-box' },
  sliderContainer: { marginBottom: 16 },
  exportBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#16a34a', padding: 12, borderRadius: 10 },
  exportBtnText: { color: '#fff', fontWeight: '700' },
  mapContainer: { flex: 1, borderRadius: 20, overflow: 'hidden', margin: 20, marginTop: 0, position: 'relative', minHeight: 500 },
  fallback: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f3f4f6' },
  fallbackText: { marginTop: 16, color: '#6b7280', fontSize: 16 },
  legend: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 15,
    width: 240,
    zIndex: 1000,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    ...Platform.select({ web: { boxShadow: '0 4px 15px rgba(0,0,0,0.1)' } })
  },
  legendTitle: { fontSize: 12, fontWeight: '800', color: '#1f2937', marginBottom: 10, textAlign: 'center' },
  gradientBar: { flexDirection: 'row', height: 8, borderRadius: 4, overflow: 'hidden' },
  gradientSegment: { height: '100%' },
  legendLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6, paddingHorizontal: 4 },
  legendText: { fontSize: 10, color: '#9ca3af', fontWeight: '600' },
  legendNote: { fontSize: 10, color: '#6b7280', marginTop: 8, textAlign: 'center' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' }
});

export default HeatmapTab;