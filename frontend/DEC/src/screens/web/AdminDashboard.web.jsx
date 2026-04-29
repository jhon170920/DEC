import React, { useState, useContext } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, 
  useWindowDimensions, Platform, Alert 
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../../context/AuthContext';

// IMPORTAR TODOS LOS TABS
import UsersTab from './components/Tabs/UsersTab';
import CatalogTab from './components/Tabs/CatalogTab';
import DetectionsTab from './components/Tabs/DetectionsTab'; 
import HeatmapTab from './components/Tabs/HeatmapTab';
import DashboardTab from './components/Tabs/DashboardTab';
import { adminStyles as styles, COLORS } from './components/styles/adminStyles';



export default function AdminDashboard() {
  const { width } = useWindowDimensions();
  const isDesktop = width > 768;
  const navigation = useNavigation();
  const { logout } = useContext(AuthContext);
  
  const [activeTab, setActiveTab] = useState('Dashboard');

  const handleLogout = async () => {
    Alert.alert("Cerrar sesión", "¿Estás seguro?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Cerrar sesión",
        style: "destructive",
        onPress: async () => {
          await logout();
          navigation.reset({
            index: 0,
            routes: [{ name: 'LoginAdmin' }],
          });
        }
      }
    ]);
  };

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
          {/* Botón de cerrar sesión */}
          <SidebarItem 
            icon="log-out" 
            label="Cerrar sesión" 
            active={false}
            onPress={handleLogout}
            isDanger
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

      {/* Botón flotante para móviles */}
      {!isDesktop && (
        <TouchableOpacity style={styles.mobileLogoutButton} onPress={handleLogout}>
          <Feather name="log-out" size={20} color="#fff" />
          <Text style={styles.mobileLogoutText}>Cerrar sesión</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// --- SUBCOMPONENTES ---
const SidebarItem = ({ icon, label, active, onPress, isDanger }) => (
  <TouchableOpacity 
    onPress={onPress}
    style={[
      styles.sidebarItem, 
      active && styles.sidebarItemActive,
      isDanger && styles.sidebarItemDanger
    ]}
  >
    <Feather name={icon} size={20} color={active ? '#fff' : (isDanger ? COLORS.danger : COLORS.secondary)} />
    <Text style={[styles.sidebarLabel, active && { color: '#fff' }, isDanger && { color: COLORS.danger }]}>
      {label}
    </Text>
  </TouchableOpacity>
);