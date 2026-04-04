import Pathology from '../models/pathologies.js'; // Tu modelo definido anteriormente

export const getAllPathologies = async (req, res) => {
    try {
        // Obtenemos todas las patologías guardadas en MongoDB
        const pathologies = await Pathology.find({}, 'name description treatment');
        
        // Respondemos con el JSON que SQLite espera
        res.status(200).json(pathologies);
    } catch (error) {
        console.error("Error al obtener patologías:", error);
        res.status(500).json({ message: "Error al recuperar catálogo técnico" });
    }
};