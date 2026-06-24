import { OAuth2Client } from 'google-auth-library';
import Users from "../models/users.js"; // Importar el modelo de usuario (no olvidar al importar el archivo su extensión .js)
import jwt from "jsonwebtoken";
import dotenv from 'dotenv';
dotenv.config();

// ✅ ACTUALIZADO: Usar GOOGLE_APP_CLIENT_ID (nativo)
const client = new OAuth2Client(process.env.GOOGLE_APP_CLIENT_ID);

// login con google 
export const googleAuth = async (req, res) => {
    try {
        const tokenHeader = req.headers.authorization; // traemos el token de google
        // verificar que el header existe y empieza con "Bearer "
        if (!tokenHeader || !tokenHeader.startsWith('Bearer ')) return res.status(401).json({ message: "No se proporcionó un token válido" });
        // obtenemos solo el string del token y quitamos la palabra 'Bearer'
        const googleToken = tokenHeader.split(' ')[1];
        
        // ✅ ACTUALIZADO: Verificar con GOOGLE_APP_CLIENT_ID
        // Mantener ambos en audience por compatibilidad (en caso de que venga de diferentes clientes)
        const ticket = await client.verifyIdToken({
            idToken: googleToken,
            audience: [
                process.env.GOOGLE_APP_CLIENT_ID,
                process.env.GOOGLE_WEB_CLIENT_ID // Opcional: mantener para compatibilidad
            ].filter(Boolean), // Filtra valores undefined
        });
        
        // Extraer información del usuario (sub es como el id de google)
        const { sub, name, email, picture } = ticket.getPayload()

        const pictureUrl = picture || ''
        // Buscamos si el usuario ya existe, ya sea por email o por id de google
        let user = await Users.findOne({ $or: [{ googleId: sub }, { email: email.toLowerCase() }] });
        // Verificar si existe 
        if (!user) {
            // si no existe, lo registramos en la base de datos
            user = new Users({
                name,
                email: email.toLowerCase(), // resetemos el mail por si algo y lo guardamos
                // Ponemos la foto de Google
                pictureUrl: pictureUrl,
                isVerified: true,
                googleId: sub, // guardamos el id de google como googleId en mongo
                provider: ['google'],
                role: 'user'
            })
            await user.save()
        // si existe y se intenta loguear/registrarse con Google por primera vez
        } else if (!user.googleId) {
            // Usuario se loguea con el formulario.
            // Mismo usuario se loguea con Google con el mismo correo del formulario.
            // Vinculamos las cuentas y evitamos usuarios duplicados.
            user.googleId = sub;
            user.isVerified = true;
            if (!user.provider.includes('google')) {
                user.provider.push('google');
            }
            // Si el usuario NO tiene una foto en su cuenta al momento de loguearse por primera vez con google, le ponemos la de Google.
            // Si tiene una foto, no le ponemos ninguna foto y le dejamos la que tiene
            if (!user.pictureUrl && pictureUrl) {
                user.pictureUrl = pictureUrl;
            }
            await user.save()
        }
        // creamos el token de esta sesión (3 días para apps offline)
        const sessionToken = jwt.sign(
            { id: user._id, role: user.role || 'user' },
            process.env.JWT_SECRET,
            { expiresIn: '72h' } // 3 días para aplicaciones móviles offline
        );
        // enviamos el token para guardarlo en el estado de token del front
        return res.status(200).json({
            token: sessionToken,
            expiresIn: 259200, // 72 horas en segundos
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                provider: user.provider,
                pictureUrl: user.pictureUrl,
                role: user.role
            }
        });
    } catch (error) {
        console.error("Error con login de Google:", error?.message)
        res.status(500).json({ message: 'Error al iniciar sesion con Google', error: error?.message });
    }
};