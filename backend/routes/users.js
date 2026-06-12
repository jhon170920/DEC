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

// Validaciones específicas
const registerValidation = [
    body('email')
        .isEmail()
        .normalizeEmail()
        .toLowerCase()
        .withMessage('Email inválido'),
    body('name')
        .trim()
        .escape()
        .isLength({ min: 2, max: 50 })
        .withMessage('Nombre debe tener 2-50 caracteres'),
    body('password')
        .isLength({ min: 8, max: 14 })
        .matches(/^[a-zA-Z0-9]+$/)
        .withMessage('Contraseña debe tener 8-14 caracteres alfanuméricos'),
];

const loginValidation = [
    body('email')
        .isEmail()
        .normalizeEmail()
        .toLowerCase(),
    body('password')
        .notEmpty()
        .withMessage('Contraseña requerida'),
];

const changePasswordValidation = [
    body('currentPassword')
        .notEmpty()
        .withMessage('Contraseña actual requerida'),
    body('newPassword')
        .isLength({ min: 8, max: 14 })
        .matches(/^[a-zA-Z0-9]+$/)
        .withMessage('Nueva contraseña debe tener 8-14 caracteres alfanuméricos'),
];

const emailValidation = [
    body('email')
        .isEmail()
        .normalizeEmail()
        .toLowerCase()
        .withMessage('Email inválido'),
];

// ruta para iniciar/registrarse con facebook
router.post('/auth/facebook', facebookAuth);
// Ruta para eliminar la cuenta desde configuracion de la APP propia de facebook
router.post('/auth/facebook-deletion', facebookDeletionCallback);

// ruta para iniciar/registrarse con google
router.post('/auth/google', googleAuth);

// Ruta para crear un nuevo usuario
router.post('/register', registerValidation, handleValidationErrors, registerUser);
// Ruta para validar el codigo de registro
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