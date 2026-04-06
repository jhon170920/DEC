import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, 
  useWindowDimensions, Platform 
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

// --- PALETA DE COLORES (Basada en tu proyecto DEC) ---
const COLORS = {
  primary: '#16a34a', // Verde cafetal
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

  return (
    <View style={styles.container}>
      {/* SIDEBAR (Solo se muestra fijo en Desktop) */}
      {isDesktop && (
        <View style={styles.sidebar}>
          <Text style={styles.logo}>DEC Admin</Text>
          <SidebarItem icon="grid" label="Dashboard" active={activeTab === 'Dashboard'} onPress={() => setActiveTab('Dashboard')} />
          <SidebarItem icon="map" label="Mapa de Brotes" active={activeTab === 'Mapa'} onPress={() => setActiveTab('Mapa')} />
          <SidebarItem icon="users" label="Usuarios" active={activeTab === 'Usuarios'} onPress={() => setActiveTab('Usuarios')} />
          <SidebarItem icon="cpu" label="Validación IA" active={activeTab === 'IA'} onPress={() => setActiveTab('IA')} />
        </View>
      )}

      {/* CONTENIDO PRINCIPAL */}
      <View style={styles.mainContent}>
        <ScrollView contentContainerStyle={styles.scrollPadding}>
          <Text style={styles.welcomeText}>Panel de Control - Garzón, Huila</Text>
          
          {/* GRILLA DE ESTADÍSTICAS */}
          <View style={[styles.statsGrid, { flexDirection: isDesktop ? 'row' : 'column' }]}>
            <StatCard title="Detecciones Hoy" value="42" icon="target" color={COLORS.primary} />
            <StatCard title="Incidencia Roya" value="12%" icon="trending-up" color={COLORS.danger} />
            <StatCard title="Usuarios Activos" value="22" icon="users" color={COLORS.secondary} />
          </View>

          {/* ÁREA DE GRÁFICAS (Placeholder) */}
          <View style={styles.chartPlaceholder}>
            <Text style={styles.sectionTitle}>Incidencia Semanal</Text>
            <View style={styles.fakeChart}>
               <Text style={{color: COLORS.text, opacity: 0.5}}> [ Aquí integrarás tus gráficas de Victory o Recharts ] </Text>
            </View>
          </View>

          {/* TABLA DE RECIENTES */}
          <View style={styles.tableContainer}>
            <Text style={styles.sectionTitle}>Últimas Detecciones</Text>
            <DetectionItem label="Roya detectada" zone="Vereda La Jagua" time="Hace 10 min" />
            <DetectionItem label="Minador detectado" zone="Finca El Recreo" time="Hace 45 min" />
          </View>
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
  rowTime: { fontSize: 12, color: COLORS.primary, fontWeight: '600' }
});