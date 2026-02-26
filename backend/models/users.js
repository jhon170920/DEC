import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    // Diferenciar entre usuarios reales e invitados si decides persistirlos
    role: { type: String, enum: ['user', 'guest'], default: 'user' },
    // Para sincronización: saber cuándo se actualizó por última vez
    lastSync: { type: Date, default: Date.now },
    // Referencia al historial de detecciones
    history: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Detection' }]
}, { timestamps: true }); // Crea createdAt y updatedAt automáticamente

const User = mongoose.model("User", UserSchema);
export default User;