import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, 
  useWindowDimensions, Platform 
} from 'react-native';
import { Feather } from '@expo/vector-icons';

// IMPORTAR TODOS LOS TABS
import UsersTab from './components/Tabs/UsersTab';
import CatalogTab from './components/Tabs/CatalogTab';
import DetectionsTab from './components/Tabs/DetectionsTab'; 
import HeatmapTab from './components/Tabs/HeatmapTab';
import DashboardTab from './components/Tabs/DashboardTab';

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

  return (
    <View style={styles.container}>
      {/* Sidebar para desktop */}
      {isDesktop && (
        <View style={styles.sidebar}>
          <Text style={styles.logo}>DEC Admin</Text>
          <SidebarItem 
            icon="grid" 
            label="Dashboard" 
            active={activeTab === 'Dashboard'} 
            onPress={() => setActiveTab('Dashboard')} 
          />
          <SidebarItem 
            icon="users" 
            label="Usuarios" 
            active={activeTab === 'Usuarios'} 
            onPress={() => setActiveTab('Usuarios')} 
          />
          <SidebarItem 
            icon="book-open" 
            label="Catálogo" 
            active={activeTab === 'Catalog'} 
            onPress={() => setActiveTab('Catalog')} 
          />
          <SidebarItem 
            icon="camera" 
            label="Detecciones" 
            active={activeTab === 'Detections'} 
            onPress={() => setActiveTab('Detections')} 
          />
          <SidebarItem 
            icon="map" 
            label="Mapa de Incidencia" 
            active={activeTab === 'Heatmap'} 
            onPress={() => setActiveTab('Heatmap')} 
          />
        </View>
      )}

      {/* Contenido principal */}
      <View style={styles.contentWrapper}>
        <ScrollView 
          style={styles.mainScroll} 
          contentContainerStyle={styles.scrollPadding}
          showsVerticalScrollIndicator={true}
        >
          {activeTab === 'Dashboard' && <DashboardTab />}
          {activeTab === 'Usuarios' && <UsersTab />}
          {activeTab === 'Catalog' && <CatalogTab />}
          {activeTab === 'Detections' && <DetectionsTab />}
          {activeTab === 'Heatmap' && <HeatmapTab />}
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

// --- ESTILOS ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    height: Platform.OS === 'web' ? '100vh' : '100%', 
    width: '100%',
    backgroundColor: COLORS.bg,
    overflow: 'auto',
  },
  sidebar: {
    width: 260,
    backgroundColor: '#fff',
    padding: 20,
    borderRightWidth: 1,
    borderRightColor: '#e5e7eb',
    height: '100%',
  },
  contentWrapper: {
    flex: 1,
    maxHeight: Platform.OS === 'web' ? '100vh' : '100%',
    overflow: Platform.OS === 'web' ? 'auto' : undefined,
  },
  mainScroll: {
    flex: 1,
    width: '100%',
  },
  scrollPadding: {
    padding: 30,
    paddingBottom: 50,
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
});