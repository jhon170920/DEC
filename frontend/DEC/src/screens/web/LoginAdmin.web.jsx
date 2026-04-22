import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Platform, Modal, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import api from '../../api/api';

const C = {
  bg: '#f4faf5',
  surface: '#ffffff',
  p: '#16a34a',
  text: '#0f2d1a',
  mid: '#2d6a4f',
  danger: '#dc2626',
};

export default function LoginAdmin() {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Estados para el modal
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [modalType, setModalType] = useState('error'); // 'error', 'success', 'info'

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const showModal = (title, message, type = 'error') => {
    setModalTitle(title);
    setModalMessage(message);
    setModalType(type);
    setModalVisible(true);
  };

  const getModalIcon = () => {
    switch (modalType) {
      case 'success':
        return <Feather name="check-circle" size={48} color={C.p} style={{ alignSelf: 'center', marginBottom: 12 }} />;
      case 'error':
        return <Feather name="alert-circle" size={48} color={C.danger} style={{ alignSelf: 'center', marginBottom: 12 }} />;
      default:
        return <Feather name="info" size={48} color={C.mid} style={{ alignSelf: 'center', marginBottom: 12 }} />;
    }
  };

  const handleSubmit = async () => {
    if (!email.trim()) {
      showModal("Error", "Por favor ingresa tu correo electrónico.");
      return;
    }
    if (!validateEmail(email.trim())) {
      showModal("Error", "Ingresa un correo electrónico válido.");
      return;
    }
    if (!password.trim()) {
      showModal("Error", "Por favor ingresa tu contraseña.");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('users/login', { email, password });
      const { token, user } = response.data;

      if (user.role !== 'admin') {
        showModal("Acceso Denegado", "No tienes permisos de administrador.");
        return;
      }

      localStorage.setItem('userToken', token);
      navigation.navigate('AdminDashboard');

    } catch (error) {
      let errorMessage = "Error al iniciar sesión. Verifica tus credenciales.";
      if (error.response) {
        errorMessage = error.response.data?.message || errorMessage;
      } else if (error.message) {
        errorMessage = error.message;
      }
      showModal("Error de Autenticación", errorMessage);
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

        <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={loading}>
          <LinearGradient
            colors={[C.p, '#15803d']}
            style={styles.buttonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.buttonText}>Entrar al Sistema</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Home')}>
          <Text style={styles.link}>Volver a la Landing</Text>
        </TouchableOpacity>
      </View>

      {/* Modal personalizado */}
      <Modal
        transparent
        animationType="fade"
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {getModalIcon()}
            <Text style={[styles.modalTitle, modalType === 'error' && { color: C.danger }]}>
              {modalTitle}
            </Text>
            <Text style={styles.modalMessage}>{modalMessage}</Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setModalVisible(false)}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={modalType === 'error' ? [C.danger, '#b91c1c'] : [C.p, '#15803d']}
                style={styles.modalButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.modalButtonText}>Aceptar</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    borderRadius: 14,
    overflow: 'hidden',
    marginTop: 8,
    marginBottom: 16,
  },
  buttonGradient: {
    paddingVertical: 16,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '20%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
    color: C.text,
  },
  modalMessage: {
    fontSize: 15,
    color: '#475569',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  modalButton: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
  },
  modalButtonGradient: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: 'bold', 
    fontSize: 16,
  },
});