import api from '../api/api';
import { getUnsyncedDetections, markAsSynced, getPathologyByName, saveRemoteDetections, getAllTreatmentLogsWithProducts,
  saveRemoteTreatmentLog, clearAllTreatmentLogs } from './dbService';
import { Platform } from 'react-native';
import NetInfo from '@react-native-community/netinfo';

let isSyncing = false;
let syncListener = null;

// Sincronizar detecciones pendientes (local → servidor)
export const syncDetections = async () => {
  if (isSyncing) {
    console.log('⚠️ Sincronización ya en curso, omitiendo...');
    return;
  }
  isSyncing = true;
  try {
    const pendingItems = await getUnsyncedDetections();
    
    for (const item of pendingItems) {
      const formData = new FormData();
      const localPathology = getPathologyByName(item.disease);
  
      if (!localPathology) {
        console.log(`⏭️ "${item.disease}" no está en el catálogo, saltando...`);
        await markAsSynced(item.id);
        continue;
      }
      
      const rawConfidence = parseFloat(item.confidence.replace('%', ''));
      const normalizedConfidence = rawConfidence > 1 ? rawConfidence / 100 : rawConfidence;

      formData.append('disease', String(item.disease));
      formData.append('confidence', normalizedConfidence);
      formData.append('plantName', 'Cafeto'); 
      formData.append('date', item.date);
      formData.append('notes', item.notes || 'Sin observaciones');
      formData.append('lat', String(item.lat || 0));
      formData.append('lng', String(item.lng || 0));

      formData.append('image', {
        uri: Platform.OS === 'android' ? item.image_uri : item.image_uri.replace('file://', ''),
        type: 'image/jpeg',
        name: `foto_${item.id}.jpg`,
      });

      console.log(`Enviando: ${item.disease} (${normalizedConfidence})`);

      const response = await api.post('detections/save', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.status === 201 || response.status === 200) {
        await markAsSynced(item.id);
        console.log(`✅ Sincronización exitosa para ID: ${item.id}`);
      }
    }
  } catch (error) {
    console.error("❌ Error en Sync (local→servidor):", error.response?.data || error.message);
  } finally {
    isSyncing = false;
  }
};

// Sincronizar todas las detecciones del servidor a la base local (servidor → local)
export const syncServerToLocal = async (token) => {
  try {
    const netState = await NetInfo.fetch();
    if (!netState.isConnected) {
      console.log("⚠️ Sin internet, no se puede sincronizar desde el servidor");
      return false;
    }

    let allDetections = [];
    let page = 1;
    const limit = 50;
    let hasMore = true;

    while (hasMore) {
      const response = await api.get(`detections/history?page=${page}&limit=${limit}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const { history, hasMore: more } = response.data;
      allDetections = [...allDetections, ...history];
      hasMore = more;
      page++;
    }

    if (allDetections.length > 0) {
      // Opcional: limpiar tabla vieja para reemplazar todo (comentar si quieres mantener ambas)
      // await clearRemoteDetections();
      await saveRemoteDetections(allDetections);
      console.log(`✅ Sincronizadas ${allDetections.length} detecciones desde MongoDB a SQLite`);
    }
    return true;
  } catch (error) {
    console.error("❌ Error sincronizando servidor → local:", error);
    return false;
  }
};

// Sincronizar tratamientos (similar a detecciones, pero con su propia lógica)
export const syncLocalTreatments = async () => {
  const localLogs = getAllTreatmentLogsWithProducts();
  for (const log of localLogs) {
    try {
      let response;
      if (log._id) {
        // Actualizar existente
        response = await api.put(`treatments/${log._id}`, {
          disease_name: log.disease_name,
          general_notes: log.general_notes,
          detection_id: log.detection_id,
          products: log.products.map(p => ({
            product_name: p.product_name,
            dose: p.dose,
            application_date: p.application_date,
            notes: p.notes
          }))
        });
      } else {
        // Crear nuevo
        response = await api.post('treatments', {
          disease_name: log.disease_name,
          general_notes: log.general_notes,
          detection_id: log.detection_id,
          products: log.products.map(p => ({
            product_name: p.product_name,
            dose: p.dose,
            application_date: p.application_date,
            notes: p.notes
          }))
        });
        // Si el servidor devuelve el _id, actualizar localmente
        if (response.data.treatment && response.data.treatment._id) {
          db.runSync('UPDATE treatment_logs SET _id = ? WHERE id = ?', [response.data.treatment._id, log.id]);
        }
      }
      console.log(`✅ Bitácora ${log.id} sincronizada`);
    } catch (error) {
      console.error(`Error sincronizando bitácora ${log.id}:`, error.message);
    }
  }
};

// Descargar bitácoras del servidor a SQLite
export const syncRemoteTreatments = async (token) => {
  try {
    const response = await api.get('treatments');
    const remoteLogs = response.data;
    // Opcional: limpiar todas las bitácoras locales para empezar fresco
    // await clearAllTreatmentLogs();
    for (const log of remoteLogs) {
      await saveRemoteTreatmentLog(log);
    }
    console.log(`✅ ${remoteLogs.length} bitácoras descargadas del servidor`);
  } catch (error) {
    console.error('Error descargando bitácoras:', error);
  }
};

// Iniciar monitoreo de conectividad (llamar al iniciar la app, con el token)
export const startAutoSync = (token) => {
  if (syncListener) return;
  syncListener = NetInfo.addEventListener(async (state) => {
    if (state.isConnected) {
      console.log('🌐 Internet detectado, sincronizando...');
      await syncDetections();
      if (token) await syncServerToLocal(token);
      await syncLocalTreatments();
      await syncRemoteTreatments(token);
    }
  });
};

// Detener monitoreo (opcional)
export const stopAutoSync = () => {
  if (syncListener) {
    syncListener();
    syncListener = null;
  }
};

// Forzar sincronización manual
export const forceSync = async (token) => {
  await syncDetections();
  if (token) await syncServerToLocal(token);
  await syncLocalTreatments();
  await syncRemoteTreatments(token);
};