import bcrypt from "bcryptjs"; // Importar bcrypt para hashear la contraseña
import Users from "../models/users.js"; // Importar el modelo de usuario (no olvidar al importar el archivo su extensión .js)
import jwt from "jsonwebtoken";

import { OAuth2Client } from 'google-auth-library';
import dotenv from 'dotenv';
dotenv.config();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const expressions = {
    name: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ]{2,15}(?:\s[a-zA-ZáéíóúÁÉÍÓÚñÑ]{2,15})?$/, // nombre, solo palabras con acentos y eso, nada de numeros ni cosas raras
    email: /^[a-zA-Z0-9._%+-]+@(gmail|hotmail)\.(com|co)$/, // solo gmail, .com o .co. Dejar que solo sea .com, no?
    pass: /^[a-zA-Z0-9]{8,14}$/ // contraseña, validación simple, no sé si ponerle validacion de mayusculas minusculas, números y carácteres especiales
}

// login con google
export const googleAuth = async (req, res) => {
    try {
        const tokenHeader = req.headers.authorization; // traemos el token de google
        if (!tokenHeader) return res.status(400).json({message: "no hay token"}) // si no hay token, pues no
        // verificar que el header existe y empieza con "Bearer "
        if (!tokenHeader || !tokenHeader.startsWith('Bearer ')) return res.status(401).json({ message: "No se proporcionó un token válido" });
        // obtenemos solo el string del token y quitamos la palabra 'Bearer'
        const googleToken = tokenHeader.split(' ')[1];
        // verificamos si el token es real
        const ticket = await client.verifyIdToken({
            idToken: googleToken,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        // extraemos la información del usuario que necesitamos y picture por si en el futuro le quermos poner la foto que tiene en el gmail
        // sub es como el id
        const { sub, email, name, picture } = ticket.getPayload()
        // Buscamos si el usuario ya existe, ya sea por email o por id de google
        let user = await Users.findOne({ $or: [{ googleId: sub }, { email: email.toLowerCase() }] });
        // verificamos si existe 
        if (!user) {
            // si no existe, lo guardamos en la base de datos
            user = new Users({
                name,
                email: email.toLowerCase(), // resetemos el mail por si algo y lo guardamos
                googleId: sub, // guardamos el id de google como googleId en mongo
                role: 'user'
            })
            await user.save()
        } else if(!user.googleId) {
            // esto es por si ya se registró con google antes de decidir guardar el id de google jaja, lo quitamos? oq
            user.googleId = sub;
            await user.save()
        }
        // creamos el token de esta sesión
        const sessionToken = jwt.sign(
            { id: user._id, role: user.role || 'user' }, 
            process.env.JWT_SECRET || 'clave_secreta_provisional', 
            { expiresIn: '30d' } // Duración larga para apps móviles
        );
        return res.status(200).json({
            message: 'inicio de sesion con google correcto', // mensaje de feedback
            token: sessionToken, // enviamos el token para guardarlo en el estado de token del front
            user: { id: user._id, name: user.name, email: user.email } // los datos, no sé si dejarlo jaja
        })

    } catch (error) {
        console.error("Error con login de google:", error.message)
        res.status(500).json({message:'Error al iniciar sesion con Google', error: error.message});  
    }
};

// registrar nuevo usuario
export const registerUser = async (req, res) => {
    try {
        const {name, email, password} = req.body; // traemos los datos del usuario
        //verificar si los campos están vacíos
        if(!name || !email || !password){
            return res.status(400).json({message: 'Todos los campos son obligatorios'});
        }
        //validar nombre
        if(!expressions.name.test(name)) {
            return res.status(400).json({message: "Escribe un nombre o un apellido válido."})
        };
        //validar correo
        if(!expressions.email.test(email)) {
            return res.status(400).json({message: "Escribe un correo válido. (gmail, .com o .co)"});
        };
        // Verificar si el usuario ya existe
        const existingUser = await Users.findOne({email});
        if (existingUser){
            return res.status(400).json({message: 'Este correo ya está registrado'});
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
        res.status(201).json({message: 'Cuenta creada correctamente'});
    } catch (error) {
        res.status(500).json({message:"Error al crear el usuario", error: error.message});
    }
};
// login
export const loginUser = async (req, res) =>{
    try {
        const {email, password} = req.body;

        // Verificar si los campos estan vacios
        if (!email || !password) return res.status(400).json({message:'Todos los campos son obligatorios'});

        // buscar el usuario por su correo electrónico
        const user = await Users.findOne({email});

        // validamos que el usuario exista en nuestra base da datos
        if (!user) return res.status(401).json({message:'Usuario o contraseña incorrectos'});

        // Comparar contraseña hasheada con la contraseña proporcionada
        const passwordValid = await bcrypt.compare(password, user.password);

        //Validar si la contraseña es incorrecta
        if (!passwordValid) return res.status(401).json({message:'Usuario o contraseña incorrectos'});
        const token = jwt.sign(
            { id: user._id, role: user.role || 'user' }, 
            process.env.JWT_SECRET || 'clave_secreta_provisional', 
            { expiresIn: '30d' } // Duración larga para apps móviles
        );
        res.status(200).json({
            message: `Bienvenido, ${user.name.toUpperCase()}`,
            token,
            user: { id: user._id, name: user.name, email: user.email, role: user.role }
            
        });
    } catch (error) {
        res.status(500).json({message:'Error al iniciar sesion', error: error.message});  
    }
}
// editar cuenta
// aquí va editar la cuenta, pero por qué editaría si solo podría cambiar el nombre ajajja o si acaso el correo 🥸
export const editUser = async (req, res) => {
    try {
        const{name}=req.body; //traer datos desde el formulario

        // validamos que ponga un nombre
        if(!name) return res.status(400).json({message: "El nombre es obligatorio."})

        // validamos el nombre porpocionado por nuestro tierno usuario/a
        if(!expressions.name.test(name)) return res.status(400).json({message: "Escribe un nombre o un apellido válido."});

        // actualizamos el nombre
        const updatedUser = await  Users.findByIdAndUpdate(req.user.id, {$set: {name: name}}, {returnDocument: 'after', runValidators: true}).select("-password");

        // si no se encuentra el usuario, no se actualiza y se envía un mensaje
        if(!updatedUser) return res.status(401).json({message: "No se encontró el usuario para actualizar"});

        // mandamos un mensaje de feedback para el front del usuario
        res.status(200).json({message: `Se han actualizado tus datos, ${updatedUser.name.toUpperCase()}`});
    } catch (error) {
        res.status(500).json({message:'Error al editar el usuario', error: error.message});  
    }
}

// eliminar la cuenta
export const deleteUser = async (req, res) => {
    try {
        // buscamos el usuario
        const deletedUser = await Users.findByIdAndDelete(req.user.id);
        // validamos que exista el usuario
        if(!deletedUser) return res.status(404).json({message: "Usuario no encontrado"})
        // enviamos un mensajito a nuestro usuario desertado
        res.status(200).json({message: `Se ha eliminado la cuentica de ${deletedUser.email}`})
    } catch (error) {
        res.status(500).json({message:'Error al eliminar cuenta', error: error.message});  
    }
}