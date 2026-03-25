import React, { useState, useRef, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StatusBar,
  Animated,
  useWindowDimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import * as SecureStore from "expo-secure-store";
import { AuthContext } from "../context/AuthContext";
import { Colors } from "../constants/colors";
import { MainStyles as styles } from "../styles/MainStyles";
import { useResponsiveLayout } from "../hooks/useResponsiveLayout";


// ─── DROPDOWN ──────────────────────────────────────────────
const UserDropdown = ({ visible, onClose, onProfile, onLogout, layout }) => {
  const { dropItemPV, dropIconS, dropTitleS, dropSubS } = layout;

  const scaleAnim   = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const [rendered, setRendered] = useState(false);

  React.useEffect(() => {
    if (visible) {
      setRendered(true);
      Animated.parallel([
        Animated.spring(scaleAnim, { toValue: 1, tension: 220, friction: 16, useNativeDriver: true }),
        Animated.timing(opacityAnim, { toValue: 1, duration: 160, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(scaleAnim,   { toValue: 0, duration: 130, useNativeDriver: true }),
        Animated.timing(opacityAnim, { toValue: 0, duration: 110, useNativeDriver: true }),
      ]).start(() => setRendered(false));
    }
  }, [visible]);

  if (!rendered) return null;

  return (
    <>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={StyleSheet.absoluteFillObject} />
      </TouchableWithoutFeedback>

      <Animated.View
        style={[
          styles.dropdown,
          {
            opacity: opacityAnim,
            transform: [
              { scale: scaleAnim.interpolate({ inputRange: [0,1], outputRange: [0.88,1] }) },
              { translateY: scaleAnim.interpolate({ inputRange: [0,1], outputRange: [-10,0] }) },
            ],
          },
        ]}
      >
        <View style={styles.dropArrow} />

        {/* Mi Perfil */}
        <TouchableOpacity
          style={[styles.dropItem, { paddingVertical: dropItemPV }]}
          onPress={() => { onClose(); onProfile(); }}
          activeOpacity={0.7}
        >
          <View style={styles.dropIconWrap}>
            <Ionicons name="person-outline" size={dropIconS} color={Colors.primary} />
          </View>
          <View style={styles.dropTexts}>
            <Text style={[styles.dropTitle, { fontSize: dropTitleS }]}>Mi Perfil</Text>
            <Text style={[styles.dropSub,   { fontSize: dropSubS  }]}>Ver y editar cuenta</Text>
          </View>
          <Feather name="chevron-right" size={dropIconS - 2} color={Colors.textMuted} />
        </TouchableOpacity>

        <View style={styles.dropDivider} />

        {/* Cerrar sesión */}
        <TouchableOpacity
          style={[styles.dropItem, styles.dropItemDanger, { paddingVertical: dropItemPV }]}
          onPress={() => { onClose(); onLogout(); }}
          activeOpacity={0.7}
        >
          <View style={[styles.dropIconWrap, styles.dropIconDanger]}>
            <Feather name="log-out" size={dropIconS} color={Colors.danger} />
          </View>
          <View style={styles.dropTexts}>
            <Text style={[styles.dropTitle, { color: Colors.danger, fontSize: dropTitleS }]}>
              Cerrar sesión
            </Text>
            <Text style={[styles.dropSub, { fontSize: dropSubS }]}>Salir de la cuenta</Text>
          </View>
        </TouchableOpacity>
      </Animated.View>
    </>
  );
};


// ─── PANTALLA PRINCIPAL ────────────────────────────────────
export default function MainApp() {

  const layout = useResponsiveLayout();
  const {
    hPad,
    // Logo
    logoRingS, logoImgS,
    // Header
    headerPV, avatarInnerS, avatarIconS,
    // Greeting
    greetingS, greetingSubS,
    // Imagen
    imageH, imageBR,
    // Scan
    scanBtnH, scanBtnBR, scanIconS, scanTextS,
    // Sección
    sectionLabelS,
    // Menu cards
    menuCardPV, menuCardPH, menuCardMB,
    menuCardBR, menuIconWrapS, menuIconWrapBR,
    menuIconS, menuTitleS, menuSubS, menuChevronS,
    // Espaciados proporcionales
    sp,
  } = layout;

  const { width } = useWindowDimensions();
  const navigation = useNavigation();
  const { setUserToken, setIsGuest } = useContext(AuthContext);
  const [dropOpen, setDropOpen] = useState(false);

  const handleLogout = async () => {
    try { await SecureStore.deleteItemAsync("userToken"); } catch (_) {}
    setUserToken(null);
    setIsGuest(false);
  };

  return (
    // ROOT ocupa toda la pantalla — sin ScrollView
    <View style={[styles.root, { flex: 1 }]}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.bg} />

      <LinearGradient
        colors={["#e8f5ec", "#f4faf5", "#f4faf5"]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* ── CONTENEDOR PRINCIPAL: distribuye espacio verticalmente ── */}
      <View style={{ flex: 1, paddingHorizontal: hPad }}>

        {/* ── HEADER ───────────────────────────────────────────── */}
        <View style={[styles.header, { paddingVertical: headerPV }]}>

          <View style={styles.logoRow}>
            <View style={[
              styles.logoMark,
              { width: 50, height: 50, borderRadius: logoRingS / 2 },
            ]}>
              
              <Image
                source={require("../../assets/image/logo.png")}
                style={{ width: logoImgS, height: logoImgS }}
                resizeMode="contain"
              />

            </View>
          </View>

          <View style={styles.avatarWrapper}>
            <TouchableOpacity
              onPress={() => setDropOpen((v) => !v)}
              activeOpacity={0.75}
              style={styles.avatarTouchable}
            >
              <View style={[
                styles.avatarInner,
                dropOpen && styles.avatarActive,
                { width: avatarInnerS, height: avatarInnerS, borderRadius: avatarInnerS / 2 },
              ]}>
                <Ionicons name="person-outline" size={avatarIconS} color={Colors.primary} />
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
              onProfile={() => navigation.navigate("Profile")}
              onLogout={handleLogout}
              layout={layout}
            />
          </View>
        </View>

        {/* ── GREETING — flex:1 absorbe el espacio sobrante ──── */}
        <View style={[styles.greetingBlock, { flex: 1, justifyContent: "center" }]}>
          <Text style={[styles.greeting, { fontSize: greetingS }]}>
            Bienvenido,{"\n"}
            <Text style={styles.greetingAccent}>¿qué deseas explorar?</Text>
          </Text>
          <Text style={[styles.greetingSub, { fontSize: greetingSubS, marginTop: 6 }]}>
            Identifica y analiza plantas con un solo escaneo.
          </Text>
        </View>

        {/* ── IMAGEN PRINCIPAL ─────────────────────────────────── */}
        <View style={[styles.imageCard, { borderRadius: imageBR, marginBottom: sp(0.018) }]}>
          <View style={styles.imageBadge}>
            <View style={styles.badgeDot} />
            <Text style={styles.badgeText}>Detección activa</Text>
          </View>
          <Image
            source={{ uri: "https://images.unsplash.com/photo-1501004318641-b39e6451bec6" }}
            style={[
              styles.image,
              { width: width - hPad * 2, height: imageH, borderRadius: imageBR },
            ]}
          />
          <LinearGradient
            colors={["transparent", "rgba(15,45,26,0.55)"]}
            style={[styles.imageOverlay, { borderRadius: imageBR }]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
          />
        </View>

        {/* ── BOTÓN SCAN ───────────────────────────────────────── */}
        <TouchableOpacity
          style={[
            styles.scanBtn,
            { height: scanBtnH, borderRadius: scanBtnBR, marginBottom: sp(0.026) },
          ]}
          activeOpacity={0.85}
          onPress={() => navigation.navigate("Camera")}
        >
          <LinearGradient
            colors={["#22c55e", "#16a34a", "#15803d"]}
            style={[styles.scanGradient, { borderRadius: scanBtnBR }]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.scanIconWrap}>
              <Feather name="camera" size={scanIconS} color="#fff" />
            </View>
            <Text style={[styles.scanText, { fontSize: scanTextS }]}>Escanear planta</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* ── SECCIÓN ACCIONES ─────────────────────────────────── */}
        <View style={[styles.sectionHeader, { marginBottom: sp(0.014) }]}>
          <Text style={[styles.sectionLabel, { fontSize: sectionLabelS }]}>ACCIONES</Text>
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
  );
}
