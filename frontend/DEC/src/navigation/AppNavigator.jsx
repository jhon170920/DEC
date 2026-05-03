import React, { useContext } from 'react';
import { Platform, View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';
import { navigationRef } from './RootNavigation';

export default function AppNavigator() {
  const auth = useContext(AuthContext);

  const linking = {
    // Esto permite que el navegador entienda las rutas
    prefixes: ['http://localhost:19006', 'https://*.serveousercontent.com'],
    config: {
      screens: {
        // Aquí va tal cual como está en el "name" de WebStack.Screen de WebNavigator.web y como se verá en la URL
        Legal: 'Legal',
        DeletionStatus: 'DeletionStatus',
      },
    },
  };

  // Validación por si el contexto no está disponible
  if (!auth) {
    console.warn('AuthContext no está disponible. Asegúrate de que AuthProvider envuelva AppNavigator.');
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#e6f3ef' }}>
        <ActivityIndicator size="large" color="#16a34a" />
      </View>
    );
  }

  const { isLoading } = auth;

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#e6f3ef' }}>
        <ActivityIndicator size="large" color="#16a34a" />
      </View>
    );
  }

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
    <NavigationContainer ref={navigationRef} linking={Platform.OS === 'web' ? linking : undefined}>
      <RenderNavigator />
    </NavigationContainer>
  );
}