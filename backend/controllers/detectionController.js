import Detections from "../models/Detection.js";
import Pathology from "../models/pathologies.js";
import { uploadToCloudinary } from "../services/cloudinary.js"; // ajusta la ruta si es diferente
import User from "../models/users.js";

// guardar
export const saveDetection = async (req, res) => {
    console.log("Cuerpo recibido:", req.body);
    console.log("Archivo recibido:", req.file); // <--- Si esto es undefined, el FormData falló
    if (!req.file) {
    return res.status(400).json({ message: "No se recibió la imagen de la afección" });
  }
    try {
        // extraer y validar que se haya enviado la foto
        if (!req.file) return res.status(400).json({ message: "No se recibió ninguna imagen para guardar la deteccion" });
        // subir el buffer en memoria a Cloudinary y obtener la URL
        const imageUrl = await uploadToCloudinary(req.file.buffer, req.file.mimetype);
        
        // obtener los id, pathología y del usuario
        const userId = req.user.id
        // extraer datos del análisis
        const {lng, lat, confidence} = req.body;

        // verificamos si existe el id de la pathología (enviada desde el front) en nuestra base de datos 
        const { disease } = req.body;
        console.log("🔍 disease recibido:", JSON.stringify(disease));
        const todasLasPatologias = await Pathology.find({});
console.log("📚 Total documentos en pathologies:", todasLasPatologias.length);
console.log("📚 Primero:", todasLasPatologias[0]);
        console.log("📦 Colección que usa Mongoose:", Pathology.collection.collectionName);
        const pathologyExist = await Pathology.findOne({ name: disease.trim()  });
        console.log("📋 Resultado findOne:", pathologyExist);
        if (!pathologyExist) return res.status(404).json({ message: "La patología referenciada no existe." });
        const pathologyId = pathologyExist._id;

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
        const savedDetection = await newDetection.save();

        await User.findByIdAndUpdate(req.user.id, {
            $push: { history: savedDetection._id }, // Empuja el ID al array
            $set: { lastSync: new Date() }          // Actualiza la fecha de sincronización
        });
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
        // Leemos la página y el límite de la URL (query params) Si no vienen, por defecto es página 1 y límite de 10 por página
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        // Calculamos cuántos registros saltar
        // Página 1: (1-1) * 10 = 0 saltos
        // Página 2: (2-1) * 10 = 10 saltos
        const skip = (page - 1) * limit;
        // req.user.id viene del middleware de autenticación (JWT)
        // ejecutamos dos busquedas al mismo tiempo, el history y el total records
        const [history, totalRecords] = await Promise.all([
            Detections.find({ userId: req.user.id })
                .populate("pathologyId", "name treatment") // tratemos la patología
                .sort({ createdAt: -1 }) // la más reciente arriba
                .skip(skip)// nos saltemos los análisis ya hechos
                .limit(limit), // el límite de detecciones cada pagina
            Detections.countDocuments({ userId: req.user.id }) // el total de detecciones
        ]) 

        const hasMore = skip + history.length < totalRecords; // calculamos si hay mas en la siguiente pagina
            
        res.status(200).json({
            history, // lita de detecciones
            hasMore, // si hay mas o no en la pagina siguiente
            totalRecords, // para mostrar un total de analisis
            currentPage: page // la página actual
        });
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