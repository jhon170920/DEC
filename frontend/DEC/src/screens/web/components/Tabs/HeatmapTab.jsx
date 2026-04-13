import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, ActivityIndicator, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import api from '../../../../api/api';

// Importar Leaflet solo en web
let L;
let MapContainer, TileLayer, useMap;

if (Platform.OS === 'web') {
  L = require('leaflet');
  require('leaflet/dist/leaflet.css');
  require('leaflet.heat');
  
  // Solucionar problema de iconos
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  });

  const ReactLeaflet = require('react-leaflet');
  MapContainer = ReactLeaflet.MapContainer;
  TileLayer = ReactLeaflet.TileLayer;
  useMap = ReactLeaflet.useMap;
}

// Componente de capa de calor con marcadores y tooltips
const HeatLayerWithMarkers = ({ points, detections, selectedDisease, selectedMonth }) => {
  if (Platform.OS !== 'web') return null;
  
  const map = useMap();

  useEffect(() => {
    if (!map || !L) return;

    const timeoutId = setTimeout(() => {
      map.invalidateSize();

      // 1. Crear la capa de calor
      const heatLayer = L.heatLayer(points, {
        radius: 25,
        blur: 15,
        maxZoom: 17,
        gradient: { 0.4: '#3b82f6', 0.65: '#10b981', 1: '#ef4444' }
      }).addTo(map);

      // 2. Agrupar detecciones por ubicación cercana (para evitar tooltips superpuestos)
      const groupedDetections = groupDetectionsByLocation(detections);
      
      // 3. Agregar marcadores con tooltips para cada grupo
      const markers = [];
      
      groupedDetections.forEach(group => {
        // Crear un marcador circular pequeño (más sutil que el marcador normal)
        const circleMarker = L.circleMarker([group.lat, group.lng], {
          radius: 8,
          fillColor: getIntensityColor(group.avgIntensity),
          color: '#fff',
          weight: 2,
          opacity: 1,
          fillOpacity: 0.7
        }).addTo(map);
        
        // Tooltip personalizado
        const tooltipContent = `
          <div style="font-family: system-ui, -apple-system, sans-serif; padding: 8px 12px; min-width: 200px;">
            <div style="font-weight: bold; font-size: 14px; color: #1f2937; border-bottom: 1px solid #e5e7eb; padding-bottom: 6px; margin-bottom: 8px;">
              📍 Zona de Incidencia
            </div>
            <div style="font-size: 12px; color: #4b5563; margin-bottom: 6px;">
              <span style="font-weight: 600;">Afección:</span> ${selectedDisease}
            </div>
            <div style="font-size: 12px; color: #4b5563; margin-bottom: 6px;">
              <span style="font-weight: 600;">Detecciones:</span> ${group.count}
            </div>
            <div style="font-size: 12px; color: #4b5563; margin-bottom: 6px;">
              <span style="font-weight: 600;">Confianza promedio:</span> ${Math.round(group.avgIntensity * 100)}%
            </div>
            <div style="font-size: 12px; color: #4b5563; margin-bottom: 6px;">
              <span style="font-weight: 600;">Mes:</span> ${selectedMonth}
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

      // Limpieza
      return () => {
        if (map) {
          map.removeLayer(heatLayer);
          markers.forEach(marker => map.removeLayer(marker));
        }
      };
    }, 200);

    return () => clearTimeout(timeoutId);
  }, [map, points, detections, selectedDisease, selectedMonth]);

  return null;
};

// Función para agrupar detecciones por ubicación (radio de ~50 metros)
const groupDetectionsByLocation = (detections, radiusKm = 0.05) => {
  const groups = [];
  
  detections.forEach(detection => {
    const lat = detection.lat;
    const lng = detection.lng;
    const intensity = detection.intensity;
    
    // Buscar si existe un grupo cercano
    let foundGroup = null;
    for (const group of groups) {
      const distance = calculateDistance(lat, lng, group.lat, group.lng);
      if (distance <= radiusKm) {
        foundGroup = group;
        break;
      }
    }
    
    if (foundGroup) {
      // Agregar al grupo existente
      foundGroup.count++;
      foundGroup.avgIntensity = (foundGroup.avgIntensity * (foundGroup.count - 1) + intensity) / foundGroup.count;
      foundGroup.lat = (foundGroup.lat + lat) / 2;
      foundGroup.lng = (foundGroup.lng + lng) / 2;
    } else {
      // Crear nuevo grupo
      groups.push({
        lat,
        lng,
        count: 1,
        avgIntensity: intensity
      });
    }
  });
  
  return groups;
};

// Calcular distancia entre dos puntos (fórmula de Haversine)
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radio de la Tierra en km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

// Obtener color según intensidad
const getIntensityColor = (intensity) => {
  if (intensity >= 0.7) return '#ef4444'; // Rojo - Alta
  if (intensity >= 0.4) return '#f59e0b'; // Naranja - Media
  return '#3b82f6'; // Azul - Baja
};

// Obtener texto de severidad
const getSeverityText = (intensity) => {
  if (intensity >= 0.7) return 'Alta (Crítica) 🚨';
  if (intensity >= 0.4) return 'Media ⚠️';
  return 'Baja ℹ️';
};

const HeatmapTab = () => {
  const [selectedDisease, setSelectedDisease] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [allDetections, setAllDetections] = useState([]);
  const [pathologies, setPathologies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mapKey, setMapKey] = useState(0);

  const fetchPathologies = useCallback(async () => {
    try {
      const res = await api.get('admin/get-pathologies');
      return res.data.pathologies || [];
    } catch (err) {
      console.error('Error cargando patologías:', err);
      return [];
    }
  }, []);

  const fetchDetections = useCallback(async () => {
    try {
      const res = await api.get('admin/get-detections');
      return res.data.detections || [];
    } catch (err) {
      console.error('Error cargando detecciones:', err);
      throw err;
    }
  }, []);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [pathologiesData, detectionsData] = await Promise.all([
          fetchPathologies(),
          fetchDetections()
        ]);
        
        setPathologies(pathologiesData);
        setAllDetections(detectionsData);
        
        if (pathologiesData.length > 0) {
          setSelectedDisease(pathologiesData[0].name);
        }
        
        const now = new Date();
        const currentMonth = now.toLocaleString('es-ES', { month: 'long' });
        setSelectedMonth(currentMonth);
        
      } catch (err) {
        setError('No se pudieron cargar los datos del mapa');
        Alert.alert('Error', 'Error al cargar los datos');
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [fetchPathologies, fetchDetections]);

  useEffect(() => {
    setMapKey(prev => prev + 1);
  }, [selectedDisease, selectedMonth]);

  // Generar puntos para el mapa de calor y datos para tooltips
  const { heatmapPoints, detectionMarkers } = useMemo(() => {
    if (!allDetections.length) return { heatmapPoints: [], detectionMarkers: [] };

    const selectedPathology = pathologies.find(p => p.name === selectedDisease);
    const pathologyId = selectedPathology?._id;

    let filtered = [...allDetections];

    if (pathologyId) {
      filtered = filtered.filter(d => 
        d.pathologyId?._id === pathologyId || d.pathologyId === pathologyId
      );
    }

    if (selectedMonth) {
      filtered = filtered.filter(d => {
        const date = new Date(d.createdAt);
        const monthName = date.toLocaleString('es-ES', { month: 'long' });
        return monthName.toLowerCase() === selectedMonth.toLowerCase();
      });
    }

    // Puntos para el mapa de calor
    const points = filtered.map(d => {
      const coords = d.location?.coordinates;
      if (coords && coords.length === 2) {
        const lng = coords[0];
        const lat = coords[1];
        const intensity = d.confidence || 0.5;
        return [lat, lng, intensity];
      }
      return null;
    }).filter(p => p !== null);

    // Datos para marcadores (sin agrupar, para tooltips)
    const markers = filtered.map(d => {
      const coords = d.location?.coordinates;
      if (coords && coords.length === 2) {
        return {
          lat: coords[1],
          lng: coords[0],
          intensity: d.confidence || 0.5,
          pathology: d.pathologyId?.name,
          date: d.createdAt
        };
      }
      return null;
    }).filter(m => m !== null);

    if (points.length === 0) {
      return { 
        heatmapPoints: [[2.195, -75.628, 0.1]], 
        detectionMarkers: [] 
      };
    }

    return { heatmapPoints: points, detectionMarkers: markers };
  }, [allDetections, selectedDisease, selectedMonth, pathologies]);

  // Obtener meses únicos
  const availableMonths = useMemo(() => {
    if (!allDetections.length) return [];
    
    const monthsSet = new Set();
    allDetections.forEach(d => {
      const date = new Date(d.createdAt);
      const monthName = date.toLocaleString('es-ES', { month: 'long' });
      monthsSet.add(monthName);
    });
    
    const monthOrder = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 
                        'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    
    return Array.from(monthsSet).sort((a, b) => {
      return monthOrder.indexOf(a.toLowerCase()) - monthOrder.indexOf(b.toLowerCase());
    });
  }, [allDetections]);

  // Obtener enfermedades únicas
  const availableDiseases = useMemo(() => {
    if (!allDetections.length) return [];
    
    const diseasesSet = new Set();
    allDetections.forEach(d => {
      const name = d.pathologyId?.name;
      if (name) diseasesSet.add(name);
    });
    
    return Array.from(diseasesSet);
  }, [allDetections]);

  const centerPosition = [2.195, -75.628];

  // Agregar estilos CSS para tooltips
  useEffect(() => {
    if (Platform.OS === 'web') {
      const style = document.createElement('style');
      style.textContent = `
        .custom-tooltip {
          background: white !important;
          border: 1px solid #e5e7eb !important;
          border-radius: 12px !important;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06) !important;
          font-family: system-ui, -apple-system, sans-serif !important;
        }
        .custom-tooltip::before {
          border-top-color: white !important;
        }
        .leaflet-tooltip-top:before {
          border-top-color: white !important;
        }
      `;
      document.head.appendChild(style);
      return () => {
        document.head.removeChild(style);
      };
    }
  }, []);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#16a34a" />
        <Text style={styles.loadingText}>Cargando datos del mapa...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Feather name="alert-circle" size={40} color="#ef4444" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={() => window.location.reload()}>
          <Text style={styles.retryText}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const diseaseList = availableDiseases.length > 0 ? availableDiseases : [];

  if (diseaseList.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Feather name="map-pin" size={48} color="#9ca3af" />
        <Text style={styles.emptyText}>No hay datos de detecciones para mostrar</Text>
        <Text style={styles.emptySubText}>Las detecciones aparecerán aquí cuando los usuarios reporten incidencias</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Mapa de Calor (Epidemiología)</Text>
          <Text style={styles.sub}>
            Distribución geográfica de afecciones en Garzón
            {allDetections.length > 0 && ` (${allDetections.length} detecciones totales)`}
          </Text>
        </View>

        <View style={styles.filterSection}>
          <View style={styles.filterBox}>
            <Text style={styles.filterLabel}>Afección:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pillScroll}>
              {diseaseList.map(d => (
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

          {availableMonths.length > 0 && (
            <View style={styles.filterBox}>
              <Text style={styles.filterLabel}>Mes:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pillScroll}>
                {availableMonths.map(m => (
                  <TouchableOpacity 
                    key={m} 
                    onPress={() => setSelectedMonth(m)}
                    style={[styles.pill, selectedMonth === m && styles.pillActive]}
                  >
                    <Text style={[styles.pillText, selectedMonth === m && styles.pillTextActive]}>
                      {m.charAt(0).toUpperCase() + m.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>
      </View>

      <View style={styles.mapContainer}>
        {Platform.OS === 'web' && MapContainer ? (
          <MapContainer 
            key={mapKey}
            center={centerPosition} 
            zoom={13} 
            style={{ height: '100%', width: '100%' }}
            scrollWheelZoom={true}
            zoomControl={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <HeatLayerWithMarkers 
              points={heatmapPoints} 
              detections={detectionMarkers}
              selectedDisease={selectedDisease}
              selectedMonth={selectedMonth}
            />
          </MapContainer>
        ) : (
          <View style={styles.fallback}>
            <Feather name="map" size={48} color="#9ca3af" />
            <Text style={styles.fallbackText}>El mapa de calor está optimizado para la plataforma Web</Text>
            <Text style={styles.fallbackSub}>Accede desde un navegador para ver la visualización completa</Text>
          </View>
        )}

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
          <View style={styles.statusInfo}>
            <Feather name="info" size={12} color="#6b7280" />
            <Text style={styles.statusText}>
              💡 Pasa el mouse sobre los puntos para ver detalles
            </Text>
          </View>
          <View style={styles.statusInfo}>
            <Feather name="target" size={12} color="#6b7280" />
            <Text style={styles.statusText}>
              {detectionMarkers.length} puntos de incidencia activos
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  header: { padding: 20, paddingBottom: 10 },
  title: { fontSize: 24, fontWeight: '800', color: '#111827' },
  sub: { color: '#6b7280', marginTop: 4, fontSize: 13 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  loadingText: { marginTop: 12, color: '#6b7280' },
  errorText: { marginTop: 12, color: '#ef4444', textAlign: 'center' },
  emptyText: { marginTop: 16, color: '#6b7280', fontSize: 16, fontWeight: '600', textAlign: 'center' },
  emptySubText: { marginTop: 8, color: '#9ca3af', fontSize: 13, textAlign: 'center' },
  retryBtn: { marginTop: 20, backgroundColor: '#16a34a', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  retryText: { color: '#fff', fontWeight: '700' },

  filterSection: { marginTop: 15, gap: 12 },
  filterBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 8, borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb' },
  filterLabel: { fontSize: 12, fontWeight: '700', color: '#374151', width: 70, marginLeft: 10 },
  pillScroll: { gap: 8, paddingHorizontal: 4 },
  pill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: '#f3f4f6' },
  pillActive: { backgroundColor: '#16a34a' },
  pillText: { fontSize: 12, fontWeight: '600', color: '#6b7280' },
  pillTextActive: { color: '#fff' },

  mapContainer: { flex: 1, borderRadius: 24, overflow: 'hidden', borderWidth: 1, borderColor: '#e5e7eb', position: 'relative', margin: 20, marginTop: 0, minHeight: 500 },
  fallback: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f3f4f6' },
  fallbackText: { marginTop: 16, color: '#6b7280', fontSize: 16, fontWeight: '600', textAlign: 'center' },
  fallbackSub: { marginTop: 8, color: '#9ca3af', fontSize: 13, textAlign: 'center' },

  legend: {
    position: 'absolute',
    bottom: 35,
    right: 35,
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 15,
    width: 260,
    zIndex: 1000,
    boxShadow: Platform.OS === 'web' ? '0 4px 15px rgba(0,0,0,0.1)' : 'none',
    borderWidth: 1,
    borderColor: '#e5e7eb'
  },
  legendTitle: { fontSize: 12, fontWeight: '800', color: '#1f2937', marginBottom: 10, textAlign: 'center' },
  gradientBar: { 
    height: 8, 
    borderRadius: 4, 
    flexDirection: 'row',
    overflow: 'hidden'
  },
  gradientSegment: {
    height: '100%'
  },
  legendLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6, paddingHorizontal: 4 },
  legendText: { fontSize: 10, color: '#9ca3af', fontWeight: '600' },
  statusInfo: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12, borderTopWidth: 1, borderTopColor: '#f3f4f6', paddingTop: 8 },
  statusText: { fontSize: 10, color: '#6b7280', fontStyle: 'italic' }
});

export default HeatmapTab;