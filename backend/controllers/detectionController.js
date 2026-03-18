import Detections from "../models/Detection.js";
import Pathology from "../models/pathologies.js";
import { uploadToCloudinary } from "../services/cloudinary.js"; // ajusta la ruta si es diferente

// guardar
export const saveDetection = async (req, res) => {
    try {
        // extraer y validar que se haya enviado la foto
        if (!req.file) return res.status(400).json({ message: "No se recibió ninguna imagen para guardar la deteccion" });
        // subir el buffer en memoria a Cloudinary y obtener la URL
        const imageUrl = await uploadToCloudinary(req.file.buffer, req.file.mimetype);
        
        // obtener los id, usuario y pathología
        const { userId, pathologyId } = req.params;
        // extraer datos del análisis
        const {lng, lat, confidence} = req.body;

        // verificamos si existe el id de la pathología (enviada desde el front) en nuestra base de datos 
        const pathologyExist = await Pathology.findById(pathologyId);
        if (!pathologyExist) return res.status(404).json({ message: "La patología referenciada no existe." });

        // 4. Crear el registro vinculado al usuario (viene del JWT)
        const newDetection = new Detections({
            userId,
            pathologyId,
            location: {
                type: "Point",
                coordinates: [parseFloat(lng), parseFloat(lat)] // [Longitud, Latitud]
            },
            confidence,
            imageUrl,
        });

        // 5. Guardar en MongoDB
        await newDetection.save();
        // enviar mensaje
        res.status(201).json({
            message: "¡Detección guardada con éxito en el historial!",
            detection: newDetection
        });
    } catch (error) {
        res.status(500).json({ message: "Error al guardar en la base de datos", error: error.message });
    }
};
// Obtener el historial del usuario logueado
export const getUserHistory = async (req, res) => {
    try {
        // req.user.id viene del middleware de autenticación (JWT)
        const history = await Detections.find({ userId: req.user.id })
        .populate("pathologyId", "name treatment description") // tratemos la patología
        .sort({ createdAt: -1 }); // la más reciente arriba
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