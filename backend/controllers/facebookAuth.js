import Users from "../models/users.js"; // Importar el modelo de usuario (no olvidar al importar el archivo su extensión .js)
import jwt from "jsonwebtoken";

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

        const pictureUrl = picture?.data?.url || ''
        // validamos si hay email en la cuenta de facebook
        const existEmail = email ? email.toLowerCase() : `${id}@facebook`;
        // buscamos al usuario en la base de datos por su id o por su correo
        let user = await Users.findOne({$or: [{ facebookId: id }, { email: existEmail.toLowerCase() }]});
        // si no existe el usuario, lo registramos automaticamente
        if (!user) {
            // si no existe, lo registramos en la base de datos
            user = new Users({
                name,
                email: existEmail,
                pictureUrl: user.pictureUrl ? user.pictureUrl : pictureUrl,
                isVerified: true,
                facebookId: id,
                provider: 'facebook',
                role: 'user',
            });
            await user.save();
        }  else if (!user.facebookId) {
            // Usuario se loguea con el formulario.
            // Mismo usuario se loguea con Facebook con el mismo correo del formulario.
            // Vinculamos ambas cuentas y evitamos usuarios duplicados.
            user.email = existEmail.toLowerCase();
            user.facebookId = id;
            user.isVerified = true;
            if (picture) user.pictureUrl = pictureUrl;
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