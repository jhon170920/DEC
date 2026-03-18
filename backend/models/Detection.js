import mongoose from "mongoose";

const DetectionSchema = new mongoose.Schema(
    {
        userId: { // Referencia al usuario que hizo la detección
            type: mongoose.Schema.Types.ObjectId,
            ref: "Users",
            required: true
        },
        plantName: { // Ej: "Tomate"
            type: String,
            required: true,
            trim: true
        },
        pathology: { // Ej: "Tizón Tardío"
            type: String,
            required: true,
            trim: true
        },
        location: { // acá debería guardar la ubicacion al momento de la detección
            type: String
        },
        confidence: { // Porcentaje de acierto de la IA (0 a 1)
            type: Number,
            min: 0,
            max: 1
        },
        imageUrl: { // Link a Cloudinary o S3
            type: String,
            required: true
        },
        // Aquí guardamos la solución completa de una vez para que el historial sea rico
        treatment: { type: String }
    },
    {
        timestamps: true // Acá se hace practicamente lo mismo que date
    }
);

const Detections = mongoose.model("Detections", DetectionSchema);
export default Detections;