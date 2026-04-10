import React, { useContext } from 'react';
import { Platform, View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';

// Contexto compartido (Este es seguro porque solo tiene lógica)
import { AuthContext } from '../context/AuthContext';

export default function AppNavigator() {
  const { isLoading } = useContext(AuthContext);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#e6f3ef' }}>
        <ActivityIndicator size="large" color="#16a34a" />
      </View>
    );
  }

  // --- CARGA DINÁMICA POR PLATAFORMA ---
  // Esto evita que la Web intente importar librerías de Android/iOS
  const RenderNavigator = () => {
    if (Platform.OS === 'web') {
      const WebNavigator = require('./WebNavigator.web').default;
      return <WebNavigator />;
    } else {
      const MobileNavigator = require('./MobileNavigator').default;
      return <MobileNavigator />;
    }
  };

  return (
    <NavigationContainer>
      <RenderNavigator />
    </NavigationContainer>
  );
}