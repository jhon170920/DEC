import express from 'express'
import { onlyAdmin, verifyToken } from '../middlewares/auth.js'
import { createNotification } from '../services/admin.js'
import { getUserNotifications, markNotificationRead } from '../controllers/notificationController.js'

const router = express.Router();

//Admin: Crear notificaciones
router.post('/create', verifyToken, onlyAdmin, createNotification);

//Usuario: Obtener no leidos
router.get('/my', verifyToken, getUserNotifications);

//Usuario: Marcar como leida
router.post('/:id/read', verifyToken, markNotificationRead);

export default router