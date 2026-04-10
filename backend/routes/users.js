import express from 'express';
import { loginUser, editUser, deleteUser} from '../controllers/users.js';
import { registerUser, verifyCode} from '../controllers/registerUser.js';
import { googleAuth } from '../controllers/googleAuth.js';
import { facebookAuth } from '../controllers/facebookAuth.js';

import { contactUs } from '../controllers/contactUs.js';
import { verifyToken } from '../middlewares/auth.js';

const router = express.Router();

// ruta para iniciar/registrarse con facebook
router.post('/auth/facebook', facebookAuth)

// ruta para iniciar/registrarse con google
router.post('/auth/google', googleAuth)

// Ruta para crear un nuevo usuario
router.post('/register', registerUser);
// Ruta para validar el codigo de registro
router.post('/verify-code', verifyCode)


// ruta para iniciar sesion
router.post('/login', loginUser);

// ruta para editar la cuentica
router.put('/edit', verifyToken, editUser);

// ruta para eliminar cuentica
router.put('/delete', verifyToken, deleteUser);

// ruta de contactanos
router.post('/send-message', contactUs);


    
export default router;