import React, { useState, useRef, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StatusBar,
  ScrollView,
  Animated,
  useWindowDimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import * as SecureStore from "expo-secure-store";
import { AuthContext } from "../context/AuthContext";
import { Colors } from "../constants/colors";
import { MainStyles as styles } from "../styles/MainStyles";
import { useResponsiveLayout } from "../hooks/useResponsiveLayout";


// ─── DROPDOWN ──────────────────────────────────────────────
const UserDropdown = ({ visible, onClose, onProfile, onLogout }) => {
  const scaleAnim   = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const mountedRef  = useRef(false);
  const [rendered, setRendered] = useState(false);

  // Montar/desmontar con animación
  React.useEffect(() => {
    if (visible) {
      setRendered(true);
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 220,
          friction: 16,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 160,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 0,
          duration: 130,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 110,
          useNativeDriver: true,
        }),
      ]).start(() => setRendered(false));
    }
  }, [visible]);

  if (!rendered) return null;

  return (
    <>
      {/* Backdrop para cerrar al tocar fuera */}
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={StyleSheet.absoluteFillObject} />
      </TouchableWithoutFeedback>

      <Animated.View
        style={[
          styles.dropdown,
          {
            opacity: opacityAnim,
            transform: [
              {
                scale: scaleAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.88, 1],
                }),
              },
              {
                translateY: scaleAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-10, 0],
                }),
              },
            ],
          },
        ]}
      >
        {/* Flecha decorativa */}
        <View style={styles.dropArrow} />

        {/* Ítem — Mi Perfil */}
        <TouchableOpacity
          style={styles.dropItem}
          onPress={() => { onClose(); onProfile(); }}
          activeOpacity={0.7}
        >
          <View style={styles.dropIconWrap}>
            <Ionicons name="person-outline" size={17} color={Colors.primary} />
          </View>
          <View style={styles.dropTexts}>
            <Text style={styles.dropTitle}>Mi Perfil</Text>
            <Text style={styles.dropSub}>Ver y editar cuenta</Text>
          </View>
          <Feather name="chevron-right" size={15} color={Colors.textMuted} />
        </TouchableOpacity>

        {/* Divisor */}
        <View style={styles.dropDivider} />

        {/* Ítem — Cerrar sesión */}
        <TouchableOpacity
          style={[styles.dropItem, styles.dropItemDanger]}
          onPress={() => { onClose(); onLogout(); }}
          activeOpacity={0.7}
        >
          <View style={[styles.dropIconWrap, styles.dropIconDanger]}>
            <Feather name="log-out" size={17} color={Colors.danger} />
          </View>
          <View style={styles.dropTexts}>
            <Text style={[styles.dropTitle, { color: Colors.danger }]}>
              Cerrar sesión
            </Text>
            <Text style={styles.dropSub}>Salir de la cuenta</Text>
          </View>
        </TouchableOpacity>
      </Animated.View>
    </>
  );
};

// ─── PANTALLA PRINCIPAL ────────────────────────────────────
export default function MainApp() {
  
  const {
    sp,
    hPad,
    logoRingS,
    logoImgS,
    headlineS,
    sublineS,
    fieldH,
    btnH,
    ghostH,
    socialH,
    iconS
  } = useResponsiveLayout();


  const { width } = useWindowDimensions();
  const navigation = useNavigation();
  const { setUserToken, setIsGuest } = useContext(AuthContext);
  const [dropOpen, setDropOpen] = useState(false);

  const handleLogout = async () => {
    try { await SecureStore.deleteItemAsync("userToken"); } catch (_) {}
    setUserToken(null);
    setIsGuest(false);
  };

  const handleProfile = () => {
    navigation.navigate("Profile"); // ajusta el nombre de tu ruta
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

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        onScrollBeginDrag={() => setDropOpen(false)}
      >
        {/* ── HEADER ── */}
        <View style={styles.header}>
          {/* Logo */}
          <View style={[styles.logoRow, {marginBottom: sp(0.00028)}]}>
            <View style={[styles.logoMark,
              { borderRadius: logoRingS /2},
            ]}>
              <LinearGradient
                colors={[Colors.bg, Colors.primaryLight, Colors.surface]}
                style={StyleSheet.absoluteFill}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              />
              <Image 
              source={require("../../assets/image/logo.png")}
              style={{width: logoImgS, height: logoImgS}}
              />
            </View>
            
          </View>

          {/* Avatar con dropdown */}
          <View style={styles.avatarWrapper}>
            <TouchableOpacity
              onPress={() => setDropOpen((v) => !v)}
              activeOpacity={0.75}
              style={styles.avatarTouchable}
            >
              <View style={[styles.avatarInner, dropOpen && styles.avatarActive]}>
                <Ionicons name="person-outline" size={20} color={Colors.primary} />
              </View>
              <Feather
                name={dropOpen ? "chevron-up" : "chevron-down"}
                size={12}
                color={Colors.textMuted}
                style={{ marginTop: 2 }}
              />
            </TouchableOpacity>

            <UserDropdown
              visible={dropOpen}
              onClose={() => setDropOpen(false)}
              onProfile={handleProfile}
              onLogout={handleLogout}
            />
          </View>
        </View>

        {/* ── GREETING ── */}
        <View style={styles.greetingBlock}>
          <Text style={styles.greeting}>
            Bienvenido,{"\n"}
            <Text style={styles.greetingAccent}>¿qué deseas explorar?</Text>
          </Text>
          <Text style={styles.greetingSub}>
            Identifica y analiza plantas con un solo escaneo.
          </Text>
        </View>

        {/* ── IMAGEN PRINCIPAL ── */}
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

        {/* ── BOTÓN SCAN ── */}
        <TouchableOpacity style={styles.scanBtn} activeOpacity={0.85} onPress={() =>navigation.navigate("Camera")}>
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

        {/* ── ACCIONES ── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionLabel}>ACCIONES</Text>
          <View style={styles.sectionLine} />
        </View>

        <View style={styles.menuList}>
            

            <View style={styles.menuList}>

  <TouchableOpacity style={styles.menuCard} activeOpacity={0.75} onPress={() => navigation.navigate("historial")}>
    <View style={styles.menuIconWrap}>
      <Feather name="search" size={24} color={Colors.primary} />
    </View>
    <View style={styles.menuTexts}>
      <Text style={styles.menuTitle}>Mis Análisis</Text>
      <Text style={styles.menuSub}>Escaneos recientes de plantas</Text>
    </View>
    <Feather name="chevron-right" size={16} color={Colors.textMuted} />
  </TouchableOpacity>

  <TouchableOpacity style={styles.menuCard} activeOpacity={0.75} onPress={() => navigation.navigate("Manual")}>
    <View style={styles.menuIconWrap}>
      <Feather name="book-open" size={24} color={Colors.primary} />
    </View>
    <View style={styles.menuTexts}>
      <Text style={styles.menuTitle}>Ayuda</Text>
      <Text style={styles.menuSub}>Manual de uso</Text>
    </View>
    <Feather name="chevron-right" size={16} color={Colors.textMuted} />
  </TouchableOpacity>

  <TouchableOpacity style={styles.menuCard} activeOpacity={0.75} onPress={() => navigation.navigate("Contact")}>
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
</View>
      </ScrollView>
    </View>
  );
}

