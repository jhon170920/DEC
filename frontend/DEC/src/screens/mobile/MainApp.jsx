import React, { useState, useRef, useContext, useCallback, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Animated,
  useWindowDimensions,
  Modal,
  Alert,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, Feather } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { AuthContext } from "../../context/AuthContext";
import { Colors } from "../../constants/colors";
import { MainStyles as styles } from "../../styles/MainStyles";
import { useResponsiveLayout } from "../../hooks/useResponsiveLayout";
import { debugCheckDatabase } from "../../services/dbService";
import api from "../../api/api";

export default function MainApp() {
  const {
    sp,
    logoRingS,
    logoImgS,
    headlineS,
    iconS,
  } = useResponsiveLayout();

  const { width } = useWindowDimensions();
  const navigation = useNavigation();
  const { userToken, isGuest } = useContext(AuthContext);
  const [userData, setUserData] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    debugCheckDatabase();
  }, []);

  const fetchUserData = async () => {
    if (!userToken) {
      setUserData(null);
      setLoadingUser(false);
      return;
    }
    try {
      const res = await api.get("users/me");
      setUserData(res.data.user);
    } catch (error) {
      console.error("Error fetching user data:", error);
      setUserData(null);
    } finally {
      setLoadingUser(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchUserData();
    }, [userToken])
  );

  const handleAvatarPress = () => {
    if (userToken) {
      navigation.navigate("Profile");
    } else {
      setShowLoginModal(true);
    }
  };

  const handleGoToLogin = () => {
    setShowLoginModal(false);
    navigation.navigate("Login");
  };

  const checkAuthAndNavigate = (screenName) => {
    if (userToken && !isGuest) {
      navigation.navigate(screenName);
    } else {
      setShowLoginModal(true);
    }
  };

  const getUserInitials = () => {
    if (userData?.name) {
      return userData.name.charAt(0).toUpperCase();
    }
    return "?";
  };

  const renderAvatar = () => {
    if (loadingUser) {
      return <ActivityIndicator size="small" color={Colors.primary} />;
    }
    if (userToken && userData?.pictureUrl) {
      return (
        <Image
          source={{ uri: userData.pictureUrl }}
          style={{ width: 36, height: 36, borderRadius: 18 }}
        />
      );
    } else if (userToken && userData?.name) {
      return (
        <View
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: Colors.primaryLight,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text style={{ fontSize: 16, fontWeight: "bold", color: Colors.primary }}>
            {getUserInitials()}
          </Text>
        </View>
      );
    } else {
      return (
        <View
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: "#e2e8f0",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Ionicons name="person-outline" size={20} color={Colors.textMuted} />
        </View>
      );
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.bg} />
      <LinearGradient
        colors={["#e8f5ec", "#f4faf5", "#f4faf5"]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* HEADER */}
        <View style={styles.header}>
          <View style={[styles.logoRow, { marginBottom: sp(0.00028) }]}>
            <View style={[styles.logoMark, { borderRadius: logoRingS / 2 }]}>
              <LinearGradient
                colors={[Colors.bg, Colors.primaryLight, Colors.surface]}
                style={StyleSheet.absoluteFill}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 0 }}
              />
              <Image
                source={require("../../../assets/image/logo.png")}
                style={{ width: logoImgS, height: logoImgS }}
                resizeMode="contain"
              />
            </View>
          </View>

          <View style={styles.avatarWrapper}>
            <TouchableOpacity
              onPress={handleAvatarPress}
              activeOpacity={0.75}
              style={styles.avatarTouchable}
            >
              <View style={[styles.avatarInner, { backgroundColor: "transparent", borderWidth: 0 }]}>
                {renderAvatar()}
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* GREETING */}
        <View style={styles.greetingBlock}>
          <Text style={styles.greeting}>
            Bienvenido,{"\n"}
            <Text style={styles.greetingAccent}>¿qué deseas explorar?</Text>
          </Text>
          <Text style={styles.greetingSub}>
            Identifica y analiza plantas con un solo escaneo.
          </Text>
        </View>

        {/* IMAGEN PRINCIPAL */}
        <View style={styles.imageCard}>
          <View style={styles.imageBadge}>
            <View style={styles.badgeDot} />
            <Text style={styles.badgeText}>Detección activa</Text>
          </View>
          <Image
            source={{ uri: "https://images.unsplash.com/photo-1501004318641-b39e6451bec6" }}
            style={[styles.image, { width: width - 56 }]}
          />
          <LinearGradient
            colors={["transparent", "rgba(15,45,26,0.55)"]}
            style={styles.imageOverlay}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
          />
        </View>

        {/* BOTÓN SCAN */}
        <TouchableOpacity
          style={styles.scanBtn}
          activeOpacity={0.85}
          onPress={() => navigation.navigate("Camera")}
        >
          <LinearGradient
            colors={["#22c55e", "#16a34a", "#15803d"]}
            style={styles.scanGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.scanIconWrap}>
              <Feather name="camera" size={20} color="#fff" />
            </View>
            <Text style={styles.scanText}>Escanear planta</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* ACCIONES */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionLabel}>ACCIONES</Text>
          <View style={styles.sectionLine} />
        </View>

        <View style={styles.menuList}>
          {/* Mis Análisis (restringido) */}
          <TouchableOpacity
            style={styles.menuCard}
            activeOpacity={0.75}
            onPress={() => checkAuthAndNavigate("History")}
          >
            <View style={styles.menuIconWrap}>
              <Feather name="search" size={24} color={Colors.primary} />
            </View>
            <View style={styles.menuTexts}>
              <Text style={styles.menuTitle}>Mis Análisis</Text>
              <Text style={styles.menuSub}>Escaneos recientes de plantas</Text>
            </View>
            <Feather name="chevron-right" size={16} color={Colors.textMuted} />
          </TouchableOpacity>

          {/* Bitácora de cultivo (restringido) */}
          <TouchableOpacity
            style={styles.menuCard}
            activeOpacity={0.75}
            onPress={() => checkAuthAndNavigate("TreatmentLog")}
          >
            <View style={styles.menuIconWrap}>
              <Feather name="book" size={24} color={Colors.primary} />
            </View>
            <View style={styles.menuTexts}>
              <Text style={styles.menuTitle}>Bitácora de cultivo</Text>
              <Text style={styles.menuSub}>Registra tus tratamientos y productos</Text>
            </View>
            <Feather name="chevron-right" size={16} color={Colors.textMuted} />
          </TouchableOpacity>

          {/* Contáctanos (restringido) */}
          <TouchableOpacity
            style={styles.menuCard}
            activeOpacity={0.75}
            onPress={() => checkAuthAndNavigate("Contact")}
          >
            <View style={styles.menuIconWrap}>
              <Feather name="message-circle" size={24} color={Colors.primary} />
            </View>
            <View style={styles.menuTexts}>
              <Text style={styles.menuTitle}>Contáctanos</Text>
              <Text style={styles.menuSub}>Medios de atención</Text>
            </View>
            <Feather name="chevron-right" size={16} color={Colors.textMuted} />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Modal para usuarios no logueados */}
      <Modal
        transparent
        animationType="fade"
        visible={showLoginModal}
        onRequestClose={() => setShowLoginModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Ionicons name="log-in-outline" size={48} color={Colors.primary} />
            <Text style={styles.modalTitle}>Inicia sesión</Text>
            <Text style={styles.modalSubtitle}>
              Para acceder a tu perfil y guardar tus análisis, inicia sesión o regístrate.
            </Text>
            <TouchableOpacity
              style={styles.modalBtn}
              activeOpacity={0.85}
              onPress={handleGoToLogin}
            >
              <LinearGradient
                colors={["#22c55e", "#16a34a", "#15803d"]}
                style={styles.modalBtnGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.modalBtnText}>Iniciar sesión</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalCancelBtn}
              activeOpacity={0.75}
              onPress={() => setShowLoginModal(false)}
            >
              <Text style={styles.modalCancelText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}