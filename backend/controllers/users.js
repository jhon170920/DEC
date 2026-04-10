import bcrypt from "bcryptjs"; // Importar bcrypt para hashear la contraseña
import Users from "../models/users.js"; // Importar el modelo de usuario (no olvidar al importar el archivo su extensión .js)
import jwt from "jsonwebtoken";
import dotenv from 'dotenv';

dotenv.config();

const expressions = {
    name: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ]{2,15}(?:\s[a-zA-ZáéíóúÁÉÍÓÚñÑ]{2,15})?$/, // nombre, solo palabras con acentos y eso, nada de numeros ni cosas raras
    email: /^[a-zA-Z0-9._%+-]+@gmail\.(com|co)$/, // solo gmail, .com o .co. Dejar que solo sea .com, no?
    pass: /^[a-zA-Z0-9]{8,14}$/ // contraseña, validación simple, no sé si ponerle validacion de mayusculas minusculas, números y carácteres especiales
}
// login de usuario con formilario
export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        // Verificar si los campos estan vacios
        if (!email || !password) return res.status(400).json({ message: 'Todos los campos son obligatorios' });
        // buscar el usuario por su correo electrónico
        const user = await Users.findOne({ email });
        // validamos que el usuario exista en nuestra base da datos
        if (!user) return res.status(401).json({ message: 'Usuario o contraseña incorrectos' });
        // Si se registró con el formulario
        if (user.provider === 'local') {
            // Comparar contraseña hasheada con la contraseña proporcionada
            const passwordValid = await bcrypt.compare(password, user.password);
            if (!passwordValid) return res.status(400).json({ message: "Contraseña incorrecta" });
        }
        // Validar verificación
        if (!user.isVerified) {
            return res.status(403).json({
                message: "Cuenta no verificada. Por favor, revisa tu correo.",
                verified: false,
                email: user.email // Útil para que el frontend sepa a dónde reenviar el código
            });
        }


        const token = jwt.sign(
            { id: user._id, role: user.role || 'user' },
            process.env.JWT_SECRET || 'clave_secreta_provisional',
            { expiresIn: '30d' } // Duración larga para apps móviles
        );
        res.status(200).json({
            message: `Bienvenido, ${user.name.toUpperCase()}`,
            token,
            user: { id: user._id, name: user.name, email: user.email }

        });
    } catch (error) {
        res.status(500).json({ message: 'Error al iniciar sesion', error: error.message });
    }
}
// editar cuenta
// aquí va editar la cuenta, pero por qué editaría si solo podría cambiar el nombre ajajja o si acaso el correo 🥸
export const editUser = async (req, res) => {
    try {
        const { name } = req.body; //traer datos desde el formulario

        // validamos que ponga un nombre
        if (!name) return res.status(400).json({ message: "El nombre es obligatorio." })

        // validamos el nombre porpocionado por nuestro tierno usuario/a
        if (!expressions.name.test(name)) return res.status(400).json({ message: "Escribe un nombre o un apellido válido." });

        // actualizamos el nombre
        const updatedUser = await Users.findByIdAndUpdate(req.user.id, { $set: { name: name } }, { returnDocument: 'after', runValidators: true }).select("-password");

        // si no se encuentra el usuario, no se actualiza y se envía un mensaje
        if (!updatedUser) return res.status(401).json({ message: "No se encontró el usuario para actualizar" });

        // mandamos un mensaje de feedback para el front del usuario
        res.status(200).json({ message: `Se han actualizado tus datos, ${updatedUser.name.toUpperCase()}` });
    } catch (error) {
        res.status(500).json({ message: 'Error al editar el usuario', error: error.message });
    }
}

// eliminar la cuenta
export const deleteUser = async (req, res) => {
    try {
        // buscamos el usuario
        const deletedUser = await Users.findByIdAndDelete(req.user.id);
        // validamos que exista el usuario
        if (!deletedUser) return res.status(404).json({ message: "Usuario no encontrado" })
        // enviamos un mensajito a nuestro usuario desertado
        res.status(200).json({ message: `Se ha eliminado la cuentica de ${deletedUser.email}` })
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar cuenta', error: error.message });
    }
}