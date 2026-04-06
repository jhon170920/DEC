import express from 'express';
import { getAllPathologies } from '../controllers/pathologyController.js';
import { verifyToken } from '../middlewares/auth.js'; // middleware para proteger rutas

const router = express.Router();

// Ruta protegida: solo accesible si el usuario tiene sesión activa
router.get('/', verifyToken, getAllPathologies);

export default router;
