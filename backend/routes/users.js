import express from 'express';
import { registerUser } from '../controllers/registerUser.js';

const router = express.Router();

// Ruta para crear un nuevo usuario

router.post('/register', registerUser);

    
export default router;