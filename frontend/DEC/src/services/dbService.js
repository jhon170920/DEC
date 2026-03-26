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
//VER LAS TABLAS DE SQLITE EN CONSOLA
export const debugCheckDatabase = () => {
  try {
    const allDetections = db.getAllSync('SELECT * FROM detections');
    console.log("--- INICIO DE DATOS ---");
    // El 'null, 2' hace que se vea ordenado con sangría
    console.log(JSON.stringify(allDetections, null, 2)); 
    console.log("--- FIN DE DATOS (Total: " + allDetections.length + ") ---");
  } catch (error) {
    console.error("Error al leer:", error);
  }
};
// export const debugCheckDatabase = () => {
//   try {
//     const allDetections = db.getAllSync('SELECT * FROM detections');
//     if (allDetections.length === 0) {
//       console.log("📭 SQLite está vacío. ¡Haz una captura y dale a GUARDAR!");
//     } else {
//       console.log("📊 Datos encontrados en SQLite:");
//       console.table(allDetections);
//     }
//   } catch (error) {
//     console.error("❌ Error al leer SQLite:", error);
//   }
// };