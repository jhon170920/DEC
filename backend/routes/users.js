import express from 'express';
import { loginUser, editUser, deleteUser, deleteUserSocial, updateProfile, changePassword, getMe, uploadProfilePicture } from '../controllers/users.js';
import { registerUser, verifyCode } from '../controllers/registerUser.js';
import { googleAuth } from '../controllers/googleAuth.js';
import { facebookAuth, facebookDeletionCallback } from '../controllers/facebookAuth.js';
import { contactUs } from '../controllers/contactUs.js';
import { verifyToken } from '../middlewares/auth.js';
import multer from 'multer';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// ruta para iniciar/registrarse con facebook
router.post('/auth/facebook', facebookAuth)
// Ruta para eliminar la cuenta desde configuracion de la APP propia de facebook
router.post('/auth/facebook-deletion', facebookDeletionCallback);

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

// ruta para eliminar cuentica  con formulario
router.delete('/delete', verifyToken, deleteUser);
// ruta para eliminar cuenta con google/facebook
router.delete('/delete-social', verifyToken, deleteUserSocial);


// ruta de contactanos
router.post('/send-message', contactUs);

//Ruta push NOTIFICACIONES



// Obtener mi perfil (usuario logueado)
router.get('/me', verifyToken, getMe);

// Actualizar perfil (nombre, teléfono, foto)
router.put('/edit-profile', verifyToken, updateProfile);

// Cambiar contraseña
router.post('/change-password', verifyToken, changePassword);

// Subir foto de perfil
router.post('/upload-profile-picture', verifyToken, upload.single('image'), uploadProfilePicture);

export default router;