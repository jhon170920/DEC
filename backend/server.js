import express from 'express';
import cors from 'cors';
import "./db/db.js"; // Asegura que la conexión a la base de datos se establezca al iniciar el servidor
import userRoutes from './routes/users.js';
import loginRoutes from './routes/login.js';
import detectionRoutes from './routes/detection.js';


const app = express();

app.use(express.json()); // Middleware para parsear JSON en las solicitudes entrantes
app.use(express.urlencoded({ extended: true })); // Middleware para parsear datos de formularios (application/x-www-form-urlencoded)
app.use(cors());

app.use("/api/detections", detectionRoutes);
app.use("/api/users", userRoutes);
app.use("/api/login", loginRoutes);
app.get("/", (req, res) => {
  res.send(" Servidor funcionando correctamente");
});

app.listen(8081, ()=> console.log("✅ ✅servidor corriendo en http://localhost:8081"));
