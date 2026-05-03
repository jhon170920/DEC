// HeatmapTab.jsx (versión corregida)
import React, { useState, useMemo, useEffect, useCallback, Suspense } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
  Platform, ActivityIndicator, Alert
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { scaleLinear } from 'd3-scale';
import api from '../../../../api/api';
import { heatmapTabStyles as styles } from '../styles/heatmapTabStyles';

// 🔁 CAMBIA ESTA URL POR LA DE TU GEOJSON EN CLOUDFLARE R2
const VEREDAS_GEOJSON_URL = process.env.CLOUDFLARE_R2_MAP;

// Escalas
const colorScale = scaleLinear()
  .domain([0, 0.3, 0.7, 1])
  .range(['#3b82f6', '#10b981', '#f59e0b', '#ef4444']);

const radiusScale = scaleLinear().domain([0, 1]).range([3, 18]);

// Carga dinámica del mapa solo en web
const WebMap = Platform.OS === 'web' ? React.lazy(() => import('../webMap/WebMap')) : null;

const HeatmapTab = () => {
  const [selectedDisease, setSelectedDisease] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [allDetections, setAllDetections] = useState([]);
  const [pathologies, setPathologies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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
      const now = new Date();
      const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
      setStartDate(oneMonthAgo.toISOString().slice(0, 10));
      setEndDate(now.toISOString().slice(0, 10));
    } catch (err) {
      setError('Error cargando datos');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Filtrar puntos
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
      start.setHours(0, 0, 0, 0);
      filtered = filtered.filter(d => new Date(d.createdAt) >= start);
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      filtered = filtered.filter(d => new Date(d.createdAt) <= end);
    }

    const points = filtered
      .map(d => {
        const coords = d.location?.coordinates;
        if (!coords?.length === 2) return null;
        const lng = coords[0];
        const lat = coords[1];
        let intensity = typeof d.confidence === 'number' ? d.confidence : 0.5;
        intensity = Math.min(1, Math.max(0, intensity));
        if (isNaN(lat) || !isFinite(lat) || lat < -90 || lat > 90) return null;
        if (isNaN(lng) || !isFinite(lng) || lng < -180 || lng > 180) return null;
        return { lat, lng, intensity };
      })
      .filter(p => p !== null);

    return { heatmapPoints: points, detectionMarkers: points };
  }, [allDetections, selectedDisease, selectedMonth, startDate, endDate, pathologies]);

  const availableMonths = useMemo(() => {
    const monthsSet = new Set();
    allDetections.forEach(d => {
      const monthName = new Date(d.createdAt).toLocaleString('es-ES', { month: 'long' });
      monthsSet.add(monthName);
    });
    const order = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    return Array.from(monthsSet).sort((a, b) => order.indexOf(a.toLowerCase()) - order.indexOf(b.toLowerCase()));
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
        {/* Filtros (sin cambios) */}
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

        <View style={styles.sliderContainer}>
          <Text style={styles.filterLabel}>Tamaño máximo del punto: {heatRadius}px</Text>
          <input
            type="range"
            min="10"
            max="40"
            step="1"
            value={heatRadius}
            onChange={(e) => setHeatRadius(parseInt(e.target.value))}
            style={{ width: '100%', marginTop: 8 }}
          />
        </View>

        <TouchableOpacity style={styles.exportBtn} onPress={exportMapAsImage}>
          <Feather name="camera" size={18} color="#fff" />
          <Text style={styles.exportBtnText}>Exportar mapa como imagen</Text>
        </TouchableOpacity>
      </ScrollView>

      <View style={styles.mapContainer}>
        {Platform.OS === 'web' && WebMap ? (
          <Suspense fallback={
            <View style={styles.center}>
              <ActivityIndicator size="large" color="#16a34a" />
              <Text>Cargando mapa...</Text>
            </View>
          }>
            <WebMap
              geoJsonUrl={VEREDAS_GEOJSON_URL}
              points={heatmapPoints}
              radiusScale={radiusScale}
              colorScale={colorScale}
              heatRadius={heatRadius}
            />
          </Suspense>
        ) : (
          <View style={styles.fallback}>
            <Feather name="map" size={48} color="#9ca3af" />
            <Text style={styles.fallbackText}>
              El mapa de calor solo está disponible en versión web
            </Text>
          </View>
        )}

        {/* Leyenda */}
        <View style={styles.legend}>
          <Text style={styles.legendTitle}>Severidad del Brote</Text>
          <View style={styles.gradientBar}>
            <View style={[styles.gradientSegment, { backgroundColor: '#3b82f6', flex: 1 }]} />
            <View style={[styles.gradientSegment, { backgroundColor: '#10b981', flex: 1 }]} />
            <View style={[styles.gradientSegment, { backgroundColor: '#f59e0b', flex: 1 }]} />
            <View style={[styles.gradientSegment, { backgroundColor: '#ef4444', flex: 1 }]} />
          </View>
          <View style={styles.legendLabels}>
            <Text style={styles.legendText}>Baja</Text>
            <Text style={styles.legendText}>Media</Text>
            <Text style={styles.legendText}>Alta</Text>
            <Text style={styles.legendText}>Crítica</Text>
          </View>
          <Text style={styles.legendNote}>💡 Pasa el mouse sobre los puntos</Text>
          <Text style={styles.legendNote}>📍 {detectionMarkers.length} puntos activos</Text>
        </View>
      </View>
    </View>
  );
};

export default HeatmapTab;