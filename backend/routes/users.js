import express from 'express';
import { registerUser, loginUser } from '../controllers/users.js';

const router = express.Router();

// Ruta para crear un nuevo usuario
router.post('/register', registerUser);
// ruta para iniciar sesion
router.post('/login', loginUser);



    
export default router;