import express from "express";
import { verifyToken } from "../middlewares/auth.js";
const router = express.Router();

// Esta ruta está PROTEGIDA: Solo usuarios logueados
router.get("/", verifyToken, async (req, res) => {
    // Gracias al middleware, aquí ya tenemos req.user.id
    // Aquí buscarías en MongoDB: Detections.find({ userId: req.user.id })
    res.json({ message: `Historial del usuario ${req.user.id}` });
});

export default router;