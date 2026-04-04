import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useIsFocused } from '@react-navigation/native';
// CAMBIO CLAVE: Importamos GLView y la clase de contexto
import { GLView } from 'expo-gl';
import Expo2DContext from 'expo-2d-context'; 
import { imageToTensor, processPrediction, runInference } from '../services/aiServices';

export default function CameraScreen({ navigation }) {
  const isFocused = useIsFocused();
  const [permission, requestPermission] = useCameraPermissions();
  const [isProcessing, setIsProcessing] = useState(false);
  
  const cameraRef = useRef(null);
  const ctxRef = useRef(null); // Aquí guardaremos la INSTANCIA de la clase

  useEffect(() => { // pregunta por permisos como el uso de la camara y procede a evaluar 
    if (permission && !permission.granted && permission.canAskAgain) {
      requestPermission();
    }
  }, [permission]);

  // Precarga del modelo
  useEffect(() => {
    import('../services/aiServices').then(({ loadModel }) => loadModel());
  }, []);

  if (!isFocused || !permission) return <View style={{ flex: 1, backgroundColor: '#000' }} />;

  const handleCapture = async () => {
    if (cameraRef.current && ctxRef.current && !isProcessing) {
      try {
        setIsProcessing(true);
        const photo = await cameraRef.current.takePictureAsync({ quality: 0.7 });

        // 1. Procesar con IA
        const inputData = await imageToTensor(photo.uri, ctxRef.current);
        const predictionData = await runInference(inputData);
        const prediction = processPrediction(predictionData); 

        if (prediction) {
          // 2. Diccionario de Información (Base de conocimientos local)
          const infoMap = {
        "Cercospora": {
          cientifico: "Cercospora coffeicola",
          desc: "Manchas circulares con centro claro. Afecta calidad del grano.",
          saludable: false
        },
        "Minador de la hoja": {
          cientifico: "Leucoptera coffeella",
          desc: "Larva que crea galerías necróticas en las hojas.",
          saludable: false
        },
        "Roya (Leaf Rust)": {
          cientifico: "Hemileia vastatrix",
          desc: "Polvillo naranja en el envés. La enfermedad más costosa del café.",
          saludable: false
        },
        "Araña roja": {
          cientifico: "Oligonychus ilicis",
          desc: "Ácaro que broncea las hojas en épocas de sequía.",
          saludable: false
        }
      };

          const detalle = infoMap[prediction.disease] || {
            cientifico: "No apllica",
            desc: "Detección fuera de rango. No se ha detectado ninguna enfermedad",
            saludable: true
          };

          // 3. NAVEGACIÓN con el objeto 'data'
          navigation.navigate('Result', { 
            data: {
              uri: photo.uri,
              disease: prediction.disease,
              confidence: prediction.confidence,
              scientificName: detalle.cientifico,
              description: detalle.desc,
              isHealthy: detalle.saludable  
            }
          });
        }
      } catch (error) {
        console.error(error);
        Alert.alert("Error", "No se pudo realizar el diagnóstico.");
      } finally {
        setIsProcessing(false);
      }
    }
  };

  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} ref={cameraRef} facing="back">
        
        {/* USAMOS GLVIEW PARA INICIALIZAR EL CONTEXTO 2D */}
        <View style={styles.canvasContainer}>
          <GLView 
            style={{ width: 640, height: 640 }} 
            onContextCreate={(gl) => {
              // Si ya existe una instancia, no creamos otra para no fugar memoria
              if (!ctxRef.current) {
                const ctx = new Expo2DContext(gl, {
                  renderWithOffscreenBuffer: true,
                  maxInteractions: 100 // Límite para evitar el error de Shader que vimos antes
                });
                ctxRef.current = ctx;
              }
            }} 
          />
        </View>

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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  camera: { flex: 1 },
  canvasContainer: {
    position: 'absolute',
    left: -1000, // Invisible para el usuario
    width: 640,
    height: 640,
  },
  overlay: { flex: 1, justifyContent: 'space-between', padding: 20 },
  guideContainer: { alignItems: 'center', marginTop: 50 },
  guideText: { color: '#fff', fontSize: 14, backgroundColor: 'rgba(0,0,0,0.6)', padding: 10, borderRadius: 20 },
  reticle: { width: 280, height: 280, borderWidth: 3, borderColor: '#16a34a', borderStyle: 'dashed', borderRadius: 25, marginTop: 40 },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 40 },
  captureButton: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', borderWidth: 5, borderColor: '#fff' },
  innerCircle: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#fff' },
  buttonDisabled: { opacity: 0.5 },
  backButton: { backgroundColor: 'rgba(0,0,0,0.5)', padding: 15, borderRadius: 30 },
  backText: { color: '#fff', fontWeight: 'bold' }
});