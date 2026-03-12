import React, { useState, useEffect, useRef, useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImageManipulator from 'expo-image-manipulator';
import { useIsFocused } from '@react-navigation/native'; // 👈 IMPORTANTE: Faltaba esto
import { AuthContext } from '../context/AuthContext';

export default function CameraScreen({ navigation }) {
  const isFocused = useIsFocused(); // 👈 IMPORTANTE: Faltaba definir esto
  const [permission, requestPermission] = useCameraPermissions();
  const [isProcessing, setIsProcessing] = useState(false);
  const cameraRef = useRef(null);
  const { userToken } = useContext(AuthContext);

  // 1. Manejo de permisos con useEffect para forzar la petición en Expo Go
  useEffect(() => {
    if (permission && !permission.granted && permission.canAskAgain) {
      requestPermission();
    }
  }, [permission]);

  // Si la pantalla NO está enfocada o no hay permisos cargados, no renderizamos nada
  if (!isFocused || !permission) return <View style={{ flex: 1, backgroundColor: '#000' }} />;

  // Pantalla de "No hay permisos"
  if (!permission.granted) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: '#fff', marginBottom: 20, textAlign: 'center' }}>
          No tenemos acceso a la cámara
        </Text>
        <TouchableOpacity onPress={requestPermission} style={styles.backButton}>
          <Text style={styles.backText}>Reintentar Permisos</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleCapture = async () => {
    if (cameraRef.current && !isProcessing) {
      try {
        setIsProcessing(true);
        const photo = await cameraRef.current.takePictureAsync({ quality: 0.8 });

        const resizedPhoto = await ImageManipulator.manipulateAsync(
          photo.uri,
          [{ resize: { width: 640, height: 640 } }],
          { base64: true }
        );

        // Simulación de IA YOLOv11
        setTimeout(() => {
          setIsProcessing(false);
          showResults({ disease: "Roya", confidence: "92%" });
        }, 2000);

      } catch (error) {
        Alert.alert("Error", "No se pudo procesar la imagen");
        setIsProcessing(false);
      }
    }
  };

  const showResults = (result) => {
    const message = userToken 
      ? `Detectado: ${result.disease}. Confianza: ${result.confidence}. \n\nTratamiento: Aplicar fungicida orgánico.`
      : `Detectado: ${result.disease}. \n\nInicia sesión para ver el tratamiento completo.`;

    Alert.alert("Resultado del Análisis", message, [
      { text: "Cerrar", style: "cancel" },
      { 
        text: userToken ? "Guardar" : "Iniciar Sesión", 
        onPress: () => userToken ? console.log("Guardando...") : navigation.navigate('Login') 
      }
    ]);
  };

  return (
    <View style={styles.container}>
      <CameraView 
        style={styles.camera} 
        ref={cameraRef}
        facing="back" // 👈 Aseguramos que use la cámara trasera
      >
        <View style={styles.overlay}>
          <View style={styles.guideContainer}>
            <Text style={styles.guideText}>Ubica la hoja dentro del recuadro</Text>
            <View style={styles.reticle} />
          </View>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
              <Text style={styles.backText}>Volver</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.captureButton, isProcessing && styles.buttonDisabled]} 
              onPress={handleCapture}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <ActivityIndicator color="#fff" size="large" />
              ) : (
                <View style={styles.innerCircle} />
              )}
            </TouchableOpacity>
            
            <View style={{ width: 60 }} /> 
          </View>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  camera: { flex: 1 },
  overlay: { flex: 1, justifyContent: 'space-between', padding: 20 },
  guideContainer: { alignItems: 'center', marginTop: 50 },
  guideText: { color: '#fff', fontSize: 16, backgroundColor: 'rgba(0,0,0,0.5)', padding: 10, borderRadius: 10 },
  reticle: { 
    width: 250, height: 250, 
    borderWidth: 2, borderColor: '#16a34a', 
    borderStyle: 'dashed', borderRadius: 20, marginTop: 40 
  },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 30 },
  captureButton: { 
    width: 80, height: 80, borderRadius: 40, 
    backgroundColor: 'rgba(255,255,255,0.3)', 
    justifyContent: 'center', alignItems: 'center', borderWidth: 4, borderColor: '#fff' 
  },
  innerCircle: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#fff' },
  buttonDisabled: { opacity: 0.5 },
  backButton: { backgroundColor: 'rgba(0,0,0,0.5)', padding: 15, borderRadius: 30 },
  backText: { color: '#fff', fontWeight: 'bold' }
});