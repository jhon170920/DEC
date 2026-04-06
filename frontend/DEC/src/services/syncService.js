import api from '../api/api';
import { getUnsyncedDetections, markAsSynced } from './dbService';
import { Platform } from 'react-native';

export const syncDetections = async () => {
  try {
    const pendingItems = await getUnsyncedDetections();
    
    for (const item of pendingItems) {
      const formData = new FormData();
      
      // 1. LIMPIEZA DE CONFIDENCE: Convertimos "78.00%" o 78 a 0.78
      const rawConfidence = parseFloat(item.confidence.replace('%', ''));
      const normalizedConfidence = rawConfidence > 1 ? rawConfidence / 100 : rawConfidence;

      formData.append('pathology', String(item.disease));
      formData.append('confidence', normalizedConfidence); // Ahora enviará 0.78
      
      // 2. CAMPO REQUERIDO: Añadimos plantName (ajusta el valor según tu backend)
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

      console.log(`Enviando: ${item.disease} (${normalizedConfidence}) para ${formData.get('plantName')}`);

      const response = await api.post('detections/save', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.status === 201 || response.status === 200) {
        await markAsSynced(item.id);
        console.log(`✅ Sincronización exitosa en Atlas para ID: ${item.id}`);
      }
    }
  } catch (error) {
    // Aquí verás si Atlas sigue rechazando algo
    console.error("❌ Error en Sync:", error.response?.data || error.message);
  }
};