import React, { useState, useEffect, useRef, useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useIsFocused } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';
import { loadModel, imageToTensor, processPrediction } from '../services/aiServices'; // Importamos el servicio de la IA

export default function CameraScreen({ navigation }) {
  const isFocused = useIsFocused();
  const [permission, requestPermission] = useCameraPermissions();
  const [isProcessing, setIsProcessing] = useState(false);
  const cameraRef = useRef(null);
  const { userToken } = useContext(AuthContext);

  useEffect(() => { // pregunta por permisos como el uso de la camara y procede a evaluar 
    if (permission && !permission.granted && permission.canAskAgain) {
      requestPermission();
    }
  }, [permission]);

  // Aseguramos que el modelo cargue al entrar a la pantalla
  useEffect(() => {
    loadModel();
  }, []);

  if (!isFocused || !permission) return <View style={{ flex: 1, backgroundColor: '#000' }} />;

const handleCapture = async () => {
    if (cameraRef.current && !isProcessing) {
      try {
        setIsProcessing(true);
        
        // 1. Capturar la foto primero
        const photo = await cameraRef.current.takePictureAsync({ quality: 0.8 });
        
        // 2. Cargar el modelo (si no está cargado, lo carga, si ya lo está, lo retorna)
        const model = await loadModel();
        
        // 3. Convertir la foto a tensor (usando la función que creamos)
        const tensor = await imageToTensor(photo.uri);
        
        // 4. Hacer la predicción
        const predictions = await model.predict(tensor);
        console.log("Shape:", predictions.shape);
        console.log("Data (primeros 20 valores):", Array.from(predictions.dataSync().slice(0, 20)));
        
        // 5. Procesar el resultado usando tu función del servicio
        const result = processPrediction(predictions);
        
        // 6. Mostrar resultado
        if (result) {
            showResults(result);
        }

        // Importante: Limpiar la memoria del tensor
        tensor.dispose(); 
        
        setIsProcessing(false);
      } catch (error) {
        console.error("Error en IA:", error);
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
      { text: userToken ? "Guardar" : "Iniciar Sesión", 
        onPress: () => userToken ? console.log("Guardando...") : navigation.navigate('Login') }
    ]);
  };

  // ... (El resto del render es igual)
  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} ref={cameraRef} facing="back">
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
              {isProcessing ? <ActivityIndicator color="#fff" size="large" /> : <View style={styles.innerCircle} />}
            </TouchableOpacity>
            <View style={{ width: 60 }} /> 
          </View>
        </View>
      </CameraView>
    </View>
  );
}
// ... (Tus estilos se mantienen igual)
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