import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Modal,
  StyleSheet,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { Colors } from "../constants/colors";
import { EditProfileStyles as styles } from "../styles/EditarPerfilstyles";
import { useResponsiveLayout } from "../hooks/useResponsiveLayout";

export default function EditProfile() {
  const navigation = useNavigation();
  const { sp, hPad, iconS, btnH, fieldH } = useResponsiveLayout();

  // ── CONECTAR BACKEND AQUÍ ──
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");

  // ── CONECTAR BACKEND AQUÍ — correo viene del login ──
  const correoUsuario = "correo@ejemplo.com";

  // ── MODAL CONTRASEÑA ──
  const [modalVisible, setModalVisible] = useState(false);
  const [passActual, setPassActual] = useState("");
  const [passNueva, setPassNueva] = useState("");
  const [passConfirmar, setPassConfirmar] = useState("");

  const handleGuardar = () => {
    // ── CONECTAR BACKEND AQUÍ ──
  };

  const handleCambiarPass = () => {
    // ── CONECTAR BACKEND AQUÍ ──
    setModalVisible(false);
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.bg} />

      <LinearGradient
        colors={["#e8f5ec", "#f4faf5", "#f4faf5"]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingHorizontal: hPad }]}
        showsVerticalScrollIndicator={false}
      >

        {/* ── HEADER ── */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} activeOpacity={0.75} onPress={() => navigation.goBack()}>
            <Feather name="arrow-left" size={iconS} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Editar Perfil</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* ── AVATAR ── */}
        <View style={styles.avatarWrap}>
          <View style={styles.avatarCircle}>
            <Ionicons name="person-outline" size={60} color={Colors.textMuted} />
          </View>
          <TouchableOpacity style={styles.avatarCameraBtn} activeOpacity={0.8}>
            <Feather name="camera" size={16} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* ── NOMBRE ── */}
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

        {/* ── CORREO — no editable, viene del login ── */}
        <View style={[styles.inputWrap, { height: fieldH }]}>
          <Feather name="mail" size={iconS} color={Colors.textMuted} style={styles.inputIcon} />
          <Text style={styles.inputReadOnly}>{correoUsuario}</Text>
        </View>

        {/* ── TELÉFONO ── */}
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

        {/* ── CAMBIAR CONTRASEÑA ── */}
        <TouchableOpacity style={[styles.inputWrap, { height: fieldH }]} activeOpacity={0.75} onPress={() => setModalVisible(true)}>
          <Feather name="key" size={iconS} color={Colors.textMuted} style={styles.inputIcon} />
          <Text style={styles.inputPlaceholder}>Cambiar contraseña</Text>
          <Feather name="chevron-right" size={16} color={Colors.textMuted} />
        </TouchableOpacity>

        {/* ── BOTÓN GUARDAR ── */}
        <TouchableOpacity style={styles.btnGuardar} activeOpacity={0.85} onPress={handleGuardar}>
          <LinearGradient
            colors={["#22c55e", "#16a34a", "#15803d"]}
            style={[styles.btnGradient, { height: btnH }]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.btnText}>Guardar Cambios</Text>
          </LinearGradient>
        </TouchableOpacity>

      </ScrollView>

      {/* ── MODAL CAMBIAR CONTRASEÑA ── */}
      <Modal transparent animationType="fade" visible={modalVisible}>
        <View style={styles.modalOverlay}>
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

            <TouchableOpacity style={styles.modalBtn} activeOpacity={0.85} onPress={handleCambiarPass}>
              <LinearGradient
                colors={["#22c55e", "#16a34a", "#15803d"]}
                style={styles.modalBtnGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.modalBtnText}>Confirmar</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={styles.modalCancelBtn} activeOpacity={0.75} onPress={() => setModalVisible(false)}>
              <Text style={styles.modalCancelText}>Cancelar</Text>
            </TouchableOpacity>

          </View>
        </View>
      </Modal>

    </View>
  );
}