import mongoose from "mongoose";

const DetectionSchema = new mongoose.Schema(
    {
        userId: { // Referencia al usuario que hizo la detección
            type: mongoose.Schema.Types.ObjectId,
            ref: "Users",
            required: true
        },
        pathologyId: { 
            type: mongoose.Schema.Types.ObjectId,
            ref: "Pathology", 
            required: true
        },
        imageUrl: { // Link a Cloudinary o S3
            type: String,
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
        }
    },
    {
        timestamps: true // Acá se hace practicamente lo mismo que date
    }
);
// Esto le dice a MongoDB: "Organiza internamente las coordenadas para búsquedas rápidas"
DetectionSchema.index({ location: "2dsphere" });
const Detections = mongoose.model("Detections", DetectionSchema);
export default Detections;