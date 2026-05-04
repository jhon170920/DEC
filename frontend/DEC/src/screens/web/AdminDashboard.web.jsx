import React, { useState, useContext, useEffect } from 'react';
import { 
  View, Text, ScrollView, TouchableOpacity, 
  useWindowDimensions, Modal, Image, ActivityIndicator
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../../context/AuthContext';
import api from '../../api/api';
import AsyncStorage from '@react-native-async-storage/async-storage'; // 👈 IMPORTADO

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
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [userData, setUserData] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [showMobileWarning, setShowMobileWarning] = useState(false); // 👈 NUEVO

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get('users/me');
        setUserData(res.data.user);
      } catch (error) {
        console.error('Error cargando usuario:', error);
      } finally {
        setLoadingUser(false);
      }
    };
    fetchUser();
  }, []);

  // 👇 Mostrar advertencia solo una vez en móvil
  useEffect(() => {
    const checkWarning = async () => {
      if (!isDesktop) {
        const warned = await AsyncStorage.getItem('@mobileAdminWarningShown');
        if (!warned) {
          setShowMobileWarning(true);
          await AsyncStorage.setItem('@mobileAdminWarningShown', 'true');
        }
      }
    };
    checkWarning();
  }, [isDesktop]);

  const handleLogout = () => setShowLogoutModal(true);

  const confirmLogout = async () => {
    setShowLogoutModal(false);
    await logout();
    navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
  };

  const handleTabPress = (tab) => {
    setActiveTab(tab);
    setDrawerOpen(false);
  };

  // Componente reutilizable para la lista de navegación (incluye perfil)
  const NavigationList = ({ showLogout = true }) => (
    <>
      {/* Cabecera con información del usuario */}
      <View style={styles.profileHeader}>
        {loadingUser ? (
          <ActivityIndicator size="small" color={COLORS.primary} />
        ) : userData ? (
          <>
            {userData.pictureUrl ? (
              <Image source={{ uri: userData.pictureUrl }} style={styles.profileImage} />
            ) : (
              <View style={styles.profileInitials}>
                <Text style={styles.profileInitialsText}>
                  {userData.name?.charAt(0).toUpperCase() || 'U'}
                </Text>
              </View>
            )}
            <Text style={styles.profileName}>{userData.name || 'Administrador'}</Text>
            <Text style={styles.profileRole}>{userData.role || 'admin'}</Text>
          </>
        ) : null}
      </View>

      <Text style={styles.logo}>DEC Panel</Text>
      <SidebarItem icon="grid"      label="Dashboard"         active={activeTab === 'Dashboard'}  onPress={() => handleTabPress('Dashboard')} />
      <SidebarItem icon="users"     label="Usuarios"          active={activeTab === 'Usuarios'}   onPress={() => handleTabPress('Usuarios')} />
      <SidebarItem icon="book-open" label="Catálogo"          active={activeTab === 'Catalog'}    onPress={() => handleTabPress('Catalog')} />
      <SidebarItem icon="camera"    label="Detecciones"       active={activeTab === 'Detections'} onPress={() => handleTabPress('Detections')} />
      <SidebarItem icon="map"       label="Mapa de Incidencia" active={activeTab === 'Heatmap'}   onPress={() => handleTabPress('Heatmap')} />
      {showLogout && (
        <SidebarItem icon="log-out" label="Cerrar sesión" active={false} onPress={handleLogout} isDanger />
      )}
    </>
  );

  return (
    <View style={styles.container}>
      {/* Escritorio: sidebar fijo con cierre de sesión */}
      {isDesktop && (
        <View style={styles.sidebar}>
          <NavigationList showLogout={true} />
        </View>
      )}

      {/* Móvil: botón hamburguesa y drawer (sin el botón de cerrar sesión en el menú) */}
      {!isDesktop && (
        <>
          <TouchableOpacity style={styles.hamburgerButton} onPress={() => setDrawerOpen(true)}>
            <Feather name="menu" size={22} color="#fff" />
          </TouchableOpacity>

          {drawerOpen && (
            <>
              <TouchableOpacity style={styles.drawerOverlay} activeOpacity={1} onPress={() => setDrawerOpen(false)} />
              <View style={styles.drawerMenu}>
                <NavigationList showLogout={false} />
              </View>
            </>
          )}

          {/* Botón flotante para cerrar sesión en móvil */}
          <TouchableOpacity style={styles.mobileLogoutButton} onPress={handleLogout}>
            <Feather name="log-out" size={20} color="#fff" />
            <Text style={styles.mobileLogoutText}>Cerrar sesión</Text>
          </TouchableOpacity>
        </>
      )}

      {/* Contenido principal */}
      <View style={styles.contentWrapper}>
        <ScrollView
          style={styles.mainScroll}
          contentContainerStyle={[styles.scrollPadding, !isDesktop && { paddingTop: 60 }, width < 480 && {flexDirection: 'column'}]}
          showsVerticalScrollIndicator={true}
        >
          {activeTab === 'Dashboard'  && <DashboardTab />}
          {activeTab === 'Usuarios'   && <UsersTab />}
          {activeTab === 'Catalog'    && <CatalogTab />}
          {activeTab === 'Detections' && <DetectionsTab />}
          {activeTab === 'Heatmap'    && <HeatmapTab />}
        </ScrollView>
      </View>

      {/* Modal de advertencia para móviles */}
      <Modal
        transparent
        animationType="fade"
        visible={showMobileWarning}
        onRequestClose={() => setShowMobileWarning(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Feather name="smartphone" size={40} color={COLORS.warning} style={styles.modalIcon} />
            <Text style={styles.modalTitle}>Pantalla pequeña detectada</Text>
            <Text style={styles.modalMessage}>
              Para una mejor experiencia y visualización de datos, te recomendamos acceder a este panel desde una computadora o dispositivo con pantalla más grande. 
              Algunas funciones pueden verse limitadas en dispositivos móviles.
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnPrimary]}
                onPress={() => setShowMobileWarning(false)}
              >
                <Text style={styles.modalBtnText}>Continuar de todos modos</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal de confirmación de cierre de sesión */}
      <Modal transparent animationType="fade" visible={showLogoutModal} onRequestClose={() => setShowLogoutModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Feather name="log-out" size={40} color={COLORS.danger} style={styles.modalIcon} />
            <Text style={styles.modalTitle}>Cerrar sesión</Text>
            <Text style={styles.modalMessage}>¿Estás seguro de que quieres cerrar sesión?</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.modalBtn, styles.modalBtnCancel]} onPress={() => setShowLogoutModal(false)}>
                <Text style={styles.modalBtnCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, styles.modalBtnDanger]} onPress={confirmLogout}>
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