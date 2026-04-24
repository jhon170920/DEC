import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, sparse: true, lowercase: true, trim: true },
    password: { type: String, required: false, select: false },
    phone: { type: String, default: '' },
    pictureUrl: { type: String, default: '' },
    isVerified: { type: Boolean, default: false},
    
    // CAMPOS PARA VERIFICAR EL CORREO DEL FORMULARIO DE REGISTRO
    verificationCode: { type: String },
    verificationCodeExpires: { type: Date },
    
    //CAMPOS PARA RECUPERACIÓN DE CONTRASEÑA
    codeRecuperation: { type: String },
    codeExpiration: { type: Date },


    // LOGIN SOCIAL
    facebookId: { type: String, unique: true, sparse: true},
    googleId: { type: String, unique: true, sparse: true },
    
    // ORIGEN DE REGISTRO
    provider: [{ type: String, enum: ['local', 'google', 'facebook', 'unknow']}],
    
    role: { type: String, enum: ['user', 'guest', 'admin', 'tecnico'], default: 'user' },
    active: { type: Boolean, default: true },
    pushTokens: { type: [String], default: [] },
    lastSync: { type: Date, default: Date.now },
    history: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Detection' }]
}, { timestamps: true });

const User = mongoose.model("User", UserSchema);

export default User;
