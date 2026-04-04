import Detections from "../models/Detection.js";
import { uploadToCloudinary } from "../services/cloudinary.js"; // ajusta la ruta si es diferente
import User from "../models/User.js";

// guardar
export const saveDetection = async (req, res) => {
    console.log("Cuerpo recibido:", req.body);
    console.log("Archivo recibido:", req.file); // <--- Si esto es undefined, el FormData falló
    if (!req.file) {
    return res.status(400).json({ message: "No se recibió la imagen de la afección" });
  }
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
        const savedDetection = await newDetection.save();

        await User.findByIdAndUpdate(req.user.id, {
            $push: { history: savedDetection._id }, // Empuja el ID al array
            $set: { lastSync: new Date() }          // Actualiza la fecha de sincronización
        });

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
        const { id } = req.params; // Necesitas pasar el ID en la ruta: /detections/:id
        const detectionDeleted = await Detections.findOneAndDelete({ _id: id, userId: req.user.id });

        if (!detectionDeleted) {
            return res.status(404).json({ message: "No se encontró la detección" });
        }

        // También sacarla del array del usuario
        await User.findByIdAndUpdate(req.user.id, { $pull: { history: id } });

        res.status(200).json({ message: "Detección eliminada" });
    } catch (error) {
        res.status(500).json({ message: "Error al eliminar", error: error.message });
    }
};

// Eliminar TODO el historial del usuario
export const deleteUserHistory = async (req, res) => {
    try {
        // Usamos deleteMany para borrar todas las que coincidan con el userId
        const result = await Detections.deleteMany({ userId: req.user.id });

        // Limpiar el array en el modelo de Usuario
        await User.findByIdAndUpdate(req.user.id, { $set: { history: [] } });

        res.status(200).json({ message: `Se eliminaron ${result.deletedCount} detecciones.` });
    } catch (error) {
        res.status(500).json({ message: "Error al eliminar el historial", error: error.message });
    }
};