import Users from "../models/users.js"; // Importar el modelo de usuario (no olvidar al importar el archivo su extensión .js)
import Detections from "../models/Detection.js"; // Importar las detecciones de los usuarios
import Pathology from "../models/pathologies.js" // Importamos nuestras patologías, (cuando la tengamos)
import { uploadToCloudinary } from './cloudinary.js';
import nodemailer from "nodemailer";
import dotenv from "dotenv";

const expressions = {
    name: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ]{2,15}(?:\s[a-zA-ZáéíóúÁÉÍÓÚñÑ]{2,15})?$/,
    email: /^[a-zA-Z0-9._%+-]+@gmail\.(com|co)$/,
    pass: /^[a-zA-Z0-9]{8,14}$/
}

// services/admin.js
dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});


// Correo 
export const sendCustomEmail = async (req, res) => {
    try {
      const { recipients, subject, htmlContent } = req.body; // recipients puede ser 'all' o array de emails
      if (!subject || !htmlContent) {
        return res.status(400).json({ message: 'Faltan asunto o contenido' });
      }
  
      let emailsToSend = [];
      if (recipients === 'all') {
        const users = await Users.find({}, 'email');
        emailsToSend = users.map(u => u.email);
      } else if (Array.isArray(recipients)) {
        emailsToSend = recipients;
      } else {
        return res.status(400).json({ message: 'Destinatarios no válidos' });
      }
  
      if (emailsToSend.length === 0) {
        return res.status(400).json({ message: 'No hay destinatarios' });
      }
  
      // Enviar correos en paralelo (con Promise.allSettled para no fallar por uno)
      const emailPromises = emailsToSend.map(email => {
        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: email,
          subject: subject,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 16px;">
              <div style="text-align: center; margin-bottom: 20px;">
                <span style="font-size: 24px; font-weight: 800; color: #16a34a;">DEC</span>
                <p style="font-size: 12px; color: #6b7280;">Detección de Enfermedades en Café</p>
              </div>
              <div>${htmlContent}</div>
              <hr style="margin: 20px 0;" />
              <p style="font-size: 12px; color: #9ca3af; text-align: center;">Este es un mensaje automático del panel administrativo DEC.</p>
            </div>
          `,
        };
        return transporter.sendMail(mailOptions);
      });
  
      const results = await Promise.allSettled(emailPromises);
      const succeeded = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;
  
      res.json({ message: `Correos enviados: ${succeeded} exitosos, ${failed} fallidos.` });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: error.message });
    }
  };

// obtener todos los usuarios de la base de datos, la ruta ya está validada para solamente usuarios.
export const getAllUsers = async (req, res) => {
    try {
        // traemos todos los usuarios y sus datos menos la scontraseñas
        const users = await Users.find().select("-password");
        // enviamos lo encontrado
        res.status(200).json({
            message: "Usuarios obtenidos",
            users: users
        });
    } catch (error) {
        console.error(error); // Para que tú lo veas en la consola del servidor
        res.status(500).json({ message: "Error al obtener los usuarios", error: error.message });
    }
}
// editar cierto usuario
export const editUser = async (req, res) => {
    try {
        const { id } = req.params; // traemos el id del usuario que vamos a editar
        const { name, email } = req.body; //traer datos desde el formulario
        const updateData = {};   // aqui vamos a guardar los datos nuevos
        // validar datos
        if (!name || !email) return res.status(400).json({ message: "El nombre y el email son obligatorios" })

        // validamos el nombre porpocionado 
        if (!expressions.name.test(name)) return res.status(400).json({ message: "Escribe un nombre o un apellido válido." });
        updateData.name = name; // guardamos el name
        // validamos el email
        if (!expressions.email.test(email)) return res.status(400).json({ message: "Escribe un correo válido. (gmail, .com o .co)" });
        // Validamos que el correo no lo tenga OTRO usuario (usando el id de params)
        const emailInUse = await Users.findOne({ email, _id: { $ne: id } });
        if (emailInUse) return res.status(400).json({ message: 'Correo ya registrado' });
        updateData.email = email; // guardamos el email

        // realizamos el cambio
        const updatedUser = await Users.findByIdAndUpdate(id, { $set: updateData }, { returnDocument: 'after', runValidators: true }).select("-password");
        if(!updatedUser) return res.status(400).json({ message: "No se encontró el usuario a actualizar" })

        // regresamos mensaje de feedback
        res.status(200).json({ message: "Usuario editado exitosamente" });
    } catch (error) {
        res.status(500).json({ message: "Error al editar este usuario", error: error.message });
    }
}

// eliminar cierto usuario
export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params; // traemos el id del usuario que vamos a eliminar
        // validamos que se haya mandado el id por la URL
        if(!id) return res.status(400).json({ message: "No hay id de usuario a eliminar" })
        // realizamos la eliminación
        const deletedUser = await Users.findByIdAndDelete(id);
        // validamos si se realizó
        if(!deletedUser) return res.status(400).json({ message: "No se encontró el usuario a eliminar" })
        // regresamos mensaje de feedback
        res.status(200).json({ message: "Usuario eliminado exitosamente" });
    } catch (error) {
        res.status(500).json({ message: "Error al eliminar este usuario", error: error.message });
    }
}

// obtener todos las detecciones obtenidas por los usuarios
export const getAllDetections = async (req, res) => {
    try {
        // traemos todos las detecciones de la base de datos
        const detections = await Detections.find()
            .populate('pathologyId', 'name')
        // enviamos lo encontrado
        res.status(200).json({
            message: "Detecciones obtenidas",
            detections: detections
        });
    } catch (error) {
        console.error(error); // Para que tú lo veas en la consola del servidor
        res.status(500).json({ message: "Error al obtener las detecciones de los usuarios", error: error.message });
    }
}

// eliminar alguna deteccion
export const deleteDetection = async (req,res) => {
    try {
        const { id } = req.params; // traemos el id de la deteccion que vamos a eliminar
        // validamos que se haya mandado el id por la URL
        if(!id) return res.status(400).json({ message: "No hay id de deteccion a eliminar" })
        // realizamos la eliminación
        const deletedDetection = await Detections.findByIdAndDelete(id);
        // validamos si se realizó
        if(!deletedDetection) return res.status(400).json({ message: "No se encontró la deteccion a eliminar" })
        // regresamos mensaje de feedback
        res.status(200).json({ message: "Deteccion eliminada exitosamente" });
    } catch (error) {
        res.status(500).json({ message: "Error al eliminar la detección", error: error.message });
    }
}

// obtener las patologías
export const getAllPathologies = async (req, res) => {
    try {
        // traemos todos las potologías de la base de datos
        const pathologies = await Pathology.find()
        // enviamos lo encontrado junto con un mensaje
        res.status(200).json({
            message: "patologías obtenidas",
            pathologies: pathologies
        });
    } catch (error) {
        res.status(500).json({ message: "Error al obtener las patologías", error: error.message });
    }
}
// editar una patología
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
// editar una patología con recomendaciones (insumos)
export const uploadPathologyImage = async (req, res) => {
  try {
    const { id } = req.params;
    if (!req.file) {
      return res.status(400).json({ message: 'No se recibió ninguna imagen' });
    }
    
    const imageUrl = await uploadToCloudinary(req.file.buffer, req.file.mimetype);
    const updatedPathology = await Pathology.findByIdAndUpdate(
      id, 
      { imageUrl }, 
      { new: true }
    );
    
    if (!updatedPathology) {
      return res.status(404).json({ message: 'Patología no encontrada' });
    }
    
    res.json({ imageUrl: updatedPathology.imageUrl });
  } catch (error) {
    console.error('Error subiendo imagen:', error);
    res.status(500).json({ message: error.message });
  }
};
// usuarios ban o unban
export const toggleBanUser = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) return res.status(400).json({ message: "No hay id de usuario" });
 
        // Buscar el usuario actual para conocer su estado
        const user = await Users.findById(id).select("-password");
        if (!user) return res.status(404).json({ message: "Usuario no encontrado" });
 
        // Invertir el estado active
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
// Aprobar o desaprobar una detección
export const toggleApproveDetection = async (req, res) => {
    try {
        const { id } = req.params;
        // Buscar la detección
        const detection = await Detections.findById(id);
        if (!detection) {
            return res.status(404).json({ message: "Detección no encontrada" });
        }

        // Invertir el estado actual
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
// Cambiar rol de un usuario
export const changeUserRole = async (req, res) => {
    try {
      const { id } = req.params;
      const { role } = req.body;
  
      // Validar que el rol sea válido
      const validRoles = ['user', 'tecnico', 'admin'];
      if (!role || !validRoles.includes(role)) {
        return res.status(400).json({ message: 'Rol no válido' });
      }
  
      // Buscar usuario
      const user = await Users.findById(id);
      if (!user) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }
  
      // Opcional: evitar que un admin se cambie a sí mismo a un rol menor
      const requestingUserId = req.user.id || req.user._id;
      if (requestingUserId.toString() === id && role !== 'admin') {
        return res.status(403).json({ message: 'No puedes cambiar tu propio rol de administrador' });
      }
  
      // Actualizar rol
      user.role = role;
      await user.save();
  
      // Responder sin enviar la contraseña
      const userResponse = user.toObject();
      delete userResponse.password;
  
      res.json({ message: 'Rol actualizado correctamente', user: userResponse });
    } catch (error) {
      console.error('Error en changeUserRole:', error);
      res.status(500).json({ message: error.message });
    }
  };