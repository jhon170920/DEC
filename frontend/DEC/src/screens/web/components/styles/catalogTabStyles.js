import { StyleSheet } from "react-native";

export const catalogTabStyles = StyleSheet.create({
    container: { flex: 1 },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 25
    },
    title: { fontSize: 26, fontWeight: '800', color: '#1f2937' },
    sub: { color: '#6b7280', marginTop: 4 },
    broadcastBtn: {
      backgroundColor: '#ef4444',
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 12,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    broadcastBtnText: { color: '#fff', fontWeight: '700' },
    mainLayout: { flexDirection: 'row', gap: 20, flex: 1 },
    listSide: { width: 300 },
    itemCard: {
      backgroundColor: '#fff',
      padding: 18,
      borderRadius: 15,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 10,
      borderWidth: 1,
      borderColor: '#e5e7eb'
    },
    itemCardActive: { backgroundColor: '#16a34a', borderColor: '#16a34a' },
    itemTitle: { fontWeight: '700', color: '#374151', fontSize: 15 },
    activeText: { color: '#fff' },
    historyCard: { marginTop: 20, backgroundColor: '#fff', padding: 15, borderRadius: 15, borderStyle: 'dashed', borderWidth: 1, borderColor: '#d1d5db' },
    historyTitle: { fontSize: 12, fontWeight: '800', color: '#9ca3af', textTransform: 'uppercase', marginBottom: 10 },
    historyItem: { marginBottom: 8 },
    historyDate: { fontSize: 11, fontWeight: '700', color: '#16a34a' },
    historyText: { fontSize: 12, color: '#6b7280' },
    editorSide: {
      flex: 1,
      backgroundColor: '#fff',
      borderRadius: 24,
      padding: 30,
      borderWidth: 1,
      borderColor: '#e5e7eb',
    },
    editorHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 25 },
    pathologyTitle: { fontSize: 28, fontWeight: '800', color: '#111827' },
    scientificName: { fontStyle: 'italic', color: '#6b7280', fontSize: 18 },
    editBtn: {
      flexDirection: 'row',
      backgroundColor: '#374151',
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 10,
      alignItems: 'center',
      gap: 8
    },
    saveBtn: { backgroundColor: '#16a34a' },
    editBtnText: { color: '#fff', fontWeight: '700' },
    imageContainer: { width: '100%', height: 220, borderRadius: 20, overflow: 'hidden', marginBottom: 30, position: 'relative' },
    refImage: { width: '100%', height: '100%', resizeMode: 'cover' },
    uploadOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 10
    },
    uploadText: { color: '#fff', fontWeight: '700' },
    form: { gap: 20 },
    label: { fontSize: 13, fontWeight: '800', color: '#4b5563', marginBottom: 8 },
    input: {
      backgroundColor: '#f9fafb',
      padding: 18,
      borderRadius: 15,
      fontSize: 14,
      color: '#1f2937',
      borderWidth: 1,
      borderColor: '#e5e7eb'
    },
    inputActive: { backgroundColor: '#fff', borderColor: '#16a34a', borderWidth: 1.5 },
    textArea: { minHeight: 120, textAlignVertical: 'top' },
    row: { flexDirection: 'row', gap: 25 },
    fieldGroup: { flex: 1 },
    switchContainer: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 5 },
    statusText: { fontSize: 12, fontWeight: '800' },
    incidenciaValue: { fontSize: 22, fontWeight: '800', color: '#16a34a', marginTop: 5 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
    modalCard: { backgroundColor: '#fff', width: 450, padding: 30, borderRadius: 24 },
    modalHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
    modalTitle: { fontSize: 20, fontWeight: '800', color: '#111827' },
    modalSub: { color: '#6b7280', fontSize: 14, marginBottom: 20 },
    modalInput: { backgroundColor: '#f3f4f6', padding: 15, borderRadius: 12, marginBottom: 15 },
    modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 10 },
    cancelBtn: { padding: 15 },
    cancelBtnText: { color: '#6b7280', fontWeight: '700' },
    confirmBtn: { backgroundColor: '#ef4444', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12, flexDirection: 'row', alignItems: 'center', gap: 8 },
    confirmBtnText: { color: '#fff', fontWeight: '700' },
    centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText: { marginTop: 12, color: '#6b7280' },
    itemImage: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: '#f3f4f6'
    },
    itemImagePlaceholder: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: '#f3f4f6',
      justifyContent: 'center',
      alignItems: 'center'
    },
    noImage: {
      backgroundColor: '#f9fafb',
      justifyContent: 'center',
      alignItems: 'center'
    },
    noImageText: {
      marginTop: 8,
      color: '#9ca3af',
      fontSize: 12
    },
    recommendationsSection: {
      marginTop: 10
    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12
    },
    addBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: '#f0fdf4',
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 8
    },
    addBtnText: {
      fontSize: 12,
      fontWeight: '600',
      color: '#16a34a'
    },
    recommendationCard: {
      backgroundColor: '#f9fafb',
      borderRadius: 12,
      padding: 12,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: '#e5e7eb'
    },
    recommendationRow: {
      flexDirection: 'row',
      gap: 10,
      marginBottom: 10
    },
    recommendationInput: {
      flex: 1,
      padding: 8,
      fontSize: 13
    },
    recommendationInputSmall: {
      flex: 0.7,
      padding: 8,
      fontSize: 13
    },
    recommendationProduct: {
      fontWeight: '700',
      fontSize: 15,
      color: '#1f2937',
      marginBottom: 4
    },
    recommendationDetail: {
      fontSize: 12,
      color: '#6b7280',
      marginBottom: 2
    },
    removeBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
      gap: 6,
      marginTop: 8,
      paddingTop: 8,
      borderTopWidth: 1,
      borderTopColor: '#e5e7eb'
    },
    removeBtnText: {
      fontSize: 12,
      color: '#ef4444',
      fontWeight: '600'
    },
    linkText: {
      fontSize: 12,
      color: '#3b82f6',
      marginTop: 4,
      textDecorationLine: 'underline'
    },
    noDataText: {
      fontSize: 12,
      color: '#9ca3af',
      fontStyle: 'italic',
      textAlign: 'center',
      marginVertical: 20
    }
  });