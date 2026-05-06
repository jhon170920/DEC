import { useEffect, useState } from 'react';
import NetInfo from '@react-native-community/netinfo';

/**
 * Hook para monitorear el estado de la conexión de red
 * Retorna el estado de conectividad y propiedades útiles para UI
 */
export const useNetworkStatus = () => {
  const [isConnected, setIsConnected] = useState(true);
  const [isWifiConnected, setIsWifiConnected] = useState(false);
  const [netType, setNetType] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let unsubscribe = null;

    const checkNetworkStatus = async () => {
      try {
        // Obtener estado inicial
        const state = await NetInfo.fetch();
        updateNetworkState(state);
        
        // Escuchar cambios en el estado de la red
        unsubscribe = NetInfo.addEventListener(updateNetworkState);
      } catch (error) {
        console.error('Error al obtener estado de red:', error);
        setIsLoading(false);
      }
    };

    const updateNetworkState = (state) => {
      const connected = state.isConnected && state.isInternetReachable;
      setIsConnected(connected);
      setIsWifiConnected(state.type === 'wifi');
      setNetType(state.type);
      setIsLoading(false);

      if (!connected) {
        console.log('📴 Modo sin conexión activado');
      } else {
        console.log(`📱 Conectado via ${state.type}`);
      }
    };

    checkNetworkStatus();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  return {
    isConnected,
    isWifiConnected,
    netType,
    isLoading,
    // Propiedades útiles para condicionar la UI
    canEdit: isConnected,
    canDelete: isConnected,
    canSync: isConnected,
    offlineModeActive: !isConnected,
  };
};
