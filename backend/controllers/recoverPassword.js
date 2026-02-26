import Users from "../models/users.js";

export const recoverPassword = async (req, res) =>{
    try {
        const {email} = req.body;
        // Verificar si el campo de correo electrónico está vacío
        if (!email){
            return res.status(400).json({message:"EL correo electronico es obligatorio"})
        }
        // Buscar el usuario por su correo electrónico
        const user = await Users.findOne({email});
        if (!user){
            return res.status(400).json({message:"Usuario no encontrado"})
        }
    } catch (error) {
        res.status(500).json({message:"Error al recuperar contraseña", error: error.message})
        
    }
}