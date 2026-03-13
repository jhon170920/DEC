import Users from "../models/users.js"; // Importar el modelo de usuario (no olvidar al importar el archivo su extensión .js)
import Detections from "../models/Detection.js"; // Importar las detecciones de los usuarios
// import Pathologies from "../models/Pathologies.js" // Importamos nuestras patologías, (cuando la tengamos)


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

// obtener las patologías (proximamente....)
// export const getAllPathologies = async (req, res) => {
//     try {
//         // traemos todos las potologías de la base de datos
//         // const pathologies = await Pathologies.find()
//         // enviamos lo encontrado
//         // res.status(200).json({message: "patologías obtenidas", pathologies: pathologies});
//     } catch (error) {
//         res.status(500).json({ message: "Error al obtener las patologías", error: error.message });
//     }
// }