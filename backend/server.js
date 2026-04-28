import express from 'express';
import cors from 'cors';
import "./db/db.js"; // Asegura que la conexión a la base de datos se establezca al iniciar el servidor

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



const app = express();
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(cors());
// ruta principal de usuarios
app.use("/api/users", userRoutes);
// ruta de historial de detecciones
app.use("/api/detections", detectionRoutes);
// ruta para recuperar conttaseña
app.use("/api/recover", recoverPassword);

app.use("/api/pathologies", pathologyRoutes) // ruta para obtener las patologías desde la base de datos

// ruta principal de admin
app.use("/api/admin", adminRoutes);
app.use('/api/stats', statsRoutes);

// ruta para mensajes
app.use('/api/messages', messageRoutes);

// ruta para tratamientos
app.use('/api/treatments', treatmentRoutes);

app.get("/", (req, res) => {
  res.send(" Servidor funcionando correctamente");
});



const PORT = process.env.PORT || 8089;
app.listen(PORT, '0.0.0.0', () => console.log(`✅ Servidor corriendo en puerto ${PORT}`));

