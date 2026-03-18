import { loadTensorflowModel } from 'react-native-fast-tflite';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { Asset } from 'expo-asset';

const TF_IMG_SIZE = 640;
const NUM_CLASSES = 4;
const NUM_DETECTIONS = 8400;
const PROB_OFFSET = 4;

/**
 * Procesa la imagen capturada para convertirla en un array de tensores (Float32).
 */
export const imageToTensor = async (uri, ctx) => {
  try {
    if (!ctx) throw new Error("El contexto gráfico (GL/2D) no está listo.");

    // 1. Redimensionar para que coincida con la entrada del modelo YOLO (640x640)
    const resized = await manipulateAsync(
      uri,
      [{ resize: { width: TF_IMG_SIZE, height: TF_IMG_SIZE } }],
      { format: SaveFormat.JPEG }
    );

    // 2. Cargar el recurso de forma asíncrona (Solución al error de Asset.fromUri)
    const assets = await Asset.loadAsync(resized.uri);
    const asset = assets[0];

    if (!asset) throw new Error("No se pudo cargar el recurso de la imagen.");

    // 3. Dibujar en el Canvas invisible
    ctx.drawImage(asset, 0, 0, TF_IMG_SIZE, TF_IMG_SIZE);
    
    // Sincronizar con la GPU antes de leer píxeles
    ctx.flush(); 

    // 4. Extraer datos de píxeles (RGBA)
    const imageData = ctx.getImageData(0, 0, TF_IMG_SIZE, TF_IMG_SIZE);
    const pixels = imageData.data; 

    // 5. Normalizar a Float32Array [R, G, B] en rango [0, 1]
    const float32 = new Float32Array(TF_IMG_SIZE * TF_IMG_SIZE * 3);
    let floatIdx = 0;

    for (let i = 0; i < pixels.length; i += 4) {
      float32[floatIdx++] = pixels[i] / 255.0;     // Rojo
      float32[floatIdx++] = pixels[i + 1] / 255.0; // Verde
      float32[floatIdx++] = pixels[i + 2] / 255.0; // Azul
    }

    return float32;
  } catch (error) {
    console.error("Error en imageToTensor:", error);
    return null;
  }
};

// --- Gestión del Modelo TFLite ---
let modelInstance = null;

export const loadModel = async () => {
  if (modelInstance) return modelInstance;

  try {
    console.log("Cargando modelo YOLOv11...");
    modelInstance = await loadTensorflowModel(
      require('../../assets/model/best_float16.tflite')
    );
    return modelInstance;
  } catch (error) {
    console.error("Error crítico al cargar el modelo:", error);
    throw error;
  }
};

// --- Inferencia ---
export const runInference = async (inputFloat32) => {
  try {
    if (!inputFloat32) return null;
    const model = await loadModel();
    const outputs = await model.run([inputFloat32]);
    return outputs[0]; 
  } catch (error) {
    console.error("Error durante la inferencia:", error);
    return null;
  }
};

// --- Interpretación de Resultados (YOLOv11) ---
export const processPrediction = (predictionData) => {
  if (!predictionData) return null;

  const MAPA_ENFERMEDADES = {
    0: "Cercospora",
    1: "Minador de la hoja",
    2: "Roya (Leaf Rust)",
    3: "Araña roja"
  };

  const UMBRAL = 0.40; // Confianza mínima del 40%
  let mejorConf = 0;
  let mejorClase = -1;

  // YOLOv11 organiza los datos: [coordenadas(4) + clases(NUM_CLASSES)] x 8400 detecciones
  for (let det = 0; det < NUM_DETECTIONS; det++) {
    for (let cls = 0; cls < NUM_CLASSES; cls++) {
      const idx = (PROB_OFFSET + cls) * NUM_DETECTIONS + det;
      const score = predictionData[idx];

      if (score > mejorConf) {
        mejorConf = score;
        mejorClase = cls;
      }
    }
  }

  if (mejorConf < UMBRAL) {
    return {
      disease: "Sana / No detectada",
      confidence: (mejorConf * 100).toFixed(2) + "%"
    };
  }

  return {
    disease: MAPA_ENFERMEDADES[mejorClase] || "Desconocida",
    confidence: (mejorConf * 100).toFixed(2) + "%"
  };
};