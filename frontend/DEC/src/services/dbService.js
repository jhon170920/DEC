import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('dec_app.db');

export const initDatabase = () => {
  // Tabla de detecciones pendientes de sincronizar (local → servidor)
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

  // Tabla de catálogo de enfermedades (offline)
  db.execSync(`
    CREATE TABLE IF NOT EXISTS pathologies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE,
      description TEXT,
      treatment TEXT
    );
  `);

  // NUEVA TABLA: detecciones descargadas desde MongoDB (servidor → local)
  db.execSync(`
    CREATE TABLE IF NOT EXISTS remote_detections (
      id TEXT PRIMARY KEY,               -- _id de MongoDB
      disease_name TEXT,
      confidence REAL,
      image_url TEXT,
      date TEXT,
      lat REAL,
      lng REAL,
      created_at TEXT
    );
  `);
};

// --- Guardar detección local (pendiente de subir) ---
export const saveDetectionLocal = (disease, confidence, imageUri, lat, lng) => {
  const date = new Date().toISOString();
  return db.runSync(
    'INSERT INTO detections (disease, confidence, image_uri, date, lat, lng, synced) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [disease, confidence, imageUri, date, lat, lng, 0]
  );
};

// --- Guardar/actualizar detecciones bajadas del servidor ---
export const saveRemoteDetections = (detections) => {
  try {
    db.withTransactionSync(() => {
      for (const d of detections) {
        const diseaseName = d.pathologyId?.name || 'Planta Sana';
        const confidence = d.confidence ?? 0;
        const imageUrl = d.imageUrl || '';
        const date = d.createdAt ? new Date(d.createdAt).toISOString() : new Date().toISOString();
        const lat = d.location?.coordinates?.[1] || 0;
        const lng = d.location?.coordinates?.[0] || 0;
        db.runSync(
          `INSERT OR REPLACE INTO remote_detections 
           (id, disease_name, confidence, image_url, date, lat, lng, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [d._id, diseaseName, confidence, imageUrl, date, lat, lng, d.createdAt]
        );
      }
    });
    console.log(`✅ ${detections.length} detecciones guardadas en SQLite`);
  } catch (error) {
    console.error("Error guardando detecciones remotas:", error);
  }
};

// --- Obtener todas las detecciones remotas (ordenadas) ---
export const getAllRemoteDetections = () => {
  try {
    return db.getAllSync('SELECT * FROM remote_detections ORDER BY created_at DESC');
  } catch (error) {
    console.error("Error obteniendo detecciones remotas:", error);
    return [];
  }
};

// --- Paginación local ---
export const getRemoteDetectionsPaginated = (limit, offset) => {
  try {
    return db.getAllSync(
      'SELECT * FROM remote_detections ORDER BY created_at DESC LIMIT ? OFFSET ?',
      [limit, offset]
    );
  } catch (error) {
    console.error("Error en paginación local:", error);
    return [];
  }
};

// --- Contar total de detecciones remotas ---
export const getRemoteDetectionsCount = () => {
  try {
    const result = db.getFirstSync('SELECT COUNT(*) as total FROM remote_detections');
    return result?.total || 0;
  } catch (error) {
    console.error("Error contando detecciones:", error);
    return 0;
  }
};

// --- Limpiar tabla remota (útil para resincronizar) ---
export const clearRemoteDetections = () => {
  try {
    db.runSync('DELETE FROM remote_detections');
    console.log("🗑️ Detecciones remotas eliminadas");
  } catch (error) {
    console.error("Error limpiando tabla remota:", error);
  }
};

// --- Funciones para catálogo y sincronización local → servidor (ya existentes) ---
export const syncPathologiesLocal = (pathologyList) => {
  try {
    db.withTransactionSync(() => {
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
    const allRemote = db.getAllSync('SELECT * FROM remote_detections');
    console.log("--- HISTORIAL PENDIENTE ---");
    console.log(JSON.stringify(allDetections, null, 2));
    console.log("--- CATÁLOGO ---");
    console.log(JSON.stringify(allPathologies, null, 2));
    console.log("--- DETECCIONES DESCARGADAS ---");
    console.log(JSON.stringify(allRemote, null, 2));
  } catch (error) {
    console.error("Error en debug:", error);
  }
};


