import express from "express";
import { getUserHistory, saveDetection, deleteUserDetection, deleteUserHistory } from "../controllers/detectionController.js";
import { verifyToken } from "../middlewares/auth.js";
import { upload } from "../services/cloudinary.js";


const router = express.Router();

// Aplicamos el middleware verifyToken para proteger AMBAS rutas
// Un invitado no podrá ni guardar ni ver historiales
router.post("/save", verifyToken, upload.single('image'), saveDetection);
// obtener el historial del usuario
router.get("/history", verifyToken, getUserHistory);
//eliminar una deteccion del historial
router.delete("/delete-detection:id", verifyToken, deleteUserDetection)

// limpiar el historial
router.delete("/clear-history", verifyToken, deleteUserHistory)




export default router;