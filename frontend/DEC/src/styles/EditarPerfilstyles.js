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
  avatarImage: {
  width: 100,
  height: 100,
  borderRadius: 50,
  resizeMode: 'cover',
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

  modalOverlay: {
  flex: 1,
  backgroundColor: 'rgba(0,0,0,0.5)',
  justifyContent: 'center',
},
modalScrollContent: {
  flexGrow: 1,
  justifyContent: 'center',
  paddingVertical: 20,
},
modalBox: {
  width: '80%',
  backgroundColor: '#fff',
  borderRadius: 20,
  padding: 20,
  alignSelf:'center',
},
modalTitle: {
  fontSize: 20,
  fontWeight: 'bold',
  marginBottom: 8,
  color: Colors.text,
},
modalSubtitle: {
  fontSize: 14,
  color: Colors.textMuted,
  textAlign: 'center',
  marginBottom: 20,
},
modalInput: {
  width: '100%',
  borderWidth: 1,
  borderColor: '#ddd',
  borderRadius: 10,
  padding: 12,
  marginBottom: 20,
  fontSize: 16,
},
modalBtn: {
  width: '100%',
  borderRadius: 10,
  overflow: 'hidden',
  marginBottom: 10,
},
modalBtnGradient: {
  paddingVertical: 12,
  alignItems: 'center',
},
modalBtnText: {
  color: '#fff',
  fontWeight: 'bold',
  fontSize: 16,
},
modalCancelBtn: {
  paddingVertical: 10,
  paddingHorizontal: 20,
  width: '100%'
},
modalCancelText: {
  color: Colors.surface,
  fontSize: 17,
  fontWeight: '500',
  textAlign: 'center',
  backgroundColor: Colors.danger,
  borderRadius: 14,
  paddingVertical: 12,
  fontWeight: 'bold'
},

});