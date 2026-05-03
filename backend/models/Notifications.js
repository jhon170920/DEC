import mongoose, { Mongoose } from "mongoose"

const NotificationSchema = new mongoose.Schema({
    title: {type: String, required: true},
    body: {type: String, required: true},
    type: {type: String, enum: ['alert', 'info', 'warning'], default: 'info'},
    pathologyId: {type: mongoose.Schema.Types.ObjectId, ref: 'Pathology'},
    location: {type: String},
    targetRoles: {type: [String],  default: ['user', 'tecnico', 'admin']},
    createdAt: {type: Date, default: Date.now},
    expiresAt: { type: Date},
    readBy: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}]
});
NotificationSchema.index({createdAt: -1});

export default mongoose.model('Notification', NotificationSchema);