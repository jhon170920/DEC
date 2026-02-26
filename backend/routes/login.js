import express from 'express';
import { loginUser } from "../controllers/login.js";

const router = express.Router();
// Ruta para iniciar sesion de usuario
router.post('/', loginUser);

export default router;