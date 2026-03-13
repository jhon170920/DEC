import * as tf from '@tensorflow/tfjs';
import { decodeJpeg, bundleResourceIO } from '@tensorflow/tfjs-react-native';
import * as FileSystem from 'expo-file-system/legacy'; // Usar Legacy para compatibilidad con tensorFlow

export const imageToTensor = async (uri) => { // Convierte en base64 y lo transforma en un buffer de bytes. Esta funcion convierte la imagen en un "TENSOR" (matriz numerica)
    const imgB64 = await FileSystem.readAsStringAsync(uri, {
        encoding: 'base64', // lo transforma a base64
    });
    const imgBuffer = tf.util.encodeString(imgB64, 'base64').buffer;
    const rawImage = decodeJpeg(new Uint8Array(imgBuffer));
    const tensor = rawImage
        .resizeBilinear([640, 640]) //Ajusta el tamaño de la imagen a 640x640 px
        .div(255.0) // Los colores van de 0 a 255. Al dividir por 255, los convierte a un rango de 0 a 1, que es donde las redes neuronales operan mejor.
        .expandDims(0); //Agrega una dimensión extra para indicar que es un "lote de 1 imagen"
    return tensor;
};

let modelInstance = null; // DECLARAMOS LA INSTANCIA DEL MODELO VACIA

// Este es el mapa de enfermedades que trabaja el modelo
const MAPA_ENFERMEDADES = {
    0: "Cercospora",
    1: "Minador de la hoja",
    2: "Roya (Leaf Rust)",
    3: "Araña roja"
};

export const loadModel = async () => {      // Inicializa el MODELO DE IA
    if (modelInstance) return modelInstance;  // Si el modelInstance ya existe, no lo carga nuevamente, (ahorra recursos y tiempo) 
    await tf.ready(); // Prepara el motor, o lo despierta Tensor

    const modelJson    = require('../../assets/model/model.json');

    // Se carga los binarios de la IA
    const modelWeights = [
        require('../../assets/model/group1-shard1of3.bin'),
        require('../../assets/model/group1-shard2of3.bin'),
        require('../../assets/model/group1-shard3of3.bin'),
    ];

    modelInstance = await tf.loadGraphModel(bundleResourceIO(modelJson, modelWeights));     //Se usa bundelResourceIO Permite que los archivos del modelo se lean localmente desde la carpeta assets de la app sin necesidad de internet.
    return modelInstance;
};

// SE PROCEDE A INTERPRETAR LOS RESULTADOS
export const processPrediction = (predictions) => {
    // Output shape: [1, 8, 8400]
    // Filas 0-3 → coordenadas bbox (x, y, w, h)  — se ignoran
    // Filas 4-7 → score de cada clase (4 clases)
    // 8400 detecciones candidatas por imagen

    const NUM_CLASES      = 4;  // El total de clases que maneja el modelo de la IA
    const NUM_DETECCIONES = 8400; // lA CANTIDAD DE COLUMNAS QUE DEVUELVE EL MODELO
    const FILA_CLASES     = 4;     // las clases empiezan en la fila 4
    const UMBRAL          = 0.25;  // confianza mínima para considerar una detección válida

    const data = predictions.dataSync(); // array plano de 67200 valores

    let mejorConf  = 0;
    let mejorClase = -1;

    //Revisa las 8400 zonas una por una
    for (let det = 0; det < NUM_DETECCIONES; det++) {
        for (let cls = 0; cls < NUM_CLASES; cls++) {
            //Como los datos vienen en un array plano se usa esta fórmula matemática para encontrar la probabilidad de una enfermedad específica
            const idx   = (FILA_CLASES + cls) * NUM_DETECCIONES + det; //cls: id de la enfermedad, NUM_DETECCIONES: el total de detecciones, det: la deteccion actual
            const score = data[idx];
            // El (morjorConf): Comparacion: Busca cuál de todas las zonas tiene el porcentaje de confianza más alto
            if (score > mejorConf) {
                mejorConf  = score;
                mejorClase = cls;
            }
        }
    }

    if (mejorConf < UMBRAL) { // Si la confianza más alta es menor al 25%, el código decide que no hay suficiente certeza y devuelve "No se detectó enfermedad".
        return {
            disease:    "No se detectó enfermedad",
            confidence: (mejorConf * 100).toFixed(2) + "%"
        };
    }

    return {
        disease:    MAPA_ENFERMEDADES[mejorClase] ?? "Desconocido", //Si es válida, usa el MAPA_ENFERMEDADES para convertir el número
        confidence: (mejorConf * 100).toFixed(2) + "%"
    };
};