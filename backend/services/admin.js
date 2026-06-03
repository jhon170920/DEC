import Users from "../models/users.js";
import Detections from "../models/Detection.js";
import Pathology from "../models/pathologies.js";
import Notifications from "../models/Notifications.js";
import { uploadToCloudinary } from './cloudinary.js';
import { Resend } from "resend";
import dotenv from "dotenv";

dotenv.config();

// Configuración de Resend
const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = process.env.FROM_EMAIL_ADMIN; // debe ser admin@dec-app.online

const expressions = {
    name: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ]{2,15}(?:\s[a-zA-ZáéíóúÁÉÍÓÚñÑ]{2,15})?$/,
    email: /^[a-zA-Z0-9._%+-]+@gmail\.(com|co)$/,
    pass: /^[a-zA-Z0-9]{8,14}$/
};

// --------------------------------------------------------------
// Envío de correos personalizados (admin)
// --------------------------------------------------------------
export const sendCustomEmail = async (req, res) => {
    try {
        const { subject, message, emails } = req.body;
        if (!subject || !message) {
            return res.status(400).json({ message: 'Faltan asunto o contenido del mensaje' });
        }

        let emailsToSend = [];
        if (emails && emails.length > 0) {
            emailsToSend = emails;
        } else {
            const users = await Users.find({}, 'email');
            emailsToSend = users.map(u => u.email);
        }

        if (emailsToSend.length === 0) {
            return res.status(400).json({ message: 'No hay destinatarios' });
        }

        // Plantilla HTML (puedes personalizarla)
        const htmlContent = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background-color: #16a34a; padding: 20px; text-align: center;">
                    <h2 style="color: #fff;">DEC APP</h2>
                </div>
                <div style="padding: 20px;">
                    ${message}
                </div>
                <hr />
                <p style="font-size: 12px; color: #6b7280;">Mensaje enviado por el administrador de la plataforma DEC.</p>
            </div>
        `;

        // Enviar correos usando Resend (Promise.allSettled para no detener todo si falla uno)
        const emailPromises = emailsToSend.map(email => {
            return resend.emails.send({
                from: FROM_EMAIL,
                to: email,
                subject: subject,
                html: htmlContent
            });
        });

        const results = await Promise.allSettled(emailPromises);
        const succeeded = results.filter(r => r.status === 'fulfilled').length;
        const failed = results.filter(r => r.status === 'rejected').length;

        // Opcional: loguear los errores
        if (failed > 0) {
            console.error(`Fallaron ${failed} envíos.`);
            results.forEach((r, idx) => {
                if (r.status === 'rejected') {
                    console.error(`Error con ${emailsToSend[idx]}:`, r.reason);
                }
            });
        }

        res.json({ message: `Correos enviados: ${succeeded} exitosos, ${failed} fallidos.` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

// --------------------------------------------------------------
// El resto de funciones (getAllUsers, editUser, deleteUser, etc.)
// se mantienen EXACTAMENTE IGUALES que en tu código original.
// Solo se reemplazó la función sendCustomEmail.
// --------------------------------------------------------------

export const getAllUsers = async (req, res) => {
    try {
        const users = await Users.find().select("-password");
        res.status(200).json({
            message: "Usuarios obtenidos",
            users: users
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al obtener los usuarios", error: error.message });
    }
};

export const editUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email } = req.body;
        const updateData = {};
        if (!name || !email) return res.status(400).json({ message: "El nombre y el email son obligatorios" });
        if (!expressions.name.test(name)) return res.status(400).json({ message: "Escribe un nombre o un apellido válido." });
        updateData.name = name;
        if (!expressions.email.test(email)) return res.status(400).json({ message: "Escribe un correo válido. (gmail, .com o .co)" });
        const emailInUse = await Users.findOne({ email, _id: { $ne: id } });
        if (emailInUse) return res.status(400).json({ message: 'Correo ya registrado' });
        updateData.email = email;
        const updatedUser = await Users.findByIdAndUpdate(id, { $set: updateData }, { returnDocument: 'after', runValidators: true }).select("-password");
        if (!updatedUser) return res.status(400).json({ message: "No se encontró el usuario a actualizar" });
        res.status(200).json({ message: "Usuario editado exitosamente" });
    } catch (error) {
        res.status(500).json({ message: "Error al editar este usuario", error: error.message });
    }
};

export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) return res.status(400).json({ message: "No hay id de usuario a eliminar" });
        const deletedUser = await Users.findByIdAndDelete(id);
        if (!deletedUser) return res.status(400).json({ message: "No se encontró el usuario a eliminar" });
        res.status(200).json({ message: "Usuario eliminado exitosamente" });
    } catch (error) {
        res.status(500).json({ message: "Error al eliminar este usuario", error: error.message });
    }
};

export const getAllDetections = async (req, res) => {
    try {
        const detections = await Detections.find().populate('pathologyId', 'name');
        res.status(200).json({
            message: "Detecciones obtenidas",
            detections: detections
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al obtener las detecciones de los usuarios", error: error.message });
    }
};

export const deleteDetection = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) return res.status(400).json({ message: "No hay id de deteccion a eliminar" });
        const deletedDetection = await Detections.findByIdAndDelete(id);
        if (!deletedDetection) return res.status(400).json({ message: "No se encontró la deteccion a eliminar" });
        res.status(200).json({ message: "Deteccion eliminada exitosamente" });
    } catch (error) {
        res.status(500).json({ message: "Error al eliminar la detección", error: error.message });
    }
};

export const getAllPathologies = async (req, res) => {
    try {
        const pathologies = await Pathology.find();
        res.status(200).json({
            message: "patologías obtenidas",
            pathologies: pathologies
        });
    } catch (error) {
        res.status(500).json({ message: "Error al obtener las patologías", error: error.message });
    }
};

export const editPathology = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, treatment, alert, recommendations } = req.body;
        const updateData = { name, description, treatment, alert };
        if (recommendations) updateData.recommendations = recommendations;
        const updated = await Pathology.findByIdAndUpdate(id, updateData, { new: true });
        res.json(updated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const uploadPathologyImage = async (req, res) => {
    try {
        const { id } = req.params;
        if (!req.file) {
            return res.status(400).json({ message: 'No se recibió ninguna imagen' });
        }
        const imageUrl = await uploadToCloudinary(req.file.buffer, req.file.mimetype);
        const updatedPathology = await Pathology.findByIdAndUpdate(id, { imageUrl }, { new: true });
        if (!updatedPathology) {
            return res.status(404).json({ message: 'Patología no encontrada' });
        }
        res.json({ imageUrl: updatedPathology.imageUrl });
    } catch (error) {
        console.error('Error subiendo imagen:', error);
        res.status(500).json({ message: error.message });
    }
};

export const toggleBanUser = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) return res.status(400).json({ message: "No hay id de usuario" });
        const user = await Users.findById(id).select("-password");
        if (!user) return res.status(404).json({ message: "Usuario no encontrado" });
        const newActive = user.active === false ? true : false;
        const updatedUser = await Users.findByIdAndUpdate(
            id,
            { $set: { active: newActive } },
            { returnDocument: 'after' }
        ).select("-password");
        res.status(200).json({
            message: newActive ? "Usuario habilitado exitosamente" : "Usuario inhabilitado exitosamente",
            active: updatedUser.active,
            user: updatedUser
        });
    } catch (error) {
        res.status(500).json({ message: "Error al cambiar estado del usuario", error: error.message });
    }
};

export const toggleApproveDetection = async (req, res) => {
    try {
        const { id } = req.params;
        const detection = await Detections.findById(id);
        if (!detection) {
            return res.status(404).json({ message: "Detección no encontrada" });
        }
        const newApproved = !detection.approved;
        detection.approved = newApproved;
        await detection.save();
        res.status(200).json({
            message: newApproved ? "Detección aprobada" : "Aprobación revertida",
            approved: newApproved
        });
    } catch (error) {
        res.status(500).json({ message: "Error al cambiar estado de aprobación", error: error.message });
    }
};

export const changeUserRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;
        const validRoles = ['user', 'tecnico', 'admin'];
        if (!role || !validRoles.includes(role)) {
            return res.status(400).json({ message: 'Rol no válido' });
        }
        const user = await Users.findById(id);
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }
        const requestingUserId = req.user.id || req.user._id;
        if (requestingUserId.toString() === id && role !== 'admin') {
            return res.status(403).json({ message: 'No puedes cambiar tu propio rol de administrador' });
        }
        user.role = role;
        await user.save();
        const userResponse = user.toObject();
        delete userResponse.password;
        res.json({ message: 'Rol actualizado correctamente', user: userResponse });
    } catch (error) {
        console.error('Error en changeUserRole:', error);
        res.status(500).json({ message: error.message });
    }
};

export const createNotification = async (req, res) => {
    try {
        const { title, body, type, pathologyId, location, targetRoles, expiresAt } = req.body;
        if (!title || !body) {
            return res.status(400).json({ message: 'Faltan titulo o cuerpo' });
        }
        const newNotification = new Notifications({
            title,
            body,
            type: type || 'info',
            pathologyId,
            location,
            targetRoles: targetRoles || ['user', 'tecnico', 'admin'],
            expiresAt: expiresAt || null,
        });
        await newNotification.save();
        res.status(201).json({ message: 'Notificacion creada', notification: newNotification });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};
