import React, { useState, useEffect } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StatusBar, ScrollView,
  Modal, StyleSheet, Image, ActivityIndicator, KeyboardAvoidingView,
  Platform, TouchableWithoutFeedback, Keyboard
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import * as ImagePicker from 'expo-image-picker';
import api from "../../api/api";
import { Colors } from "../../constants/colors";
import { EditProfileStyles as styles } from "../../styles/EditarPerfilstyles";
import { useResponsiveLayout } from "../../hooks/useResponsiveLayout";

export default function EditProfile() {
  const navigation = useNavigation();
  const { sp, hPad, iconS, btnH, fieldH } = useResponsiveLayout();

  const [loading, setLoading] = useState(false);
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [correo, setCorreo] = useState("");
  const [fotoPerfil, setFotoPerfil] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Modal contraseña
  const [modalVisible, setModalVisible] = useState(false);
  const [passActual, setPassActual] = useState("");
  const [passNueva, setPassNueva] = useState("");
  const [passConfirmar, setPassConfirmar] = useState("");

  // Estados para modales personalizados
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loadingPass, setLoadingPass] = useState(false);

  // Cargar datos del usuario actual
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await api.get('users/me');
        const user = res.data.user;
        setNombre(user.name || '');
        setTelefono(user.phone || '');
        setCorreo(user.email || '');
        setFotoPerfil(user.pictureUrl || null);
      } catch (error) {
        console.error(error);
        setErrorMessage("No se pudo cargar la información del usuario");
        setErrorModalVisible(true);
      }
    };
    fetchUserData();
  }, []);

  // Guardar cambios de perfil
  const handleGuardar = async () => {
    if (!nombre.trim()) {
      setErrorMessage("El nombre es obligatorio");
      setErrorModalVisible(true);
      return;
    }
    setLoading(true);
    try {
      await api.put('users/edit-profile', { name: nombre, phone: telefono });
      setSuccessMessage("Perfil actualizado correctamente");
      setSuccessModalVisible(true);
      setTimeout(() => {
        setSuccessModalVisible(false);
        navigation.goBack();
      }, 1500);
    } catch (error) {
      const msg = error.response?.data?.message || "No se pudo actualizar";
      setErrorMessage(msg);
      setErrorModalVisible(true);
    } finally {
      setLoading(false);
    }
  };

  // Cambiar contraseña
  const handleCambiarPass = async () => {
    if (!passActual || !passNueva || !passConfirmar) {
      setErrorMessage("Todos los campos son obligatorios");
      setErrorModalVisible(true);
      return;
    }
    if (passNueva !== passConfirmar) {
      setErrorMessage("Las contraseñas nuevas no coinciden");
      setErrorModalVisible(true);
      return;
    }
    if (passNueva.length < 8) {
      setErrorMessage("La nueva contraseña debe tener al menos 8 caracteres");
      setErrorModalVisible(true);
      return;
    }
    setLoadingPass(true);
    try {
      await api.post('users/change-password', {
        currentPassword: passActual,
        newPassword: passNueva
      });
      setSuccessMessage("Contraseña actualizada correctamente");
      setSuccessModalVisible(true);
      setModalVisible(false);
      setPassActual('');
      setPassNueva('');
      setPassConfirmar('');
      setTimeout(() => {
        setSuccessModalVisible(false);
      }, 1500);
    } catch (error) {
      const msg = error.response?.data?.message || "No se pudo cambiar la contraseña";
      setErrorMessage(msg);
      setErrorModalVisible(true);
    } finally {
      setLoadingPass(false);
    }
  };

  // Subir foto de perfil
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      setErrorMessage("Necesitamos acceso a tu galería");
      setErrorModalVisible(true);
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setUploadingImage(true);
      const asset = result.assets[0];
      const formData = new FormData();
      const filename = asset.uri.split('/').pop();
      const extension = filename ? filename.split('.').pop() : 'jpg';
      const mimeType = `image/${extension === 'jpg' ? 'jpeg' : extension}`;
      formData.append('image', {
        uri: asset.uri,
        name: `profile_${Date.now()}.${extension}`,
        type: mimeType,
      });

      try {
        const res = await api.post('users/upload-profile-picture', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setFotoPerfil(res.data.pictureUrl);
        setSuccessMessage("Foto de perfil actualizada");
        setSuccessModalVisible(true);
        setTimeout(() => {
          setSuccessModalVisible(false);
        }, 1500);
      } catch (error) {
        setErrorMessage("No se pudo subir la imagen");
        setErrorModalVisible(true);
      } finally {
        setUploadingImage(false);
      }
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.root}>
          <StatusBar barStyle="dark-content" backgroundColor={Colors.bg} />

          <LinearGradient
            colors={["#e8f5ec", "#f4faf5", "#f4faf5"]}
            style={StyleSheet.absoluteFill}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />

          <ScrollView
            contentContainerStyle={[
              styles.scroll,
              {
                paddingHorizontal: hPad,
                paddingBottom: Platform.OS === "ios" ? 40 : 30,
              }
            ]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* HEADER */}
            <View style={styles.header}>
              <TouchableOpacity style={styles.backBtn} activeOpacity={0.75} onPress={() => navigation.goBack()}>
                <Feather name="arrow-left" size={iconS} color={Colors.primary} />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Editar Perfil</Text>
              <View style={{ width: 40 }} />
            </View>

            {/* AVATAR */}
            <View style={styles.avatarWrap}>
              <TouchableOpacity onPress={pickImage} disabled={uploadingImage} activeOpacity={0.8}>
                {fotoPerfil ? (
                  <Image source={{ uri: fotoPerfil }} style={styles.avatarImage} />
                ) : (
                  <View style={styles.avatarCircle}>
                    <Ionicons name="person-outline" size={60} color={Colors.textMuted} />
                  </View>
                )}
                <View style={styles.avatarCameraBtn}>
                  {uploadingImage ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Feather name="camera" size={16} color="#fff" />
                  )}
                </View>
              </TouchableOpacity>
            </View>

            {/* NOMBRE */}
            <View style={[styles.inputWrap, { height: fieldH }]}>
              <Feather name="user" size={iconS} color={Colors.textMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Nombre completo"
                placeholderTextColor={Colors.textMuted}
                value={nombre}
                onChangeText={setNombre}
              />
              <Feather name="chevron-right" size={16} color={Colors.textMuted} />
            </View>

            {/* CORREO (no editable) */}
            <View style={[styles.inputWrap, { height: fieldH }]}>
              <Feather name="mail" size={iconS} color={Colors.textMuted} style={styles.inputIcon} />
              <Text style={styles.inputReadOnly}>{correo}</Text>
            </View>

            {/* TELÉFONO */}
            <View style={[styles.inputWrap, { height: fieldH }]}>
              <Feather name="phone" size={iconS} color={Colors.textMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Teléfono"
                placeholderTextColor={Colors.textMuted}
                value={telefono}
                onChangeText={setTelefono}
                keyboardType="phone-pad"
              />
            </View>

            {/* CAMBIAR CONTRASEÑA */}
            <TouchableOpacity style={[styles.inputWrap, { height: fieldH }]} activeOpacity={0.75} onPress={() => setModalVisible(true)}>
              <Feather name="key" size={iconS} color={Colors.textMuted} style={styles.inputIcon} />
              <Text style={styles.inputPlaceholder}>Cambiar contraseña</Text>
              <Feather name="chevron-right" size={16} color={Colors.textMuted} />
            </TouchableOpacity>

            {/* BOTÓN GUARDAR */}
            <TouchableOpacity style={styles.btnGuardar} activeOpacity={0.85} onPress={handleGuardar} disabled={loading}>
              <LinearGradient
                colors={["#22c55e", "#16a34a", "#15803d"]}
                style={[styles.btnGradient, { height: btnH }]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.btnText}>{loading ? 'Guardando...' : 'Guardar Cambios'}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </ScrollView>

          {/* MODAL CAMBIAR CONTRASEÑA CON PROTECCIÓN DE TECLADO */}
          <Modal transparent animationType="fade" visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
            <KeyboardAvoidingView
              style={{ flex: 1 }}
              behavior={Platform.OS === "ios" ? "padding" : "height"}
              keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
            >
              <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.modalOverlay}>
                  <ScrollView
                    contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                  >
                    <View style={styles.modalBox}>
                      <Text style={styles.modalTitle}>Cambiar contraseña</Text>
                      
                      <TextInput
                        style={styles.modalInput}
                        placeholder="Contraseña actual"
                        placeholderTextColor={Colors.textMuted}
                        value={passActual}
                        onChangeText={setPassActual}
                        secureTextEntry
                      />
                      <TextInput
                        style={styles.modalInput}
                        placeholder="Contraseña nueva"
                        placeholderTextColor={Colors.textMuted}
                        value={passNueva}
                        onChangeText={setPassNueva}
                        secureTextEntry
                      />
                      <TextInput
                        style={styles.modalInput}
                        placeholder="Confirmar contraseña"
                        placeholderTextColor={Colors.textMuted}
                        value={passConfirmar}
                        onChangeText={setPassConfirmar}
                        secureTextEntry
                      />
                      
                      <TouchableOpacity style={styles.modalBtn} activeOpacity={0.85} onPress={handleCambiarPass} disabled={loadingPass}>
                        <LinearGradient
                          colors={["#22c55e", "#16a34a", "#15803d"]}
                          style={styles.modalBtnGradient}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                        >
                          <Text style={styles.modalBtnText}>{loadingPass ? "Actualizando..." : "Confirmar"}</Text>
                        </LinearGradient>
                      </TouchableOpacity>
                      
                      <TouchableOpacity style={styles.modalBtn} activeOpacity={0.75} onPress={() => setModalVisible(false)}>
                        <Text style={styles.modalCancelText}>Cancelar</Text>
                      </TouchableOpacity>
                    </View>
                  </ScrollView>
                </View>
              </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
          </Modal>

          {/* MODAL DE ERROR */}
          <Modal transparent animationType="fade" visible={errorModalVisible} onRequestClose={() => setErrorModalVisible(false)}>
            <View style={styles.modalOverlay}>
              <View style={styles.modalBox}>
                <Feather name="alert-circle" size={40} color="#dc2626" style={{ alignSelf: 'center', marginBottom: 10 }} />
                <Text style={[styles.modalTitle, { color: "#dc2626" }]}>Error</Text>
                <Text style={styles.modalSubtitle}>{errorMessage}</Text>
                <TouchableOpacity style={[styles.modalBtn, { backgroundColor: "#dc2626" }]} onPress={() => setErrorModalVisible(false)}>
                  <Text style={styles.modalBtnText}>Cerrar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

          {/* MODAL DE ÉXITO */}
          <Modal transparent animationType="fade" visible={successModalVisible} onRequestClose={() => setSuccessModalVisible(false)}>
            <View style={styles.modalOverlay}>
              <View style={styles.modalBox}>
                <Feather name="check-circle" size={40} color={Colors.primary} style={{ alignSelf: 'center', marginBottom: 10 }} />
                <Text style={styles.modalTitle}>Éxito</Text>
                <Text style={styles.modalSubtitle}>{successMessage}</Text>
                <ActivityIndicator size="small" color={Colors.primary} style={{ marginTop: 10 }} />
              </View>
            </View>
          </Modal>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}