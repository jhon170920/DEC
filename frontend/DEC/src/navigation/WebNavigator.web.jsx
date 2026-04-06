// src/navigation/WebNavigator.web.jsx
import React, { useContext } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthContext } from '../context/AuthContext';

// Pantallas Web
import LandingPage from '../screens/web/LandingPage.web';
import AdminDashboard from '../screens/web/AdminDashboard.web';
import LoginAdmin from '../screens/web/LoginAdmin.web';

const WebStack = createStackNavigator();

export default function WebNavigator() {
  const { userToken } = useContext(AuthContext);

  return (
    <WebStack.Navigator screenOptions={{ headerShown: false }}>
      {/* La Landing Page siempre es lo primero en Web */}
      <WebStack.Screen name="Home" component={LandingPage} />
      <WebStack.Screen name="LoginAdmin" component={LoginAdmin} />
      <WebStack.Screen name="AdminDashboard" component={AdminDashboard} />
    </WebStack.Navigator>
  );
}