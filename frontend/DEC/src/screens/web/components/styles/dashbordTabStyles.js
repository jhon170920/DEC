import { StyleSheet, Platform } from "react-native";

export const dashboardTabStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  content: { padding: 20, paddingBottom: 40 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, color: '#6b7280' },

  // FILTER BAR
  filterBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 20,
    flexWrap: 'wrap',
    gap: 12
  },
  filterBarResponsiveSmall: {
    width: '40%',
    flexDirection: 'column',
    justifyContent: 'center',
    alignSelf: 'center',
    marginLeft: -12,
  },
  dateFilterRow: {
    flexDirection: 'row',
    gap: 16,
    flexWrap: 'wrap'
  },
  dateFilterRowResposiveSmall: { // typo mantenido por compatibilidad
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 6
  },
  dateInput: {
    padding: 10,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    fontSize: 14,
    backgroundColor: '#fff'
  },

  // NUEVO: contenedor de acciones de filtro (botones)
  filterActions: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterActionsResponsiveSmall: {
    justifyContent: 'center',
    width: '100%',
    marginTop: 8,
  },

  exportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#16a34a',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  exportBtnResponsiveSmall: {
    alignContent: 'center',
    alignItems: 'center',
    marginLeft: '-90%',
  },
  exportBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13
  },

  // KPIs
  kpiRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 12
  },
  kpiCard: {
    flex: 1,
    minWidth: 170,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    ...Platform.select({ web: { boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)' } })
  },
  kpiIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12
  },
  kpiValue: { fontSize: 28, fontWeight: '800', color: '#111827' },
  kpiTitle: { fontSize: 13, color: '#6b7280', marginTop: 4 },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    marginTop: 8
  },
  trendText: { fontSize: 10, fontWeight: '600' },

  // GRÁFICOS
  chartsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 20,
    marginBottom: 24
  },
  chartRowResponsiveSmall: {
    flexDirection: 'column'
  },
  chartCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb'
  },
  chartCardResponsiveSmall: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
  },
  fullWidthCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 24
  },
  fullWidthCardResponsiveSmall: {
    alignContent: 'center',
    width: '100%',
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 16,
    textAlign: 'center'
  },
  noData: { textAlign: 'center', color: '#9ca3af', padding: 20 },

  distributionBar: { marginBottom: 14 },
  distributionLabel: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4
  },
  distributionName: { fontSize: 13, fontWeight: '500', color: '#374151' },
  distributionValue: { fontSize: 13, fontWeight: '600', color: '#16a34a' },
  distributionBarBg: {
    height: 8,
    backgroundColor: '#f3f4f6',
    borderRadius: 4,
    overflow: 'hidden'
  },
  distributionBarFill: { height: '100%', borderRadius: 4 },

  weeklyContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 200
  },
  weeklyBar: { alignItems: 'center', width: 40 },
  weeklyLabel: { fontSize: 11, color: '#6b7280', marginBottom: 8 },
  weeklyBarBg: {
    width: 30,
    height: 120,
    backgroundColor: '#f3f4f6',
    borderRadius: 4,
    overflow: 'hidden',
    justifyContent: 'flex-end'
  },
  weeklyBarFill: {
    width: '100%',
    backgroundColor: '#16a34a',
    borderRadius: 4
  },
  weeklyValue: {
    fontSize: 11,
    fontWeight: '600',
    color: '#374151',
    marginTop: 6
  },

  twoColumns: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 20,
    marginBottom: 24
  },

  topItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6'
  },
  topRank: { width: 30, fontSize: 14, fontWeight: '700', color: '#16a34a' },
  topName: { flex: 1, fontSize: 14, color: '#374151' },
  topValue: { fontSize: 13, fontWeight: '600', color: '#6b7280', marginLeft: '1%' },

  recentItem: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6'
  },
  recentDate: { width: 90, fontSize: 12, color: '#9ca3af' },
  recentPathology: { flex: 1, fontSize: 13, fontWeight: '500', color: '#374151' },
  recentConfidence: {
    fontSize: 12,
    fontWeight: '600',
    color: '#16a34a',
    width: 50,
    textAlign: 'right'
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    width: '80%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
    textAlign: 'center',
  },
  pathologyItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  pathologyItemText: {
    fontSize: 16,
    color: '#374151',
  },
  pathologyItemSelected: {
    backgroundColor: '#dcfce7',
    borderRadius: 8,
  },
  closeModalBtn: {
    marginTop: 16,
    backgroundColor: '#16a34a',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeModalBtnText: {
    color: '#fff',
    fontWeight: '700',
  },
});