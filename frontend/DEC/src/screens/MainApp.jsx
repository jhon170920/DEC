import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  StatusBar,
  ScrollView
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialCommunityIcons, Feather } from "@expo/vector-icons";

export default function MainApp() {
  return (
    <LinearGradient
      colors={["#c9d6d0", "#4f7f57"]}
      style={styles.container}
    >
      <StatusBar barStyle="dark-content" />

      <ScrollView contentContainerStyle={styles.scroll}>

        {/* HEADER */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <MaterialCommunityIcons name="leaf" size={28} color="#1f4d2e" />
            <Text style={styles.logoText}>DEC</Text>
          </View>

          <View style={styles.profile}>
            <Ionicons name="person-circle-outline" size={40} color="#1f4d2e" />
          </View>
        </View>

        {/* IMAGEN PRINCIPAL */}
        <View style={styles.imageContainer}>
          <Image
            source={{
              uri: "https://images.unsplash.com/photo-1501004318641-b39e6451bec6"
            }}
            style={styles.image}
          />
        </View>

        {/* BOTÓN SCAN */}
        <TouchableOpacity style={styles.scanButton}>
          <Feather name="camera" size={22} color="#fff" />
          <Text style={styles.scanText}>SCAN</Text>
        </TouchableOpacity>

        {/* BOTONES SECUNDARIOS */}
        <TouchableOpacity style={styles.secondaryButton}>
          <Feather name="search" size={22} color="#fff" />
          <View>
            <Text style={styles.secondaryTitle}>Mis Analisis</Text>
            <Text style={styles.secondarySubtitle}>
              Escaneos recientes de plantas
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryButton}>
          <Feather name="book-open" size={22} color="#fff" />
          <View>
            <Text style={styles.secondaryTitle}>Ayuda</Text>
            <Text style={styles.secondarySubtitle}>
              Manual de uso
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryButton}>
          <Feather name="message-circle" size={22} color="#fff" />
          <View>
            <Text style={styles.secondaryTitle}>Contactanos</Text>
            <Text style={styles.secondarySubtitle}>
              Medios de atencion
            </Text>
          </View>
        </TouchableOpacity>

      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  scroll: {
    padding: 20,
    paddingTop: 50
  },

  /* HEADER */
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6
  },
  logoText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1f4d2e"
  },

  /* IMAGEN */
  imageContainer: {
    borderRadius: 20,
    overflow: "hidden",
    elevation: 8,
    backgroundColor: "#000",
    marginBottom: 25
  },
  image: {
    width: "100%",
    height: 200,
    resizeMode: "cover"
  },

  /* BOTÓN SCAN */
  scanButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#2e7d32",
    paddingVertical: 18,
    borderRadius: 15,
    marginBottom: 20,
    elevation: 6
  },
  scanText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    letterSpacing: 1
  },

  /* BOTONES SECUNDARIOS */
  secondaryButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
    backgroundColor: "#2e7d32",
    padding: 15,
    borderRadius: 15,
    marginBottom: 15,
    elevation: 5
  },
  secondaryTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold"
  },
  secondarySubtitle: {
    color: "#e0e0e0",
    fontSize: 12
  }
});