import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('dec_app.db');

export const initDatabase = () => {
  // 1. Tabla de Detecciones (Historial del agricultor)
  db.execSync(`
    CREATE TABLE IF NOT EXISTS detections (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      disease TEXT,
      confidence TEXT,
      image_uri TEXT,
      date TEXT,
      lat REAL,
      lng REAL,
      synced INTEGER DEFAULT 0 
    );
  `);

  // 2. NUEVA: Tabla de Catálogo (Tratamientos traídos de MongoDB)
  db.execSync(`
    CREATE TABLE IF NOT EXISTS pathologies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE,
      description TEXT,
      treatment TEXT
    );
  `);
};

// --- GESTIÓN DE DETECCIONES ---

// CORRECCIÓN: Ahora acepta lat y lng
export const saveDetectionLocal = (disease, confidence, imageUri, lat, lng) => {
  const date = new Date().toISOString();
  return db.runSync(
    'INSERT INTO detections (disease, confidence, image_uri, date, lat, lng, synced) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [disease, confidence, imageUri, date, lat, lng, 0]
  );
};

// --- GESTIÓN DE PATOLOGÍAS (CATÁLOGO OFFLINE) ---

// NUEVA: Función para guardar lo que bajamos de MongoDB al iniciar sesión
export const syncPathologiesLocal = (pathologyList) => {
  try {
    db.withTransactionSync(() => {
      // Limpiamos o actualizamos para no tener datos viejos
      pathologyList.forEach(p => {
        db.runSync(
          'INSERT OR REPLACE INTO pathologies (name, description, treatment) VALUES (?, ?, ?)',
          [p.name, p.description, p.treatment]
        );
      });
    });
    console.log("✅ Catálogo SQLite actualizado");
  } catch (error) {
    console.error("Error sincronizando catálogo local:", error);
  }
};

export const getPathologyByName = (name) => {
  try {
    return db.getFirstSync('SELECT * FROM pathologies WHERE name = ?', [name]);
  } catch (error) {
    console.error("Error al consultar patología local:", error);
    return null;
  }
};

// --- UTILIDADES ---

export const getUnsyncedDetections = () => {
  return db.getAllSync('SELECT * FROM detections WHERE synced = 0');
};

export const markAsSynced = (id) => {
  db.runSync('UPDATE detections SET synced = 1 WHERE id = ?', [id]);
};

export const debugCheckDatabase = () => {
  try {
    const allDetections = db.getAllSync('SELECT * FROM detections');
    const allPathologies = db.getAllSync('SELECT * FROM pathologies');
    console.log("--- HISTORIAL DE DETECCIONES ---");
    console.log(JSON.stringify(allDetections, null, 2));
    console.log("--- CATÁLOGO DE TRATAMIENTOS ---");
    console.log(JSON.stringify(allPathologies, null, 2));
  } catch (error) {
    console.error("Error en debug:", error);
  }
};