import React, { useState, useCallback, useContext } from "react";
import {
  View, Text, TouchableOpacity, StatusBar, ScrollView, Switch,
  StyleSheet, Image, Platform, ActivityIndicator, Modal, TextInput
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { Colors } from "../../constants/colors";
import { ProfileStyles as styles } from "../../styles/Profilestyles";
import { useResponsiveLayout } from "../../hooks/useResponsiveLayout";
import api, { deleteUserAccount } from "../../api/api";
import { AuthContext } from "../../context/AuthContext";

export default function Profile() {
  const navigation = useNavigation();
  const { logout } = useContext(AuthContext);
  const { sp, hPad, logoRingS, logoImgS, iconS, btnH, headlineS, sublineS, brandS } = useResponsiveLayout();
  
  const [notificaciones, setNotificaciones] = useState(true);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ plantas: 0, analisis: 0, guardadas: 0 });
  
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
      const res = await api.get('users/me');
      setUserData(res.data.user);
    } catch (error) {
      console.error("Error fetching user:", error);
      setErrorMessage("No se pudo cargar la información del perfil");
      setModalErrorVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await api.get('detections/count');
      setStats({ analisis: res.data.count, plantas: 0, guardadas: 0 });
    } catch (error) {
      console.error(error);
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
      <ScrollView contentContainerStyle={[styles.scroll, { paddingHorizontal: hPad, paddingTop: scrollPadT }]} showsVerticalScrollIndicator={false}>
        
        {/* HEADER */}
        <View style={[styles.header, { marginBottom: sp(0.018) }]}>
          <View style={[styles.logoMark, { width: logoRingS, height: logoRingS, borderRadius: logoRingS / 2 }]}>
            <Image source={require("../../../assets/image/logo.png")} style={{ width: logoImgS, height: logoImgS }} resizeMode="contain" />
          </View>
          <TouchableOpacity style={[styles.backBtn, { width: logoRingS * 0.60, height: logoRingS * 0.68 }]} activeOpacity={0.75} onPress={() => navigation.goBack()}>
            <Feather name="arrow-left" size={iconS} color={Colors.text} />
          </TouchableOpacity>
        </View>

        {/* AVATAR */}
        <View style={styles.avatarWrap}>
          <TouchableOpacity onPress={() => navigation.navigate("EditProfile")}>
            {fotoPerfil ? (
              <Image source={{ uri: fotoPerfil }} style={{ width: avatarSize, height: avatarSize, borderRadius: avatarSize / 2 }} />
            ) : (
              <View style={[styles.avatarCircle, { width: avatarSize, height: avatarSize, borderRadius: avatarSize / 2, backgroundColor: Colors.primaryLight, justifyContent: 'center', alignItems: 'center' }]}>
                <Text style={[styles.avatarInitial, { fontSize: avatarSize * 0.42 }]}>{inicial}</Text>
              </View>
            )}
            <View style={[styles.avatarBadge, { width: badgeS, height: badgeS }]}>
              <Feather name="edit-2" size={badgeS * 0.5} color="#fff" />
            </View>
          </TouchableOpacity>
        </View>

        {/* NOMBRE */}
        <Text style={[styles.userName, { fontSize: headlineS * 0.5, marginBottom: sp(0.018) }]}>{nombreUsuario}</Text>

        {/* STATS */}
        <View style={[styles.statsCard, { marginBottom: sp(0.02), paddingVertical: sp(0.015) }]}>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { fontSize: headlineS * 0.5 }]}>{stats.plantas}</Text>
            <Text style={[styles.statLabel, { fontSize: sublineS }]}>Plantas</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { fontSize: headlineS * 0.5 }]}>{stats.analisis}</Text>
            <Text style={[styles.statLabel, { fontSize: sublineS }]}>Análisis</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { fontSize: headlineS * 0.5 }]}>{stats.guardadas}</Text>
            <Text style={[styles.statLabel, { fontSize: sublineS }]}>Guardadas</Text>
          </View>
        </View>

        {/* MI CUENTA */}
        <View style={[styles.sectionHeader, { marginBottom: 6, marginTop: 8 }]}>
          <Text style={[styles.sectionLabel, { fontSize: sublineS - 1 }]}>MI CUENTA</Text>
          <View style={styles.sectionLine} />
        </View>

        <View style={styles.groupCard}>
          <TouchableOpacity style={[styles.menuItem, { paddingVertical: menuPadV }]} activeOpacity={0.75} onPress={() => navigation.navigate("EditProfile")}>
            <View style={[styles.menuIconWrap, { width: menuIconS, height: menuIconS, backgroundColor: "#f0faf3" }]}>
              <Feather name="edit-2" size={iconS} color={Colors.primary} />
            </View>
            <Text style={[styles.menuTitle, { fontSize: brandS }]}>Editar perfil</Text>
            <Feather name="chevron-right" size={iconS - 4} color={Colors.textMuted} />
          </TouchableOpacity>
          <View style={styles.itemDivider} />
          <View style={[styles.menuItem, { paddingVertical: menuPadV }]}>
            <View style={[styles.menuIconWrap, { width: menuIconS, height: menuIconS, backgroundColor: "#eff6ff" }]}>
              <Feather name="bell" size={iconS} color="#3b82f6" />
            </View>
            <Text style={[styles.menuTitle, { fontSize: brandS }]}>Notificaciones</Text>
            <Switch value={notificaciones} onValueChange={setNotificaciones} trackColor={{ false: Colors.border, true: Colors.primary }} thumbColor="#fff" />
          </View>
        </View>

        {/* SOPORTE */}
        <View style={[styles.sectionHeader, { marginBottom: 6, marginTop: 8 }]}>
          <Text style={[styles.sectionLabel, { fontSize: sublineS - 1 }]}>SOPORTE</Text>
          <View style={styles.sectionLine} />
        </View>

        <View style={styles.groupCard}>
          <TouchableOpacity style={[styles.menuItem, { paddingVertical: menuPadV }]} activeOpacity={0.75} onPress={() => {}}>
            <View style={[styles.menuIconWrap, { width: menuIconS, height: menuIconS, backgroundColor: "#eff6ff" }]}>
              <Feather name="help-circle" size={iconS} color="#3b82f6" />
            </View>
            <Text style={[styles.menuTitle, { fontSize: brandS }]}>Centro de ayuda</Text>
            <Feather name="chevron-right" size={iconS - 4} color={Colors.textMuted} />
          </TouchableOpacity>
          <View style={styles.itemDivider} />
          <TouchableOpacity style={[styles.menuItem, { paddingVertical: menuPadV }]} activeOpacity={0.75} onPress={() => {}}>
            <View style={[styles.menuIconWrap, { width: menuIconS, height: menuIconS, backgroundColor: Colors.surfaceAlt }]}>
              <Feather name="file-text" size={iconS} color={Colors.textMuted} />
            </View>
            <Text style={[styles.menuTitle, { fontSize: brandS }]}>Términos y privacidad</Text>
            <Feather name="chevron-right" size={iconS - 4} color={Colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* BOTONES */}
        <TouchableOpacity style={[styles.btnDanger, { height: btnH }]} activeOpacity={0.75} onPress={() => setModalLogoutVisible(true)}>
          <Text style={[styles.btnDangerText, { fontSize: brandS }]}>Cerrar sesión</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.btnDanger, { height: btnH }]} activeOpacity={0.75} onPress={() => setModalDeleteConfirmVisible(true)}>
          <Text style={[styles.btnDangerText, { fontSize: brandS }]}>Eliminar cuenta</Text>
        </TouchableOpacity>

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
            <Text style={styles.modalSubtitle}>Ingresa tu contraseña para confirmar</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Contraseña"
              placeholderTextColor={Colors.textMuted}
              value={deletePassword}
              onChangeText={setDeletePassword}
              secureTextEntry
            />
            <TouchableOpacity style={[styles.modalBtn, { backgroundColor: "#dc2626" }]} activeOpacity={0.85} onPress={confirmDeleteAccount} disabled={deleting}>
              <LinearGradient colors={["#dc2626", "#b91c1c"]} style={styles.modalBtnGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                <Text style={styles.modalBtnText}>{deleting ? "Eliminando..." : "Eliminar"}</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalCancelBtn} activeOpacity={0.75} onPress={() => setModalPasswordVisible(false)}>
              <Text style={styles.modalCancelText}>Cancelar</Text>
            </TouchableOpacity>
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