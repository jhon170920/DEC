import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

const { width, height } = Dimensions.get("window");

// ─── TOKENS ────────────────────────────────────────────────
const C = {
  bg: "#f4faf5",
  surface: "#ffffff",
  surfaceAlt: "#f0faf3",
  border: "#dceee2",
  borderFocus: "#22c55e",
  primary: "#16a34a",
  primaryLight: "#22c55e",
  primaryDark: "#15803d",
  primaryGlow: "rgba(34,197,94,0.15)",
  text: "#0f2d1a",
  textMid: "#2d6a4f",
  textSoft: "#5a8a6a",
  textMuted: "#8aad96",
  tabBg: "#e2f0e6",
  blob1: "rgba(134,239,172,0.45)",
  blob2: "rgba(52,211,153,0.25)",
  blob3: "rgba(187,247,208,0.55)",
  checkActive: "#16a34a",
};

// ─── BLOB (animated background circle) ─────────────────────
const Blob = ({ style, color, dx = 10, dy = 15, duration = 10000 }) => {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0, duration, useNativeDriver: true }),
      ])
    ).start();
  }, []);
  const translateX = anim.interpolate({ inputRange: [0, 1], outputRange: [0, dx] });
  const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [0, dy] });
  return (
    <Animated.View style={[style, { transform: [{ translateX }, { translateY }] }]}>
      <View style={{ flex: 1, borderRadius: 999, backgroundColor: color }} />
    </Animated.View>
  );
};

// ─── ANIMATED FIELD ─────────────────────────────────────────
const Field = ({ label, value, onChangeText, secureTextEntry, keyboardType, icon, rightSlot }) => {
  const [focused, setFocused] = useState(false);
  const labelAnim = useRef(new Animated.Value(value ? 1 : 0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(labelAnim, {
      toValue: focused || value ? 1 : 0,
      duration: 180,
      useNativeDriver: false,
    }).start();
    Animated.timing(glowAnim, {
      toValue: focused ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [focused, value]);

  const labelTop = labelAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 8] });
  const labelSize = labelAnim.interpolate({ inputRange: [0, 1], outputRange: [14, 10] });
  const labelColor = labelAnim.interpolate({ inputRange: [0, 1], outputRange: [C.textMuted, C.primaryLight] });
  const borderColor = glowAnim.interpolate({ inputRange: [0, 1], outputRange: [C.border, C.borderFocus] });
  const iconBg = glowAnim.interpolate({ inputRange: [0, 1], outputRange: [C.surfaceAlt, "#dcfce7"] });

  return (
    <Animated.View style={[styles.field, { borderColor }]}>
      <View style={styles.fieldContent}>
        {/* Icon badge */}
        <Animated.View style={[styles.fieldIconWrap, { backgroundColor: iconBg }]}>
          <Text style={[styles.fieldIconText, focused && { color: C.primary }]}>{icon}</Text>
        </Animated.View>

        {/* Label + Input */}
        <View style={styles.fieldTextWrap}>
          <Animated.Text style={[styles.floatingLabel, { top: labelTop, fontSize: labelSize, color: labelColor }]}>
            {focused || value ? label.toUpperCase() : label}
          </Animated.Text>
          <TextInput
            style={styles.fieldInput}
            value={value}
            onChangeText={onChangeText}
            secureTextEntry={secureTextEntry}
            keyboardType={keyboardType || "default"}
            autoCapitalize="none"
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            selectionColor={C.primary}
          />
        </View>

        {rightSlot}
      </View>
    </Animated.View>
  );
};

// ─── CHECKBOX ───────────────────────────────────────────────
const Checkbox = ({ checked, onPress, label }) => {
  const scale = useRef(new Animated.Value(1)).current;
  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scale, { toValue: 0.8, duration: 80, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, tension: 200, friction: 8, useNativeDriver: true }),
    ]).start();
    onPress();
  };
  return (
    <TouchableOpacity style={styles.checkRow} onPress={handlePress} activeOpacity={0.8}>
      <Animated.View style={[styles.checkBox, checked && styles.checkBoxActive, { transform: [{ scale }] }]}>
        {checked && <Text style={styles.checkMark}>✓</Text>}
      </Animated.View>
      <Text style={styles.checkLabel}>{label}</Text>
    </TouchableOpacity>
  );
};

// ─── SOCIAL BUTTON ──────────────────────────────────────────
const SocialBtn = ({ label, color, onPress }) => {
  const scale = useRef(new Animated.Value(1)).current;
  return (
    <TouchableOpacity
      style={styles.socialBtn}
      activeOpacity={0.75}
      onPress={onPress}
    >
      <Text style={[styles.socialLogo, { color }]}>{label[0]}</Text>
      <Text style={styles.socialLabel}>{label}</Text>
    </TouchableOpacity>
  );
};

// ─── MAIN SCREEN ────────────────────────────────────────────
export default function LoginScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState(0);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);

  // Page entry
  const pageAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(28)).current;

  // Tab indicator
  const tabAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(pageAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 700, useNativeDriver: true }),
    ]).start();
  }, []);

  const switchTab = (idx) => {
    setActiveTab(idx);
    Animated.spring(tabAnim, {
      toValue: idx,
      tension: 120,
      friction: 10,
      useNativeDriver: true,
    }).start();
  };

  const tabIndicatorX = tabAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [4, (width - 56) / 2 + 4],
  });

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Campos requeridos", "Por favor completa todos los campos.");
      return;
    }
    setLoading(true);
    // Simulate request
    setTimeout(() => {
      setLoading(false);
      // navigation.replace('Home');
    }, 1500);
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />

      {/* Background blobs */}
      <Blob style={styles.blob1} color={C.blob1} dx={20} dy={15} duration={10000} />
      <Blob style={styles.blob2} color={C.blob2} dx={-15} dy={20} duration={12000} />
      <Blob style={styles.blob3} color={C.blob3} dx={18} dy={-12} duration={9000} />

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View style={{ opacity: pageAnim, transform: [{ translateY: slideAnim }] }}>

            {/* ── HEADER ── */}
            <View style={styles.header}>
              {/* Logo row */}
              <View style={styles.logoRow}>
                <LinearGradient colors={["#22c55e", "#15803d"]} style={styles.logoMark} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                  <Text style={styles.logoIcon}>🌿</Text>
                </LinearGradient>
                <Text style={styles.logoName}>EcoVerde</Text>
              </View>

              {/* Headline */}
              <Text style={styles.headline}>
                {"Hola,\nbienvenido\n"}
                <Text style={styles.headlineItalic}>de vuelta.</Text>
              </Text>
              <Text style={styles.subline}>Ingresa para continuar tu experiencia verde.</Text>
            </View>

            {/* ── TABS ── */}
            <View style={styles.tabRow}>
              <Animated.View style={[styles.tabIndicator, { transform: [{ translateX: tabIndicatorX }] }]} />
              {["Ingresar", "Registrarse"].map((t, i) => (
                <TouchableOpacity key={t} style={styles.tab} onPress={() => switchTab(i)} activeOpacity={0.7}>
                  <Text style={[styles.tabText, activeTab === i && styles.tabTextActive]}>{t}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* ── FORM ── */}
            <View style={styles.form}>
              <Field
                label="Correo electrónico"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                icon="✉"
              />
              <Field
                label="Contraseña"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                icon="🔒"
                rightSlot={
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                    <Text style={styles.eyeIcon}>{showPassword ? "🙈" : "👁"}</Text>
                  </TouchableOpacity>
                }
              />
            </View>

            {/* ── META ROW ── */}
            <View style={styles.metaRow}>
              <Checkbox checked={remember} onPress={() => setRemember(!remember)} label="Recordarme" />
              <TouchableOpacity onPress={() => Alert.alert("Próximamente", "Función en desarrollo")}>
                <Text style={styles.forgotLink}>¿Olvidaste tu contraseña?</Text>
              </TouchableOpacity>
            </View>

            {/* ── PRIMARY BUTTON ── */}
            <TouchableOpacity
              style={[styles.btnPrimary, loading && { opacity: 0.75 }]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={["#22c55e", "#16a34a", "#15803d"]}
                style={styles.btnPrimaryGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <View style={styles.btnPrimaryInner}>
                    <Text style={styles.btnPrimaryText}>Ingresar</Text>
                    <View style={styles.btnArrow}>
                      <Text style={styles.btnArrowText}>→</Text>
                    </View>
                  </View>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* ── GUEST BUTTON ── */}
            <TouchableOpacity style={styles.btnGhost} activeOpacity={0.75}>
              <Text style={styles.btnGhostText}>Continuar como Invitado</Text>
            </TouchableOpacity>

            {/* ── DIVIDER ── */}
            <View style={styles.divider}>
              <View style={styles.divLine} />
              <Text style={styles.divText}>o continúa con</Text>
              <View style={styles.divLine} />
            </View>

            {/* ── SOCIAL ── */}
            <View style={styles.socialRow}>
              <SocialBtn label="Google" color="#4285F4" />
              <SocialBtn label="Facebook" color="#1877F2" />
              <SocialBtn label="X" color="#000000" />
            </View>

            {/* ── FOOTER ── */}
            <TouchableOpacity style={styles.footer} onPress={() => navigation?.navigate("Register")}>
              <Text style={styles.footerText}>
                ¿Primera vez aquí?{" "}
                <Text style={styles.footerLink}>Crea tu cuenta</Text>
              </Text>
            </TouchableOpacity>

          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

// ─── STYLES ─────────────────────────────────────────────────
const TAB_WIDTH = (width - 56) / 2;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: C.bg,
  },

  // Blobs
  blob1: {
    position: "absolute",
    width: 300, height: 300,
    borderRadius: 150,
    top: -80, left: -80,
    overflow: "hidden",
  },
  blob2: {
    position: "absolute",
    width: 240, height: 240,
    borderRadius: 120,
    top: height * 0.28, right: -60,
    overflow: "hidden",
  },
  blob3: {
    position: "absolute",
    width: 180, height: 180,
    borderRadius: 90,
    bottom: 120, left: -40,
    overflow: "hidden",
  },

  scroll: {
    flexGrow: 1,
    paddingHorizontal: 28,
    paddingTop: Platform.OS === "ios" ? 64 : 48,
    paddingBottom: 48,
  },

  // ── Header ──
  header: {
    marginBottom: 28,
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 28,
  },
  logoMark: {
    width: 40, height: 40,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  logoIcon: { fontSize: 20 },
  logoName: {
    fontSize: 17,
    fontWeight: "800",
    color: C.text,
    letterSpacing: -0.3,
  },
  headline: {
    fontSize: 38,
    lineHeight: 42,
    fontWeight: "300",
    color: C.text,
    letterSpacing: -0.5,
    marginBottom: 10,
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
  },
  headlineItalic: {
    fontStyle: "italic",
    color: C.primary,
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    fontWeight: "300",
  },
  subline: {
    fontSize: 14,
    color: C.textSoft,
    lineHeight: 21,
    fontWeight: "400",
  },

  // ── Tabs ──
  tabRow: {
    flexDirection: "row",
    backgroundColor: C.tabBg,
    borderRadius: 14,
    padding: 4,
    marginBottom: 28,
    position: "relative",
    height: 48,
  },
  tabIndicator: {
    position: "absolute",
    top: 4,
    width: TAB_WIDTH,
    height: 40,
    backgroundColor: C.surface,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
  tabText: {
    fontSize: 13,
    fontWeight: "600",
    color: C.textSoft,
    letterSpacing: 0.2,
  },
  tabTextActive: {
    color: C.text,
    fontWeight: "700",
  },

  // ── Form ──
  form: {
    gap: 14,
    marginBottom: 14,
  },
  field: {
    backgroundColor: C.surface,
    borderRadius: 16,
    borderWidth: 1.5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  fieldContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    height: 64,
    gap: 12,
  },
  fieldIconWrap: {
    width: 34, height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  fieldIconText: {
    fontSize: 15,
    color: C.textMuted,
  },
  fieldTextWrap: {
    flex: 1,
    position: "relative",
    height: 64,
    justifyContent: "center",
  },
  floatingLabel: {
    position: "absolute",
    left: 0,
    letterSpacing: 0.3,
    fontWeight: "500",
  },
  fieldInput: {
    color: C.text,
    fontSize: 15,
    fontWeight: "600",
    paddingTop: 18,
    paddingBottom: 2,
  },
  eyeBtn: {
    padding: 6,
    marginLeft: 4,
  },
  eyeIcon: { fontSize: 16 },

  // ── Meta row ──
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
    marginTop: 4,
  },
  checkRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  checkBox: {
    width: 20, height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: C.border,
    backgroundColor: C.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  checkBoxActive: {
    backgroundColor: C.primary,
    borderColor: C.primary,
  },
  checkMark: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "800",
    lineHeight: 14,
  },
  checkLabel: {
    fontSize: 12.5,
    fontWeight: "500",
    color: C.textSoft,
  },
  forgotLink: {
    fontSize: 12.5,
    fontWeight: "700",
    color: C.primary,
  },

  // ── Primary button ──
  btnPrimary: {
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 12,
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 8,
  },
  btnPrimaryGradient: {
    height: 58,
    alignItems: "center",
    justifyContent: "center",
  },
  btnPrimaryInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  btnPrimaryText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  btnArrow: {
    width: 28, height: 28,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  btnArrowText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },

  // ── Ghost button ──
  btnGhost: {
    height: 50,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "#c8e6ce",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 26,
  },
  btnGhostText: {
    color: C.textMid,
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: 0.1,
  },

  // ── Divider ──
  divider: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 20,
  },
  divLine: { flex: 1, height: 1, backgroundColor: C.border },
  divText: {
    fontSize: 11,
    fontWeight: "600",
    color: C.textMuted,
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },

  // ── Social ──
  socialRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 28,
  },
  socialBtn: {
    flex: 1,
    height: 50,
    backgroundColor: C.surface,
    borderWidth: 1.5,
    borderColor: C.border,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  socialLogo: {
    fontSize: 16,
    fontWeight: "800",
    lineHeight: 20,
  },
  socialLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: C.textMid,
    letterSpacing: 0.2,
  },

  // ── Footer ──
  footer: {
    alignItems: "center",
  },
  footerText: {
    fontSize: 13.5,
    color: C.textMuted,
    fontWeight: "500",
  },
  footerLink: {
    color: C.primary,
    fontWeight: "800",
  },
});