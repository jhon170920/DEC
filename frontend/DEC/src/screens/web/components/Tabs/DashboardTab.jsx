import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, ActivityIndicator,
  Dimensions, Platform, TouchableOpacity, Alert, Modal, FlatList
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import api from '../../../../api/api';
import { dashboardTabStyles as styles } from '../styles/dashbordTabStyles';

const { width } = Dimensions.get('window');

const DashboardTab = () => {
  // Estados para los inputs (valores temporales)
  const [tempStartDate, setTempStartDate] = useState('');
  const [tempEndDate, setTempEndDate] = useState('');

  // Estados para los filtros realmente aplicados
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');

  // Estados para el filtro de patología
  const [pathologiesList, setPathologiesList] = useState([]);
  const [selectedPathologyId, setSelectedPathologyId] = useState(null); // null = todas
  const [modalVisible, setModalVisible] = useState(false);

  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState({
    totalUsers: 0,
    totalDetections: 0,
    totalPathologies: 0,
    avgConfidence: 0,
    previousUsers: 0,
    previousDetections: 0,
    usersTrend: 0,
    detectionsTrend: 0
  });
  const [pieData, setPieData] = useState([]);
  const [barData, setBarData] = useState([]);
  const [weeklyData, setWeeklyData] = useState([]);
  const [topPathologies, setTopPathologies] = useState([]);
  const [recentDetections, setRecentDetections] = useState([]);

  // Obtener lista de patologías al montar
  useEffect(() => {
    const fetchPathologies = async () => {
      try {
        const res = await api.get('admin/get-pathologies');
        setPathologiesList(res.data.pathologies || []);
      } catch (error) {
        console.error('Error cargando patologías:', error);
      }
    };
    fetchPathologies();
  }, []);

  // Función que obtiene los datos usando los filtros aplicados y la patología seleccionada
  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const [usersRes, detectionsRes, pathologiesRes] = await Promise.all([
        api.get('admin/get-users'),
        api.get('admin/get-detections'),
        api.get('admin/get-pathologies')
      ]);

      const users = usersRes.data.users || [];
      let detections = detectionsRes.data.detections || [];
      const pathologies = pathologiesRes.data.pathologies || [];

      // --- FILTRO POR PATOLOGÍA ---
      if (selectedPathologyId) {
        detections = detections.filter(d => d.pathologyId?._id === selectedPathologyId);
      }

      // --- FILTRO POR FECHAS ---
      let filteredDetections = [...detections];
      if (filterStartDate) {
        const start = new Date(filterStartDate);
        start.setHours(0, 0, 0, 0);
        filteredDetections = filteredDetections.filter(d => new Date(d.createdAt) >= start);
      }
      if (filterEndDate) {
        const end = new Date(filterEndDate);
        end.setHours(23, 59, 59, 999);
        filteredDetections = filteredDetections.filter(d => new Date(d.createdAt) <= end);
      }

      // Calcular período anterior solo si hay fechas aplicadas
      let previousDetections = 0;
      let usersTrend = 0;
      let detectionsTrend = 0;
      if (filterStartDate && filterEndDate) {
        const startPrev = new Date(filterStartDate);
        const endPrev = new Date(filterEndDate);
        const duration = endPrev - startPrev;
        startPrev.setTime(startPrev.getTime() - duration);
        endPrev.setTime(endPrev.getTime() - duration);
        // Filtramos también por patología en el período anterior
        let prevDetections = detections.filter(d => {
          const date = new Date(d.createdAt);
          return date >= startPrev && date <= endPrev;
        });
        if (selectedPathologyId) {
          prevDetections = prevDetections.filter(d => d.pathologyId?._id === selectedPathologyId);
        }
        previousDetections = prevDetections.length;

        // Tendencias (simuladas para usuarios)
        const previousUsers = Math.max(0, users.length - 5);
        usersTrend = previousUsers > 0 ? ((users.length - previousUsers) / previousUsers * 100).toFixed(1) : 0;
        detectionsTrend = previousDetections > 0 ? ((filteredDetections.length - previousDetections) / previousDetections * 100).toFixed(1) : 0;
      }

      // KPIs
      const totalUsers = users.length;
      const totalDetections = filteredDetections.length;
      const totalPathologies = pathologies.length;
      const avgConfidence = filteredDetections.length
        ? (filteredDetections.reduce((sum, d) => sum + (d.confidence || 0), 0) / filteredDetections.length * 100).toFixed(1)
        : 0;

      setKpis({
        totalUsers,
        totalDetections,
        totalPathologies,
        avgConfidence,
        previousUsers: 0,
        previousDetections,
        usersTrend,
        detectionsTrend
      });

      // Datos para gráfico de torta (solo sobre las detecciones filtradas)
      const pathologyCounts = {};
      filteredDetections.forEach(d => {
        const name = d.pathologyId?.name || 'Desconocida';
        pathologyCounts[name] = (pathologyCounts[name] || 0) + 1;
      });
      const pieChartData = Object.entries(pathologyCounts).map(([name, value], idx) => ({
        name,
        value,
        percentage: totalDetections > 0 ? Math.round((value / totalDetections) * 100) : 0,
        color: getColor(idx)
      }));
      setPieData(pieChartData);

      // Top 5
      const top5 = [...pieChartData].sort((a, b) => b.value - a.value).slice(0, 5);
      setTopPathologies(top5);

      // Barras mensuales (últimos 6 meses)
      const now = new Date();
      const last6Months = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        last6Months.push(d);
      }
      const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
      const barChartData = last6Months.map(date => {
        const month = date.getMonth();
        const year = date.getFullYear();
        const count = filteredDetections.filter(d => {
          const dDate = new Date(d.createdAt);
          return dDate.getMonth() === month && dDate.getFullYear() === year;
        }).length;
        return { month: monthNames[month], detections: count };
      });
      setBarData(barChartData);

      // Datos semanales (últimos 7 días)
      const weekly = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        d.setHours(0, 0, 0, 0);
        const nextDay = new Date(d);
        nextDay.setDate(d.getDate() + 1);
        const count = filteredDetections.filter(det => {
          const detDate = new Date(det.createdAt);
          return detDate >= d && detDate < nextDay;
        }).length;
        weekly.push({ day: d.toLocaleDateString('es-ES', { weekday: 'short' }), detections: count });
      }
      setWeeklyData(weekly);

      // Últimas 5 detecciones
      const recent = [...filteredDetections]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);
      setRecentDetections(recent);

    } catch (error) {
      console.error('Error cargando dashboard:', error);
      Alert.alert('Error', 'No se pudieron cargar los datos');
    } finally {
      setLoading(false);
    }
  }, [filterStartDate, filterEndDate, selectedPathologyId]);

  // Carga inicial y cuando cambian los filtros aplicados o la patología
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Aplicar filtros de fecha
  const applyFilters = () => {
    setFilterStartDate(tempStartDate);
    setFilterEndDate(tempEndDate);
  };

  // Limpiar filtros de fecha
  const clearFilters = () => {
    setTempStartDate('');
    setTempEndDate('');
    setFilterStartDate('');
    setFilterEndDate('');
  };

  // Seleccionar patología desde el modal
  const selectPathology = (id) => {
    setSelectedPathologyId(id);
    setModalVisible(false);
  };

  // Obtener nombre de la patología seleccionada para mostrar en la tarjeta
  const getSelectedPathologyName = () => {
    if (!selectedPathologyId) return 'Todas';
    const found = pathologiesList.find(p => p._id === selectedPathologyId);
    return found ? found.name : 'Todas';
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#16a34a" />
        <Text style={styles.loadingText}>Cargando dashboard...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} id="dashboard-content">
      {/* Barra de filtros */}
      <View style={[styles.filterBar, width < 480 && styles.filterBarResponsiveSmall]}>
        <View style={[styles.dateFilterRow, width < 480 && styles.dateFilterRowResposiveSmall]}>
          <div>
            <Text style={styles.filterLabel}>Fecha inicio</Text>
            <input
              type="date"
              value={tempStartDate}
              onChange={(e) => setTempStartDate(e.target.value)}
              className="date-input"
              style={styles.dateInput}
            />
          </div>
          <div>
            <Text style={styles.filterLabel}>Fecha fin</Text>
            <input
              type="date"
              value={tempEndDate}
              onChange={(e) => setTempEndDate(e.target.value)}
              className="date-input"
              style={styles.dateInput}
            />
          </div>
        </View>

        {/* Botones Aplicar y Limpiar (sin Exportar PDF) */}
        <View style={[styles.filterActions, width < 480 && styles.filterActionsResponsiveSmall]}>
          <TouchableOpacity style={[styles.exportBtn, { backgroundColor: '#16a34a' }]} onPress={applyFilters}>
            <Feather name="check" size={16} color="#fff" />
            <Text style={styles.exportBtnText}>Aplicar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.exportBtn, { backgroundColor: '#6b7280' }]} onPress={clearFilters}>
            <Feather name="x" size={16} color="#fff" />
            <Text style={styles.exportBtnText}>Limpiar</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* KPIs - La tarjeta de Patologías es clickeable */}
      <View style={styles.kpiRow}>
        <KpiCard title="Usuarios" value={kpis.totalUsers} trend={kpis.usersTrend} icon="users" color="#3b82f6" />
        <KpiCard title="Detecciones" value={kpis.totalDetections} trend={kpis.detectionsTrend} icon="camera" color="#16a34a" />
        <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.kpiCard}>
          <View style={[styles.kpiIcon, { backgroundColor: '#f59e0b15' }]}>
            <Feather name="book" size={24} color="#f59e0b" />
          </View>
          <Text style={styles.kpiValue}>{kpis.totalPathologies}</Text>
          <Text style={styles.kpiTitle}>Patologías</Text>
          <Text style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>
            Filtro: {getSelectedPathologyName()}
          </Text>
          <Feather name="chevron-down" size={16} color="#9ca3af" style={{ marginTop: 4 }} />
        </TouchableOpacity>
        <KpiCard title="Confianza Prom." value={`${kpis.avgConfidence}%`} icon="trending-up" color="#8b5cf6" />
      </View>

      {/* Gráficos */}
      <View style={[styles.chartsRow, width < 480 && styles.chartRowResponsiveSmall]}>
        <View style={[styles.chartCard, width < 480 && styles.chartCardResponsiveSmall]}>
          <Text style={styles.chartTitle}>Distribución por Afección</Text>
          {pieData.length > 0 ? (
            pieData.map((item, idx) => (
              <View key={idx} style={styles.distributionBar}>
                <View style={styles.distributionLabel}>
                  <Text style={styles.distributionName}>{item.name}</Text>
                  <Text style={styles.distributionValue}>{item.value} ({item.percentage}%)</Text>
                </View>
                <View style={styles.distributionBarBg}>
                  <View style={[styles.distributionBarFill, { width: `${item.percentage}%`, backgroundColor: item.color }]} />
                </View>
              </View>
            ))
          ) : <Text style={styles.noData}>Sin datos</Text>}
        </View>

        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Evolución Mensual</Text>
          {barData.length > 0 ? (
            barData.map((item, idx) => {
              const maxBar = Math.max(...barData.map(b => b.detections), 1);
              return (
                <View key={idx} style={styles.distributionBar}>
                  <View style={styles.distributionLabel}>
                    <Text style={styles.distributionName}>{item.month}</Text>
                    <Text style={styles.distributionValue}>{item.detections}</Text>
                  </View>
                  <View style={styles.distributionBarBg}>
                    <View style={[styles.distributionBarFill, { width: `${(item.detections / maxBar) * 100}%`, backgroundColor: '#16a34a' }]} />
                  </View>
                </View>
              );
            })
          ) : <Text style={styles.noData}>Sin datos</Text>}
        </View>
      </View>

      {/* Tendencia semanal */}
      <View style={styles.fullWidthCard}>
        <Text style={styles.chartTitle}>Tendencia de la Última Semana</Text>
        {weeklyData.length > 0 ? (
          <View style={styles.weeklyContainer}>
            {weeklyData.map((item, idx) => (
              <View key={idx} style={styles.weeklyBar}>
                <Text style={styles.weeklyLabel}>{item.day}</Text>
                <View style={styles.weeklyBarBg}>
                  <View style={[styles.weeklyBarFill, { height: `${Math.min((item.detections / Math.max(...weeklyData.map(w => w.detections), 1)) * 100, 100)}%` }]} />
                </View>
                <Text style={styles.weeklyValue}>{item.detections}</Text>
              </View>
            ))}
          </View>
        ) : <Text style={styles.noData}>Sin datos</Text>}
      </View>

      {/* Top y recientes */}
      <View style={styles.twoColumns}>
        <View style={[styles.fullWidthCard, width < 480 && styles.fullWidthCardResponsiveSmall]}>
          <Text style={styles.chartTitle}>Top 5 Patologías</Text>
          {topPathologies.length > 0 ? (
            topPathologies.map((item, idx) => (
              <View key={idx} style={styles.topItem}>
                <Text style={styles.topRank}>{idx + 1}</Text>
                <Text style={styles.topName}>{item.name}</Text>
                <Text style={styles.topValue}>{item.value} casos</Text>
              </View>
            ))
          ) : <Text style={styles.noData}>Sin datos</Text>}
        </View>

        <View style={styles.fullWidthCard}>
          <Text style={styles.chartTitle}>Últimas Detecciones</Text>
          {recentDetections.length > 0 ? (
            recentDetections.map((det, idx) => (
              <View key={idx} style={styles.recentItem}>
                <Text style={styles.recentDate}>{new Date(det.createdAt).toLocaleDateString()}</Text>
                <Text style={styles.recentPathology}>{det.pathologyId?.name || '—'}</Text>
                <Text style={styles.recentConfidence}>{Math.round((det.confidence || 0) * 100)}%</Text>
              </View>
            ))
          ) : <Text style={styles.noData}>Sin detecciones</Text>}
        </View>
      </View>

      {/* Modal de selección de patología */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Seleccionar Patología</Text>
            <FlatList
              data={[{ _id: null, name: 'Todas' }, ...pathologiesList]}
              keyExtractor={(item) => item._id || 'all'}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.pathologyItem,
                    selectedPathologyId === item._id && styles.pathologyItemSelected
                  ]}
                  onPress={() => selectPathology(item._id)}
                >
                  <Text style={[
                    styles.pathologyItemText,
                    selectedPathologyId === item._id && { color: '#16a34a', fontWeight: '700' }
                  ]}>
                    {item.name}
                  </Text>
                  {selectedPathologyId === item._id && (
                    <Feather name="check" size={20} color="#16a34a" />
                  )}
                </TouchableOpacity>
              )}
              style={{ width: '100%' }}
            />
            <TouchableOpacity
              style={styles.closeModalBtn}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeModalBtnText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

// Componente KPI con soporte para trend opcional
const KpiCard = ({ title, value, trend, icon, color }) => (
  <View style={styles.kpiCard}>
    <View style={[styles.kpiIcon, { backgroundColor: color + '15' }]}>
      <Feather name={icon} size={24} color={color} />
    </View>
    <Text style={styles.kpiValue}>{value}</Text>
    <Text style={styles.kpiTitle}>{title}</Text>
    {trend !== undefined && trend !== null && (
      <View style={[styles.trendBadge, { backgroundColor: trend >= 0 ? '#dcfce7' : '#fee2e2' }]}>
        <Feather name={trend >= 0 ? 'trending-up' : 'trending-down'} size={12} color={trend >= 0 ? '#16a34a' : '#ef4444'} />
        <Text style={[styles.trendText, { color: trend >= 0 ? '#16a34a' : '#ef4444' }]}>
          {Math.abs(trend)}% vs período anterior
        </Text>
      </View>
    )}
  </View>
);

const getColor = (index) => {
  const colors = ['#16a34a', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec489a', '#06b6d4', '#84cc16'];
  return colors[index % colors.length];
};

export default DashboardTab;