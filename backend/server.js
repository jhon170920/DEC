import express from 'express';
import cors from 'cors';
import "./db/db.js"; // Asegura que la conexión a la base de datos se establezca al iniciar el servidor
import userRoutes from './routes/users.js';
import detectionRoutes from './routes/detection.js';


const app = express();

app.use(express.json()); // Middleware para parsear JSON en las solicitudes entrantes
app.use(express.urlencoded({ extended: true })); // Middleware para parsear datos de formularios (application/x-www-form-urlencoded)
app.use(cors());
// ruta principal de usuarios
app.use("/api/users", userRoutes);

// ruta de historial de detecciones
app.use("/api/detections", detectionRoutes);

app.get("/", (req, res) => {
  res.send(" Servidor funcionando correctamente");
});



PORT = 8089
app.listen(PORT, ()=> console.log(`✅ ✅servidor corriendo en http://localhost:${PORT}`));
