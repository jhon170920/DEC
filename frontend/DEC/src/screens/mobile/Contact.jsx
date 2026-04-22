import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Image,
  Modal,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { Colors } from "../../constants/colors";
import { ContactStyles as styles } from "../../styles/Contacstyles";
import { useResponsiveLayout } from "../../hooks/useResponsiveLayout";

export default function Contact() {
  const navigation = useNavigation();
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const {
    sp,
    hPad,
    logoRingS,
    logoImgS,
    headlineS,
    sublineS,
    btnH,
    iconS,
  } = useResponsiveLayout();

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleEnviar = () => {
    if (!nombre.trim()) {
      setErrorMessage("Por favor ingresa tu nombre.");
      setErrorModalVisible(true);
      return;
    }
    if (!correo.trim()) {
      setErrorMessage("Por favor ingresa tu correo electrónico.");
      setErrorModalVisible(true);
      return;
    }
    if (!validateEmail(correo.trim())) {
      setErrorMessage("Ingresa un correo electrónico válido.");
      setErrorModalVisible(true);
      return;
    }
    if (!mensaje.trim()) {
      setErrorMessage("Por favor escribe tu mensaje.");
      setErrorModalVisible(true);
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setModalVisible(true);
    }, 2000);
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
            style={styles.absoluteFill}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />

          <ScrollView
            contentContainerStyle={[
              styles.scroll,
              { 
                paddingHorizontal: hPad,
                paddingBottom: Platform.OS === "ios" ? 40 : 30, // espacio extra inferior
              }
            ]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled" // permite cerrar teclado al tocar fuera
          >
            {/* ── BACK ── */}
            <TouchableOpacity style={styles.backBtn} activeOpacity={0.75} onPress={() => navigation.goBack()}>
              <Feather name="arrow-left" size={iconS} color={Colors.primary} />
            </TouchableOpacity>

            {/* ── LOGO ── */}
            <View style={[styles.logoWrap, {
              width: logoRingS,
              height: logoRingS,
              borderRadius: logoRingS / 2,
              marginBottom: sp(0.025),
            }]}>
              <Image
                source={require("../../../assets/image/logo.png")}
                style={{ width: logoImgS, height: logoImgS, resizeMode: "contain" }}
              />
            </View>

            {/* ── TÍTULO ── */}
            <Text style={[styles.title, { fontSize: headlineS, marginBottom: sp(0.04) }]}>
              Contáctanos
            </Text>

            {/* ── NOMBRE ── */}
            <Text style={[styles.label, { fontSize: sublineS }]}>Nombre *</Text>
            <View style={[styles.inputWrap, { marginBottom: sp(0.030) }]}>
              <Feather name="user" size={iconS} color={Colors.text} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Tu nombre"
                placeholderTextColor={Colors.textMuted}
                value={nombre}
                onChangeText={setNombre}
              />
            </View>

            {/* ── CORREO ── */}
            <Text style={[styles.label, { fontSize: sublineS }]}>Correo electrónico *</Text>
            <View style={[styles.inputWrap, { marginBottom: sp(0.030) }]}>
              <Feather name="mail" size={iconS} color={Colors.text} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="correo@ejemplo.com"
                placeholderTextColor={Colors.textMuted}
                value={correo}
                onChangeText={setCorreo}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            {/* ── MENSAJE ── */}
            <Text style={[styles.label, { fontSize: sublineS }]}>Mensaje *</Text>
            <TextInput
              style={[styles.textArea, { marginBottom: sp(0.06) }]}
              placeholder="Escribe tu mensaje aquí..."
              placeholderTextColor={Colors.textMuted}
              value={mensaje}
              onChangeText={setMensaje}
              multiline
              numberOfLines={5}
              textAlignVertical="top"
            />

            {/* ── BOTÓN ENVIAR ── */}
            <TouchableOpacity style={styles.btnEnviar} activeOpacity={0.85} onPress={handleEnviar} disabled={loading}>
              <LinearGradient
                colors={["#22c55e", "#16a34a", "#15803d"]}
                style={[styles.btnGradient, { height: btnH }]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.btnText}>Enviar mensaje</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* ── MODALES (sin cambios) ── */}
            <Modal transparent animationType="fade" visible={modalVisible}>
              <View style={styles.modalOverlay}>
                <View style={styles.modalBox}>
                  <Feather name="check-circle" size={48} color={Colors.primary} />
                  <Text style={styles.modalTitle}>¡Mensaje enviado!</Text>
                  <Text style={styles.modalSub}>Nos pondremos en contacto contigo pronto.</Text>
                  <TouchableOpacity style={styles.modalBtn} activeOpacity={0.85} onPress={() => {
                    setModalVisible(false);
                    navigation.navigate("MainApp");
                  }}>
                    <Text style={styles.modalBtnText}>OK</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>

            <Modal transparent animationType="fade" visible={errorModalVisible}>
              <View style={styles.modalOverlay}>
                <View style={styles.modalBox}>
                  <Feather name="alert-circle" size={48} color="#dc2626" />
                  <Text style={[styles.modalTitle, { color: "#dc2626" }]}>Error</Text>
                  <Text style={styles.modalSub}>{errorMessage}</Text>
                  <TouchableOpacity style={[styles.modalBtn, { backgroundColor: "#dc2626" }]} activeOpacity={0.85} onPress={() => setErrorModalVisible(false)}>
                    <Text style={styles.modalBtnText}>Cerrar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>
          </ScrollView>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}