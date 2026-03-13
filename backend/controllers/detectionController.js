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