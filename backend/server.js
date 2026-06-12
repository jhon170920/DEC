import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import dotenv from 'dotenv';
import "./db/db.js"; // Asegura que la conexión a la base de datos se establezca al iniciar el servidor

dotenv.config();

// Validar variables de entorno críticas
const requiredEnvVars = ['JWT_SECRET', 'RESEND_API_KEY', 'FACEBOOK_APP_SECRET', 'dbURI', 'GOOGLE_WEB_CLIENT_ID', 'GOOGLE_APP_CLIENT_ID'];
for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
        console.error(`❌ ERROR CRÍTICO: Variable de entorno faltante: ${envVar}`);
        process.exit(1);
    }
}

// rutas del usuario
import userRoutes from './routes/users.js';
// rutas de las detecciones
import detectionRoutes from './routes/detection.js';
// rutas de recuperar contraseña
import recoverPassword from './routes/recoverPassword.js'
import pathologyRoutes from './routes/pathologyRoutes.js';
// ruta de admin 
import adminRoutes from './routes/admin.js'
import statsRoutes from './routes/statsRoutes.js';
// ruta de mensajes
import messageRoutes from './routes/messages.js';
// ruta de tratamientos
import treatmentRoutes from './routes/treatments.js';
// ruta de notificaciones
import notificationRoutes from './routes/notificationsRoutes.js';

const app = express();

// Aplicar headers de seguridad
app.use(helmet());

// Middleware de parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Configurar CORS (sin cambios, mantener como está)
app.use(cors());

// Rate Limiting - General
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Demasiadas solicitudes, intenta más tarde',
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => process.env.NODE_ENV !== 'production'
});

// Rate Limiting - Login
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: 'Demasiados intentos de inicio de sesión. Intenta en 15 minutos',
    skipSuccessfulRequests: true,
    skip: (req) => process.env.NODE_ENV !== 'production'
});

// Rate Limiting - Recuperación de contraseña
const passwordLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 3,
    message: 'Demasiadas solicitudes de recuperación. Intenta en 1 hora',
    skip: (req) => process.env.NODE_ENV !== 'production'
});

// Aplicar limiters
app.use(generalLimiter);
// Aplicar rate limiting específico
app.use("/api/users", (req, res, next) => {
    if (req.path.includes('login') || req.path.includes('auth')) {
        return loginLimiter(req, res, next);
    }
    next();
}, userRoutes);

// ruta de historial de detecciones
app.use("/api/detections", detectionRoutes);

// ruta para recuperar contraseña
app.use("/api/recover", passwordLimiter, recoverPassword);

app.use("/api/pathologies", pathologyRoutes); // ruta para obtener las patologías desde la base de datos

// ruta principal de admin
app.use("/api/admin", adminRoutes);
app.use('/api/stats', statsRoutes);

// ruta para mensajes
app.use('/api/messages', messageRoutes);

// ruta para tratamientos
app.use('/api/treatments', treatmentRoutes);

//ruta para notificaciones
app.use('/api/notifications', notificationRoutes),

app.get("/", (req, res) => {
  res.send(" Servidor funcionando correctamente");
});

// Middleware de manejo de errores
app.use((err, req, res, next) => {
    console.error(err);
    
    const statusCode = err.statusCode || err.status || 500;
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    res.status(statusCode).json({
        message: isDevelopment ? err.message : 'Error al procesar la solicitud',
        ...(isDevelopment && { stack: err.stack })
    });
});

const PORT = process.env.PORT || 8089;
app.listen(PORT, '0.0.0.0', () => console.log(`✅ Servidor corriendo en puerto ${PORT}`));

