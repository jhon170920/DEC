import React, { useContext, useState, useEffect } from "react";
import { AuthContext } from "../../context/AuthContext";
import * as Location from 'expo-location';
import {
  View, Text, Image, TouchableOpacity, ScrollView,
  StyleSheet, StatusBar, Modal, ActivityIndicator
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { saveDetectionLocal } from "../../services/dbService";
import { syncDetections } from "../../services/syncService";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { Colors } from "../../constants/colors";
import { ResultStyles as styles } from "../../styles/Resultstyles";
import NetInfo from '@react-native-community/netinfo';

export default function Result() {
  const route = useRoute();
  const navigation = useNavigation();
  const { data } = route.params || {};

  const imagenResultado = data?.uri || "";
  const saludable = data?.isHealthy ?? true;
  const nombreAfeccion = data?.disease || "Sin identificar";
  const nombreCientifico = data?.scientificName || "N/A";
  const descripcion = data?.description || "No hay descripción disponible.";

  const { userToken, logout } = useContext(AuthContext);
  
  // Estados para modales
  const [modalDescripcionVisible, setModalDescripcionVisible] = useState(false);
  const [modalLoginVisible, setModalLoginVisible] = useState(false);
  const [modalSuccessVisible, setModalSuccessVisible] = useState(false);
  const [modalErrorVisible, setModalErrorVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [saving, setSaving] = useState(false);

  // Redirección automática si es "Objeto no identificado"
  useEffect(() => {
    if (nombreAfeccion === "Objeto no identificado") {
      const timer = setTimeout(() => {
        navigation.replace("Camera");
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [nombreAfeccion]);

  const handleSave = async () => {
    if (!userToken) {
      setModalLoginVisible(true);
      return;
    }

    setSaving(true);
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      let location = null;
      if (status === 'granted') {
        location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      }
      await saveDetectionLocal(
        nombreAfeccion,
        data?.confidence || "0%",
        imagenResultado,
        location?.coords.latitude || 0,
        location?.coords.longitude || 0
      );
      setSuccessMessage("Análisis guardado localmente con GPS.");
      setModalSuccessVisible(true);

      // Sincronizar automáticamente si hay internet
      const netState = await NetInfo.fetch();
      if (netState.isConnected) {
        // Ejecutar sincronización en segundo plano (no esperar)
        syncDetections().catch(err => console.warn("Sync error:", err));
      }

      // Redirigir después de 1.5 segundos
      setTimeout(() => {
        setModalSuccessVisible(false);
        navigation.navigate("MainApp");
      }, 1500);
    } catch (error) {
      console.error(error);
      setErrorMessage("Ocurrió un error al guardar el análisis. Inténtalo de nuevo.");
      setModalErrorVisible(true);
    } finally {
      setSaving(false);
    }
  };

  const handleGoToLogin = () => {
    setModalLoginVisible(false);
    logout(); // Limpia sesión y redirige al login (según tu AuthContext)
  };

  const handleErrorClose = () => {
    setModalErrorVisible(false);
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

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Feather name="arrow-left" size={24} color={Colors.primary} />
          </TouchableOpacity>
          <Image source={require("../../../assets/image/logo.png")} style={styles.logo} />
        </View>

        {/* SECCION RESULTADO */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionLabel}>RESULTADO</Text>
          <View style={styles.sectionLine} />
        </View>

        {/* IMAGEN */}
        <View style={styles.imageCard}>
          <Image source={{ uri: imagenResultado }} style={styles.image} resizeMode="cover" />
        </View>

        {/* TÍTULO */}
        <Text style={styles.analysisTitle}>
          Análisis: <Text style={styles.analysisAccent}>{nombreAfeccion}</Text>
        </Text>

        {/* BADGE */}
        <View style={[styles.badge, !saludable && styles.badgeDanger]}>
          <Feather
            name={saludable ? "check-square" : "x-square"}
            size={16}
            color={saludable ? Colors.primary : "#f97316"}
          />
          <Text style={[styles.badgeText, !saludable && styles.badgeTextDanger]}>
            {saludable ? "Saludable" : "No saludable"}
          </Text>
        </View>

        {/* CARDS INFO */}
        <View style={styles.menuList}>
          {/* Nombre Científico */}
          <View style={styles.menuCard}>
            <View style={styles.menuIconWrap}>
              <Feather name="search" size={24} color={Colors.primary} />
            </View>
            <View style={styles.menuTexts}>
              <Text style={styles.menuTitle}>Nombre Científico:</Text>
              <Text style={styles.menuSub}>{nombreCientifico}</Text>
            </View>
          </View>

          {/* Descripción con modal */}
          <TouchableOpacity style={styles.menuCard} activeOpacity={0.75} onPress={() => setModalDescripcionVisible(true)}>
            <View style={styles.menuIconWrap}>
              <Feather name="book-open" size={24} color={Colors.primary} />
            </View>
            <View style={styles.menuTexts}>
              <Text style={styles.menuTitle}>Descripción</Text>
              <Text style={styles.menuSub} numberOfLines={2}>{descripcion}</Text>
            </View>
            <Feather name="chevron-right" size={16} color={Colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* BOTÓN GUARDAR */}
        <TouchableOpacity style={styles.scanBtn} activeOpacity={0.85} onPress={handleSave} disabled={saving}>
          <LinearGradient
            colors={["#22c55e", "#16a34a", "#15803d"]}
            style={styles.scanGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            {saving ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.scanText}>Guardar Análisis</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>

      {/* Modal para descripción completa */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalDescripcionVisible}
        onRequestClose={() => setModalDescripcionVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Descripción completa</Text>
            <ScrollView style={styles.modalScroll}>
              <Text style={styles.modalText}>{descripcion}</Text>
            </ScrollView>
            <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setModalDescripcionVisible(false)}>
              <Text style={styles.modalCloseText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal para solicitar inicio de sesión */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalLoginVisible}
        onRequestClose={() => setModalLoginVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Feather name="log-in" size={40} color={Colors.primary} style={{ alignSelf: 'center', marginBottom: 10 }} />
            <Text style={styles.modalTitle}>Sesión requerida</Text>
            <Text style={styles.modalText}>
              Para guardar diagnósticos en tu historial y ver tratamientos detallados, por favor inicia sesión.
            </Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 }}>
              <TouchableOpacity style={[styles.modalCloseBtn, { backgroundColor: '#e2e8f0', flex: 1, marginRight: 8 }]} onPress={() => setModalLoginVisible(false)}>
                <Text style={{ color: Colors.text }}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalCloseBtn, { backgroundColor: Colors.primary, flex: 1, marginLeft: 8 }]} onPress={handleGoToLogin}>
                <Text style={{ color: '#fff' }}>Ir al Login</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal de éxito al guardar */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalSuccessVisible}
        onRequestClose={() => setModalSuccessVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Feather name="check-circle" size={50} color={Colors.primary} style={{ alignSelf: 'center', marginBottom: 10 }} />
            <Text style={styles.modalTitle}>¡Éxito!</Text>
            <Text style={styles.modalText}>{successMessage}</Text>
            <ActivityIndicator size="small" color={Colors.primary} style={{ marginTop: 10 }} />
          </View>
        </View>
      </Modal>

      {/* Modal de error al guardar */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalErrorVisible}
        onRequestClose={handleErrorClose}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Feather name="alert-circle" size={50} color="#dc2626" style={{ alignSelf: 'center', marginBottom: 10 }} />
            <Text style={[styles.modalTitle, { color: '#dc2626' }]}>Error</Text>
            <Text style={styles.modalText}>{errorMessage}</Text>
            <TouchableOpacity style={[styles.modalCloseBtn, { backgroundColor: '#dc2626' }]} onPress={handleErrorClose}>
              <Text style={styles.modalCloseText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}