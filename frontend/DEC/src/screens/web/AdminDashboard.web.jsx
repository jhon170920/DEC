import React, { useState, useContext } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, 
  useWindowDimensions, Platform, Modal
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
  // 👇 AÑADIDO: estado para controlar el modal de confirmación (reemplaza Alert.alert)
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = () => {
    // 👇 CORREGIDO: en web Alert.alert no funciona; abrimos nuestro propio modal
    setShowLogoutModal(true);
  };

  const confirmLogout = async () => {
    setShowLogoutModal(false);
    await logout();
    navigation.reset({
      index: 0,
      routes: [{ name: 'Home' }],
    });
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
          <SidebarItem 
            icon="log-out" 
            label="Cerrar sesión" 
            active={false}
            onPress={handleLogout}
            isDanger
          />
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

      {/* Botón flotante para móviles */}
      {!isDesktop && (
        <TouchableOpacity style={styles.mobileLogoutButton} onPress={handleLogout}>
          <Feather name="log-out" size={20} color="#fff" />
          <Text style={styles.mobileLogoutText}>Cerrar sesión</Text>
        </TouchableOpacity>
      )}

      {/* 👇 AÑADIDO: Modal de confirmación compatible con web */}
      <Modal
        transparent
        animationType="fade"
        visible={showLogoutModal}
        onRequestClose={() => setShowLogoutModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Feather name="log-out" size={40} color={COLORS.danger} style={styles.modalIcon} />
            <Text style={styles.modalTitle}>Cerrar sesión</Text>
            <Text style={styles.modalMessage}>¿Estás seguro de que quieres cerrar sesión?</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnCancel]}
                onPress={() => setShowLogoutModal(false)}
              >
                <Text style={styles.modalBtnCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnDanger]}
                onPress={confirmLogout}
              >
                <Text style={styles.modalBtnDangerText}>Cerrar sesión</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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