import express from 'express';
import { registerUser, loginUser, editUser, deleteUser } from '../controllers/users.js';
import { verifyToken } from '../middlewares/auth.js';

const router = express.Router();

// Ruta para crear un nuevo usuario
router.post('/register', registerUser);
// ruta para iniciar sesion
router.post('/login', loginUser);

// ruta para editar la cuentica
router.put('/edit', verifyToken, editUser);

// ruta para eliminar cuentica
router.delete('/delete', verifyToken, deleteUser);



    
export default router;