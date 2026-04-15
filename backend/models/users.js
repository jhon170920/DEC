import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, sparse: true, lowercase: true, trim: true },
    password: { type: String, required: false, select: false }, // FALSE PARA LOGIN GOOGLE Y FACEBOOK. SELECT EN FALSE PARA NO TRAERLO EN CADA CONSULTA
    pictureUrl: { type: String, defaut: '' }, // FOTO (URL DE GOOGLE Y FACEBOOK)
    isVerified: { type: Boolean, default: false}, // REGISTRO CON FORMULARIO
    // CAMPOS PARA VERIFICAR EL CORREO DEL FORMULARIO DE REGISTRO
    verificationCode: { type: String },
    verificationCodeExpires: { type: Date },

    // LOGIN SOCIAL
    facebookId: { type: String, unique: true, sparse: true},
    googleId: { type: String, unique: true, sparse: true },
    // ORIGEN DE REGISTRO
    provider: [{ type: String, enum: ['local', 'google', 'facebook', 'unknow']}], default: ['local'],

    // Diferenciar entre usuarios reales e invitados si decides persistirlos
    role: { type: String, enum: ['user', 'guest', 'admin'], default: 'user' },
    // Para sincronización: saber cuándo se actualizó por última vez.
    
    active: { type: Boolean, default: true },
    pushTokens: { type: [String], default: [] },
    // Para sincronización: saber cuándo se actualizó por última vez
    lastSync: { type: Date, default: Date.now },
    // Referencia al historial de detecciones
    history: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Detection' }]
}, 
{ timestamps: true }); // Crea createdAt y updatedAt automáticamente

const User = mongoose.model("User", UserSchema);

export default User;
