import { StyleSheet, Platform } from "react-native";
import { Colors } from "../constants/colors";

export const EditProfileStyles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg },
  scroll: {
    paddingTop: Platform.OS === "ios" ? 60 : 44,
    paddingBottom: 40,
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 28,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: Colors.surface,
    borderWidth: 1.5, borderColor: Colors.border,
    alignItems: "center", justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18, fontWeight: "700",
    color: Colors.text, letterSpacing: -0.3,
  },

  // Avatar
  avatarWrap: {
    alignSelf: "center",
    marginBottom: 32,
    position: "relative",
  },
  avatarCircle: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: Colors.surfaceAlt,
    borderWidth: 1.5, borderColor: Colors.border,
    alignItems: "center", justifyContent: "center",
  },
  avatarCameraBtn: {
    position: "absolute", bottom: 2, right: 2,
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: Colors.primary,
    alignItems: "center", justifyContent: "center",
    borderWidth: 2, borderColor: Colors.bg,
  },

  // Inputs
  inputWrap: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: Colors.surface,
    borderWidth: 1.5, borderColor: Colors.border,
    borderRadius: 16, paddingHorizontal: 14,
    marginBottom: 12, gap: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  inputIcon: {},
  input: {
    flex: 1, fontSize: 15,
    color: Colors.text,
  },
  inputReadOnly: {
    flex: 1, fontSize: 15,
    color: Colors.textMuted,
  },
  inputPlaceholder: {
    flex: 1, fontSize: 15,
    color: Colors.textMuted,
  },

  // Botón guardar
  btnGuardar: {
    borderRadius: 16, overflow: "hidden",
    marginTop: 12,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35, shadowRadius: 16, elevation: 6,
  },
  btnGradient: {
    alignItems: "center", justifyContent: "center",
  },
  btnText: { color: "#fff", fontSize: 15, fontWeight: "700", letterSpacing: 0.4 },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    alignItems: "center",
    justifyContent: "center",
  },
  modalBox: {
    width: "85%",
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 24,
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15, shadowRadius: 20, elevation: 10,
  },
  modalTitle: {
    fontSize: 17, fontWeight: "700",
    color: Colors.text, letterSpacing: -0.2,
    marginBottom: 4,
  },
  modalInput: {
    height: 48,
    backgroundColor: Colors.surfaceAlt,
    borderWidth: 1.5, borderColor: Colors.border,
    borderRadius: 12, paddingHorizontal: 14,
    fontSize: 14, color: Colors.text,
  },
  modalBtn: {
    borderRadius: 12, overflow: "hidden",
    marginTop: 4,
  },
  modalBtnGradient: {
    height: 48, alignItems: "center", justifyContent: "center",
  },
  modalBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },
  modalCancelBtn: {
    alignItems: "center", paddingVertical: 8,
  },
  modalCancelText: {
    fontSize: 14, color: Colors.textMuted, fontWeight: "500",
  },
});