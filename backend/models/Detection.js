import mongoose from "mongoose";

const DetectionSchema = new mongoose.Schema(
    {
        userId: { // Referencia al usuario que hizo la detección
            type: mongoose.Schema.Types.ObjectId,
            ref: "Users",
            required: true
        },
        pathology: { 
            type: mongoose.Schema.Types.ObjectId,
            ref: "Pathology", 
            required: true
        },
        location: {
            type: {
                type: String, 
                enum: ['Point'], // Solo permite el valor 'Point'
                default: 'Point'
            },
            coordinates: {
                type: [Number], // [longitud, latitud] -> OJO: El orden es inverso en GeoJSON
                required: true
            }
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