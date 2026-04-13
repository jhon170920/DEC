import Users from "../models/users.js"; // Importar el modelo de usuario (no olvidar al importar el archivo su extensión .js)
import jwt from "jsonwebtoken";
import crypto from 'crypto';
import dotenv from 'dotenv';
dotenv.config();
// login con facebook
export const facebookAuth = async (req, res) => {
    try {
        const tokenHeader = req.headers.authorization; // traemos el token de facebook
        // verificar que el header existe y empieza con "Bearer "
        if (!tokenHeader || !tokenHeader.startsWith('Bearer ')) return res.status(401).json({ message: "No hay token o no se proporcionó un token válido" });
        // obtenemos solo el string del token y quitamos la palabra 'Bearer'
        const fbToken = tokenHeader.split(' ')[1];
        // url para valiadar el token y pedir los datos del usuario
        const fbUrl = `https://graph.facebook.com/me?fields=id,name,email,picture.width(500).height(500)&access_token=${fbToken}`;
        // obtenemos la respuesta
        const response = await fetch(fbUrl);
        // importante parsear la respuesta con fetch
        const data = await response.json();
        // extraemos los datos que requerimos en los campos de <<fbUrl>>
        const { id, name, email, picture } = data;
        // Accedemos a la URL de la foto que nos da Facebook
        const pictureUrlFb = picture?.data?.url || ''
        // Si la cuenta de Facebook tiene email, lo guardamos. Si no, ponemos un correo aleatorio
        const existEmail = email ? email.toLowerCase() : null;
        // buscamos al usuario en la base de datos por su id o por su correo
        let user;
        if (existEmail){
            // si hay correo buscamos por ID o por email
            user = await Users.findOne({
                $or: [{ facebookId: id }, { email: existEmail.toLowerCase() }]
            });
        } else{
            // si NO hay correo lo buscamos por unicamente por id
            user = await Users.findOne({ facebookId: id})
        }
        // Verificar si existe
        if (!user) {
            // si NO existe el usuario, lo registramos
            user = new Users({
                name,
                email: existEmail,
                // Ponemos la foto de facebook SOLO cuando se registra
                pictureUrl: pictureUrlFb,
                isVerified: true,
                facebookId: id,
                provider: ['facebook'],
                role: 'user',
            });
            await user.save();
        // si existe y se intenta loguear/registrarse con Facebook por primera vez
        }  else if (!user.facebookId) {
            // Usuario se loguea con el formulario.
            // Mismo usuario se loguea con Facebook con el mismo correo del formulario.
            // Vinculamos ambas cuentas y evitamos usuarios duplicados.
            user.facebookId = id;
            user.isVerified = true;
            if (!user.provider.includes('facebook')) {
                user.provider.push('facebook');
            }
            // Si el usuario NO tiene una foto en su cuenta al momento de loguearse por primera vez con facebook, le ponemos la de Facebook.
            // Si tiene una foto, no le ponemos ninguna foto y le dejamos la que tiene
            if (!user.pictureUrl && pictureUrlFb) {
                user.pictureUrl = pictureUrlFb
            };
            await user.save()
        }
        // Creamos el token de este login
        const sessionToken = jwt.sign(
            { id: user._id, role: user.role || 'user' }, 
            process.env.JWT_SECRET || 'clave_secreta_provisional', // QUITAR EN DESPLIEGUE
            { expiresIn: '30d' }
        );
        // Respuesta final con los datos necesaios por aahpra
        return res.status(200).json({
            token: sessionToken,
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
        console.error("Error con login de Facebook:", error?.message);
        if (error.message.includes("Token used too late") || error.message.includes("Wrong number of segments")) {
            return res.status(401).json({ message: 'Token de Google inválido o expirado' });
        }
        res.status(500).json({ message: 'Error al iniciar sesion con Facebook', error: error.message });
    }
}

// solicitud para eliminar (obligatorio para facebook)
export const facebookDeletionCallback = async (req, res) => {
    try {
        const {signed_request} = req.body;
        if (!signed_request) return res.status(400).send('No signed request');

        const [encoded_sig, payload] = signed_request.split('.');
        const secret = process.env.FACEBOOK_APP_SECRET;

        // 1. Validar la firma para asegurar que viene de Facebook
        const sig = Buffer.from(encoded_sig.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('hex');
        const expected_sig = crypto.createHmac('sha256', secret).update(payload).digest('hex');

        if (sig !== expected_sig) return res.status(400).send('Invalid signature');

        // 2. Decodificar los datos del usuario
        const data = JSON.parse(Buffer.from(payload.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString());

        // borrar los datos en tu MongoDB
        await Users.findOneAndDelete({ facebookId: data.user_id });

        // 4. Responder a Meta con el formato que ellos exigen
        const responseData = {
            url: `https://tu-dominio.com/deletion-status?id=${data.user_id}`, // URL donde el usuario ve el estado
            confirmation_code: data.user_id // Un ID de rastreo
        };

        res.status(200).json(responseData);
    } catch (error) {
        res.status(500).send('Error processing deletion');
    }
};