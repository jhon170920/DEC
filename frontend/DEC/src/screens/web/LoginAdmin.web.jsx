import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Platform, Modal, ActivityIndicator, useWindowDimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import api from '../../api/api';
import { C, LoginAdminStyles as styles } from './components/styles/loginAdminStyles';
import { AuthContext } from '../../context/AuthContext';

export default function LoginAdmin () {
  const navigation = useNavigation();
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { width } = useWindowDimensions();

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

      await login(token);
      navigation.navigate('AdminDashboard')

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
      <View style={[styles.card, width < 480 && styles.cardResponsiveSmall]}>
        <Text style={[styles.title, width < 480 && styles.titleResponsiveSmall]}>Acceso Administrador</Text>
        <Text style={[styles.subtitle, width <480 && styles.subtitleResponsiveSmall]}>Ingresa tus credenciales para administrar el sistema.</Text>

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
          <View style={[styles.modalContainer, width < 480 && styles.modalContainerResponsiveSmall, width >=700 && width < 900 && styles.modalContainerResponsiveMedium]}>
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

