
import React, { useEffect, useContext } from 'react';
import { Platform } from 'react-native';
import { AuthContext } from '../context/AuthContext';
 
// En web no hay SQLite ni NetInfo, el SyncManager no hace nada
// Solo se activa la sincronización en móvil (iOS / Android)
export const SyncManager = () => {
  const { userToken } = useContext(AuthContext);
 
  useEffect(() => {
    if (Platform.OS === 'web') return; // 👈 salida inmediata en web
    if (!userToken) return;
 
    // Importaciones dinámicas para que el bundler web nunca las cargue
    const run = async () => {
      const { startAutoSync, forceSync } = await import('../services/syncService');
      const NetInfo = (await import('@react-native-community/netinfo')).default;
 
      startAutoSync(userToken);
 
      const netState = await NetInfo.fetch();
      if (netState.isConnected) {
        await forceSync(userToken);
      }
    };
 
    run();
  }, [userToken]);
 
  return null;
};
