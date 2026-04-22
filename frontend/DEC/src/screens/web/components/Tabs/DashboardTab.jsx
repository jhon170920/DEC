import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, ActivityIndicator,
  Dimensions, Platform, TouchableOpacity, Alert
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import api from '../../../../api/api';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const { width } = Dimensions.get('window');

const DashboardTab = () => {
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
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

  // Calcular fechas por defecto (últimos 30 días)
  useEffect(() => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30);
    setEndDate(now.toISOString().slice(0, 10));
    setStartDate(thirtyDaysAgo.toISOString().slice(0, 10));
  }, []);

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

      // Filtrar por fechas
      let filteredDetections = [...detections];
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        filteredDetections = filteredDetections.filter(d => new Date(d.createdAt) >= start);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filteredDetections = filteredDetections.filter(d => new Date(d.createdAt) <= end);
      }

      // Calcular período anterior (misma duración)
      const startPrev = new Date(startDate);
      const endPrev = new Date(endDate);
      const duration = endPrev - startPrev;
      startPrev.setTime(startPrev.getTime() - duration);
      endPrev.setTime(endPrev.getTime() - duration);
      const previousDetections = detections.filter(d => {
        const date = new Date(d.createdAt);
        return date >= startPrev && date <= endPrev;
      }).length;

      // KPIs
      const totalUsers = users.length;
      const totalDetections = filteredDetections.length;
      const totalPathologies = pathologies.length;
      const avgConfidence = filteredDetections.length
        ? (filteredDetections.reduce((sum, d) => sum + (d.confidence || 0), 0) / filteredDetections.length * 100).toFixed(1)
        : 0;

      // Calcular tendencias
      const previousUsers = Math.max(0, totalUsers - 5); // simulado, idealmente de BD histórica
      const usersTrend = previousUsers > 0 ? ((totalUsers - previousUsers) / previousUsers * 100).toFixed(1) : 0;
      const detectionsTrend = previousDetections > 0 ? ((totalDetections - previousDetections) / previousDetections * 100).toFixed(1) : 0;

      setKpis({ totalUsers, totalDetections, totalPathologies, avgConfidence, previousUsers, previousDetections, usersTrend, detectionsTrend });

      // Datos para gráfico de torta
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

      // Top 5 patologías
      const top5 = [...pieChartData].sort((a, b) => b.value - a.value).slice(0, 5);
      setTopPathologies(top5);

      // Datos para gráfico de barras (últimos 6 meses)
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
  }, [startDate, endDate]);

  useEffect(() => {
    if (startDate && endDate) fetchDashboardData();
  }, [fetchDashboardData, startDate, endDate]);

  // Exportar a PDF
  const exportToPDF = async () => {
  if (Platform.OS !== 'web') {
    Alert.alert('Solo disponible en versión web');
    return;
  }

  try {
    // Mostrar indicador de carga
    Alert.alert('Generando PDF', 'Por favor espera...');
    
    // Clonar el contenido del dashboard para no afectar la vista
    const originalContent = document.getElementById('dashboard-content');
    if (!originalContent) throw new Error('No se encontró el contenido');

    // Crear un contenedor temporal para el PDF
    const pdfContainer = document.createElement('div');
    pdfContainer.style.position = 'absolute';
    pdfContainer.style.top = '-9999px';
    pdfContainer.style.left = '-9999px';
    pdfContainer.style.width = '800px';
    pdfContainer.style.backgroundColor = '#ffffff';
    pdfContainer.style.padding = '20px';
    pdfContainer.style.fontFamily = 'sans-serif';
    document.body.appendChild(pdfContainer);

    // Clonar el contenido
    const clone = originalContent.cloneNode(true);
    pdfContainer.appendChild(clone);

    // Ajustar estilos para el PDF
    const style = document.createElement('style');
    style.textContent = `
      * { box-sizing: border-box; }
      .kpi-row, .charts-row, .full-width-card, .two-columns {
        margin-bottom: 20px;
      }
      .kpi-card {
        background: #f9fafb;
        border-radius: 12px;
        padding: 15px;
        text-align: center;
        border: 1px solid #e5e7eb;
      }
      .distribution-bar {
        margin-bottom: 12px;
      }
      .distribution-bar-bg {
        background: #e5e7eb;
        height: 8px;
        border-radius: 4px;
      }
      .weekly-bar {
        display: inline-block;
        width: 40px;
        text-align: center;
        margin: 0 5px;
      }
      .top-item, .recent-item {
        display: flex;
        justify-content: space-between;
        padding: 8px 0;
        border-bottom: 1px solid #f0f0f0;
      }
      .header-pdf {
        text-align: center;
        margin-bottom: 30px;
        border-bottom: 2px solid #16a34a;
        padding-bottom: 10px;
      }
      .footer-pdf {
        text-align: center;
        font-size: 10px;
        color: #9ca3af;
        margin-top: 30px;
        border-top: 1px solid #e5e7eb;
        padding-top: 10px;
      }
        .kpi-row { display: flex; justify-content: space-between; gap: 10px; }
  .kpi-card { flex: 1; }
  .charts-row { display: flex; gap: 20px; }
  .chart-card { flex: 1; }
  .two-columns { display: flex; gap: 20px; }
  .weekly-container { display: flex; justify-content: space-around; align-items: flex-end; height: 150px; }
  .weekly-bar { display: flex; flex-direction: column; align-items: center; }
  .weekly-bar-bg { width: 30px; height: 100px; background: #e5e7eb; border-radius: 4px; overflow: hidden; display: flex; flex-direction: column-reverse; }
  .weekly-bar-fill { background: #16a34a; width: 100%; }
    `;
    pdfContainer.appendChild(style);

    // Agregar portada
    const cover = document.createElement('div');
    cover.innerHTML = `
      <div class="header-pdf">
        <h1 style="color: #16a34a;">DEC - Panel de Control</h1>
        <h2>Reporte de Gestión</h2>
        <p>Rango de fechas: ${startDate || 'Todo'} - ${endDate || 'Todo'}</p>
        <p>Generado: ${new Date().toLocaleString()}</p>
      </div>
    `;
    pdfContainer.insertBefore(cover, pdfContainer.firstChild);

    // Agregar pie de página después del contenido
    const footer = document.createElement('div');
    footer.className = 'footer-pdf';
    footer.innerHTML = `<p>DEC - Sistema de Monitoreo de Cultivos | Página </p>`;
    pdfContainer.appendChild(footer);

    // Usar html2canvas para capturar todo el contenedor
    const canvas = await html2canvas(pdfContainer, {
      scale: 2,
      backgroundColor: '#ffffff',
      logging: false,
      windowWidth: pdfContainer.scrollWidth,
      windowHeight: pdfContainer.scrollHeight
    });

    // Crear PDF
    const imgData = canvas.toDataURL('image/png');
    const { jsPDF } = await import('jspdf');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    let heightLeft = pdfHeight;
    let position = 0;

    // Añadir primera página
    pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
    heightLeft -= pdf.internal.pageSize.getHeight();

    // Añadir páginas adicionales si es necesario
    while (heightLeft > 0) {
      position = heightLeft - pdfHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
      heightLeft -= pdf.internal.pageSize.getHeight();
    }

    // Guardar PDF
    pdf.save(`dashboard_DEC_${new Date().toISOString().slice(0, 10)}.pdf`);

    // Limpiar
    document.body.removeChild(pdfContainer);
    Alert.alert('Éxito', 'PDF generado correctamente');
  } catch (error) {
    console.error('Error generando PDF:', error);
    Alert.alert('Error', 'No se pudo generar el PDF');
  }
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
      {/* Filtros y exportación */}
      <View style={styles.filterBar}>
        <View style={styles.dateFilterRow}>
          <div>
            <Text style={styles.filterLabel}>Fecha inicio</Text>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="date-input" style={styles.dateInput} />
          </div>
          <div>
            <Text style={styles.filterLabel}>Fecha fin</Text>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="date-input" style={styles.dateInput} />
          </div>
        </View>
        <TouchableOpacity style={styles.exportBtn} onPress={exportToPDF}>
          <Feather name="file-text" size={16} color="#fff" />
          <Text style={styles.exportBtnText}>Exportar PDF</Text>
        </TouchableOpacity>
      </View>

      {/* KPIs */}
      <View style={styles.kpiRow}>
        <KpiCard title="Usuarios" value={kpis.totalUsers} trend={kpis.usersTrend} icon="users" color="#3b82f6" />
        <KpiCard title="Detecciones" value={kpis.totalDetections} trend={kpis.detectionsTrend} icon="camera" color="#16a34a" />
        <KpiCard title="Patologías" value={kpis.totalPathologies} icon="book" color="#f59e0b" />
        <KpiCard title="Confianza Prom." value={`${kpis.avgConfidence}%`} icon="trending-up" color="#8b5cf6" />
      </View>

      {/* Gráficos */}
      <View style={styles.chartsRow}>
        {/* Distribución */}
        <View style={styles.chartCard}>
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

        {/* Evolución mensual */}
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

      {/* Top patologías y últimas detecciones */}
      <View style={styles.twoColumns}>
        <View style={styles.fullWidthCard}>
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
    </ScrollView>
  );
};

// Componente KPI con tendencia
const KpiCard = ({ title, value, trend, icon, color }) => (
  <View style={styles.kpiCard}>
    <View style={[styles.kpiIcon, { backgroundColor: color + '15' }]}>
      <Feather name={icon} size={24} color={color} />
    </View>
    <Text style={styles.kpiValue}>{value}</Text>
    <Text style={styles.kpiTitle}>{title}</Text>
    {trend !== undefined && (
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  content: { padding: 20, paddingBottom: 40 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, color: '#6b7280' },
  filterBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 20, flexWrap: 'wrap', gap: 12 },
  dateFilterRow: { flexDirection: 'row', gap: 16, flexWrap: 'wrap' },
  filterLabel: { fontSize: 12, fontWeight: '700', color: '#374151', marginBottom: 6 },
  dateInput: { padding: 10, borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, fontSize: 14, backgroundColor: '#fff' },
  exportBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#16a34a', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 },
  exportBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  kpiRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 24, gap: 12 },
  kpiCard: { flex: 1, minWidth: 170, backgroundColor: '#fff', borderRadius: 20, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: '#e5e7eb', ...Platform.select({ web: { boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)' } }) },
  kpiIcon: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  kpiValue: { fontSize: 28, fontWeight: '800', color: '#111827' },
  kpiTitle: { fontSize: 13, color: '#6b7280', marginTop: 4 },
  trendBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12, marginTop: 8 },
  trendText: { fontSize: 10, fontWeight: '600' },
  chartsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 20, marginBottom: 24 },
  chartCard: { flex: 1, backgroundColor: '#fff', borderRadius: 20, padding: 16, borderWidth: 1, borderColor: '#e5e7eb' },
  fullWidthCard: { backgroundColor: '#fff', borderRadius: 20, padding: 16, borderWidth: 1, borderColor: '#e5e7eb', marginBottom: 24 },
  chartTitle: { fontSize: 16, fontWeight: '700', color: '#374151', marginBottom: 16, textAlign: 'center' },
  noData: { textAlign: 'center', color: '#9ca3af', padding: 20 },
  distributionBar: { marginBottom: 14 },
  distributionLabel: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  distributionName: { fontSize: 13, fontWeight: '500', color: '#374151' },
  distributionValue: { fontSize: 13, fontWeight: '600', color: '#16a34a' },
  distributionBarBg: { height: 8, backgroundColor: '#f3f4f6', borderRadius: 4, overflow: 'hidden' },
  distributionBarFill: { height: '100%', borderRadius: 4 },
  weeklyContainer: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'flex-end', height: 200 },
  weeklyBar: { alignItems: 'center', width: 40 },
  weeklyLabel: { fontSize: 11, color: '#6b7280', marginBottom: 8 },
  weeklyBarBg: { width: 30, height: 120, backgroundColor: '#f3f4f6', borderRadius: 4, overflow: 'hidden', justifyContent: 'flex-end' },
  weeklyBarFill: { width: '100%', backgroundColor: '#16a34a', borderRadius: 4 },
  weeklyValue: { fontSize: 11, fontWeight: '600', color: '#374151', marginTop: 6 },
  twoColumns: { flexDirection: 'row', flexWrap: 'wrap', gap: 20, marginBottom: 24 },
  topItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  topRank: { width: 30, fontSize: 14, fontWeight: '700', color: '#16a34a' },
  topName: { flex: 1, fontSize: 14, color: '#374151' },
  topValue: { fontSize: 13, fontWeight: '600', color: '#6b7280' },
  recentItem: { flexDirection: 'row', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  recentDate: { width: 90, fontSize: 12, color: '#9ca3af' },
  recentPathology: { flex: 1, fontSize: 13, fontWeight: '500', color: '#374151' },
  recentConfidence: { fontSize: 12, fontWeight: '600', color: '#16a34a', width: 50, textAlign: 'right' },
});

export default DashboardTab;