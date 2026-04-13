import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import api  from '../../api/api';

const C = {
  bg: '#f4faf5',
  surface: '#ffffff',
  p: '#16a34a',
  text: '#0f2d1a',
  mid: '#2d6a4f',
};

export default function LoginAdmin() {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email || !password) {
      return Alert.alert("Error", "Por favor completa todos los campos.");
    }

    setLoading(true);
    try {
      // 1. Llamamos al endpoint de login que ya tienes en users.js
      const response = await api.post('users/login', { email, password });
      const { token, user } = response.data;

      // 2. Validamos que el usuario tenga el ROL de administrador
      // Tu middleware onlyAdmin en el backend depende de esto
      if (user.role !== 'admin' && email !== 'admin@dec.com') { 
        // Nota: He puesto un ejemplo de correo por si aún no has seteado el primer admin en la DB
        throw new Error("No tienes permisos de administrador.");
      }

      // 3. Guardamos el token en localStorage (estamos en Web)
      localStorage.setItem('userToken', token);
      
      // 4. Navegamos al Dashboard
      navigation.navigate('AdminDashboard');

    } catch (error) {
      const msg = error.response?.data?.message || error.message || "Error al iniciar sesión";
      Alert.alert("Acceso Denegado", msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.root}>
      <View style={styles.card}>
        <Text style={styles.title}>Acceso Administrador</Text>
        <Text style={styles.subtitle}>Ingresa tus credenciales para administrar el sistema.</Text>

        <TextInput
          style={styles.input}
          placeholder="Correo electrónico"
          placeholderTextColor="rgba(15,45,26,0.35)"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
        />
        <TextInput
          style={styles.input}
          placeholder="Contraseña"
          placeholderTextColor="rgba(15,45,26,0.35)"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
          <Text style={styles.buttonText}>{loading ? "Verificando..." : "Entrar al Sistema"}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Home')}>
          <Text style={styles.link}>Volver a la Landing</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    minHeight: '100vh',
    backgroundColor: C.bg,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: Platform.OS === 'web' ? 420 : '100%',
    backgroundColor: C.surface,
    borderRadius: 24,
    padding: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: C.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: C.mid,
    marginBottom: 28,
    lineHeight: 22,
  },
  input: {
    height: 52,
    borderWidth: 1,
    borderColor: '#dceee2',
    borderRadius: 14,
    paddingHorizontal: 16,
    marginBottom: 16,
    fontSize: 15,
    color: C.text,
    backgroundColor: '#f7fcf8',
  },
  button: {
    backgroundColor: C.p,
    borderRadius: 14,
    paddingVertical: 16,
    marginTop: 8,
    marginBottom: 16,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  link: {
    color: C.p,
    textAlign: 'center',
    fontWeight: '600',
  },
});
