import bcrypt from "bcryptjs"; // Importar bcrypt para hashear la contraseña
import Users from "../models/users.js"; // Importar el modelo de usuario (no olvidar al importar el archivo su extensión .js)
import jwt from "jsonwebtoken";


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


export const loginUser = async (req, res) =>{

    try {
        const {email, password} = req.body;
        // Verificar si los campos estan vacios
        if (!email || !password){
            return res.status(400).json({message:'Todos los campos son obligatorios'});
        }
        // buscar el usuario por su correo electrónico
        const user = await Users.findOne({email});
        if (!user){
            return res.status(400).json({message:'Usuario no encontrado'});
        }
        // Comparar contraseña hasheada con la contraseña proporcionada
        const passwordValid = await bcrypt.compare(password, user.password);
        if (!passwordValid){ //Validar si la contraseña es incorrecta
            return res.status(400).json({message:'Contraseña incorrecta'});
        }
        const token = jwt.sign(
            { id: user._id, role: user.role || 'user' }, 
            process.env.JWT_SECRET || 'clave_secreta_provisional', 
            { expiresIn: '30d' } // Duración larga para apps móviles
        );
        res.status(200).json({
            message:'Inicio de sesion exitoso',
            token,
            user: { id: user._id, name: user.name, email: user.email }
            
        });
    } catch (error) {
        res.status(500).json({message:'Error al iniciar sesion', error: error.message});  
    }
}