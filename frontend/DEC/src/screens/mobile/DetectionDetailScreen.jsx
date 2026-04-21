import React from 'react';
import {
  View, Text, Image, StyleSheet, ScrollView, TouchableOpacity, StatusBar, Linking
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../constants/colors';

export default function DetectionDetail() {
  const route = useRoute();
  const navigation = useNavigation();
  const { detection } = route.params;

  // Extraer datos (compatible con SQLite o MongoDB)
  const diseaseName = detection.disease_name || detection.pathologyId?.name || 'Planta Sana';
  const confidence = detection.confidence ?? 0;
  const imageUrl = detection.image_url || detection.imageUrl;
  const date = detection.created_at || detection.createdAt;
  const location = detection.location?.coordinates || [detection.lng, detection.lat];
  const lat = location[1] || detection.lat || 0;
  const lng = location[0] || detection.lng || 0;
  const treatment = detection.pathologyId?.treatment || 'No hay tratamiento registrado';
  const description = detection.pathologyId?.description || 'Sin descripción disponible';

  const isDiseased = diseaseName !== 'Planta Sana';
  const mainColor = isDiseased ? '#E67E22' : '#27AE60';

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    return d.toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const openMaps = () => {
    const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
    Linking.openURL(url);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.bg} />
      <LinearGradient colors={['#e8f5ec', '#f4faf5']} style={StyleSheet.absoluteFill} />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Botón de retroceso */}
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={24} color={Colors.primary} />
        </TouchableOpacity>

        {/* Imagen principal */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="cover" />
          <View style={[styles.badge, { backgroundColor: mainColor }]}>
            <Text style={styles.badgeText}>{isDiseased ? 'Enfermedad detectada' : 'Planta sana'}</Text>
          </View>
        </View>

        {/* Información */}
        <View style={styles.infoCard}>
          <Text style={[styles.diseaseName, { color: mainColor }]}>{diseaseName}</Text>
          <Text style={styles.date}>{formatDate(date)}</Text>

          <View style={styles.confidenceContainer}>
            <Text style={styles.label}>Precisión del análisis</Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${confidence * 100}%`, backgroundColor: mainColor }]} />
            </View>
            <Text style={styles.confidenceText}>{(confidence * 100).toFixed(1)}%</Text>
          </View>

          {isDiseased && (
            <>
              <View style={styles.divider} />
              <Text style={styles.sectionTitle}>Descripción</Text>
              <Text style={styles.description}>{description}</Text>

              <Text style={styles.sectionTitle}>Tratamiento recomendado</Text>
              <Text style={styles.treatment}>{treatment}</Text>
            </>
          )}

          {lat !== 0 && lng !== 0 && (
            <>
              <View style={styles.divider} />
              <Text style={styles.sectionTitle}>Ubicación del análisis</Text>
              <TouchableOpacity style={styles.mapButton} onPress={openMaps}>
                <Feather name="map-pin" size={18} color="#fff" />
                <Text style={styles.mapButtonText}>Ver en mapa</Text>
              </TouchableOpacity>
              <Text style={styles.coords}>Lat: {lat.toFixed(6)}, Lng: {lng.toFixed(6)}</Text>
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  scrollContent: { paddingBottom: 30 },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 30,
    padding: 8,
    elevation: 5,
  },
  imageContainer: {
    width: '100%',
    height: 350,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  badge: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    paddingHorizontal: 15,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgeText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  infoCard: {
    backgroundColor: '#fff',
    marginTop: -20,
    marginHorizontal: 16,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  diseaseName: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
  },
  date: {
    textAlign: 'center',
    color: '#7F8C8D',
    fontSize: 14,
    marginBottom: 20,
  },
  confidenceContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 5,
  },
  progressBar: {
    height: 10,
    backgroundColor: '#E0E0E0',
    borderRadius: 5,
    overflow: 'hidden',
    marginVertical: 5,
  },
  progressFill: {
    height: '100%',
    borderRadius: 5,
  },
  confidenceText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2C3E50',
    textAlign: 'right',
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 8,
  },
  description: {
    fontSize: 15,
    color: '#555',
    lineHeight: 22,
    marginBottom: 15,
  },
  treatment: {
    fontSize: 15,
    color: '#27AE60',
    fontWeight: '500',
    marginBottom: 10,
  },
  mapButton: {
    flexDirection: 'row',
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10,
  },
  mapButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  coords: {
    fontSize: 12,
    color: '#7F8C8D',
    textAlign: 'center',
    marginTop: 5,
  },
});