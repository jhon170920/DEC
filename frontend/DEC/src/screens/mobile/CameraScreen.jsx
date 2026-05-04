import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, Dimensions } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useIsFocused } from '@react-navigation/native';
import { GLView } from 'expo-gl';
import Expo2DContext from 'expo-2d-context';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { imageToTensor, processPrediction, runInference, loadModel } from '../../services/aiServices';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const BOX_SIZE = 220;

export default function CameraScreen({ navigation }) {
  const isFocused = useIsFocused();
  const [permission, requestPermission] = useCameraPermissions();
  const [isProcessing, setIsProcessing] = useState(false);
  const [modelLoading, setModelLoading] = useState(true);
  const cameraRef = useRef(null);
  const ctxRef = useRef(null);
  const startTimeRef = useRef(Date.now());

  useEffect(() => {
    if (permission && !permission.granted && permission.canAskAgain) {
      requestPermission();
    }
  }, [permission]);

  useEffect(() => {
    const initializeModel = async () => {
      startTimeRef.current = Date.now();
      try {
        await loadModel();
      } catch (error) {
        console.error('Error cargando modelo:', error);
        Alert.alert('Error', 'No se pudo cargar el modelo de inteligencia artificial.');
      } finally {
        const elapsed = Date.now() - startTimeRef.current;
        const remaining = Math.max(0, 2000 - elapsed);
        setTimeout(() => {
          setModelLoading(false);
        }, remaining);
      }
    };
    initializeModel();
  }, []);

  if (!isFocused || !permission) return <View style={{ flex: 1, backgroundColor: '#000' }} />;

  const handleCapture = async () => {
    if (modelLoading) {
      Alert.alert('Cargando', 'El modelo de IA aún se está cargando. Espera un momento.');
      return;
    }
    if (cameraRef.current && ctxRef.current && !isProcessing) {
      try {
        setIsProcessing(true);
        const photo = await cameraRef.current.takePictureAsync({ quality: 0.7 });

        const originX = (screenWidth - BOX_SIZE) / 2;
        const originY = (screenHeight - BOX_SIZE) / 2;
        const scaleX = photo.width / screenWidth;
        const scaleY = photo.height / screenHeight;

        const cropped = await manipulateAsync(
          photo.uri,
          [{
            crop: {
              originX: originX * scaleX,
              originY: originY * scaleY,
              width: BOX_SIZE * scaleX,
              height: BOX_SIZE * scaleY,
            }
          }],
          { compress: 0.8, format: SaveFormat.JPEG }
        );

        const inputData = await imageToTensor(cropped.uri, ctxRef.current);
        const predictionData = await runInference(inputData);
        const prediction = processPrediction(predictionData);

        if (prediction) {
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
            cientifico: "No aplica",
            desc: "Detección fuera de rango. No se ha detectado ninguna enfermedad",
            saludable: true
          };

          navigation.navigate('Result', {
            data: {
              uri: cropped.uri,
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
        <View style={styles.canvasContainer}>
          <GLView
            style={{ width: 640, height: 640 }}
            onContextCreate={(gl) => {
              if (!ctxRef.current) {
                const ctx = new Expo2DContext(gl, {
                  renderWithOffscreenBuffer: true,
                  maxInteractions: 100
                });
                ctxRef.current = ctx;
              }
            }}
          />
        </View>

        <View style={styles.overlay}>
          <View style={styles.topSection}>
            <Text style={styles.guideText}>Ubica la hoja dentro del recuadro</Text>
          </View>

          <View style={styles.middleSection}>
            <View style={styles.reticle} />
          </View>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('MainApp')}>
              <Text style={styles.backText}>Volver</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.captureButton, (isProcessing || modelLoading) && styles.buttonDisabled]}
              onPress={handleCapture}
              disabled={isProcessing || modelLoading}
            >
              {isProcessing
                ? <ActivityIndicator color="#fff" size="large" />
                : <View style={styles.innerCircle} />
              }
            </TouchableOpacity>

            <View style={{ width: 60 }} />
          </View>
        </View>

        {modelLoading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#16a34a" />
            <Text style={styles.loadingText}>Cargando inteligencia artificial...</Text>
          </View>
        )}
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  camera: { flex: 1 },
  canvasContainer: {
    position: 'absolute',
    left: -1000,
    width: 640,
    height: 640,
  },
  overlay: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: 20,
  },
  topSection: {
    alignItems: 'center',
    marginTop: 30,
  },
  guideText: {
    color: '#fff',
    fontSize: 14,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 10,
    borderRadius: 20,
  },
  middleSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reticle: {
    width: BOX_SIZE,
    height: BOX_SIZE,
    borderWidth: 3,
    borderColor: '#16a34a',
    borderStyle: 'dashed',
    borderRadius: 16,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 40,
  },
  captureButton: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 5, borderColor: '#fff'
  },
  innerCircle: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#fff' },
  buttonDisabled: { opacity: 0.5 },
  backButton: { backgroundColor: 'rgb(28, 146, 18)', padding: 15, borderRadius: 30 },
  backText: { color: '#fff', fontWeight: 'bold' },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 12,
    fontWeight: '500',
  },
});