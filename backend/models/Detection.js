import mongoose from "mongoose";

const DetectionSchema = new mongoose.Schema({
    // Referencia al usuario que hizo la detección
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Users", 
        required: true 
    },
    plantName: { type: String, required: true }, // Ej: "Tomate"
    pathology: { type: String, required: true }, // Ej: "Tizón Tardío"
    confidence: { type: Number }, // Porcentaje de acierto de la IA (0 a 1)
    imageUrl: { type: String, required: true }, // Link a Cloudinary o S3
    date: { type: Date, default: Date.now },
    // Aquí guardamos la solución completa de una vez para que el historial sea rico
    treatment: { type: String } 
}, { timestamps: true });

const Detections = mongoose.model("Detections", DetectionSchema);
export default Detections;