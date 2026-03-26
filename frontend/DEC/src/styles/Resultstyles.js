import { StyleSheet, Platform } from "react-native";
import { Colors } from "../constants/colors";

export const ResultStyles = StyleSheet.create({
root: { flex: 1, backgroundColor: Colors.bg },
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
    marginBottom: 20,
},
logo: { width: 60, height: 60, resizeMode: "contain" },
avatarInner: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.surfaceAlt,
    borderWidth: 1.5, borderColor: Colors.border,
    alignItems: "center", justifyContent: "center",
},

  // Section
sectionHeader: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 14 },
sectionLabel: { fontSize: 10.5, fontWeight: "700", color: Colors.textMuted, letterSpacing: 1.5 },
sectionLine: { flex: 1, height: 1, backgroundColor: Colors.border },

  // Image
imageCard: {
    borderRadius: 20, overflow: "hidden", marginBottom: 20,
    borderWidth: 1.5, borderColor: Colors.border,
    backgroundColor: Colors.surface,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08, shadowRadius: 16, elevation: 4,
},
image: { height: 220, width: "100%", resizeMode: "cover" },

  // Título
analysisTitle: {
    fontSize: 26, fontWeight: "800",
    color: Colors.text, letterSpacing: -0.4,
    marginBottom: 14,
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
},
analysisAccent: {
    color: Colors.primary, fontStyle: "italic",
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
},

  // Badge
badge: {
    flexDirection: "row", alignItems: "center", gap: 8,
    alignSelf: "flex-start",
    backgroundColor: "#dcfce7",
    borderWidth: 1.5, borderColor: Colors.primaryLight,
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 100, marginBottom: 24,
},
badgeDanger: {
    backgroundColor: "#fff7ed",
    borderColor: "#f97316",
},
badgeText: {
    fontSize: 13, fontWeight: "700", color: Colors.primary,
},
badgeTextDanger: { color: "#f97316" },

  // Menu cards
menuList: { gap: 10, marginBottom: 28 },
menuCard: {
    flexDirection: "row", alignItems: "center", gap: 14,
    backgroundColor: Colors.surface,
    borderWidth: 1.5, borderColor: Colors.border,
    borderRadius: 16, padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
},
menuIconWrap: {
    width: 48, height: 48, borderRadius: 14,
    backgroundColor: Colors.surfaceAlt,
    borderWidth: 1, borderColor: Colors.border,
    alignItems: "center", justifyContent: "center",
},
    menuTexts: { flex: 1 },
    menuTitle: { fontSize: 14.5, fontWeight: "700", color: Colors.text, letterSpacing: -0.1, marginBottom: 2 },
    menuSub: { fontSize: 12, color: Colors.textMuted, fontWeight: "400" },

  // Botón
scanBtn: {
    borderRadius: 16, overflow: "hidden",
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35, shadowRadius: 16, elevation: 6,
},
scanGradient: {
    height: 56, alignItems: "center", justifyContent: "center",
},
scanText: { color: "#fff", fontSize: 15, fontWeight: "700", letterSpacing: 0.4 },
});
