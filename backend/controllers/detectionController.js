import Detections from "../models/Detection.js";

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

export const saveDetection = async (req, res) => {
    try {
        // 1. Extraemos los datos del body y el path del archivo subido
        const { plantName, pathology, confidence, treatment } = req.body;
        const imageUrl = req.file.path; // La URL de Cloudinary que acabas de obtener

        // 2. Creamos el nuevo registro vinculado al ID del usuario (que viene del JWT)
        const newDetection = new Detections({
            userId: req.user.id, 
            plantName,
            pathology,
            confidence: parseFloat(confidence),
            imageUrl,
            treatment
        });

        // 3. Guardamos en MongoDB
        await newDetection.save();

        res.status(201).json({
            message: "¡Detección guardada con éxito en el historial!",
            data: newDetection
        });
    } catch (error) {
        res.status(500).json({ message: "Error al guardar en la base de datos", error: error.message });
    }
};