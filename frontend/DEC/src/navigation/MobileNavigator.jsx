import React, { useContext } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';

// Contexto
import { AuthContext } from '../context/AuthContext';

// --- IMPORTACIÓN DE PANTALLAS ---
import Login from '../screens/mobile/Login';
import Register from '../screens/mobile/Register';
import VerifyCodeScreen from '../screens/mobile/VerifyCodeScreen';
import ForgotPassword from '../screens/mobile/ForgotPassword'; // Paso 1: Enviar código
import ResetPassword from '../screens/mobile/ResetPassword'   // Paso 2: Ingresar código y nueva pass

import MainApp from '../screens/mobile/MainApp'; // El Tab Navigator principal de la app
import CameraScreen from '../screens/mobile/CameraScreen';
import Result from '../screens/mobile/Result';
import HistoryScreen from '../screens/mobile/HistoryScreen';
import Contact from '../screens/mobile/Contact';
import Profile from '../screens/mobile/Profile';
import { StackActions } from '@react-navigation/native';

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
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* CONDICIÓN DE ENTRADA A LA APP */}
      {userToken || isGuest ? (
        // --- STACK DE LA APP PRINCIPAL ---
        <>
          <Stack.Screen name="MainApp" component={MainApp} />
          <Stack.Screen name="Camera" component={CameraScreen} />
          <Stack.Screen name="History" component={HistoryScreen} />
          <Stack.Screen name="Contact" component={Contact} />
          <Stack.Screen name='VerifyCode' component={VerifyCodeScreen} />
          
          {/* <Stack.Screen name="Manual" component={ManualScreen} /> */}
          <Stack.Screen name="Result" component={Result} /> 
          <Stack.Screen name="Profile" component={Profile} />
        </>
      ) : (
        // --- STACK DE AUTENTICACIÓN ---
        <>
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="Register" component={Register} />
          <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
          <Stack.Screen name='ResetPassword' component={ResetPassword} />
          {/* <Stack.Screen name="ResetPassword" component={ResetPassword} /> */}
        </>
      )}
    </Stack.Navigator>
  );
}