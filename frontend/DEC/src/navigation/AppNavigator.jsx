import React, { useContext } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// Contexto
import { AuthContext } from '../context/AuthContext';

// --- IMPORTACIÓN DE PANTALLAS ---
import Login from '../screens/Login';
import Register from '../screens/Register';
// import ForgotPassword from '../screens/ForgotPassword'; // Paso 1: Enviar código
// import ResetPassword from '../screens/ResetPassword';   // Paso 2: Ingresar código y nueva pass

import MainApp from '../screens/MainApp';               // El Dashboard con los 4 botones
// import CameraScreen from '../screens/CameraScreen';
// import HistoryScreen from '../screens/HistoryScreen';
// import ContactScreen from '../screens/ContactScreen';
// import ManualScreen from '../screens/ManualScreen';

const Stack = createStackNavigator();

export default function AppNavigator() {
  const { userToken, isGuest, isLoading } = useContext(AuthContext);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#e6f3ef' }}>
        <ActivityIndicator size="large" color="#16a34a" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {/* CONDICIÓN DE ENTRADA A LA APP */}
        {userToken || isGuest ? (
          // --- STACK DE LA APP PRINCIPAL ---
          <>
            <Stack.Screen name="MainApp" component={MainApp} />
            {/*<Stack.Screen name="Camera" component={CameraScreen} />
            <Stack.Screen name="History" component={HistoryScreen} />
            <Stack.Screen name="Contact" component={ContactScreen} />
            <Stack.Screen name="Manual" component={ManualScreen} /> */}
          </>
        ) : (
          // --- STACK DE AUTENTICACIÓN ---
          <>
            <Stack.Screen name="Login" component={Login} />
             <Stack.Screen name="Register" component={Register} />
            {/*<Stack.Screen name="ForgotPassword" component={ForgotPassword} />
            <Stack.Screen name="ResetPassword" component={ResetPassword} /> */}
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}