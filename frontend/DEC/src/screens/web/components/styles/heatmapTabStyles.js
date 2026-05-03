import { StyleSheet, Platform } from "react-native";


export const heatmapTabStyles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f9fafb' },
    header: { padding: 20, paddingBottom: 0 },
    title: { fontSize: 24, fontWeight: '800', color: '#111827' },
    sub: { color: '#6b7280', marginTop: 4 },
    filterSection: { padding: 20, maxHeight: 280 },
    filterRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', marginBottom: 16, gap: 10 },
    filterLabel: { fontSize: 14, fontWeight: '700', color: '#374151', width: 70 },
    pillScroll: { flex: 1, flexDirection: 'row' },
    pill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: '#f3f4f6', marginRight: 8 },
    pillActive: { backgroundColor: '#16a34a' },
    pillText: { fontSize: 12, fontWeight: '600', color: '#6b7280' },
    pillTextActive: { color: '#fff' },
    dateFilterRow: { flexDirection: 'row', gap: 16, marginBottom: 16, flexWrap: 'wrap', alignItems: 'flex-end' },
    dateInputGroup: { flex: 1, minWidth: 160, minWidth: Platform.OS === 'web' ? 200 : '100%'},
    dateInput: { padding: 10, borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, fontSize: 14, backgroundColor: '#fff', width: '100%',boxSizing: 'border-box', },
    sliderContainer: { marginBottom: 16 },
    exportBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#16a34a', padding: 12, borderRadius: 10 },
    exportBtnText: { color: '#fff', fontWeight: '700' },
    mapContainer: { flex: 1, borderRadius: 20, overflow: 'hidden', margin: 20, marginTop: 0, position: 'relative', minHeight: 500 },
    fallback: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f3f4f6' },
    fallbackText: { marginTop: 16, color: '#6b7280', fontSize: 16 },
    legend: { position: 'absolute', bottom: 20, right: 20, backgroundColor: 'white', padding: 15, borderRadius: 15, width: 240, zIndex: 1000, borderWidth: 1, borderColor: '#e5e7eb', ...Platform.select({ web: { boxShadow: '0 4px 15px rgba(0,0,0,0.1)' } }) },
    legendTitle: { fontSize: 12, fontWeight: '800', color: '#1f2937', marginBottom: 10, textAlign: 'center' },
    gradientBar: { flexDirection: 'row', height: 8, borderRadius: 4, overflow: 'hidden' },
    gradientSegment: { height: '100%' },
    legendLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6, paddingHorizontal: 4 },
    legendText: { fontSize: 10, color: '#9ca3af', fontWeight: '600' },
    legendNote: { fontSize: 10, color: '#6b7280', marginTop: 8, textAlign: 'center' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' }
  });