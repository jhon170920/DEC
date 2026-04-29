import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, ScrollView, 
  Platform, ActivityIndicator, Alert 
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import api from '../../../../api/api';
import { heatmapTabStyles as styles } from '../styles/heatmapTabStyles';

// Importar Leaflet solo en web
let L;
let MapContainer, TileLayer, useMap;

if (Platform.OS === 'web') {
  L = require('leaflet');
  require('leaflet/dist/leaflet.css');
  require('leaflet.heat');
  
  // Solucionar iconos de Leaflet
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

// Componente de capa de calor (solo web)
const HeatLayerWithMarkers = ({ points, detections, selectedDisease, selectedMonth, heatRadius }) => {
  if (Platform.OS !== 'web' || !L || !useMap) return null;
  
  const map = useMap();

  useEffect(() => {
    if (!map || !L) return;

    const timeoutId = setTimeout(() => {
      map.invalidateSize();

      // Capa de calor
      const heatLayer = L.heatLayer(points, {
        radius: heatRadius,
        blur: 15,
        maxZoom: 17,
        gradient: { 0.4: '#3b82f6', 0.65: '#10b981', 1: '#ef4444' }
      }).addTo(map);

      // Agrupar detecciones para tooltips
      const grouped = groupDetectionsByLocation(detections);
      const markers = [];
      
      grouped.forEach(group => {
        const circleMarker = L.circleMarker([group.lat, group.lng], {
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

      return () => {
        if (map) {
          map.removeLayer(heatLayer);
          markers.forEach(m => map.removeLayer(m));
        }
      };
    }, 200);

    return () => clearTimeout(timeoutId);
  }, [map, points, detections, selectedDisease, selectedMonth, heatRadius]);

  return null;
};

// Funciones auxiliares (sin cambios)
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
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
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

const HeatmapTab = () => {
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
      setStartDate(oneMonthAgo.toISOString().slice(0,10));
      setEndDate(now.toISOString().slice(0,10));
    } catch (err) {
      setError('Error cargando datos');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    setMapKey(prev => prev + 1);
  }, [selectedDisease, selectedMonth, startDate, endDate, heatRadius]);

  const { heatmapPoints, detectionMarkers } = useMemo(() => {
    if (!allDetections.length) return { heatmapPoints: [], detectionMarkers: [] };
    const selectedPathology = pathologies.find(p => p.name === selectedDisease);
    const pathologyId = selectedPathology?._id;
    let filtered = [...allDetections];
    if (pathologyId) {
      filtered = filtered.filter(d => d.pathologyId?._id === pathologyId || d.pathologyId === pathologyId);
    }
    if (selectedMonth) {
      filtered = filtered.filter(d => {
        const monthName = new Date(d.createdAt).toLocaleString('es-ES', { month: 'long' });
        return monthName.toLowerCase() === selectedMonth.toLowerCase();
      });
    }
    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0,0,0,0);
      filtered = filtered.filter(d => new Date(d.createdAt) >= start);
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23,59,59,999);
      filtered = filtered.filter(d => new Date(d.createdAt) <= end);
    }
    const points = filtered.map(d => {
      const coords = d.location?.coordinates;
      if (coords?.length === 2) return [coords[1], coords[0], d.confidence || 0.5];
      return null;
    }).filter(p => p !== null);
    const markers = filtered.map(d => {
      const coords = d.location?.coordinates;
      if (coords?.length === 2) return { lat: coords[1], lng: coords[0], intensity: d.confidence || 0.5 };
      return null;
    }).filter(m => m !== null);
    if (points.length === 0) return { heatmapPoints: [[2.195, -75.628, 0.1]], detectionMarkers: [] };
    return { heatmapPoints: points, detectionMarkers: markers };
  }, [allDetections, selectedDisease, selectedMonth, startDate, endDate, pathologies]);

  const availableMonths = useMemo(() => {
    const monthsSet = new Set();
    allDetections.forEach(d => {
      const monthName = new Date(d.createdAt).toLocaleString('es-ES', { month: 'long' });
      monthsSet.add(monthName);
    });
    const order = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
    return Array.from(monthsSet).sort((a,b) => order.indexOf(a.toLowerCase()) - order.indexOf(b.toLowerCase()));
  }, [allDetections]);

  const availableDiseases = useMemo(() => {
    const set = new Set();
    allDetections.forEach(d => { if (d.pathologyId?.name) set.add(d.pathologyId.name); });
    return Array.from(set);
  }, [allDetections]);

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

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#16a34a" /><Text>Cargando mapa...</Text></View>;
  if (error) return <View style={styles.center}><Text style={{color:'red'}}>{error}</Text></View>;

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
              <TouchableOpacity key={d} onPress={() => setSelectedDisease(d)} style={[styles.pill, selectedDisease === d && styles.pillActive]}>
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
              <TouchableOpacity onPress={() => setSelectedMonth('')} style={[styles.pill, selectedMonth === '' && styles.pillActive]}>
                <Text style={[styles.pillText, selectedMonth === '' && styles.pillTextActive]}>Todos</Text>
              </TouchableOpacity>
              {availableMonths.map(m => (
                <TouchableOpacity key={m} onPress={() => setSelectedMonth(m)} style={[styles.pill, selectedMonth === m && styles.pillActive]}>
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
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={styles.dateInput} />
          </View>
          <View style={styles.dateInputGroup}>
            <Text style={styles.filterLabel}>Fecha fin</Text>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} style={styles.dateInput} />
          </View>
        </View>

        {/* Slider nativo para web */}
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

      {/* Mapa */}
      <View style={styles.mapContainer}>
        {Platform.OS === 'web' && MapContainer ? (
          <MapContainer
            key={mapKey}
            center={[2.195, -75.628]}
            zoom={13}
            style={{ height: '100%', width: '100%' }}
            scrollWheelZoom
            zoomControl
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap' />
            <HeatLayerWithMarkers
              points={heatmapPoints}
              detections={detectionMarkers}
              selectedDisease={selectedDisease}
              selectedMonth={selectedMonth || 'todos'}
              heatRadius={heatRadius}
            />
          </MapContainer>
        ) : (
          <View style={styles.fallback}>
            <Feather name="map" size={48} color="#9ca3af" />
            <Text style={styles.fallbackText}>Mapa disponible solo en web</Text>
          </View>
        )}

        {/* Leyenda */}
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

export default HeatmapTab;