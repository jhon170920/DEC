import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, 
  useWindowDimensions, Platform, ActivityIndicator, TextInput, 
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import IncidentCharts from './components/IncidentCharts'; 
import api from "../../api/api";

// 1. IMPORTA EL NUEVO COMPONENTE
import UsersTab from './components/Tabs/UsersTab';
import CatalogTab from './components/Tabs/CatalogTab';
import DetectionsTab from './components/Tabs/DetectionsTab'; 
import HeatmapTab from './components/Tabs/HeatmapTab';

const COLORS = {
  primary: '#16a34a',
  secondary: '#064e3b',
  bg: '#f0f9f1',
  surface: '#ffffff',
  text: '#1f2937',
  danger: '#ef4444',
  warning: '#f59e0b'
};

export default function AdminDashboard() {
  const { width, height } = useWindowDimensions();
  const isDesktop = width > 768;
  
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState([]);
  const [kpis, setKpis] = useState({ totalUsers: 0, activeUsers: 0, detectionsInPeriod: 0 });
  const [dates, setDates] = useState({ startDate: '', endDate: '' });
  const [groupBy, setGroupBy] = useState('day');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resIncidence, resKpis] = await Promise.all([
        api.get('stats/incidence', { params: { ...dates, groupBy } }),
        api.get('stats/kpis', { params: dates })
      ]);
      setChartData(resIncidence.data);
      setKpis(resKpis.data);
    } catch (error) {
      console.log("Error en Dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    if (activeTab === 'Dashboard') {
      fetchData(); 
    }
  }, [groupBy, dates, activeTab]);

  return (
    <View style={styles.container}>
      {isDesktop && (
        <View style={styles.sidebar}>
          <Text style={styles.logo}>DEC Admin</Text>
          <SidebarItem icon="grid" label="Dashboard" active={activeTab === 'Dashboard'} onPress={() => setActiveTab('Dashboard')} />
          <SidebarItem icon="users" label="Usuarios" active={activeTab === 'Usuarios'} onPress={() => setActiveTab('Usuarios')} />
          <SidebarItem icon="book-open" label="Catálogo" active={activeTab === 'Catalog'} onPress={() => setActiveTab('Catalog')} />
          <SidebarItem icon="camera" label="Detecciones" active={activeTab === 'Detections'} onPress={() => setActiveTab('Detections')} />
          <SidebarItem icon="map" label="Mapa de Incidencia" active={activeTab === 'Heatmap'} onPress={() => setActiveTab('Heatmap')} />
        </View>
      )}

      <View style={[styles.contentWrapper, { height: height }]}>
        <ScrollView 
          style={styles.mainScroll} 
          contentContainerStyle={styles.scrollPadding}
          showsVerticalScrollIndicator={true}
        >
          {/* --- VISTA: DASHBOARD --- */}
          {activeTab === 'Dashboard' && (
            <>
              <View style={styles.headerRow}>
                <View>
                  <Text style={styles.welcomeText}>Panel General</Text>
                  <Text style={styles.subText}>Estado del sistema en Garzón y alrededores</Text>
                </View>
                
                <View style={styles.filterBar}>
                  <TextInput 
                    style={styles.dateInput} 
                    placeholder="Fecha inicio" 
                    onChangeText={(v) => setDates({...dates, startDate: v})} 
                  />
                  <View style={{ width: 1, height: 20, backgroundColor: '#e5e7eb' }} />
                  <TextInput 
                    style={styles.dateInput} 
                    placeholder="Fecha fin" 
                    onChangeText={(v) => setDates({...dates, endDate: v})} 
                  />
                  <TouchableOpacity style={styles.filterBtn} onPress={fetchData}>
                    <Feather name="refresh-cw" size={16} color="#fff" />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={[styles.statsGrid, { flexDirection: isDesktop ? 'row' : 'column' }]}>
                <QuickActionCard 
                  title="Usuarios" 
                  value={kpis.totalUsers} 
                  sub="Gestionar cuentas" 
                  icon="users" 
                  color="#3b82f6" 
                  onPress={() => setActiveTab('Usuarios')}
                />
                <QuickActionCard 
                  title="Detecciones" 
                  value={kpis.detectionsInPeriod} 
                  sub="Ver hallazgos" 
                  icon="camera" 
                  color="#16a34a" 
                  onPress={() => setActiveTab('Detections')}
                />
                <QuickActionCard 
                  title="Catálogo" 
                  value="4 Patologías" 
                  sub="Roya, Minador..." 
                  icon="book" 
                  color="#f59e0b" 
                  onPress={() => setActiveTab('Catalog')}
                />
              </View>

              <View style={styles.whiteCard}>
                <View style={styles.cardHeader}>
                  <Text style={styles.sectionTitle}>Distribución de Enfermedades</Text>
                  <View style={styles.tabGroup}>
                    {['day', 'week', 'month'].map(t => (
                      <TouchableOpacity key={t} onPress={() => setGroupBy(t)} style={[styles.tabBtn, groupBy === t && styles.tabBtnActive]}>
                        <Text style={[styles.tabBtnText, groupBy === t && { color: '#fff' }]}>
                          {t === 'day' ? 'D' : t === 'week' ? 'S' : 'M'}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
                
                <View style={styles.chartSpace}>
                  {loading ? <ActivityIndicator color="#16a34a" size="large" /> : <IncidentCharts data={chartData} />}
                </View>
              </View>
            </>
          )}

          {/* --- VISTA: Botones --- */}
          {activeTab === 'Usuarios' && (
            <UsersTab />
          )}
          {activeTab === 'Catalog' && (
            <CatalogTab />
          )}
          {activeTab === 'Detections' && (
            <DetectionsTab />
          )}
          {activeTab === 'Heatmap' && (
            <HeatmapTab />
          )}

          {/* --- VISTAS EN CONSTRUCCIÓN --- */}
          {/* {( activeTab === 'Detections') && (
            <View style={styles.placeholderContainer}>
              <Feather name="tool" size={50} color="#d1d5db" />
              <Text style={styles.placeholderText}>Sección en desarrollo</Text>
            </View>
          )} */}

          <View style={{ height: 50 }} />
        </ScrollView>
      </View>
    </View>
  );
}

// --- SUBCOMPONENTES ---

const SidebarItem = ({ icon, label, active, onPress }) => (
  <TouchableOpacity 
    onPress={onPress}
    style={[styles.sidebarItem, active && styles.sidebarItemActive]}
  >
    <Feather name={icon} size={20} color={active ? '#fff' : COLORS.secondary} />
    <Text style={[styles.sidebarLabel, active && { color: '#fff' }]}>{label}</Text>
  </TouchableOpacity>
);

const QuickActionCard = ({ title, value, sub, icon, color, onPress }) => (
  <TouchableOpacity style={styles.statCard} onPress={onPress}>
    <View style={[styles.iconCircle, { backgroundColor: color + '15' }]}>
      <Feather name={icon} size={22} color={color} />
    </View>
    <View style={{ flex: 1 }}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
      <Text style={styles.cardSub}>{sub}</Text>
    </View>
    <Feather name="chevron-right" size={18} color="#d1d5db" />
  </TouchableOpacity>
);

// --- ESTILOS ACTUALIZADOS ---

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    // IMPORTANTE: Evita que el contenedor crezca más que la pantalla
    height: Platform.OS === 'web' ? '100vh' : '100%', 
    width: '100%',
    backgroundColor: COLORS.bg,
    // Permite scroll natural en web
    overflow: 'auto',
  },
  sidebar: {
    width: 260,
    backgroundColor: '#fff',
    padding: 20,
    borderRightWidth: 1,
    borderRightColor: '#e5e7eb',
    height: '100%', // Se mantiene fijo de arriba a abajo
    marginRight: 0,
  },
  contentWrapper: {
    flex: 1,       // Toma todo el espacio a la derecha del sidebar
    // No forzar height aquí, dejar que sea flexible
    maxHeight: '100vh',
    overflow: Platform.OS === 'web' ? 'hidden' : undefined,
  },
  mainScroll: {
    flex: 1,
    width: '100%',
  },
  scrollPadding: {
    padding: 30,
    paddingBottom: 50,
    // No usar flexGrow aquí
  },
  logo: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.primary,
    marginBottom: 40,
    textAlign: 'center'
  },
  sidebarItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 12,
    marginBottom: 8
  },
  sidebarItemActive: {
    backgroundColor: COLORS.primary,
  },
  sidebarLabel: {
    marginLeft: 15,
    fontWeight: '600',
    color: COLORS.secondary
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 10
  },
  subText: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 25
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 25,
    flexWrap: 'wrap',
    gap: 15
  },
  statsGrid: {
    gap: 20,
    marginBottom: 30,
    // En mobile, tomar ancho completo
    width: '100%',
  },
  statCard: {
    flex: 1,
    minHeight: 100,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
    borderWidth: 1,
    borderColor: '#f3f4f6',
    ...Platform.select({
      web: { cursor: 'pointer', transition: '0.2s' }
    })
  },
  statTitle: { fontSize: 14, color: '#6b7280' },
  statValue: { fontSize: 24, fontWeight: '800', color: COLORS.text },
  cardSub: { fontSize: 11, color: '#9ca3af', marginTop: 2 },
  iconCircle: {
    padding: 12,
    borderRadius: 12,
    minWidth: 46,
    minHeight: 46,
    justifyContent: 'center',
    alignItems: 'center'
  },
  whiteCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    marginBottom: 30,
    width: '100%',
    alignSelf: 'center',
    ...Platform.select({
      web: { boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)' }
    })
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
    flexWrap: 'wrap',
    gap: 10
  },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text },
  placeholderContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 100,
  },
  placeholderText: {
    marginTop: 20,
    fontSize: 18,
    color: '#9ca3af',
    fontWeight: '600'
  },
  chartSpace: {
    marginTop: 10,
    minHeight: 400,
    width: '100%',
  },
  filterBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 8,
    borderRadius: 12,
    gap: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    flexWrap: 'wrap',
    minWidth: 300,
  },
  dateInput: {
    padding: 8,
    fontSize: 13,
    color: COLORS.text,
    width: 120,
    borderWidth: 0,
  },
  filterBtn: {
    backgroundColor: COLORS.primary,
    padding: 10,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center'
  },
  tabGroup: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    padding: 4,
    borderRadius: 12
  },
  tabBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8
  },
  tabBtnActive: {
    backgroundColor: COLORS.primary,
  },
  tabBtnText: { 
    fontSize: 12, 
    fontWeight: '700', 
    color: '#6b7280' 
  }
});