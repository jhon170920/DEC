import React, { useState, useContext } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, 
  useWindowDimensions, Platform, Modal
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
  sidebarItemDanger: {
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  sidebarLabel: {
    marginLeft: 15,
    fontWeight: '600',
    color: COLORS.secondary
  },
  mobileLogoutButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: COLORS.danger,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  mobileLogoutText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  // Estilos del modal de confirmación
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    width: 340,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
  },
  modalIcon: {
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 8,
  },
  modalMessage: {
    fontSize: 15,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 28,
    lineHeight: 22,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalBtnCancel: {
    backgroundColor: '#f3f4f6',
  },
  modalBtnCancelText: {
    color: '#374151',
    fontWeight: '600',
    fontSize: 15,
  },
  modalBtnDanger: {
    backgroundColor: COLORS.danger,
  },
  modalBtnDangerText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
});