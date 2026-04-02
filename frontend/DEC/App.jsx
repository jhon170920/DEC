import React, { useEffect } from 'react';
import { AuthProvider } from './src/context/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';
import { initDatabase } from './src/services/dbService';

export default function App() {
  useEffect(() => {
    initDatabase(); // Esto crea la tabla 'detections' si no existe
  }, []);
  return (
    <AuthProvider>
      <AppNavigator />
    </AuthProvider>
  );
}
