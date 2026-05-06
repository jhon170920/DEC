import api from '../api/api';
import { getUnsyncedDetections, markAsSynced, getPathologyByName, saveRemoteDetections, getAllTreatmentLogsWithProducts,
  saveRemoteTreatmentLog, clearAllTreatmentLogs } from './dbService';
import { Platform } from 'react-native';
import NetInfo from '@react-native-community/netinfo';

let isSyncing = false;
let syncListener = null;

// Helper para verificar conexión antes de sincronizar
const checkConnectivity = async () => {
  const netState = await NetInfo.fetch();
  return netState.isConnected;
};

// Helper para reintentos con backoff exponencial
const retryWithBackoff = async (fn, maxRetries = 3, initialDelay = 1000) => {
  let lastError;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (attempt < maxRetries - 1) {
        const delay = initialDelay * Math.pow(2, attempt);
        console.log(`⏳ Reintentando en ${delay}ms... (intento ${attempt + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  throw lastError;
};

// Sincronizar detecciones pendientes (local → servidor)
export const syncDetections = async () => {
  if (isSyncing) {
    console.log('⚠️ Sincronización ya en curso, omitiendo...');
    return false;
  }

  const isConnected = await checkConnectivity();
  if (!isConnected) {
    console.log('⚠️ Sin internet, no se pueden sincronizar detecciones');
    return false;
  }

  isSyncing = true;
  try {
    const pendingItems = await getUnsyncedDetections();
    
    if (pendingItems.length === 0) {
      console.log('ℹ️ No hay detecciones pendientes de sincronizar');
      return true;
    }

    let syncedCount = 0;
    let failedCount = 0;

    for (const item of pendingItems) {
      try {
        const formData = new FormData();
        const localPathology = getPathologyByName(item.disease);
    
        if (!localPathology) {
          console.log(`⏭️ "${item.disease}" no está en el catálogo, saltando...`);
          await markAsSynced(item.id);
          failedCount++;
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

        const response = await retryWithBackoff(async () => {
          return await api.post('detections/save', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
        }, 2);

        if (response.status === 201 || response.status === 200) {
          await markAsSynced(item.id);
          console.log(`✅ Sincronización exitosa para ID: ${item.id}`);
          syncedCount++;
        } else {
          console.warn(`⚠️ Respuesta inesperada (${response.status}) para ID: ${item.id}`);
          failedCount++;
        }
      } catch (itemError) {
        console.error(`❌ Error sincronizando detección ${item.id}:`, itemError.message);
        failedCount++;
      }
    }

    console.log(`📊 Detecciones sincronizadas: ${syncedCount}/${pendingItems.length}`);
    return failedCount === 0;
  } catch (error) {
    const errorMsg = error.response?.data?.message || error.message || 'Error desconocido';
    console.error("❌ Error en Sync (local→servidor):", errorMsg);
    return false;
  } finally {
    isSyncing = false;
  }
};

// Sincronizar todas las detecciones del servidor a la base local (servidor → local)
export const syncServerToLocal = async (token) => {
  try {
    const isConnected = await checkConnectivity();
    if (!isConnected) {
      console.log("⚠️ Sin internet, no se puede sincronizar desde el servidor");
      return false;
    }

    let allDetections = [];
    let page = 1;
    const limit = 50;
    let hasMore = true;

    while (hasMore) {
      try {
        const response = await retryWithBackoff(async () => {
          return await api.get(`detections/history?page=${page}&limit=${limit}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
        }, 2); // 2 reintentos para paginación

        if (!response.data) {
          console.warn(`⚠️ Respuesta vacía en página ${page}`);
          break;
        }

        const { history = [], hasMore: more = false } = response.data;
        
        if (!Array.isArray(history)) {
          console.warn(`⚠️ Historia no es un array en página ${page}:`, typeof history);
          break;
        }

        allDetections = [...allDetections, ...history];
        hasMore = more;
        page++;
      } catch (pageError) {
        console.error(`❌ Error en página ${page}:`, pageError.message);
        // Si falla una página, continuamos con las que ya tenemos
        break;
      }
    }

    if (allDetections.length > 0) {
      await saveRemoteDetections(allDetections);
      console.log(`✅ Sincronizadas ${allDetections.length} detecciones desde MongoDB a SQLite`);
    } else {
      console.log("ℹ️ No hay detecciones nuevas para sincronizar");
    }
    return true;
  } catch (error) {
    const errorMsg = error.response?.data?.message || error.message || 'Error desconocido';
    console.error("❌ Error sincronizando servidor → local:", errorMsg);
    return false;
  }
};

// Sincronizar tratamientos (similar a detecciones, pero con su propia lógica)
export const syncLocalTreatments = async () => {
  try {
    const isConnected = await checkConnectivity();
    if (!isConnected) {
      console.log('⚠️ Sin internet, no se pueden sincronizar tratamientos');
      return false;
    }

    const localLogs = getAllTreatmentLogsWithProducts();
    
    if (localLogs.length === 0) {
      console.log('ℹ️ No hay tratamientos locales para sincronizar');
      return true;
    }

    let syncedCount = 0;
    let failedCount = 0;

    for (const log of localLogs) {
      try {
        let response;
        if (log._id) {
          // Actualizar existente
          response = await retryWithBackoff(async () => {
            return await api.put(`treatments/${log._id}`, {
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
          }, 2);
        } else {
          // Crear nuevo
          response = await retryWithBackoff(async () => {
            return await api.post('treatments', {
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
          }, 2);
          // Si el servidor devuelve el _id, actualizar localmente
          if (response.data?.treatment?._id) {
            // db.runSync('UPDATE treatment_logs SET _id = ? WHERE id = ?', [response.data.treatment._id, log.id]);
          }
        }
        console.log(`✅ Bitácora ${log.id} sincronizada`);
        syncedCount++;
      } catch (error) {
        const errorMsg = error.response?.data?.message || error.message || 'Error desconocido';
        console.error(`⚠️ Error sincronizando bitácora ${log.id}:`, errorMsg);
        failedCount++;
      }
    }

    console.log(`📊 Bitácoras sincronizadas: ${syncedCount}/${localLogs.length}`);
    return failedCount === 0;
  } catch (error) {
    const errorMsg = error.response?.data?.message || error.message || 'Error desconocido';
    console.error('❌ Error en syncLocalTreatments:', errorMsg);
    return false;
  }
};

// Descargar bitácoras del servidor a SQLite
export const syncRemoteTreatments = async (token) => {
  try {
    const isConnected = await checkConnectivity();
    if (!isConnected) {
      console.log("⚠️ Sin internet, no se puede descargar bitácoras");
      return false;
    }

    const response = await retryWithBackoff(async () => {
      return await api.get('treatments', {
        headers: { Authorization: `Bearer ${token}` }
      });
    }, 2);

    if (!response.data) {
      console.warn("⚠️ Respuesta vacía al descargar bitácoras");
      return false;
    }

    const remoteLogs = Array.isArray(response.data) ? response.data : response.data.treatments || [];
    
    if (remoteLogs.length === 0) {
      console.log("ℹ️ No hay bitácoras para descargar");
      return true;
    }

    for (const log of remoteLogs) {
      try {
        if (!log._id) {
          console.warn("⚠️ Bitácora sin _id, omitiendo:", log);
          continue;
        }
        await saveRemoteTreatmentLog(log);
      } catch (logError) {
        console.error(`⚠️ Error guardando bitácora ${log._id}:`, logError.message);
        // Continuar con las siguientes bitácoras
      }
    }
    
    console.log(`✅ ${remoteLogs.length} bitácoras descargadas del servidor`);
    return true;
  } catch (error) {
    const errorMsg = error.response?.data?.message || error.message || 'Error desconocido';
    console.error('❌ Error descargando bitácoras:', errorMsg);
    return false;
  }
};

// Iniciar monitoreo de conectividad (llamar al iniciar la app, con el token)
export const startAutoSync = (token) => {
  if (syncListener) return;
  
  syncListener = NetInfo.addEventListener(async (state) => {
    if (state.isConnected) {
      console.log('🌐 Internet detectado, iniciando sincronización...');
      try {
        // Ejecutar sincronizaciones en paralelo con espera máxima
        const syncPromises = [
          syncDetections(),
          syncServerToLocal(token),
          syncLocalTreatments(),
          syncRemoteTreatments(token),
          syncNotifications(token)
        ];
        
        await Promise.allSettled(syncPromises);
        console.log('✅ Sincronización completada');
      } catch (error) {
        console.error('❌ Error durante sincronización automática:', error.message);
      }
    } else {
      console.log('📴 Internet desconectado, usando datos locales');
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
  console.log('🔄 Iniciando sincronización forzada...');
  try {
    const isConnected = await checkConnectivity();
    if (!isConnected) {
      console.warn('⚠️ No hay conexión a internet');
      return false;
    }

    const results = await Promise.allSettled([
      syncDetections(),
      syncServerToLocal(token),
      syncLocalTreatments(),
      syncRemoteTreatments(token),
      syncNotifications(token)
    ]);

    const failed = results.filter(r => r.status === 'rejected').length;
    const succeeded = results.filter(r => r.status === 'fulfilled').length;
    
    console.log(`✅ Sincronización completada: ${succeeded} exitosas, ${failed} fallidas`);
    return failed === 0;
  } catch (error) {
    console.error('❌ Error en sincronización forzada:', error.message);
    return false;
  }
};

// Sincronizacion de notificaciones
export const syncNotifications = async (token) => {
  try {
    const isConnected = await checkConnectivity();
    if (!isConnected) {
      console.log("⚠️ Sin internet, no se pueden descargar notificaciones");
      return [];
    }

    const response = await retryWithBackoff(async () => {
      return await api.get('notifications/my', {
        headers: { Authorization: `Bearer ${token}` }
      });
    }, 2);

    if (!response.data) {
      console.warn("⚠️ Respuesta vacía al descargar notificaciones");
      return [];
    }

    const notifications = Array.isArray(response.data) ? response.data : response.data.notifications || [];
    console.log(`✅ ${notifications.length} notificaciones sincronizadas`);
    return notifications;
  } catch (error) {
    const errorMsg = error.response?.data?.message || error.message || 'Error desconocido';
    console.error('❌ Error sincronizando notificaciones:', errorMsg);
    return [];
  }
};