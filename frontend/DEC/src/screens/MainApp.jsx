import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Platform,
  useWindowDimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialCommunityIcons, Feather } from "@expo/vector-icons";

// ─── TOKENS (mismo sistema que Login/Register) ─────────────
const C = {
  bg:          "#f4faf5",
  surface:     "#ffffff",
  surfaceAlt:  "#f0faf3",
  border:      "#dceee2",
  primary:     "#16a34a",
  primaryLight:"#22c55e",
  primaryDark: "#15803d",
  text:        "#0f2d1a",
  textMid:     "#2d6a4f",
  textSoft:    "#5a8a6a",
  textMuted:   "#8aad96",
};

// ─── MENU CARD ─────────────────────────────────────────────
const MenuCard = ({ icon, title, subtitle, onPress }) => (
  <TouchableOpacity style={styles.menuCard} onPress={onPress} activeOpacity={0.75}>
    {/* Icono con badge verde */}
    <View style={styles.menuIconWrap}>
      <Feather name={icon} size={20} color={C.primary} />
    </View>

    {/* Texto */}
    <View style={styles.menuTexts}>
      <Text style={styles.menuTitle}>{title}</Text>
      <Text style={styles.menuSub}>{subtitle}</Text>
    </View>

    {/* Chevron */}
    <Feather name="chevron-right" size={18} color={C.textMuted} />
  </TouchableOpacity>
);

// ─── PANTALLA PRINCIPAL ────────────────────────────────────
export default function MainApp() {
  const { width } = useWindowDimensions();

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />

      {/* Fondo degradado igual al Login */}
      <LinearGradient
        colors={["#e8f5ec", "#f4faf5", "#f4faf5"]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
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

          {/* Avatar */}
          <TouchableOpacity style={styles.avatarBtn} activeOpacity={0.7}>
            <View style={styles.avatarInner}>
              <Ionicons name="person-outline" size={20} color={C.primary} />
            </View>
          </TouchableOpacity>
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
          {/* Badge sobre imagen */}
          <View style={styles.imageBadge}>
            <View style={styles.badgeDot} />
            <Text style={styles.badgeText}>Detección activa</Text>
          </View>
          <Image
            source={{ uri: "https://images.unsplash.com/photo-1501004318641-b39e6451bec6" }}
            style={[styles.image, { width: width - 56 }]}
          />
          {/* Overlay sutil en la parte inferior */}
          <LinearGradient
            colors={["transparent", "rgba(15,45,26,0.55)"]}
            style={styles.imageOverlay}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
          />
        </View>

        {/* ── BOTÓN SCAN (principal) ── */}
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

        {/* ── SECCIÓN: ACCIONES ── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionLabel}>ACCIONES</Text>
          <View style={styles.sectionLine} />
        </View>

        <View style={styles.menuList}>
          <MenuCard
            icon="search"
            title="Mis Análisis"
            subtitle="Escaneos recientes de plantas"
          />
          <MenuCard
            icon="book-open"
            title="Ayuda"
            subtitle="Manual de uso"
          />
          <MenuCard
            icon="message-circle"
            title="Contáctanos"
            subtitle="Medios de atención"
          />
        </View>

      </ScrollView>
    </View>
  );
}

// ─── ESTILOS ───────────────────────────────────────────────
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: C.bg,
  },
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
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  logoMark: {
    width: 36,
    height: 36,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  logoText: {
    fontSize: 18,
    fontWeight: "800",
    color: C.text,
    letterSpacing: -0.3,
  },
  avatarBtn: {
    padding: 2,
  },
  avatarInner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: C.surfaceAlt,
    borderWidth: 1.5,
    borderColor: C.border,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },

  // Greeting
  greetingBlock: {
    marginBottom: 22,
  },
  greeting: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "300",
    color: C.text,
    letterSpacing: -0.4,
    marginBottom: 6,
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
  },
  greetingAccent: {
    fontStyle: "italic",
    color: C.primary,
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
  },
  greetingSub: {
    fontSize: 13.5,
    color: C.textSoft,
    lineHeight: 19,
  },

  // Image card
  imageCard: {
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 20,
    borderWidth: 1.5,
    borderColor: C.border,
    backgroundColor: C.surface,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
    position: "relative",
  },
  imageBadge: {
    position: "absolute",
    top: 12,
    left: 12,
    zIndex: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.92)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: C.border,
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: C.primaryLight,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "600",
    color: C.textMid,
    letterSpacing: 0.3,
  },
  image: {
    height: 200,
    resizeMode: "cover",
  },
  imageOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
  },

  // Scan button
  scanBtn: {
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 28,
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 6,
  },
  scanGradient: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  scanIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 9,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  scanText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.4,
  },

  // Section header
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 14,
  },
  sectionLabel: {
    fontSize: 10.5,
    fontWeight: "700",
    color: C.textMuted,
    letterSpacing: 1.5,
  },
  sectionLine: {
    flex: 1,
    height: 1,
    backgroundColor: C.border,
  },

  // Menu cards
  menuList: {
    gap: 10,
  },
  menuCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: C.surface,
    borderWidth: 1.5,
    borderColor: C.border,
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  menuIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: C.surfaceAlt,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: "center",
    justifyContent: "center",
  },
  menuTexts: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 14.5,
    fontWeight: "700",
    color: C.text,
    letterSpacing: -0.1,
    marginBottom: 2,
  },
  menuSub: {
    fontSize: 12,
    color: C.textMuted,
    fontWeight: "400",
  },
});