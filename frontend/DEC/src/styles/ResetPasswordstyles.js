import { StyleSheet, Platform } from "react-native";
import { Colors } from "../constants/colors";

export const ResetPasswordStyles = StyleSheet.create({
root: { flex: 1, backgroundColor: Colors.bg },
scroll: {
    paddingTop: Platform.OS === "ios" ? 60 : 44,
    paddingBottom: 40,
    alignItems: "center",
},

  // Logo
logoWrap: {
    backgroundColor: Colors.surface,
    borderWidth: 1.5, borderColor: Colors.border,
    alignItems: "center", justifyContent: "center",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, shadowRadius: 6, elevation: 3,
  },

  // Título
title: {
    fontWeight: "700",
    color: Colors.text,
    textAlign: "center",
    letterSpacing: -0.3,
    marginBottom: 8,
},
subtitle: {
    color: Colors.primary,
    fontStyle: "italic",
    textAlign: "center",
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
},

  // Card
card: {
    width: "100%",
    backgroundColor: Colors.surface,
    borderRadius: 20,
    borderWidth: 1.5, borderColor: Colors.border,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
},

  // Label
label: {
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 8,
},

  // Código
codeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
},
codeInput: {
    width: 44, height: 50,
    borderRadius: 12,
    backgroundColor: Colors.surfaceAlt,
    borderWidth: 1.5, borderColor: Colors.border,
    fontSize: 20, fontWeight: "700",
    color: Colors.text,
},
codeInputFilled: {
    borderColor: Colors.primary,
    backgroundColor: "#dcfce7",
},

  // Inputs
inputWrap: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: Colors.surfaceAlt,
    borderWidth: 1.5, borderColor: Colors.border,
    borderRadius: 12, paddingHorizontal: 14,
    marginBottom: 16, gap: 10,
},
input: {
    flex: 1, fontSize: 15,
    color: Colors.text,
},

  // Botón
btnActualizar: {
    borderRadius: 16, overflow: "hidden",
    marginTop: 4,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35, shadowRadius: 16, elevation: 6,
},
btnGradient: {
    flexDirection: "row",
    alignItems: "center", justifyContent: "center",
    gap: 10,
},
btnText: { color: "#fff", fontSize: 15, fontWeight: "700", letterSpacing: 0.4 },
});