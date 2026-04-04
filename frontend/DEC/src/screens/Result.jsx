import React, {useContext} from "react";
import { AuthContext } from "../context/AuthContext";
import * as Location from 'expo-location';
import { View, Text, Image, TouchableOpacity, ScrollView, Alert, StyleSheet, StatusBar } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { saveDetectionLocal } from "../services/dbService";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { Colors } from "../constants/colors";
import { ResultStyles as styles } from "../styles/Resultstyles";


export default function Result() {
const route = useRoute();
const navigation = useNavigation();

const { data } = route.params || {};

    // ── DATOS CONECTADOS ──
    const imagenResultado = data?.uri || "";
    const saludable = data?.isHealthy ?? true;
    const nombreAfeccion = data?.disease || "Sin identificar";
    const nombreCientifico = data?.scientificName || "N/A";
    const descripcion = data?.description || "No hay descripción disponible.";

    const { userToken, logout } = useContext(AuthContext);
    
  const handleSave = async () => {
    
  // REGLA: Solo guardar si hay sesión (token)
  if (!userToken) {
    Alert.alert(
        "Sesión Requerida", 
        "Para guardar diagnósticos en tu historial y ver tratamientos detallados, por favor inicia sesión.",
        [
          { text: "Cancelar", style: "cancel" },
          { text: "Ir al Login", onPress: () => logout() }
        ]
      );
    return;
  }

  try {
    // 1. Pedir permiso y obtener ubicación rápida
    let { status } = await Location.requestForegroundPermissionsAsync();
    let location = null;
    
    if (status === 'granted') {
      location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
    }

    // 2. Guardar en SQLite con coordenadas (aunque sean null si no dio permiso)
    await saveDetectionLocal(
        nombreAfeccion,
        data?.confidence || "0%",  
        imagenResultado,
        location?.coords.latitude || 0,
        location?.coords.longitude || 0
    );

    Alert.alert("Éxito", "Análisis guardado localmente con GPS.");
    navigation.navigate('MainApp');
  } catch (error) {
    console.error(error);
  }
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
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        >

        {/* ── HEADER ── */}
        <View style={styles.header}>
            <Image
            source={require("../../assets/image/logo.png")}
            style={styles.logo}
            />

            <TouchableOpacity style={styles.avatarInner}>
            <Feather name="user" size={20} color={Colors.primary} />
            </TouchableOpacity>

        </View>


        {/* ── SECCION ── */}

        <View style={styles.sectionHeader}>
            <Text style={styles.sectionLabel}>RESULTADO</Text>
            <View style={styles.sectionLine} />
        </View>


        {/* ── IMAGEN ── */}
        <View style={styles.imageCard}>
            <Image
            source={{ uri: imagenResultado }}
            style={styles.image}
            resizeMode="contain"
            />
        </View>
        {/* ── TÍTULO ── */}
        <Text style={styles.analysisTitle}>
            Análisis: <Text style={styles.analysisAccent}>{nombreAfeccion}</Text>
        </Text>


        {/* ── BADGE ── */}

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
        {/* ── CARDS INFO ── */}
        <View style={styles.menuList}>
            <TouchableOpacity style={styles.menuCard} activeOpacity={0.75} onPress={() => {}}>
            <View style={styles.menuIconWrap}>
                <Feather name="search" size={24} color={Colors.primary} />
            </View>
            <View style={styles.menuTexts}>
                <Text style={styles.menuTitle}>Nombre Científico:</Text>
                <Text style={styles.menuSub}>{nombreCientifico}</Text>
            </View>
            <Feather name="chevron-right" size={16} color={Colors.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuCard} activeOpacity={0.75} onPress={() => {}}>
            <View style={styles.menuIconWrap}>
                <Feather name="book-open" size={24} color={Colors.primary} />
            </View>

            <View style={styles.menuTexts}>
                <Text style={styles.menuTitle}>Descripción</Text>
                <Text style={styles.menuSub}>{descripcion}</Text>

            </View>

            <Feather name="chevron-right" size={16} color={Colors.textMuted} />

            </TouchableOpacity>
        </View>


        {/* ── BOTÓN GUARDAR ── */}

        <TouchableOpacity style={styles.scanBtn} activeOpacity={0.85} onPress={handleSave}>
            <LinearGradient
            colors={["#22c55e", "#16a34a", "#15803d"]}
            style={styles.scanGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            >
            <Text style={styles.scanText}>Guardar Análisis</Text>
            </LinearGradient>
        </TouchableOpacity>

        </ScrollView>

    </View> 
    );
}