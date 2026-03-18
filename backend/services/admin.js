import Users from "../models/users.js"; // Importar el modelo de usuario (no olvidar al importar el archivo su extensión .js)
import Detections from "../models/Detection.js"; // Importar las detecciones de los usuarios
import Pathology from "../models/pathologies.js" // Importamos nuestras patologías, (cuando la tengamos)

const expressions = {
    name: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ]{2,15}(?:\s[a-zA-ZáéíóúÁÉÍÓÚñÑ]{2,15})?$/,
    email: /^[a-zA-Z0-9._%+-]+@gmail\.(com|co)$/,
    pass: /^[a-zA-Z0-9]{8,14}$/
}

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
export const getAllDeteccions = async (req, res) => {
    try {
        // traemos todos las detecciones de la base de datos
        const detections = await Detections.find()
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

// subir las pathologías de prueba
export const savePathology = async (req, res) => {
    try {
        const {name, description, treatment} = req.body;

        const newPathology = new Pathology({
            name,
            description,
            treatment
        })

        await newPathology.save()

        res.status(201).json({
            message: "¡Pahtología guardada con éxito en el historial!",
            data: newPathology
        });

    } catch (error) {
        res.status(500).json({ message: "Error al crear la pathología", error: error.message });
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
        const { id } = req.params; // traemos el id de la patología que vamos a editar
        const { name, description, treatment } = req.body; //traer datos desde el formulario
        const updateData = {};   // aqui vamos a guardar los datos nuevos
        // validar datos
        if(!name || !description || !treatment ) return res.status(400).json({ message: "El nombre, la descripcion y el tratamiento son obligatorios" })

        // validamos el nombre porpocionado 
        if(!expressions.name.test(name)) return res.status(400).json({ message: "Escribe un nombre de patología válido" });


        // realizamos el cambio
        const updatedPathology = await Pathology.findByIdAndUpdate(id, { $set: {name: name, description: description, treatment: treatment} }, { returnDocument: 'after', runValidators: true }).select("-password");
        if(!updatedPathology) return res.status(400).json({ message: "No se encontró la pathología a actualizar" })

        // regresamos mensaje de feedback
        res.status(200).json({ message: "Patolohia editada exitosamente" })
    } catch (error) {
        res.status(500).json({ message: "Error al editar una patologías", error: error.message });
    }
}