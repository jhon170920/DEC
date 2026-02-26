import bcrypt from "bcrypt"; // Importar bcrypt para hashear la contraseña
import Users from "../models/users.js"; // Importar el modelo de usuario (no olvidar al importar el archivo su extensión .js)

export const registerUser = async (req, res) => {
    try {
        const {name, email, password} = req.body;

        //verificar si los campos están vacíos
        if(!name || !email || !password){
            return res.status(400).json({message: 'Todos los campos son obligatorios'});
        }

        // Verificar si el usuario ya existe

        const existingUser = await Users.findOne({email});
        if (existingUser){
            return res.status(400).json({message: 'EL correo ya existe'});

        }
        // Hashear la contraseña antes de guardarla en la base de datos
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        //crear un nuevo usuario
        const newUser = new Users({
            name,
            email,
            password: hashedPassword
        })
        await newUser.save(); // Guardar el nuevo usuario en la base de datos
        res.status(201).json({message: 'Usuario creado exitosamente'});

    } catch (error) {
        res.status(500).json({message:"Error al crear el usuario", error: error.message});
    }
};