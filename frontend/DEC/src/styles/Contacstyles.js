import { StyleSheet, Platform } from "react-native";
import { Colors } from "../constants/colors";

export const ContactStyles = StyleSheet.create({
root: { flex: 1, backgroundColor: Colors.bg },
absoluteFill: { ...StyleSheet.absoluteFill },
scroll: {
    paddingTop: Platform.OS === "ios" ? 80 : 120,
    paddingBottom: 60,
    alignItems: "center",
},

  // -- Logo --
logoWrap: {
    width: 90, height: 90, borderRadius: 45,
    backgroundColor: Colors.surfaceAlt,
    borderWidth: 1.5, borderColor: Colors.border,
    alignItems: "center", justifyContent: "center",
    marginBottom: 30,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15, shadowRadius: 8, elevation: 4,
},
logo: { width: 65, height: 65, resizeMode: "contain" },

  // Título
title: {
    fontSize: 45, fontWeight: "300",
    color: Colors.text, letterSpacing: -0.4,
    marginBottom: 90,
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
},

  // --Label --
label: {
    alignSelf: "flex-start",
    fontSize: 16, fontWeight: "700",
    color: Colors.primary, marginBottom: 6,
    letterSpacing: 0.2,
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
},

  // Input con ícono
inputWrap: {
    flexDirection: "row", alignItems: "center",
    width: "100%", marginBottom: 20,
    borderWidth: 1.5, borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    paddingBottom: 8,
    backgroundColor: Colors.surface,
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
},
inputIcon: { marginRight: 10 },
input: {
    flex: 1, fontSize: 15,
    color: Colors.text,
},

  // TextArea
textArea: {
    width: "100%",
    minHeight: 140,
    borderWidth: 1.5, borderColor: Colors.border,
    borderRadius: 16,
    padding: 14,
    fontSize: 15,
    color: Colors.text,
    backgroundColor: Colors.surface,
    marginBottom: 32,
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
},

  // Botón
btnEnviar: {
    width: "100%", borderRadius: 12, overflow: "hidden",
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35, shadowRadius: 16, elevation: 6,
},
btnGradient: {
    height: 56, alignItems: "center", justifyContent: "center",
},
btnText: { color: "#fff", fontSize: 15, fontWeight: "700", letterSpacing: 0.4 },

// modal
modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    alignItems: "center",
    justifyContent: "center",
},
modalBox: {
    width: "80%",
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 28,
    alignItems: "center",
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15, shadowRadius: 20, elevation: 10,
},
modalTitle: {
    fontSize: 18, fontWeight: "700",
    color: Colors.text, letterSpacing: -0.2,
},
modalSub: {
    fontSize: 13.5, color: Colors.textSoft,
    textAlign: "center", lineHeight: 20,
},
modalBtn: {
    marginTop: 8,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 40,
},
modalBtnText: {
    color: "#fff", fontSize: 15, fontWeight: "700",
},
backBtn: {
    position: "absolute",
    top: Platform.OS === "ios" ? 60 : 44,
    right: 28,
    zIndex: 10,
    width: 55, height: 55,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    borderWidth: 1.5, borderColor: Colors.border,
    alignItems: "center", justifyContent: "center",
},

});
