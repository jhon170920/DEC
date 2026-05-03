import { StyleSheet, Platform } from "react-native";
import { Colors } from "../constants/colors";

export const ProfileStyles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg },
  scroll: {
    paddingTop: Platform.OS === "ios" ? 80 : 55,
    paddingBottom: 40,
  },

  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  logoMark: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: "center", justifyContent: "center",
    backgroundColor: Colors.surface,
    borderWidth: 1, borderColor: Colors.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, shadowRadius: 6, elevation: 3,
  },
  backBtn: {
    width: 40, height: 40, 
    backgroundColor: Colors.surface,
    borderWidth: 1.5, borderColor: Colors.border,
    alignItems: "center", justifyContent: "center",
  },

  // Avatar
  avatarWrap: {
    alignSelf: "center",
    marginBottom: 12,
    position: "relative",
  },
  avatarCircle: {
    backgroundColor: "#a87c5a",
    alignItems: "center", justifyContent: "center",
  },
  avatarInitial: {
    fontWeight: "700", color: "#fff",
  },
  avatarBadge: {
    position: "absolute", bottom: 2, right: 2,
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: Colors.primary,
    alignItems: "center", justifyContent: "center",
    borderWidth: 2, borderColor: Colors.bg,
  },

  // Nombre
  userName: {
    alignSelf: "center",
    fontWeight: "700",
    color: Colors.text, marginBottom: 20,
    letterSpacing: -0.3,
  },

  // Stats
  statsCard: {
    flexDirection: "row",
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1.5, borderColor: Colors.border,
    paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  statItem: { flex: 1, alignItems: "center" },
  statNumber: {
    
    fontWeight: "700", color: Colors.primary,
  },
  statLabel: {
    
    color: Colors.textMuted, marginTop: 2,
  },
  statDivider: { width: 1, backgroundColor: Colors.border },

  // Section
  sectionHeader: {
    flexDirection: "row", alignItems: "center",
    gap: 12, marginBottom: 10, marginTop: 12,
  },
  sectionLabel: {
    fontWeight: "700", color: Colors.textMuted, letterSpacing: 1.5,
  },
  sectionLine: { flex: 1, height: 1, backgroundColor: Colors.border },

  // Group card
  groupCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1.5, borderColor: Colors.border,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
    overflow: "hidden",
  },
  menuItem: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 16, paddingVertical: 14, gap: 12,
  },
  menuIconWrap: {
    width: 36, height: 36, borderRadius: 10,
    alignItems: "center", justifyContent: "center",
  },
  menuTitle: {
    
    flex: 1, fontWeight: "500", color: Colors.text,
  },
  itemDivider: { height: 1, backgroundColor: Colors.border, marginHorizontal: 16 },

  // Botones danger
  btnDanger: {
    
    backgroundColor: "#fff0f0",
    borderRadius: 16,
    borderWidth: 1.5, borderColor: "#fecaca",
    alignItems: "center", justifyContent: "center",
    marginTop: 12,
  },
  btnDangerText: {
    fontWeight: "600", color: "#ef4444",
  },
  //MODAL ESTILOS
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
},
modalBox: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    width: '80%',
    alignItems: 'center',
},
modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 8,
},
modalSubtitle: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 20,
    textAlign: 'center',
},
modalInput: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
    fontSize: 16,
},
modalBtn: {
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: Colors.primary,
    borderRadius: 12,
},
modalConfirmBtn: {
  alignItems: 'center',
  borderRadius: 12,
},
modalBtnGradient: {
    width: '100%',
    padding: 14,
    alignItems: 'center',
    borderRadius: 12,
    marginBottom: 20,
},
modalBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    padding: 2,
    textAlign: 'center',
},
modalCancelBtn: {
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: Colors.primary,
    borderRadius: 12,
},
modalCancelText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    padding: 2,
    textAlign: 'center',
},

});