import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, ActivityIndicator, 
  Dimensions, Platform 
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import api from '../../../../api/api';

const { width } = Dimensions.get('window');

const DashboardTab = () => {
  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState({ 
    totalUsers: 0, 
    totalDetections: 0, 
    totalPathologies: 0, 
    avgConfidence: 0 
  });
  const [recentDetections, setRecentDetections] = useState([]);
  const [pieData, setPieData] = useState([]);
  const [barData, setBarData] = useState([]);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const [usersRes, detectionsRes, pathologiesRes] = await Promise.all([
        api.get('admin/get-users'),
        api.get('admin/get-detections'),
        api.get('admin/get-pathologies')
      ]);

      const users = usersRes.data.users || [];
      const detections = detectionsRes.data.detections || [];
      const pathologies = pathologiesRes.data.pathologies || [];

      // KPIs
      const totalUsers = users.length;
      const totalDetections = detections.length;
      const totalPathologies = pathologies.length;
      const avgConfidence = detections.length 
        ? (detections.reduce((sum, d) => sum + (d.confidence || 0), 0) / detections.length * 100).toFixed(1)
        : 0;

      setKpis({ totalUsers, totalDetections, totalPathologies, avgConfidence });

      // Datos para distribución por patología
      const pathologyCounts = {};
      detections.forEach(d => {
        const name = d.pathologyId?.name || 'Desconocida';
        pathologyCounts[name] = (pathologyCounts[name] || 0) + 1;
      });
      const total = detections.length;
      const pieChartData = Object.entries(pathologyCounts).map(([name, value]) => ({
        name,
        value,
        percentage: total > 0 ? Math.round((value / total) * 100) : 0
      }));
      setPieData(pieChartData);

      // Datos para detecciones por mes (últimos 6 meses)
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
        const count = detections.filter(d => {
          const dDate = new Date(d.createdAt);
          return dDate.getMonth() === month && dDate.getFullYear() === year;
        }).length;
        return { month: monthNames[month], count };
      });
      setBarData(barChartData);

      // Últimas 5 detecciones
      const recent = [...detections]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);
      setRecentDetections(recent);

    } catch (error) {
      console.error('Error cargando dashboard:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#16a34a" />
        <Text style={styles.loadingText}>Cargando estadísticas...</Text>
      </View>
    );
  }

  const maxBarValue = Math.max(...barData.map(d => d.count), 1);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* KPIs */}
      <View style={styles.kpiRow}>
        <KpiCard title="Usuarios" value={kpis.totalUsers} icon="users" color="#3b82f6" />
        <KpiCard title="Detecciones" value={kpis.totalDetections} icon="camera" color="#16a34a" />
        <KpiCard title="Patologías" value={kpis.totalPathologies} icon="book" color="#f59e0b" />
        <KpiCard title="Confianza Prom." value={`${kpis.avgConfidence}%`} icon="trending-up" color="#8b5cf6" />
      </View>

      {/* Distribución por Afección */}
      <View style={styles.fullWidthCard}>
        <Text style={styles.chartTitle}>Distribución por Afección</Text>
        {pieData.length > 0 ? (
          pieData.map((item, idx) => (
            <View key={idx} style={styles.distributionBar}>
              <View style={styles.distributionLabel}>
                <Text style={styles.distributionName}>{item.name}</Text>
                <Text style={styles.distributionValue}>{item.value} ({item.percentage}%)</Text>
              </View>
              <View style={styles.distributionBarBg}>
                <View 
                  style={[
                    styles.distributionBarFill, 
                    { width: `${item.percentage}%`, backgroundColor: getColor(idx) }
                  ]} 
                />
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.noData}>Sin datos de detecciones</Text>
        )}
      </View>

      {/* Detecciones por Mes */}
      <View style={styles.fullWidthCard}>
        <Text style={styles.chartTitle}>Detecciones por Mes</Text>
        {barData.length > 0 ? (
          barData.map((item, idx) => (
            <View key={idx} style={styles.distributionBar}>
              <View style={styles.distributionLabel}>
                <Text style={styles.distributionName}>{item.month}</Text>
                <Text style={styles.distributionValue}>{item.count}</Text>
              </View>
              <View style={styles.distributionBarBg}>
                <View 
                  style={[
                    styles.distributionBarFill, 
                    { width: `${(item.count / maxBarValue) * 100}%`, backgroundColor: '#16a34a' }
                  ]} 
                />
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.noData}>Sin datos de detecciones</Text>
        )}
      </View>

      {/* Confianza Promedio General */}
      <View style={styles.fullWidthCard}>
        <Text style={styles.chartTitle}>Confianza Promedio General</Text>
        <View style={styles.confidenceContainer}>
          <View style={styles.confidenceCircle}>
            <Text style={styles.confidenceValue}>{kpis.avgConfidence}%</Text>
          </View>
          <Text style={styles.confidenceLabel}>Precisión promedio de todas las detecciones</Text>
        </View>
      </View>

      {/* Tabla de últimas detecciones */}
      <View style={styles.fullWidthCard}>
        <Text style={styles.chartTitle}>Últimas Detecciones</Text>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableCell, styles.headerCell]}>Fecha</Text>
            <Text style={[styles.tableCell, styles.headerCell]}>Afección</Text>
            <Text style={[styles.tableCell, styles.headerCell]}>Confianza</Text>
            <Text style={[styles.tableCell, styles.headerCell]}>Ubicación</Text>
          </View>
          {recentDetections.length > 0 ? (
            recentDetections.map((det, idx) => (
              <View key={det._id || idx} style={styles.tableRow}>
                <Text style={styles.tableCell}>{new Date(det.createdAt).toLocaleDateString()}</Text>
                <Text style={styles.tableCell}>{det.pathologyId?.name || '—'}</Text>
                <Text style={styles.tableCell}>{Math.round((det.confidence || 0) * 100)}%</Text>
                <Text style={styles.tableCell}>
                  {det.location?.coordinates ? `${det.location.coordinates[1].toFixed(4)}` : '—'}
                </Text>
              </View>
            ))
          ) : (
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.noDataText]}>No hay detecciones registradas</Text>
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
};

// Componente KPI
const KpiCard = ({ title, value, icon, color }) => (
  <View style={styles.kpiCard}>
    <View style={[styles.kpiIcon, { backgroundColor: color + '15' }]}>
      <Feather name={icon} size={24} color={color} />
    </View>
    <Text style={styles.kpiValue}>{value}</Text>
    <Text style={styles.kpiTitle}>{title}</Text>
  </View>
);

// Función para colores
const getColor = (index) => {
  const colors = ['#16a34a', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec489a', '#06b6d4', '#84cc16'];
  return colors[index % colors.length];
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  content: { padding: 20, paddingBottom: 40 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  loadingText: { marginTop: 12, color: '#6b7280' },
  
  kpiRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 24, gap: 12 },
  kpiCard: { 
    flex: 1, 
    minWidth: 150, 
    backgroundColor: '#fff', 
    borderRadius: 20, 
    padding: 16, 
    alignItems: 'center', 
    borderWidth: 1, 
    borderColor: '#e5e7eb',
    ...Platform.select({ web: { boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)' } })
  },
  kpiIcon: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  kpiValue: { fontSize: 28, fontWeight: '800', color: '#111827' },
  kpiTitle: { fontSize: 13, color: '#6b7280', marginTop: 4 },
  
  fullWidthCard: { 
    backgroundColor: '#fff', 
    borderRadius: 20, 
    padding: 20, 
    borderWidth: 1, 
    borderColor: '#e5e7eb', 
    marginBottom: 24
  },
  chartTitle: { fontSize: 18, fontWeight: '700', color: '#374151', marginBottom: 20, textAlign: 'center' },
  noData: { textAlign: 'center', color: '#9ca3af', padding: 40 },
  noDataText: { textAlign: 'center', color: '#9ca3af' },
  
  distributionBar: { marginBottom: 16 },
  distributionLabel: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  distributionName: { fontSize: 14, fontWeight: '500', color: '#374151' },
  distributionValue: { fontSize: 14, fontWeight: '600', color: '#16a34a' },
  distributionBarBg: { height: 10, backgroundColor: '#f3f4f6', borderRadius: 5, overflow: 'hidden' },
  distributionBarFill: { height: '100%', borderRadius: 5 },
  
  confidenceContainer: { alignItems: 'center', padding: 20 },
  confidenceCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#8b5cf615',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16
  },
  confidenceValue: { fontSize: 48, fontWeight: '800', color: '#8b5cf6' },
  confidenceLabel: { fontSize: 14, color: '#6b7280', textAlign: 'center' },
  
  table: { width: '100%', overflowX: 'auto' },
  tableHeader: { 
    flexDirection: 'row', 
    backgroundColor: '#f9fafb', 
    borderBottomWidth: 1, 
    borderBottomColor: '#e5e7eb', 
    paddingVertical: 12,
    paddingHorizontal: 8
  },
  tableRow: { 
    flexDirection: 'row', 
    borderBottomWidth: 1, 
    borderBottomColor: '#f3f4f6', 
    paddingVertical: 12,
    paddingHorizontal: 8
  },
  tableCell: { flex: 1, fontSize: 12, color: '#4b5563' },
  headerCell: { fontWeight: '700', color: '#6b7280' }
});

export default DashboardTab;