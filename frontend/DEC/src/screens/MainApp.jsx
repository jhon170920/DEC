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
  Platform,
  Animated,
  useWindowDimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import * as SecureStore from "expo-secure-store";
import { AuthContext } from "../context/AuthContext";

// ─── TOKENS ────────────────────────────────────────────────
const C = {
  bg:           "#f4faf5",
  surface:      "#ffffff",
  surfaceAlt:   "#f0faf3",
  border:       "#dceee2",
  primary:      "#16a34a",
  primaryLight: "#22c55e",
  primaryDark:  "#15803d",
  text:         "#0f2d1a",
  textMid:      "#2d6a4f",
  textSoft:     "#5a8a6a",
  textMuted:    "#8aad96",
  danger:       "#dc2626",
  dangerBg:     "#fff5f5",
  dangerBorder: "#fecaca",
};

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
            <Ionicons name="person-outline" size={17} color={C.primary} />
          </View>
          <View style={styles.dropTexts}>
            <Text style={styles.dropTitle}>Mi Perfil</Text>
            <Text style={styles.dropSub}>Ver y editar cuenta</Text>
          </View>
          <Feather name="chevron-right" size={15} color={C.textMuted} />
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
            <Feather name="log-out" size={17} color={C.danger} />
          </View>
          <View style={styles.dropTexts}>
            <Text style={[styles.dropTitle, { color: C.danger }]}>
              Cerrar sesión
            </Text>
            <Text style={styles.dropSub}>Salir de la cuenta</Text>
          </View>
        </TouchableOpacity>
      </Animated.View>
    </>
  );
};

// ─── MENU CARD ─────────────────────────────────────────────
const MenuCard = ({ icon, title, subtitle, onPress }) => (
  <TouchableOpacity style={styles.menuCard} onPress={onPress} activeOpacity={0.75}>
    <View style={styles.menuIconWrap}>
      <Feather name={icon} size={20} color={C.primary} />
    </View>
    <View style={styles.menuTexts}>
      <Text style={styles.menuTitle}>{title}</Text>
      <Text style={styles.menuSub}>{subtitle}</Text>
    </View>
    <Feather name="chevron-right" size={18} color={C.textMuted} />
  </TouchableOpacity>
);

// ─── PANTALLA PRINCIPAL ────────────────────────────────────
export default function MainApp() {
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
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />

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
          <View style={styles.logoRow}>
            <View style={styles.logoMark}>
              <LinearGradient
                colors={["#22c55e", "#15803d"]}
                style={StyleSheet.absoluteFill}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              />
              <MaterialCommunityIcons name="leaf" size={18} color="#fff" />
            </View>
            <Text style={styles.logoText}>DEC</Text>
          </View>

          {/* Avatar con dropdown */}
          <View style={styles.avatarWrapper}>
            <TouchableOpacity
              onPress={() => setDropOpen((v) => !v)}
              activeOpacity={0.75}
              style={styles.avatarTouchable}
            >
              <View style={[styles.avatarInner, dropOpen && styles.avatarActive]}>
                <Ionicons name="person-outline" size={20} color={C.primary} />
              </View>
              <Feather
                name={dropOpen ? "chevron-up" : "chevron-down"}
                size={12}
                color={C.textMuted}
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
        <TouchableOpacity style={styles.scanBtn} activeOpacity={0.85}>
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
          <MenuCard icon="search"         title="Mis Análisis"  subtitle="Escaneos recientes de plantas" />
          <MenuCard icon="book-open"      title="Ayuda"         subtitle="Manual de uso" />
          <MenuCard icon="message-circle" title="Contáctanos"   subtitle="Medios de atención" />
        </View>
      </ScrollView>
    </View>
  );
}

// ─── ESTILOS ───────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  scroll: {
    paddingHorizontal: 28,
    paddingTop: Platform.OS === "ios" ? 60 : 44,
    paddingBottom: 40,
  },

  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 28,
    zIndex: 100,
  },
  logoRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  logoMark: {
    width: 36, height: 36, borderRadius: 11,
    alignItems: "center", justifyContent: "center",
    overflow: "hidden",
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 5,
  },
  logoText: { fontSize: 18, fontWeight: "800", color: C.text, letterSpacing: -0.3 },

  // Avatar
  avatarWrapper: { position: "relative", zIndex: 200 },
  avatarTouchable: { flexDirection: "row", alignItems: "center", gap: 4 },
  avatarInner: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: C.surfaceAlt,
    borderWidth: 1.5, borderColor: C.border,
    alignItems: "center", justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  avatarActive: { borderColor: C.primaryLight, backgroundColor: "#dcfce7" },

  // Dropdown
  dropdown: {
    position: "absolute",
    top: 52,
    right: 0,
    width: 222,
    backgroundColor: C.surface,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: C.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.13,
    shadowRadius: 28,
    elevation: 14,
    zIndex: 300,
    paddingVertical: 6,
  },
  dropArrow: {
    position: "absolute",
    top: -7,
    right: 16,
    width: 13, height: 13,
    backgroundColor: C.surface,
    borderTopWidth: 1.5,
    borderLeftWidth: 1.5,
    borderColor: C.border,
    transform: [{ rotate: "45deg" }],
    zIndex: 301,
  },
  dropItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 10,
    marginHorizontal: 6,
    borderRadius: 12,
  },
  dropItemDanger: { backgroundColor: C.dangerBg },
  dropIconWrap: {
    width: 34, height: 34, borderRadius: 10,
    backgroundColor: C.surfaceAlt,
    borderWidth: 1, borderColor: C.border,
    alignItems: "center", justifyContent: "center",
  },
  dropIconDanger: { backgroundColor: "#fff0f0", borderColor: C.dangerBorder },
  dropTexts: { flex: 1 },
  dropTitle: { fontSize: 13.5, fontWeight: "700", color: C.text, letterSpacing: -0.1 },
  dropSub:   { fontSize: 11, color: C.textMuted, marginTop: 1 },
  dropDivider: { height: 1, backgroundColor: C.border, marginHorizontal: 12, marginVertical: 4 },

  // Greeting
  greetingBlock: { marginBottom: 22 },
  greeting: {
    fontSize: 28, lineHeight: 34, fontWeight: "300",
    color: C.text, letterSpacing: -0.4, marginBottom: 6,
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
  },
  greetingAccent: {
    fontStyle: "italic", color: C.primary,
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
  },
  greetingSub: { fontSize: 13.5, color: C.textSoft, lineHeight: 19 },

  // Image card
  imageCard: {
    borderRadius: 20, overflow: "hidden", marginBottom: 20,
    borderWidth: 1.5, borderColor: C.border,
    backgroundColor: C.surface,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08, shadowRadius: 16, elevation: 4,
    position: "relative",
  },
  imageBadge: {
    position: "absolute", top: 12, left: 12, zIndex: 10,
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: "rgba(255,255,255,0.92)",
    paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: 100, borderWidth: 1, borderColor: C.border,
  },
  badgeDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: C.primaryLight },
  badgeText: { fontSize: 11, fontWeight: "600", color: C.textMid, letterSpacing: 0.3 },
  image: { height: 200, resizeMode: "cover" },
  imageOverlay: { position: "absolute", bottom: 0, left: 0, right: 0, height: 60 },

  // Scan button
  scanBtn: {
    borderRadius: 16, overflow: "hidden", marginBottom: 28,
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35, shadowRadius: 16, elevation: 6,
  },
  scanGradient: {
    height: 56, flexDirection: "row",
    alignItems: "center", justifyContent: "center", gap: 12,
  },
  scanIconWrap: {
    width: 30, height: 30, borderRadius: 9,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center", justifyContent: "center",
  },
  scanText: { color: "#fff", fontSize: 15, fontWeight: "700", letterSpacing: 0.4 },

  // Section
  sectionHeader: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 14 },
  sectionLabel: { fontSize: 10.5, fontWeight: "700", color: C.textMuted, letterSpacing: 1.5 },
  sectionLine: { flex: 1, height: 1, backgroundColor: C.border },

  // Menu cards
  menuList: { gap: 10 },
  menuCard: {
    flexDirection: "row", alignItems: "center", gap: 14,
    backgroundColor: C.surface,
    borderWidth: 1.5, borderColor: C.border,
    borderRadius: 16, padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  menuIconWrap: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: C.surfaceAlt,
    borderWidth: 1, borderColor: C.border,
    alignItems: "center", justifyContent: "center",
  },
  menuTexts: { flex: 1 },
  menuTitle: { fontSize: 14.5, fontWeight: "700", color: C.text, letterSpacing: -0.1, marginBottom: 2 },
  menuSub:   { fontSize: 12, color: C.textMuted, fontWeight: "400" },
});