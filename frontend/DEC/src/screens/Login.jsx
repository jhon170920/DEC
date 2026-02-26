import React, { useState, useContext } from 'react'; 
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native'; // Correcto para React Navigation
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { AuthContext } from '../context/AuthContext'; // Importamos tu contexto

// RECUERDA: Usa tu IP real (ej. 192.168.1.5)
const API_URL = "http://192.168.1.XX:8081/api/login"; 

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigation = useNavigation(); 
  // Extraemos las funciones del contexto
  const { setUserToken, setIsGuest } = useContext(AuthContext);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Por favor, completa todos los campos");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(API_URL, {
        email: email.toLowerCase().trim(),
        password: password
      });

      if (response.data.token) {
        await SecureStore.setItemAsync('userToken', response.data.token);
        // Al setear el token, el AppNavigator detecta el cambio y te manda a la Cámara
        setUserToken(response.data.token); 
      }
    } catch (error) {
      console.error(error);
      const message = error.response?.data?.message || "No se pudo conectar con el servidor";
      Alert.alert("Error", message);
    } finally {
      setLoading(false);
    }
  };

  // Función para entrar sin internet o sin cuenta
  const handleGuestEntry = () => {
    setIsGuest(true); // Esto también lo detecta el AppNavigator
  };

  return (
    <LinearGradient colors={["#e6f3ef", "#5b8f6a"]} style={styles.container}>
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Image source={require("../../assets/image/logo.png")} style={styles.logo} resizeMode="contain" />
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            placeholder="Correo electrónico"
            placeholderTextColor="#4b6b5a"
            style={styles.input}
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />

          <TextInput
            placeholder="Contraseña"
            placeholderTextColor="#4b6b5a"
            secureTextEntry
            style={[styles.input, styles.inputPassword]}
            value={password}
            onChangeText={setPassword}
          />

          <TouchableOpacity 
            style={[styles.button, loading && { opacity: 0.7 }]} 
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Ingresar</Text>}
          </TouchableOpacity>

          {/* BOTÓN MODO INVITADO (Offline) */}
          <TouchableOpacity 
            style={[styles.button, { backgroundColor: '#4b6b5a', marginTop: 12 }]} 
            onPress={handleGuestEntry}
          >
            <Text style={styles.buttonText}>Continuar como Invitado</Text>
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>ingresar con</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.socialContainer}>
             <TouchableOpacity><Image source={require("../../assets/image/google.png")} style={styles.socialIcon} /><Text style={styles.socialText}>Google</Text></TouchableOpacity>
             <TouchableOpacity><Image source={require("../../assets/image/facebook.png")} style={styles.socialIcon} /><Text style={styles.socialText}>Facebook</Text></TouchableOpacity>
             <TouchableOpacity><Image source={require("../../assets/image/x.png")} style={styles.socialIcon} /><Text style={styles.socialText}>X</Text></TouchableOpacity>
          </View>

          <View style={styles.footerContainer}>
            <TouchableOpacity 
              style={styles.footerLink}
              onPress={() => Alert.alert("Próximamente", "Función de recuperación en desarrollo")}
            >
              <Text style={styles.footerText}>¿Olvidaste tu contraseña? <Text style={styles.registerText}>Recuperala</Text></Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.footerLink}
              onPress={() => navigation.navigate('Register')} // Cambio de Link a navigation.navigate
            >
              <Text style={styles.footerText}>¿No tienes una cuenta? <Text style={styles.registerText}>Regístrate</Text></Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </LinearGradient>
  );
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 64,
    marginBottom: 40,
  },
  logo: {
    width: 120,
    height: 120,
  },
  inputContainer: {
    width: '100%',
    paddingHorizontal: 32,
  },
  input: {
    backgroundColor: 'rgba(167, 243, 208, 0.7)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    color: '#065f46',
    fontSize: 16,
  },
  inputPassword: {
    marginBottom: 24,
  },
  button: {
    backgroundColor: '#16a34a',
    paddingVertical: 12,
    borderRadius: 12,
  },
  buttonText: {
    textAlign: 'center',
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(15, 78, 51, 0.4)',
  },
  dividerText: {
    marginHorizontal: 8,
    color: '#065f46',
    fontSize: 14,
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 32,
  },
  socialIcon: {
    width: 50,
    height: 50,
  },
  socialText: {
    color: '#065f46',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  footerLink: {
    marginTop: 10,
    alignItems: 'center',
    marginBottom: 8,
  },
  footerLinkText: {
    color: '#065f46',
    textDecorationLine: 'underline',
  },
  footerText: {
    color: '#065f46',
  },
  registerText: {
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
});