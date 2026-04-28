import express from 'express';
import { verifyToken } from '../middlewares/auth.js';
import { getUnreadNotifications } from '../controllers/notificationController.js';

const router = express.Router();
router.get('/unread', verifyToken, getUnreadNotifications);

export default router;