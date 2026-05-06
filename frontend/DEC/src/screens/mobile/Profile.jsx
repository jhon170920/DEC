import React, { useState, useCallback, useContext, useEffect } from "react";
import {
  View, Text, TouchableOpacity, StatusBar, ScrollView, Switch,
  StyleSheet, Image, Platform, ActivityIndicator, Modal, TextInput
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import NetInfo from "@react-native-community/netinfo";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Colors } from "../../constants/colors";
import { ProfileStyles as styles } from "../../styles/Profilestyles";
import { useResponsiveLayout } from "../../hooks/useResponsiveLayout";
import { useNetworkStatus } from "../../hooks/useNetworkStatus";
import api, { deleteUserAccount, deleteUserAccountSocial } from "../../api/api";
import { AuthContext } from "../../context/AuthContext";
import {getTreatmentLogsCount, saveUserProfile, getUserProfile, updateUserStats, getUserStats} from "../../services/dbService"
import ToolTipBubble from "../../components/Tour/ToolTipBubble";

export default function Profile() {
  const navigation = useNavigation();
  const { logout, RevokeAccessSocial } = useContext(AuthContext);
  const { sp, hPad, logoRingS, logoImgS, iconS, btnH, headlineS, sublineS, brandS } = useResponsiveLayout();
  const { isConnected, netType, offlineModeActive } = useNetworkStatus();
  
  const [notificaciones, setNotificaciones] = useState(true);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ analisis: 0, seguimiento: 0 });
  
  // Estados para modales
  const [modalLogoutVisible, setModalLogoutVisible] = useState(false);
  const [modalDeleteConfirmVisible, setModalDeleteConfirmVisible] = useState(false);
  const [modalPasswordVisible, setModalPasswordVisible] = useState(false);
  const [modalErrorVisible, setModalErrorVisible] = useState(false);
  const [modalSuccessVisible, setModalSuccessVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  
  const [deletePassword, setDeletePassword] = useState("");
  const [deleting, setDeleting] = useState(false);

  const fetchUserData = async () => {
    try {
      // Intentar cargar del servidor primero
      if (isConnected) {
        try {
          const res = await api.get('users/me');
          const user = res.data.user;
          setUserData(user);
          
          // Guardar en SQLite para modo offline
          saveUserProfile(user);
          
          // Guardar en AsyncStorage como backup
          await AsyncStorage.setItem('userData', JSON.stringify(user));
        } catch (networkError) {
          console.warn('⚠️ Error al obtener datos del servidor, usando cache local:', networkError.message);
          // Si falla, cargar del cache local
          const cachedUser = getUserProfile();
          if (cachedUser) {
            setUserData(cachedUser);
          }
        }
      } else {
        // Si no hay internet, cargar del almacenamiento local
        const cachedUser = getUserProfile();
        if (cachedUser) {
          setUserData(cachedUser);
          console.log('📴 Usando datos locales - Modo offline');
        } else {
          // Si no hay datos locales, intentar AsyncStorage
          const asyncData = await AsyncStorage.getItem('userData');
          if (asyncData) {
            const user = JSON.parse(asyncData);
            setUserData(user);
            saveUserProfile(user);
          }
        }
      }
    } catch (error) {
      console.error("Error en fetchUserData:", error);
      // Como último recurso, cargar datos en caché
      const cachedData = await AsyncStorage.getItem('userData');
      if (cachedData) {
        setUserData(JSON.parse(cachedData));
      } else {
        setErrorMessage("No se pudo cargar la información del perfil");
        setModalErrorVisible(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      if (isConnected) {
        try {
          const res = await api.get('detections/count');
          const seguimientos = await getTreatmentLogsCount(); 
          const newStats = { 
            analisis: res.data.count,
            seguimiento: seguimientos || 0
          };
          setStats(newStats);
          updateUserStats(newStats);
          
          // También guardar en AsyncStorage
          await AsyncStorage.setItem('userStats', JSON.stringify(newStats));
        } catch (networkError) {
          console.warn('⚠️ Error al obtener estadísticas del servidor:', networkError.message);
          // Usar cache local
          const cachedStats = getUserStats();
          setStats(cachedStats);
        }
      } else {
        // Modo offline: cargar del SQLite
        const cachedStats = getUserStats();
        setStats(cachedStats);
        console.log('📴 Usando estadísticas locales - Modo offline');
      }
    } catch (error) {
      console.error('Error en fetchStats:', error);
      // Fallback a AsyncStorage
      const asyncStats = await AsyncStorage.getItem('userStats');
      if (asyncStats) {
        setStats(JSON.parse(asyncStats));
      }
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchUserData();
      fetchStats();
    }, [])
  );

  const handleLogout = () => {
    setModalLogoutVisible(false);
    logout();
  };

  const handleDeleteAccount = () => {
    if (!isConnected) {
      setErrorMessage("Necesitas conexión a internet para eliminar tu cuenta. Esto no se puede hacer en modo offline.");
      setModalErrorVisible(true);
      return;
    }
    setModalDeleteConfirmVisible(false);
    setModalPasswordVisible(true);
  };

  const confirmDeleteAccount = async () => {
    if (!deletePassword) {
      setErrorMessage("Ingresa tu contraseña para eliminar la cuenta");
      setModalErrorVisible(true);
      return;
    }
    setDeleting(true);
    try {
      await deleteUserAccount(deletePassword);
      setSuccessMessage("Tu cuenta ha sido eliminada permanentemente");
      setModalSuccessVisible(true);
      // Esperar un momento para mostrar el modal antes de redirigir
      setTimeout(() => {
        setModalSuccessVisible(false);
        logout();
      }, 2000);
    } catch (error) {
      const msg = error.message || "Error al eliminar la cuenta";
      setErrorMessage(msg);
      setModalErrorVisible(true);
    } finally {
      setDeleting(false);
      setModalPasswordVisible(false);
      setDeletePassword("");
    }
  };
  // Eliminar cuenta si inició sesión con Google/Facebook
  const confirmDeleteAccountSocial = async () => {
    try {
      // Borrar la cuenta vinculada a fb o google 
      await RevokeAccessSocial(); // se remueven los permisos de fb/google
      await deleteUserAccountSocial(); // se elimina el registro de la cuenta en mongo
      setSuccessMessage("Tu cuenta ha sido eliminada permanentemente");
      setModalSuccessVisible(true);
      // Esperar un momento para mostrar el modal antes de redirigir
      setTimeout(() => {
        setModalSuccessVisible(false);
        logout();
      }, 2000);
    } catch (error) {
      const msg = error.message || "Error al eliminar la cuenta";
      setErrorMessage(msg);
      setModalErrorVisible(true);
    } finally{
      setDeleting(false);
      setModalPasswordVisible(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.root}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  const nombreUsuario = userData?.name || "Usuario";
  const inicial = nombreUsuario.charAt(0).toUpperCase();
  const fotoPerfil = userData?.pictureUrl;
  const avatarSize = sp(0.085);
  const badgeS = avatarSize * 0.24;
  const menuIconS = iconS * 1.7;
  const menuPadV = sp(0.0070);
  const scrollPadT = Platform.OS === "ios" ? sp(0.07) : sp(0.06);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.bg} />
      <LinearGradient colors={["#e8f5ec", "#f4faf5", "#f4faf5"]} style={StyleSheet.absoluteFill} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} />
      
      {/* BANNER OFFLINE */}
      {offlineModeActive && (
        <View style={{ backgroundColor: '#fef3c7', paddingVertical: sp(0.01), paddingHorizontal: hPad, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <Feather name="wifi-off" size={16} color="#b45309" />
          <Text style={{ fontSize: sublineS - 2, color: '#b45309', fontWeight: '600' }}>Modo sin conexión - Usando datos locales</Text>
        </View>
      )}

      <ScrollView contentContainerStyle={[styles.scroll, { paddingHorizontal: hPad, paddingTop: sp(0.06) }]} showsVerticalScrollIndicator={false}>
        
        {/* HEADER */}
        <View style={[styles.header, { marginBottom: sp(0.018) }]}>
          <View style={[styles.logoMark, { width: 60, height: 60, borderRadius: 30 }]}>
          <Image source={require("../../../assets/image/logo.png")} style={{ width: 40, height: 40 }} resizeMode="contain" />
          </View>
          <TouchableOpacity style={[styles.backBtn, { width: 50, height: 50, borderRadius: 25 }]} activeOpacity={0.75} onPress={() => navigation.goBack()}>
            <Feather name="arrow-left" size={iconS} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        {/* AVATAR */}
        <View style={styles.avatarWrap}>
          <TouchableOpacity disabled={!isConnected} onPress={() => navigation.navigate("EditProfile")}>
            {fotoPerfil ? (
              <Image source={{ uri: fotoPerfil }} style={{ width: avatarSize, height: avatarSize, borderRadius: avatarSize / 2 }} />
            ) : (
              <View style={[styles.avatarCircle, { width: avatarSize, height: avatarSize, borderRadius: avatarSize / 2, backgroundColor: Colors.primaryLight, justifyContent: 'center', alignItems: 'center' }]}>
                <Text style={[styles.avatarInitial, { fontSize: avatarSize * 0.42 }]}>{inicial}</Text>
              </View>
            )}
            <View style={[styles.avatarBadge, { width: badgeS, height: badgeS, opacity: isConnected ? 1 : 0.5 }]}>
              <Feather name="edit-2" size={badgeS * 0.5} color="#fff" />
            </View>
          </TouchableOpacity>
        </View>

        {/* NOMBRE */}
        <Text style={[styles.userName, { fontSize: headlineS * 0.5, marginBottom: sp(0.018) }]}>{nombreUsuario}</Text>

        {/* STATS */}
        <ToolTipBubble
          stepNumber={0}
          nextStep={1}
          text='La cantidad de análisis que has hecho y los seguimientos que has creado.'
        >
          <View style={[styles.statsCard, { marginBottom: sp(0.02), paddingVertical: sp(0.015) }]}>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { fontSize: headlineS * 0.5 }]}>{stats.analisis}</Text>
              <Text style={[styles.statLabel, { fontSize: sublineS }]}>Análisis</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { fontSize: headlineS * 0.5 }]}>{stats.seguimiento}</Text>
              <Text style={[styles.statLabel, { fontSize: sublineS }]}>Seguimiento</Text>
            </View>
          </View>
        </ToolTipBubble>
        
        {/* MI CUENTA */}
        <View style={[styles.sectionHeader, { marginBottom: 6, marginTop: 8 }]}>
          <Text style={[styles.sectionLabel, { fontSize: sublineS - 1 }]}>MI CUENTA</Text>
          <View style={styles.sectionLine} />
        </View>

        <View style={styles.groupCard}>
          <ToolTipBubble
            stepNumber={1}
            nextStep={2}
            text='Puedes editar tus datos personales básicos.'
          >
          {/* EDITAR PERFIL */}
            <TouchableOpacity style={[styles.menuItem, { paddingVertical: menuPadV, opacity: isConnected ? 1 : 0.5 }]} activeOpacity={0.75} disabled={!isConnected} onPress={() => navigation.navigate("EditProfile")}>
              <View style={[styles.menuIconWrap, { width: menuIconS, height: menuIconS, backgroundColor: "#f0faf3" }]}>
                <Feather name="edit-2" size={iconS} color={Colors.primary} />
              </View>
              <Text style={[styles.menuTitle, { fontSize: brandS }]}>Editar perfil</Text>
              <Feather name="chevron-right" size={iconS - 4} color={Colors.textMuted} />
            </TouchableOpacity>
          </ToolTipBubble>

          <View style={styles.itemDivider} />

          <ToolTipBubble
            stepNumber={2}
            nextStep={3}
            text='La configuración de tus recordatorios.'
          >
            {/* RECORDATORIOS */}
            <TouchableOpacity
              style={[styles.menuItem, { paddingVertical: menuPadV }]}
              activeOpacity={0.75}
              onPress={() => navigation.navigate('Alarms')}
            >
              <View style={[styles.menuIconWrap, { width: menuIconS, height: menuIconS, backgroundColor: "#eff6ff" }]}>
                <Feather name="bell" size={iconS} color="#3b82f6" />
              </View>
              <Text style={[styles.menuTitle, { fontSize: brandS }]}>Mis recordatorios</Text>
              <Feather name="chevron-right" size={iconS - 4} color={Colors.textMuted} />
            </TouchableOpacity>
          </ToolTipBubble>
        </View>

        {/* SOPORTE */}
        <View style={[styles.sectionHeader, { marginBottom: 6, marginTop: 8 }]}>
          <Text style={[styles.sectionLabel, { fontSize: sublineS - 1 }]}>SOPORTE</Text>
          <View style={styles.sectionLine} />
        </View>

        <View style={styles.groupCard}>
          <ToolTipBubble
            stepNumber={3}
            nextStep={4}
            text='Nuestro contacto directo, una guía rápida y algunas preguntas frecuentes.'
          >
            {/* CENTRO DE AYUDA */}
            <TouchableOpacity style={[styles.menuItem, { paddingVertical: menuPadV }]} activeOpacity={0.75} onPress={() => navigation.navigate('Centro')}>
              <View style={[styles.menuIconWrap, { width: menuIconS, height: menuIconS, backgroundColor: "#eff6ff" }]}>
                <Feather name="help-circle" size={iconS} color="#3b82f6" />
              </View>
              <Text style={[styles.menuTitle, { fontSize: brandS }]}>Centro de ayuda</Text>
              <Feather name="chevron-right" size={iconS - 4} color={Colors.textMuted} />
            </TouchableOpacity>
          </ToolTipBubble>

          <View style={styles.itemDivider} />

          <ToolTipBubble
            stepNumber={4}
            nextStep={5}
            text='Puedes consultar en cualquier momento nuestros Términos y Política de Privacidad.'
          >
            {/* TERMINOS Y PRIVACIDAD */}
            <TouchableOpacity style={[styles.menuItem, { paddingVertical: menuPadV }]} activeOpacity={0.75} onPress={() => navigation.navigate('Terminos')}>
              <View style={[styles.menuIconWrap, { width: menuIconS, height: menuIconS, backgroundColor: Colors.surfaceAlt }]}>
                <Feather name="file-text" size={iconS} color={Colors.textMuted} />
              </View>
              <Text style={[styles.menuTitle, { fontSize: brandS }]}>Términos y privacidad</Text>
              <Feather name="chevron-right" size={iconS - 4} color={Colors.textMuted} />
            </TouchableOpacity>
          </ToolTipBubble>
        </View>

        {/* BOTONES */}
        <ToolTipBubble
          stepNumber={5}
          nextStep={6}
          text='Puedes cerrar tu sesión y volver a iniciar en tu cuenta, o iniciar en otra cuenta siempre que lo desees.'
          placement='top'
        >

          <TouchableOpacity style={[styles.btnDanger, { height: btnH }]} activeOpacity={0.75} onPress={() => setModalLogoutVisible(true)}>
            <Text style={[styles.btnDangerText, { fontSize: brandS }]}>Cerrar sesión</Text>
          </TouchableOpacity>
        </ToolTipBubble>
        <ToolTipBubble
          stepNumber={6}
          nextStep={'finishScreen'}
          text='Puedes eliminar tu cuenta junto con todos tus datos en cualquier momento si lo prefieres. ¡Cuidado, esto es irreversible!'
          placement='top'
        >
          <TouchableOpacity style={[styles.btnDanger, { height: btnH, opacity: isConnected ? 1 : 0.5 }]} activeOpacity={0.75} disabled={!isConnected} onPress={() => setModalDeleteConfirmVisible(true)}>
            <Text style={[styles.btnDangerText, { fontSize: brandS }]}>Eliminar cuenta</Text>
          </TouchableOpacity>
        </ToolTipBubble>
      </ScrollView>

      {/* Modal confirmar cierre de sesión */}
      <Modal transparent animationType="fade" visible={modalLogoutVisible} onRequestClose={() => setModalLogoutVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Feather name="log-out" size={40} color={Colors.danger} style={{ alignSelf: 'center', marginBottom: 10 }} />
            <Text style={styles.modalTitle}>Cerrar sesión</Text>
            <Text style={styles.modalSubtitle}>¿Estás seguro de que quieres cerrar sesión?</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 }}>
              <TouchableOpacity style={[styles.modalCancelBtn, { flex: 1, marginRight: 8 }]} onPress={() => setModalLogoutVisible(false)}>
                <Text style={styles.modalCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, { backgroundColor: Colors.danger, flex: 1, marginLeft: 8 }]} onPress={handleLogout}>
                <Text style={styles.modalBtnText}>Cerrar sesión</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal confirmar eliminación de cuenta */}
      <Modal transparent animationType="fade" visible={modalDeleteConfirmVisible} onRequestClose={() => setModalDeleteConfirmVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Feather name="alert-triangle" size={40} color="#dc2626" style={{ alignSelf: 'center', marginBottom: 10 }} />
            <Text style={styles.modalTitle}>Eliminar cuenta</Text>
            <Text style={styles.modalSubtitle}>⚠️ Esta acción es irreversible. Se eliminarán todos tus datos.</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 }}>
              <TouchableOpacity style={[styles.modalCancelBtn, { flex: 1, marginRight: 8 }]} onPress={() => setModalDeleteConfirmVisible(false)}>
                <Text style={styles.modalCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, { backgroundColor: "#dc2626", flex: 1, marginLeft: 8 }]} onPress={handleDeleteAccount}>
                <Text style={styles.modalBtnText}>Continuar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal para ingresar contraseña y eliminar cuenta */}
      <Modal transparent animationType="fade" visible={modalPasswordVisible} onRequestClose={() => setModalPasswordVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Eliminar cuenta</Text>
            {userData.provider.includes('local') && 
              (
                <>
                  <Text style={styles.modalSubtitle}>Ingresa tu contraseña para confirmar</Text>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="Contraseña"
                    placeholderTextColor={Colors.textMuted}
                    value={deletePassword}
                    onChangeText={setDeletePassword}
                    secureTextEntry
                  />
                </>
              )
            }
            <View style={{ justifyContent: 'space-between', marginTop: 20, width: '100%' }}>
              <TouchableOpacity style={styles.modalConfirmBtn} activeOpacity={0.85} onPress={userData.provider.includes('local') ? confirmDeleteAccount : confirmDeleteAccountSocial} disabled={deleting}>
                <LinearGradient colors={["#dc2626", "#b91c1c"]} style={styles.modalBtnGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                  <Text style={styles.modalBtnText}>{deleting ? "Eliminando..." : "Eliminar"}</Text>
                </LinearGradient>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalCancelBtn} activeOpacity={0.75} onPress={() => setModalPasswordVisible(false)}>
                <Text style={styles.modalCancelText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal de error */}
      <Modal transparent animationType="fade" visible={modalErrorVisible} onRequestClose={() => setModalErrorVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Feather name="alert-circle" size={40} color="#dc2626" style={{ alignSelf: 'center', marginBottom: 10 }} />
            <Text style={[styles.modalTitle, { color: "#dc2626" }]}>Error</Text>
            <Text style={styles.modalSubtitle}>{errorMessage}</Text>
            <TouchableOpacity style={[styles.modalBtn, { backgroundColor: "#dc2626" }]} onPress={() => setModalErrorVisible(false)}>
              <Text style={styles.modalBtnText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal de éxito */}
      <Modal transparent animationType="fade" visible={modalSuccessVisible} onRequestClose={() => setModalSuccessVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Feather name="check-circle" size={40} color={Colors.primary} style={{ alignSelf: 'center', marginBottom: 10 }} />
            <Text style={styles.modalTitle}>Cuenta eliminada</Text>
            <Text style={styles.modalSubtitle}>{successMessage}</Text>
            <ActivityIndicator size="small" color={Colors.primary} style={{ marginTop: 10 }} />
          </View>
        </View>
      </Modal>
    </View>
  );
}