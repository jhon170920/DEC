import Detections from "../models/Detection.js";
import { uploadToCloudinary } from "../services/cloudinary.js"; // ajusta la ruta si es diferente

// guardar
export const saveDetection = async (req, res) => {
    try {
        // 1. Validar que se haya subido un archivo
        if (!req.file) {
            return res.status(400).json({ message: "No se recibió ninguna imagen." });
        }

        // 2. Subir el buffer en memoria a Cloudinary y obtener la URL
        const imageUrl = await uploadToCloudinary(req.file.buffer, req.file.mimetype);

        // 3. Extraer el resto de datos del body
        const { plantName, pathology, confidence, treatment } = req.body;

        // 4. Crear el registro vinculado al usuario (viene del JWT)
        const newDetection = new Detections({
            userId: req.user.id,
            plantName,
            pathology,
            confidence: parseFloat(confidence),
            imageUrl,
            treatment
        });

        // 5. Guardar en MongoDB
        await newDetection.save();

        res.status(201).json({
            message: "¡Detección guardada con éxito en el historial!",
            data: newDetection
        });
    } catch (error) {
        res.status(500).json({ message: "Error al guardar en la base de datos", error: error.message });
    }
};
// Obtener el historial del usuario logueado
export const getUserHistory = async (req, res) => {
    try {
        // req.user.id viene del middleware de autenticación (JWT)
        const history = await Detections.find({ userId: req.user.id }).sort({ createdAt: -1 });
        res.status(200).json(history);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener el historial", error: error.message });
    }
};
// eliminar una deteccion del historial del usuario
export const deleteUserDetection = async (req, res) => {
    try {
        const detectionDeleted = await Detections.findOneAndDelete({ userId: req.user.id})
        // validamos si encontramos la deteccion por si acaso
        if (!detectionDeleted) {
            return res.status(404).json({ message: "No se encontró la detección para borrar" });
        }
    } catch (error) {
        res.status(500).json({ message: "Error al eliminar la detección", error: error.message });
    }
}
// eliminar todo el historial del usuario
export const deleteUserHistory = async (req, res) => {
    try {
        const historyDeleted = await Detections.findOneAndDelete({ userId: req.user.id})
        // validamos si hay algo por si acaso
        if (!historyDeleted){
            return res.status(404).json({ message: "No se encontró el historial de detecciones para borrar" });
        }
    } catch (error) {
        res.status(500).json({ message: "Error al eliminar el historial de detecciones", error: error.message });
    }
}