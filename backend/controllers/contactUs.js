import Users from "../models/users.js";
import { saveMessage } from "./messageController.js";

export const contactUs = async (req, res) => {
    try {
        const { name, message } = req.body;
        const userId = req.user.id; // viene del token JWT

        if (!name || !message) {
            return res.status(400).json({ message: "Todos los campos son obligatorios." });
        }

        // Buscar usuario por id del token
        const user = await Users.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "Usuario no encontrado." });
        }

        const email = user.email; // tomamos el email de la BD

        // Guardar mensaje en la base de datos
        await saveMessage(user._id, name, email, message);

        res.status(200).json({ message: "Mensaje enviado correctamente" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al enviar el mensaje" });
    }
};