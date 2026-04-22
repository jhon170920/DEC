import React, { useEffect, useContext } from 'react';
import { startAutoSync, forceSync } from '../services/syncService';
import { AuthContext } from '../context/AuthContext';
import NetInfo from '@react-native-community/netinfo';

export const SyncManager = () => {
  const { userToken } = useContext(AuthContext);

  useEffect(() => {
    if (!userToken) return;
    // Iniciar auto-sync con el token actual
    startAutoSync(userToken);
    // Forzar sincronización inicial si hay internet
    const checkAndSync = async () => {
      const netState = await NetInfo.fetch();
      if (netState.isConnected) {
        await forceSync(userToken);
      }
    };
    checkAndSync();
  }, [userToken]);

  return null;
};