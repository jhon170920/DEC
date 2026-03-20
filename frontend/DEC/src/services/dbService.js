import * as SQLite from 'expo-sqlite';

// Abrimos (o creamos) la base de datos
const db = SQLite.openDatabaseSync('dec_app.db');

export const initDatabase = () => {
  db.execSync(`
    CREATE TABLE IF NOT EXISTS detections (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      disease TEXT,
      confidence TEXT,
      image_uri TEXT,
      date TEXT,
      synced INTEGER DEFAULT 0 -- 0: No sincronizado, 1: Sincronizado
    );
  `);
};

// Guardar una nueva detección localmente
export const saveDetectionLocal = (disease, confidence, imageUri) => {
  const date = new Date().toISOString();
  return db.runSync(
    'INSERT INTO detections (disease, confidence, image_uri, date, synced) VALUES (?, ?, ?, ?, ?)',
    [disease, confidence, imageUri, date, 0]
  );
};

// Obtener detecciones que aún no se han subido a la nube
export const getUnsyncedDetections = () => {
  return db.getAllSync('SELECT * FROM detections WHERE synced = 0');
};

// Marcar como sincronizado después de subir a MongoDB
export const markAsSynced = (id) => {
  db.runSync('UPDATE detections SET synced = 1 WHERE id = ?', [id]);
};