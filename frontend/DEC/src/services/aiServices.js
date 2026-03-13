import * as tf from '@tensorflow/tfjs';
import { decodeJpeg, bundleResourceIO } from '@tensorflow/tfjs-react-native';
import * as FileSystem from 'expo-file-system/legacy';

export const imageToTensor = async (uri) => {
    // 1. Leer el archivo de la imagen como una cadena base64
    const imgB64 = await FileSystem.readAsStringAsync(uri, {
        encoding: 'base64',
    });
    
    // 2. Convertir el base64 a un buffer de bytes
    const imgBuffer = tf.util.encodeString(imgB64, 'base64').buffer;
    
    // 3. Decodificar la imagen (convirtiéndola en un tensor de píxeles)
    const rawImage = decodeJpeg(new Uint8Array(imgBuffer));
    
    // 4. Redimensionar y normalizar al formato que espera tu modelo YOLO
    // YOLO espera: [1, 640, 640, 3] y valores entre 0 y 1
    const tensor = rawImage
        .resizeBilinear([640, 640])
        .div(255.0) // Normalización
        .expandDims(0); // Añade la dimensión del lote (batch dimension)
        
    return tensor;
};

let modelInstance = null;

// Mapa real según tu .yaml
const MAPA_ENFERMEDADES = {
    0: "Cercospora", // LA MISMA MANCHA HIERRO
    1: "Minador de la hoja",
    2: "Roya (Leaf Rust)",
    3: "Araña roja"
};

export const loadModel = async () => {
    if (modelInstance) return modelInstance;
    await tf.ready();
    
    // bundleResourceIO requires BOTH the model JSON and an array of weight binaries.
    // Add all your .bin shard files here in order (e.g. group1-shard1of3.bin, etc.)
    const modelJson    = require('../../assets/model/model.json');
    const modelWeights = [
        require('../../assets/model/group1-shard1of3.bin'),
        require('../../assets/model/group1-shard2of3.bin'),
        require('../../assets/model/group1-shard3of3.bin'),
    ];

    modelInstance = await tf.loadGraphModel(bundleResourceIO(modelJson, modelWeights));
    return modelInstance;
};

export const processPrediction = (predictions) => {
    // Nota: 'predictions' suele ser un tensor. 
    // Usamos dataSync() para obtener los números.
    const data = predictions.dataSync();
    
    let maxConf = 0;
    let bestClassIndex = 0;
    
    for (let i = 0; i < data.length; i++) {
        if (data[i] > maxConf) {
            maxConf = data[i];
            bestClassIndex = i;
        }
    }
    
    return {
        disease: MAPA_ENFERMEDADES[bestClassIndex] || "Desconocido",
        confidence: (maxConf * 100).toFixed(2) + "%"
    };
};