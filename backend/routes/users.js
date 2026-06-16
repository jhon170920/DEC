import express from 'express';
import { body, validationResult } from 'express-validator';
import { loginUser, editUser, deleteUser, deleteUserSocial, updateProfile, changePassword, getMe, uploadProfilePicture } from '../controllers/users.js';
import { registerUser, verifyCode } from '../controllers/registerUser.js';
import { googleAuth } from '../controllers/googleAuth.js';
import { facebookAuth, facebookDeletionCallback } from '../controllers/facebookAuth.js';
import { contactUs } from '../controllers/contactUs.js';
import { verifyToken } from '../middlewares/auth.js';
import multer from 'multer';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

// Middleware para validación
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ 
            message: 'Validación fallida',
            errors: errors.array().map(e => e.msg)
        });
    }
    next();
};

// ========== VALIDACIONES ACTUALIZADAS ==========

// ✅ REGISTRO: Validaciones más flexibles (coinciden con backend)
const registerValidation = [
    // Email: Validación básica (express-validator es estricto)
    body('email')
        .trim()
        .notEmpty().withMessage('Email requerido')
        .isEmail().withMessage('Email inválido'),
    
    // Nombre: Solo letras y espacios, 2-50 caracteres
    body('name')
        .trim()
        .notEmpty().withMessage('Nombre requerido')
        .isLength({ min: 2, max: 50 }).withMessage('Nombre debe tener 2-50 caracteres')
        .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/).withMessage('Nombre: solo letras y espacios'),
    
    // Contraseña: Mínimo 6 caracteres (sin restricción a alfanuméricos)
    // Permite caracteres especiales: !@#$%^&*
    body('password')
        .trim()
        .notEmpty().withMessage('Contraseña requerida')
        .isLength({ min: 6 }).withMessage('Contraseña debe tener al menos 6 caracteres')
        // NO validamos caracteres especiales - el backend lo hace más flexible
];

// LOGIN: Validaciones básicas
const loginValidation = [
    body('email')
        .trim()
        .notEmpty().withMessage('Email requerido')
        .isEmail().withMessage('Email inválido'),
    body('password')
        .notEmpty().withMessage('Contraseña requerida'),
];

// CAMBIO DE CONTRASEÑA: Validaciones más flexibles
const changePasswordValidation = [
    body('currentPassword')
        .notEmpty()
        .withMessage('Contraseña actual requerida'),
    body('newPassword')
        .trim()
        .notEmpty().withMessage('Nueva contraseña requerida')
        .isLength({ min: 6 }).withMessage('Nueva contraseña debe tener al menos 6 caracteres'),
];

// VALIDACIÓN DE EMAIL
const emailValidation = [
    body('email')
        .trim()
        .notEmpty().withMessage('Email requerido')
        .isEmail().withMessage('Email inválido'),
];

// ========== RUTAS ==========

// ruta para iniciar/registrarse con facebook
router.post('/auth/facebook', facebookAuth);
// Ruta para eliminar la cuenta desde configuracion de la APP propia de facebook
router.post('/auth/facebook-deletion', facebookDeletionCallback);

// ruta para iniciar/registrarse con google
router.post('/auth/google', googleAuth);

// ✅ RUTA DE REGISTRO CON VALIDACIONES ACTUALIZADAS
router.post('/register', registerValidation, handleValidationErrors, registerUser);

// ✅ VERIFICACIÓN DE CÓDIGO
router.post('/verify-code', emailValidation, handleValidationErrors, verifyCode);

// ruta para iniciar sesion
router.post('/login', loginValidation, handleValidationErrors, loginUser);

// ruta para editar la cuentica
router.put('/edit', verifyToken, editUser);

// ruta para eliminar cuentica con formulario
router.delete('/delete', verifyToken, deleteUser);
// ruta para eliminar cuenta con google/facebook
router.delete('/delete-social', verifyToken, deleteUserSocial);

// ruta de contactanos (requiere sesión activa)
router.post('/send-message', verifyToken, contactUs);

// Obtener mi perfil (usuario logueado)
router.get('/me', verifyToken, getMe);

// Actualizar perfil (nombre, teléfono, foto)
router.put('/edit-profile', verifyToken, updateProfile);

// Cambiar contraseña
router.post('/change-password', verifyToken, changePasswordValidation, handleValidationErrors, changePassword);

// Subir foto de perfil
router.post('/upload-profile-picture', verifyToken, upload.single('image'), uploadProfilePicture);

export default router;