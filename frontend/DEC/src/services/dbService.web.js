const noop = () => {};
 
// --- Init ---
export const initDatabase = noop;
export const resetDatabase = noop;
export const debugCheckDatabase = noop;
 
// --- Detecciones pendientes (local → servidor) ---
export const saveDetectionLocal = () => ({ lastInsertRowId: 0 });
export const getUnsyncedDetections = () => [];
export const markAsSynced = noop;
 
// --- Catálogo offline ---
export const syncPathologiesLocal = noop;
export const getPathologyByName = () => null;
export const getPathologyWithRecommendations = () => null;
 
// --- Detecciones remotas (servidor → local) ---
export const saveRemoteDetections = noop;
export const getAllRemoteDetections = () => [];
export const getRemoteDetectionsPaginated = () => [];
export const getRemoteDetectionsCount = () => 0;
export const clearRemoteDetections = noop;
export const getRemoteDetectionById = () => null;
export const getAllDetectionsForSelector = () => [];
 
// --- Alarmas ---
export const saveAlarm = () => null;
export const getAlarmsByDetection = () => [];
export const getAllActiveAlarms = () => [];
export const deactivateAlarm = noop;
export const deleteAlarm = noop;
 
// --- Bitácoras de tratamiento ---
export const saveTreatmentLog = () => Promise.resolve(null);
export const updateTreatmentLog = () => Promise.resolve(false);
export const deleteTreatmentLog = noop;
export const getAllTreatmentLogs = () => [];
export const getTreatmentLogById = () => null;
export const getTreatmentLogByDetectionId = () => null;
export const getAllTreatmentLogsWithProducts = () => [];   // ← el que faltaba
export const saveRemoteTreatmentLog = noop;
export const clearAllTreatmentLogs = noop;
