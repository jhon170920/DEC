import express from "express";
import { getUserHistory, saveDetection } from "../controllers/detectionController.js";
import { verifyToken } from "../middlewares/auth.js";
import { upload } from "../services/cloudinary.js";


const router = express.Router();

// Aplicamos el middleware verifyToken para proteger AMBAS rutas
// Un invitado no podrá ni guardar ni ver historiales
router.post("/save", verifyToken, upload.single("image"), saveDetection);
router.get("/history", verifyToken, getUserHistory);


export default router;