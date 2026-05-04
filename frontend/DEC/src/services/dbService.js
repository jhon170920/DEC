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
      id TEXT PRIMARY KEY,
      name TEXT UNIQUE,
      description TEXT,
      treatment TEXT,
      imageUrl TEXT
    );
  `);

  // Tabla de recomendaciones (insumos) por patología
  db.execSync(`
    CREATE TABLE IF NOT EXISTS pathology_recommendations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      pathology_id TEXT NOT NULL,
      productName TEXT NOT NULL,
      activeIngredient TEXT,
      dose TEXT NOT NULL,
      price TEXT,
      supplier TEXT,
      link TEXT,
      FOREIGN KEY (pathology_id) REFERENCES pathologies(id) ON DELETE CASCADE
    );
  `);

  // Tabla de detecciones descargadas desde MongoDB (servidor → local)
  db.execSync(`
    CREATE TABLE IF NOT EXISTS remote_detections (
      id TEXT PRIMARY KEY,
      disease_name TEXT,
      confidence REAL,
      image_url TEXT,
      date TEXT,
      lat REAL,
      lng REAL,
      created_at TEXT
    );
  `);

  // Tabla de alarmas programadas localmente
  db.execSync(`
    CREATE TABLE IF NOT EXISTS alarms (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      detection_id TEXT NOT NULL,
      title TEXT,
      message TEXT,
      trigger_date TEXT,
      active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (detection_id) REFERENCES remote_detections(id) ON DELETE CASCADE
    );
  `);

  // Tablas de bitácora (seguimientos con múltiples productos)
  db.execSync(`
    CREATE TABLE IF NOT EXISTS treatment_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      _id TEXT,
      disease_name TEXT NOT NULL,
      general_notes TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      detection_id TEXT,
      FOREIGN KEY (detection_id) REFERENCES remote_detections(id) ON DELETE SET NULL
    );
  `);

  db.execSync(`
    CREATE TABLE IF NOT EXISTS treatment_products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      treatment_log_id INTEGER NOT NULL,
      product_name TEXT NOT NULL,
      dose TEXT,
      application_date TEXT,
      notes TEXT,
      FOREIGN KEY (treatment_log_id) REFERENCES treatment_logs(id) ON DELETE CASCADE
    );
  `);
};

// --- Detecciones pendientes (local → servidor) ---
export const saveDetectionLocal = (disease, confidence, imageUri, lat, lng) => {
  const date = new Date().toISOString();
  return db.runSync(
    'INSERT INTO detections (disease, confidence, image_uri, date, lat, lng, synced) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [disease, confidence, imageUri, date, lat, lng, 0]
  );
};

export const getUnsyncedDetections = () => db.getAllSync('SELECT * FROM detections WHERE synced = 0');
export const markAsSynced = (id) => db.runSync('UPDATE detections SET synced = 1 WHERE id = ?', [id]);

// --- Catálogo offline (con recomendaciones) ---
export const syncPathologiesLocal = (pathologyList) => {
  try {
    db.withTransactionSync(() => {
      pathologyList.forEach(p => {
        // Insertar o reemplazar la patología
        db.runSync(
          'INSERT OR REPLACE INTO pathologies (id, name, description, treatment, imageUrl) VALUES (?, ?, ?, ?, ?)',
          [p._id, p.name, p.description, p.treatment, p.imageUrl || '']
        );
        // Eliminar recomendaciones antiguas
        db.runSync('DELETE FROM pathology_recommendations WHERE pathology_id = ?', [p._id]);
        // Insertar nuevas recomendaciones
        if (p.recommendations && p.recommendations.length) {
          for (const rec of p.recommendations) {
            db.runSync(
              `INSERT INTO pathology_recommendations 
               (pathology_id, productName, activeIngredient, dose, price, supplier, link)
               VALUES (?, ?, ?, ?, ?, ?, ?)`,
              [p._id, rec.productName, rec.activeIngredient, rec.dose, rec.price, rec.supplier, rec.link]
            );
          }
        }
      });
    });
    console.log("✅ Catálogo SQLite actualizado con recomendaciones");
  } catch (error) {
    console.error("Error sincronizando catálogo local:", error);
  }
};

// Obtener patología básica por nombre (sin recomendaciones)
export const getPathologyByName = (name) => {
  return db.getFirstSync('SELECT * FROM pathologies WHERE name = ?', [name]);
};

// Obtener patología completa con recomendaciones
export const getPathologyWithRecommendations = (name) => {
  try {
    const pathology = db.getFirstSync('SELECT * FROM pathologies WHERE name = ?', [name]);
    if (pathology) {
      const recommendations = db.getAllSync('SELECT * FROM pathology_recommendations WHERE pathology_id = ?', [pathology.id]);
      pathology.recommendations = recommendations;
    }
    return pathology;
  } catch (error) {
    console.error("Error obteniendo patología con recomendaciones:", error);
    return null;
  }
};

// --- Detecciones descargadas (servidor → local) ---
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

export const getAllRemoteDetections = () => db.getAllSync('SELECT * FROM remote_detections ORDER BY created_at DESC');
export const getRemoteDetectionsPaginated = (limit, offset) =>
  db.getAllSync('SELECT * FROM remote_detections ORDER BY created_at DESC LIMIT ? OFFSET ?', [limit, offset]);
export const getRemoteDetectionsCount = () => db.getFirstSync('SELECT COUNT(*) as total FROM remote_detections')?.total || 0;
export const clearRemoteDetections = () => db.runSync('DELETE FROM remote_detections');

// --- Alarmas locales ---
export const saveAlarm = (alarm) => {
  try {
    const { detection_id, title, message, trigger_date } = alarm;
    const result = db.runSync(
      `INSERT INTO alarms (detection_id, title, message, trigger_date, active)
       VALUES (?, ?, ?, ?, 1)`,
      [detection_id, title, message, trigger_date]
    );
    return result.lastInsertRowId;
  } catch (error) {
    console.error("Error guardando alarma:", error);
  }
};

export const getAlarmsByDetection = (detection_id) =>
  db.getAllSync('SELECT * FROM alarms WHERE detection_id = ? AND active = 1 ORDER BY trigger_date ASC', [detection_id]);

export const getAllActiveAlarms = () =>
  db.getAllSync('SELECT * FROM alarms WHERE active = 1 ORDER BY trigger_date ASC');

export const deactivateAlarm = (alarmId) =>
  db.runSync('UPDATE alarms SET active = 0 WHERE id = ?', [alarmId]);

export const deleteAlarm = (alarmId) => {
  try {
    db.runSync('DELETE FROM alarms WHERE id = ?', [alarmId]);
    console.log(`🗑️ Alarma ${alarmId} eliminada de SQLite`);
  } catch (error) {
    console.error("Error eliminando alarma:", error);
  }
};

// --- Detección individual (para detalle) ---
export const getRemoteDetectionById = (id) => {
  try {
    return db.getFirstSync('SELECT * FROM remote_detections WHERE id = ?', [id]);
  } catch (error) {
    console.error("Error obteniendo detección por ID:", error);
    return null;
  }
};

// --- Seguimientos (bitácora) ---
export const saveTreatmentLog = async (log) => {
  const { disease_name, general_notes, detection_id, products } = log;
  const now = new Date().toISOString();
  try {
    const result = db.runSync(
      `INSERT INTO treatment_logs (disease_name, general_notes, detection_id, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?)`,
      [disease_name, general_notes, detection_id || null, now, now]
    );
    const logId = result.lastInsertRowId;
    if (products && products.length) {
      for (const prod of products) {
        db.runSync(
          `INSERT INTO treatment_products (treatment_log_id, product_name, dose, application_date, notes)
           VALUES (?, ?, ?, ?, ?)`,
          [logId, prod.product_name, prod.dose, prod.application_date, prod.notes]
        );
      }
    }
    return logId;
  } catch (error) {
    console.error("Error guardando seguimiento:", error);
    throw error;
  }
};

export const updateTreatmentLog = async (id, log) => {
  const { disease_name, general_notes, detection_id, products } = log;
  const now = new Date().toISOString();
  try {
    db.runSync(
      `UPDATE treatment_logs SET disease_name = ?, general_notes = ?, detection_id = ?, updated_at = ?
       WHERE id = ?`,
      [disease_name, general_notes, detection_id || null, now, id]
    );
    db.runSync('DELETE FROM treatment_products WHERE treatment_log_id = ?', [id]);
    if (products && products.length) {
      for (const prod of products) {
        db.runSync(
          `INSERT INTO treatment_products (treatment_log_id, product_name, dose, application_date, notes)
           VALUES (?, ?, ?, ?, ?)`,
          [id, prod.product_name, prod.dose, prod.application_date, prod.notes]
        );
      }
    }
    return true;
  } catch (error) {
    console.error("Error actualizando seguimiento:", error);
    throw error;
  }
};

export const getAllTreatmentLogs = () => {
  return db.getAllSync('SELECT * FROM treatment_logs ORDER BY created_at DESC');
};

export const getTreatmentLogById = (id) => {
  const log = db.getFirstSync('SELECT * FROM treatment_logs WHERE id = ?', [id]);
  if (log) {
    const products = db.getAllSync('SELECT * FROM treatment_products WHERE treatment_log_id = ?', [id]);
    log.products = products;
  }
  return log;
};

export const deleteTreatmentLog = (id) => {
  db.runSync('DELETE FROM treatment_products WHERE treatment_log_id = ?', [id]);
  db.runSync('DELETE FROM treatment_logs WHERE id = ?', [id]);
};

// --- Obtener seguimiento asociado a una detección (el más reciente) ---
export const getTreatmentLogByDetectionId = (detectionId) => {
  try {
    const log = db.getFirstSync('SELECT * FROM treatment_logs WHERE detection_id = ? ORDER BY created_at DESC LIMIT 1', [detectionId]);
    if (log) {
      const products = db.getAllSync('SELECT * FROM treatment_products WHERE treatment_log_id = ?', [log.id]);
      log.products = products;
    }
    return log;
  } catch (error) {
    console.error("Error obteniendo seguimiento por detección:", error);
    return null;
  }
};

// --- Selector de detecciones (para formulario) ---
export const getAllDetectionsForSelector = () => {
  try {
    return db.getAllSync('SELECT id, disease_name, image_url, created_at FROM remote_detections ORDER BY created_at DESC');
  } catch (error) {
    console.error("Error obteniendo detecciones", error);
    return [];
  }
};
// --- Resetear base de datos (para desarrollo) ---
export const resetDatabase = () => {
  try {
    // Lista de todas las tablas creadas por la app
    const tables = [
      'detections',
      'pathologies',
      'pathology_recommendations',
      'remote_detections',
      'alarms',
      'treatment_logs',
      'treatment_products'
    ];
    
    for (const table of tables) {
      db.runSync(`DROP TABLE IF EXISTS ${table}`);
    }
    
    // Recrear la estructura de la base de datos
    initDatabase();
    console.log("🗑️ Base de datos local eliminada y recreada correctamente");
  } catch (error) {
    console.error("Error al resetear la base de datos:", error);
  }
};

// --- Obtener todas las bitácoras con sus productos (para listado) ---
export const getAllTreatmentLogsWithProducts = () => {
  const logs = db.getAllSync('SELECT * FROM treatment_logs ORDER BY id ASC');
  for (const log of logs) {
    const products = db.getAllSync('SELECT * FROM treatment_products WHERE treatment_log_id = ?', [log.id]);
    log.products = products;
  }
  return logs;
};

// Guardar un log descargado desde el servidor (reemplazar o insertar según _id)
export const saveRemoteTreatmentLog = (log) => {
  // Verificar si ya existe localmente por su _id (de MongoDB)
  const existing = db.getFirstSync('SELECT id FROM treatment_logs WHERE _id = ?', [log._id]);
  if (existing) {
    // Actualizar
    db.runSync(
      `UPDATE treatment_logs SET disease_name = ?, general_notes = ?, detection_id = ?, updated_at = ? WHERE id = ?`,
      [log.disease_name, log.general_notes, log.detection_id, log.updatedAt, existing.id]
    );
    const logId = existing.id;
    // Reemplazar productos
    db.runSync('DELETE FROM treatment_products WHERE treatment_log_id = ?', [logId]);
    for (const prod of log.products) {
      db.runSync(
        `INSERT INTO treatment_products (treatment_log_id, product_name, dose, application_date, notes) VALUES (?, ?, ?, ?, ?)`,
        [logId, prod.product_name, prod.dose, prod.application_date, prod.notes]
      );
    }
  } else {
    // Insertar nuevo
    const result = db.runSync(
      `INSERT INTO treatment_logs (_id, disease_name, general_notes, detection_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)`,
      [log._id, log.disease_name, log.general_notes, log.detection_id, log.createdAt, log.updatedAt]
    );
    const logId = result.lastInsertRowId;
    for (const prod of log.products) {
      db.runSync(
        `INSERT INTO treatment_products (treatment_log_id, product_name, dose, application_date, notes) VALUES (?, ?, ?, ?, ?)`,
        [logId, prod.product_name, prod.dose, prod.application_date, prod.notes]
      );
    }
  }
};
// Numero de Seguimientos de Bitacora
export const getTreatmentLogsCount = () => {
  try {
    const result = db.getFirstSync('SELECT COUNT(*) as total FROM treatment_logs');
    return result?.total || 0;
  } catch (error) {
    console.error("Error contando seguimientos:", error);
    return 0;
  }
};

// Limpiar todas las bitácoras locales (usar con precaución)
export const clearAllTreatmentLogs = () => {
  db.runSync('DELETE FROM treatment_products');
  db.runSync('DELETE FROM treatment_logs');
};

// Actualizar IDs
export const updateTreatmentLogRemoteId = (localId, remoteId) => {
  try {
    db.runSync('UPDATE treatment_logs SET _id = ? WHERE id = ?', [remoteId, localId]);
    console.log(`✅ Tratamiento local ID ${localId} actualizado con _id remoto ${remoteId}`);
  } catch (error) {
    console.error("Error actualizando _id del tratamiento:", error);
  }
};
// --- Utilidades ---
export const debugCheckDatabase = () => {
  try {
    const allPathologies = db.getAllSync('SELECT * FROM pathologies');
    const allRecs = db.getAllSync('SELECT * FROM pathology_recommendations');
    console.log("--- CATÁLOGO ---", JSON.stringify(allPathologies, null, 2));
    console.log("--- RECOMENDACIONES ---", JSON.stringify(allRecs, null, 2));
    // ... otros logs
  } catch (error) {
    console.error("Error en debug:", error);
  }
};



