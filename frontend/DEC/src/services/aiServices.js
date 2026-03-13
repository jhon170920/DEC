import * as tf from '@tensorflow/tfjs';
import { decodeJpeg, bundleResourceIO } from '@tensorflow/tfjs-react-native';
import * as FileSystem from 'expo-file-system/legacy';

export const imageToTensor = async (uri) => {
    const imgB64 = await FileSystem.readAsStringAsync(uri, {
        encoding: 'base64',
    });
    const imgBuffer = tf.util.encodeString(imgB64, 'base64').buffer;
    const rawImage = decodeJpeg(new Uint8Array(imgBuffer));
    const tensor = rawImage
        .resizeBilinear([640, 640])
        .div(255.0)
        .expandDims(0);
    return tensor;
};

let modelInstance = null;

const MAPA_ENFERMEDADES = {
    0: "Cercospora",
    1: "Minador de la hoja",
    2: "Roya (Leaf Rust)",
    3: "Araña roja"
};

export const loadModel = async () => {
    if (modelInstance) return modelInstance;
    await tf.ready();

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
    // Output shape: [1, 8, 8400]
    // Filas 0-3 → coordenadas bbox (x, y, w, h)  — se ignoran
    // Filas 4-7 → score de cada clase (4 clases)
    // 8400 detecciones candidatas por imagen

    const NUM_CLASES      = 4;
    const NUM_DETECCIONES = 8400;
    const FILA_CLASES     = 4;     // las clases empiezan en la fila 4
    const UMBRAL          = 0.25;  // confianza mínima para considerar una detección válida

    const data = predictions.dataSync(); // array plano de 67200 valores

    let mejorConf  = 0;
    let mejorClase = -1;

    for (let det = 0; det < NUM_DETECCIONES; det++) {
        for (let cls = 0; cls < NUM_CLASES; cls++) {
            // Índice en array plano: fila × NUM_DETECCIONES + columna_deteccion
            const idx   = (FILA_CLASES + cls) * NUM_DETECCIONES + det;
            const score = data[idx];

            if (score > mejorConf) {
                mejorConf  = score;
                mejorClase = cls;
            }
        }
    }

    if (mejorConf < UMBRAL) {
        return {
            disease:    "No se detectó enfermedad",
            confidence: (mejorConf * 100).toFixed(2) + "%"
        };
    }

    return {
        disease:    MAPA_ENFERMEDADES[mejorClase] ?? "Desconocido",
        confidence: (mejorConf * 100).toFixed(2) + "%"
    };
};