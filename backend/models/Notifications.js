import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema({
  title: { type: String, required: true },
  body: { type: String, required: true },
  pathologyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Pathology' }, // opcional, para mostrar desde qué patología se emitió
  location: { type: String }, // ubicación del brote
  imageUrl: { type: String }, // imagen relacionada (opcional)
  sentAt: { type: Date, default: Date.now },
  targetRoles: { type: [String], default: ['user', 'tecnico'] }, // a quiénes va dirigido
  active: { type: Boolean, default: true } // para ocultar notificaciones viejas
});

// Índice para consultas rápidas por fecha
NotificationSchema.index({ sentAt: -1 });

const Notification = mongoose.model('Notification', NotificationSchema);

export default Notification;