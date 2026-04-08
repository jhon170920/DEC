import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, 
  useWindowDimensions, Platform, ActivityIndicator, TextInput, Alert 
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import IncidentCharts from './components/IncidentCharts'; // Importa el componente anterior
import api from "../../api/api"
// import axios from 'axios'; // Asegúrate de tener axios instalado

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
  const { width } = useWindowDimensions();
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

  useEffect(() => { fetchData(); }, [groupBy, dates]);

  return (
    <View style={styles.container}>
      {isDesktop && (
        <View style={styles.sidebar}>
          <Text style={styles.logo}>DEC Admin</Text>
          <SidebarItem icon="grid" label="Dashboard" active={activeTab === 'Dashboard'} onPress={() => setActiveTab('Dashboard')} />
          <SidebarItem icon="users" label="Usuarios" active={activeTab === 'Usuarios'} onPress={() => setActiveTab('Usuarios')} />
          <SidebarItem icon="book-open" label="Catálogo" active={activeTab === 'Catalog'} onPress={() => setActiveTab('Catalog')} />
          <SidebarItem icon="camera" label="Detecciones" active={activeTab === 'Detections'} onPress={() => setActiveTab('Detections')} />
        </View>
      )}

      <ScrollView style={styles.mainContent} contentContainerStyle={styles.scrollPadding}>
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

        {/* TARJETAS DE RESUMEN (ACCESOS RÁPIDOS) */}
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

        {/* CONTENEDOR DE GRÁFICA */}
        <View style={styles.whiteCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.sectionTitle}>Distribución de Enfermedades</Text>
            <View style={styles.tabGroup}>
              {['day', 'week', 'month'].map(t => (
                <TouchableOpacity key={t} onPress={() => setGroupBy(t)} style={[styles.tabBtn, groupBy === t && styles.tabBtnActive]}>
                  <Text style={[styles.tabBtnText, groupBy === t && { color: '#fff' }]}>{t === 'day' ? 'D' : t === 'week' ? 'S' : 'M'}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          <View style={styles.chartSpace}>
            {loading ? <ActivityIndicator color="#16a34a" /> : <IncidentCharts data={chartData} />}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

// Componente para las tarjetas superiores
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

const StatCard = ({ title, value, icon, color }) => (
  <View style={styles.statCard}>
    <View style={[styles.iconCircle, { backgroundColor: color + '20' }]}>
      <Feather name={icon} size={24} color={color} />
    </View>
    <View>
      <Text style={styles.statTitle}>{title}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  </View>
);

const DetectionItem = ({ label, zone, time }) => (
  <View style={styles.tableRow}>
    <MaterialCommunityIcons name="leaf-alert" size={24} color={COLORS.primary} />
    <View style={{ flex: 1, marginLeft: 15 }}>
      <Text style={styles.rowTitle}>{label}</Text>
      <Text style={styles.rowSub}>{zone}</Text>
    </View>
    <Text style={styles.rowTime}>{time}</Text>
  </View>
);

// --- ESTILOS ---

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: COLORS.bg,
  },
  sidebar: {
    width: 260,
    backgroundColor: '#fff',
    padding: 20,
    borderRightWidth: 1,
    borderRightColor: '#e5e7eb',
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
  mainContent: {
    flex: 1,
  },
  scrollPadding: {
    padding: 30
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 25
  },
  statsGrid: {
    gap: 20,
    marginBottom: 30
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
    ...Platform.select({
        web: { boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' },
        default: { elevation: 3 }
    })
  },
  statTitle: { fontSize: 14, color: '#6b7280' },
  statValue: { fontSize: 24, fontWeight: '800', color: COLORS.text },
  iconCircle: {
    padding: 12,
    borderRadius: 12
  },
  chartPlaceholder: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 30
  },
  fakeChart: {
    height: 200,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 15,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#e5e7eb'
  },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text },
  tableContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6'
  },
  rowTitle: { fontWeight: '600', color: COLORS.text },
  rowSub: { fontSize: 12, color: '#6b7280' },
  rowTime: { fontSize: 12, color: COLORS.primary, fontWeight: '600' },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
    flexWrap: 'wrap',
    gap: 15
  },
  filterBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 8,
    borderRadius: 12,
    gap: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb'
  },
  dateInput: {
    padding: 8,
    fontSize: 13,
    color: COLORS.text,
    width: 130
  },
  filterBtn: {
    backgroundColor: COLORS.primary,
    padding: 10,
    borderRadius: 8
  },
  chartSpace: {
    marginTop: 20,
    minHeight: 300,
    justifyContent: 'center'
  }, 
  whiteCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    marginBottom: 30,
    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
    borderWidth: 1,
    borderColor: '#f3f4f6'
  },
  cardSub: { fontSize: 11, color: '#9ca3af', marginTop: 2 },
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
    backgroundColor: '#16a34a',
  },
  tabBtnText: { fontSize: 12, fontWeight: '700', color: '#6b7280' },
  subText: { fontSize: 14, color: '#6b7280', marginTop: -20, marginBottom: 20 }
});