import React, { useState, useContext } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  useWindowDimensions, Alert
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../../context/AuthContext';

import UsersTab from './components/Tabs/UsersTab';
import CatalogTab from './components/Tabs/CatalogTab';
import DetectionsTab from './components/Tabs/DetectionsTab';
import HeatmapTab from './components/Tabs/HeatmapTab';
import DashboardTab from './components/Tabs/DashboardTab';
import { adminStyles as styles, COLORS } from './components/styles/adminStyles';

export default function AdminDashboard() {
  const { width } = useWindowDimensions();
  const isDesktop = width > 700;
  const navigation = useNavigation();
  const { logout } = useContext(AuthContext);

  const [activeTab, setActiveTab] = useState('Dashboard');
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleLogout = async () => {
    Alert.alert("Cerrar sesión", "¿Estás seguro?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Cerrar sesión",
        style: "destructive",
        onPress: async () => {
          await logout();
          navigation.reset({ index: 0, routes: [{ name: 'LoginAdmin' }] });
        }
      }
    ]);
  };

  const handleTabPress = (tab) => {
    setActiveTab(tab);
    setDrawerOpen(false); // cierra el drawer al seleccionar
  };

  const SidebarContent = () => (
    <>
      <Text style={styles.logo}>DEC Admin</Text>
      <SidebarItem icon="grid"      label="Dashboard"         active={activeTab === 'Dashboard'}  onPress={() => handleTabPress('Dashboard')} />
      <SidebarItem icon="users"     label="Usuarios"          active={activeTab === 'Usuarios'}   onPress={() => handleTabPress('Usuarios')} />
      <SidebarItem icon="book-open" label="Catálogo"          active={activeTab === 'Catalog'}    onPress={() => handleTabPress('Catalog')} />
      <SidebarItem icon="camera"    label="Detecciones"       active={activeTab === 'Detections'} onPress={() => handleTabPress('Detections')} />
      <SidebarItem icon="map"       label="Mapa de Incidencia" active={activeTab === 'Heatmap'}   onPress={() => handleTabPress('Heatmap')} />
      <SidebarItem icon="log-out"   label="Cerrar sesión"     active={false} onPress={handleLogout} isDanger />
    </>
  );

  return (
    <View style={styles.container}>

      {/* ── DESKTOP: sidebar fijo ── */}
      {isDesktop && (
        <View style={styles.sidebar}>
          <SidebarContent />
        </View>
      )}

      {/* ── MÓVIL: botón hamburguesa ── */}
      {!isDesktop && (
        <TouchableOpacity
          style={styles.hamburgerButton}
          onPress={() => setDrawerOpen(true)}
        >
          <Feather name="menu" size={22} color="#fff" />
        </TouchableOpacity>
      )}

      {/* ── MÓVIL: drawer overlay + menú ── */}
      {!isDesktop && drawerOpen && (
        <>
          {/* Toca fuera para cerrar */}
          <TouchableOpacity
            style={styles.drawerOverlay}
            activeOpacity={1}
            onPress={() => setDrawerOpen(false)}
          />
          <View style={styles.drawerMenu}>
            <SidebarContent />
          </View>
        </>
      )}

      {/* ── Contenido principal ── */}
      <View style={styles.contentWrapper}>
        <ScrollView
          style={styles.mainScroll}
          contentContainerStyle={[
            styles.scrollPadding,
            !isDesktop && { paddingTop: 60 } // espacio para el botón hamburguesa
          ]}
          showsVerticalScrollIndicator={true}
        >
          {activeTab === 'Dashboard'  && <DashboardTab />}
          {activeTab === 'Usuarios'   && <UsersTab />}
          {activeTab === 'Catalog'    && <CatalogTab />}
          {activeTab === 'Detections' && <DetectionsTab />}
          {activeTab === 'Heatmap'    && <HeatmapTab />}
        </ScrollView>
      </View>

    </View>
  );
}

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