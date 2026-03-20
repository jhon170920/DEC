import api from '../api/api';
import { getUnsyncedDetections, markAsSynced } from './dbService';

export const syncDetections = async () => {
  try {
    const pendingItems = await getUnsyncedDetections();
    
    for (const item of pendingItems) {
      const formData = new FormData();
      formData.append('disease', item.disease);
      formData.append('confidence', item.confidence);
      formData.append('image', {
        uri: item.image_uri,
        type: 'image/jpeg',
        name: `foto.jpg`,
      });

      // Ya no pasamos headers ni token, ¡el api.js lo hace solo!
      const response = await api.post('/detections/save', formData);

      if (response.status === 201) {
        await markAsSynced(item.id);
      }
    }
  } catch (error) {
    console.error("Error en Sync:", error.response?.data || error.message);
  }
};