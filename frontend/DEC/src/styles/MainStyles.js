import { StyleSheet, Platform } from "react-native";
import { Colors } from "../constants/colors";

export const MainStyles = StyleSheet.create({
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
    marginBottom: 28,
    zIndex: 100,
  },
  logoRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  logoMark: {
    width: 60, height: 60, borderRadius: 11,
    alignItems: "center", justifyContent: "center",
    overflow: "hidden",
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 5,
  },
  logoText: { fontSize: 18, fontWeight: "800", color: Colors.text, letterSpacing: -0.3 },

  // Avatar
  avatarWrapper: { position: "relative", zIndex: 200 },
  avatarTouchable: { flexDirection: "row", alignItems: "center", gap: 4 },
  avatarInner: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.surfaceAlt,
    borderWidth: 1.5, borderColor: Colors.border,
    alignItems: "center", justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  avatarActive: { borderColor: Colors.primaryLight, backgroundColor: "#dcfce7" },

  // Dropdown
  dropdown: {
    position: "absolute",
    top: 52,
    right: 0,
    width: 222,
    backgroundColor: Colors.surface,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: Colors.border,
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
    backgroundColor: Colors.surface,
    borderTopWidth: 1.5,
    borderLeftWidth: 1.5,
    borderColor: Colors.border,
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
  dropItemDanger: { backgroundColor: Colors.dangerBg },
  dropIconWrap: {
    width: 34, height: 34, borderRadius: 10,
    backgroundColor: Colors.surfaceAlt,
    borderWidth: 1, borderColor: Colors.border,
    alignItems: "center", justifyContent: "center",
  },
  dropIconDanger: { backgroundColor: "#fff0f0", borderColor: Colors.dangerBorder },
  dropTexts: { flex: 1 },
  dropTitle: { fontSize: 13.5, fontWeight: "700", color: Colors.text, letterSpacing: -0.1 },
  dropSub:   { fontSize: 11, color: Colors.textMuted, marginTop: 1 },
  dropDivider: { height: 1, backgroundColor: Colors.border, marginHorizontal: 12, marginVertical: 4 },

  // Greeting
  greetingBlock: { marginBottom: 22 },
  greeting: {
    fontSize: 28, lineHeight: 34, fontWeight: "300",
    color: Colors.text, letterSpacing: -0.4, marginBottom: 6,
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
  },
  greetingAccent: {
    fontStyle: "italic", color: Colors.primary,
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
  },
  greetingSub: { fontSize: 13.5, color: Colors.textSoft, lineHeight: 19 },

  // Image card
  imageCard: {
    borderRadius: 20, overflow: "hidden", marginBottom: 20,
    borderWidth: 1.5, borderColor: Colors.border,
    backgroundColor: Colors.surface,
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
    borderRadius: 100, borderWidth: 1, borderColor: Colors.border,
  },
  badgeDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.primaryLight },
  badgeText: { fontSize: 11, fontWeight: "600", color: Colors.textMid, letterSpacing: 0.3 },
  image: { height: 200, resizeMode: "cover" },
  imageOverlay: { position: "absolute", bottom: 0, left: 0, right: 0, height: 60 },

  // Scan button
  scanBtn: {
    borderRadius: 16, overflow: "hidden", marginBottom: 28,
    shadowColor: Colors.primary,
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
  sectionLabel: { fontSize: 10.5, fontWeight: "700", color: Colors.textMuted, letterSpacing: 1.5 },
  sectionLine: { flex: 1, height: 1, backgroundColor: Colors.border },

  // Menu cards
  menuList: { gap: 10 },
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
  menuSub:   { fontSize: 12, color: Colors.textMuted, fontWeight: "400" },
});