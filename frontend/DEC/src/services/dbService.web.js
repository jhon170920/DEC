// src/services/dbService.web.js
// Este archivo reemplaza al original automáticamente solo en el navegador.

export const initDatabase = () => {
  console.log("🌐 Web: Base de datos local (SQLite) deshabilitada.");
};

export const saveDetectionLocal = (disease, confidence, imageUri, lat, lng) => {
  console.log("🌐 Web: Simulación de guardado local.");
  return { lastInsertRowId: 0 };
};

export const syncPathologiesLocal = (pathologyList) => {
  console.log("🌐 Web: Datos de catálogo recibidos desde Atlas.");
};

export const getPathologyByName = (name) => {
  console.log("🌐 Web: Consultando patología en modo online.");
  return null;
};

export const getUnsyncedDetections = () => {
  return [];
};

export const markAsSynced = (id) => {
  console.log(`🌐 Web: Marcando ID ${id} como sincronizado (Simulado).`);
};

export const debugCheckDatabase = () => {
  console.log("🌐 Web: No hay base de datos local para depurar.");
};
export const saveRemoteDetections = () =>{
  console.log("🌐 Web: no hay base de datos local por sincronizar")
}