import Message from '../models/Message.js';

// Guardar un nuevo mensaje (usado por contactUs)
export const saveMessage = async (userId, name, email, message) => {
    const newMessage = new Message({ userId, name, email, message });
    await newMessage.save();
    return newMessage;
};

// Obtener todos los mensajes de un usuario (para el panel admin)
export const getUserMessages = async (req, res) => {
    try {
        const { userId } = req.params;
        const messages = await Message.find({ userId }).sort({ createdAt: -1 });
        res.json(messages);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Eliminar un mensaje por ID
export const deleteMessage = async (req, res) => {
    try {
        const { messageId } = req.params;
        await Message.findByIdAndDelete(messageId);
        res.json({ message: 'Mensaje eliminado' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};