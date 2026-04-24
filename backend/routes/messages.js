import express from 'express';
import { verifyToken, onlyAdmin } from '../middlewares/auth.js';
import { getUserMessages, deleteMessage } from '../controllers/messageController.js';

const router = express.Router();

// Obtener mensajes de un usuario específico (solo admin)
router.get('/user/:userId', verifyToken, onlyAdmin, getUserMessages);

// Eliminar un mensaje (solo admin)
router.delete('/:messageId', verifyToken, onlyAdmin, deleteMessage);

export default router;