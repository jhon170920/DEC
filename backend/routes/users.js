import express from 'express';
import { registerUser, loginUser, editUser, deleteUser, googleAuth } from '../controllers/users.js';
import { contactUs } from '../controllers/contactUs.js';
import { verifyToken } from '../middlewares/auth.js';
import { savePushToken } from '../controllers/notificationController.js';

const router = express.Router();

router.post('/auth/google', googleAuth)

// Ruta para crear un nuevo usuario
router.post('/register', registerUser);
// ruta para iniciar sesion
router.post('/login', loginUser);

// ruta para editar la cuentica
router.put('/edit', verifyToken, editUser);

// ruta para eliminar cuentica
router.delete('/delete', verifyToken, deleteUser);

// ruta de contactos
router.post('/send-message', contactUs);

//Ruta push NOTIFICACIONES

router.post('/save-push-token', verifyToken, savePushToken);

    
export default router;