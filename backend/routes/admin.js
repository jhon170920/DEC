import express from 'express';
import { getAllUsers, getAllDeteccions } from '../services/admin.js';
import { verifyToken, onlyAdmin } from '../middlewares/auth.js';

const router = express.Router();

// obtener usuarios
router.get('/get-users', verifyToken, onlyAdmin, getAllUsers);
// obtener detecciones
router.get('/get-deteccions', verifyToken, onlyAdmin, getAllDeteccions);

export default router