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

  // Tabla de notas de tratamiento (seguimiento del usuario)
  db.execSync(`
    CREATE TABLE IF NOT EXISTS treatment_notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      detection_id TEXT NOT NULL,
      disease_name TEXT,
      product_name TEXT,
      dose TEXT,
      application_date TEXT,
      notes TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (detection_id) REFERENCES remote_detections(id) ON DELETE CASCADE
    );
  `);

  // Tabla de alarmas programadas localmente
  db.execSync(`
    CREATE TABLE IF NOT EXISTS alarms (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      detection_id TEXT NOT NULL,
      title TEXT,
      message TEXT,
      trigger_date TEXT,    -- Fecha ISO
      active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (detection_id) REFERENCES remote_detections(id) ON DELETE CASCADE
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

// Tabla de seguimientos (logs de tratamiento)
db.execSync(`
  CREATE TABLE IF NOT EXISTS treatment_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    disease_name TEXT NOT NULL,
    general_notes TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    detection_id TEXT, -- opcional, referencia a remote_detections.id
    FOREIGN KEY (detection_id) REFERENCES remote_detections(id) ON DELETE SET NULL
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

// --- Catálogo offline ---
export const syncPathologiesLocal = (pathologyList) => {
  try {
    db.withTransactionSync(() => {
      pathologyList.forEach(p => {
        db.runSync('INSERT OR REPLACE INTO pathologies (name, description, treatment) VALUES (?, ?, ?)',
          [p.name, p.description, p.treatment]);
      });
    });
    console.log("✅ Catálogo SQLite actualizado");
  } catch (error) {
    console.error("Error sincronizando catálogo local:", error);
  }
};
export const getPathologyByName = (name) => db.getFirstSync('SELECT * FROM pathologies WHERE name = ?', [name]);

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

// --- Notas de tratamiento ---
export const saveTreatmentNote = (note) => {
  try {
    const { detection_id, disease_name, product_name, dose, application_date, notes } = note;
    const existing = db.getFirstSync('SELECT id FROM treatment_notes WHERE detection_id = ?', [detection_id]);
    if (existing) {
      db.runSync(
        `UPDATE treatment_notes SET 
          disease_name = ?, product_name = ?, dose = ?, application_date = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
         WHERE detection_id = ?`,
        [disease_name, product_name, dose, application_date, notes, detection_id]
      );
    } else {
      db.runSync(
        `INSERT INTO treatment_notes 
         (detection_id, disease_name, product_name, dose, application_date, notes)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [detection_id, disease_name, product_name, dose, application_date, notes]
      );
    }
  } catch (error) {
    console.error("Error guardando nota de tratamiento:", error);
  }
};
export const getTreatmentNoteByDetectionId = (detection_id) =>
  db.getFirstSync('SELECT * FROM treatment_notes WHERE detection_id = ?', [detection_id]);
export const deleteTreatmentNote = (detection_id) =>
  db.runSync('DELETE FROM treatment_notes WHERE detection_id = ?', [detection_id]);
export const getAllTreatmentNotes = () => db.getAllSync('SELECT * FROM treatment_notes ORDER BY application_date DESC');

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
// Obtener alarmas activas para una detección específica
export const getAlarmsByDetection = (detection_id) =>
  db.getAllSync('SELECT * FROM alarms WHERE detection_id = ? AND active = 1 ORDER BY trigger_date ASC', [detection_id]);
// Obtener todas las alarmas activas (para reprogramar al iniciar la app)
export const getAllActiveAlarms = () =>
  db.getAllSync('SELECT * FROM alarms WHERE active = 1 ORDER BY trigger_date ASC');
// Desactivar alarma (sin eliminar, para mantener historial)
export const deactivateAlarm = (alarmId) =>
  db.runSync('UPDATE alarms SET active = 0 WHERE id = ?', [alarmId]);
// Eliminar alarma completamente
export const deleteAlarm = (alarmId) => {
  try {
    db.runSync('DELETE FROM alarms WHERE id = ?', [alarmId]);
    console.log(`🗑️ Alarma ${alarmId} eliminada de SQLite`);
  } catch (error) {
    console.error("Error eliminando alarma:", error);
  }
};
// Obtener una detección remota por su ID (para detalle)
export const getRemoteDetectionById = (id) => {
  try {
    return db.getFirstSync('SELECT * FROM remote_detections WHERE id = ?', [id]);
  } catch (error) {
    console.error("Error obteniendo detección por ID:", error);
    return null;
  }
};
// Tratamientos (seguimientos)
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
    // Guardar productos asociados
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
    // Eliminar productos antiguos y volver a insertar
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

// --- Utilidades ---
export const debugCheckDatabase = () => {
  try {
    const allDetections = db.getAllSync('SELECT * FROM detections');
    const allPathologies = db.getAllSync('SELECT * FROM pathologies');
    const allRemote = db.getAllSync('SELECT * FROM remote_detections');
    const allNotes = db.getAllSync('SELECT * FROM treatment_notes');
    const allAlarms = db.getAllSync('SELECT * FROM alarms');
    console.log("--- HISTORIAL PENDIENTE ---", JSON.stringify(allDetections, null, 2));
    console.log("--- CATÁLOGO ---", JSON.stringify(allPathologies, null, 2));
    console.log("--- DETECCIONES DESCARGADAS ---", JSON.stringify(allRemote, null, 2));
    console.log("--- NOTAS DE TRATAMIENTO ---", JSON.stringify(allNotes, null, 2));
    console.log("--- ALARMAS ---", JSON.stringify(allAlarms, null, 2));
  } catch (error) {
    console.error("Error en debug:", error);
  }
};


