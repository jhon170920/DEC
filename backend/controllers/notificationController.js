import Notifications from "../models/Notifications.js";

//Obtener notificaciones no leidas para el usuario (FRONTEND)
export const getUserNotifications = async (req, res) =>{
  try {
    const userId = req.user.id;
    const now = new Date();
    const notifications = await Notifications.find({
      targetRoles: {$in: [req.user.role]},
      $or: [{expiresAt: {$gt:now}}, {expiresAt: null}],
      readBy: {$ne: userId}
    }).sort({createdAt: -1});
    res.json(notifications);
  } catch (error) {
    res.status(500).json({message: error.message});
  }
};
// Marcar notificacion como leida
export const markNotificationRead = async (req, res) =>{
  try {
    const {id} = req.params;
    const userId = req.user.id;
    const notification = await Notification.findById(id);
    if (!notification) return res.status(404).json({message: ' Notificacion no encontrada'});
    if (!notification.readBy.include(userId)){
      notification.readBy.push(userId);
      await notification.save();
    }
    res.json({message: 'Notificacion marcada como leida'});
  } catch (error) {
    res.status(500).json({message: error.message});
  }
};