import bcrypt from "bcryptjs"; // Importar bcrypt para hashear la contraseña
import Users from "../models/users.js"; // Importar el modelo de usuario (no olvidar al importar el archivo su extensión .js)
import dotenv from 'dotenv';
import nodemailer from "nodemailer";


dotenv.config();

const expressions = {
    name: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{2,50}$/, // nombre, solo palabras con acentos y eso, nada de numeros ni cosas raras
    email: /^[a-zA-Z0-9._%+-]+@(gmail|hotmail|yahoo|proton|outlook|icloud|test)\.(com|co|me|es|org|edu.co)$/, // correos actuales
    pass: /^[a-zA-Z0-9]{8,14}$/ // contraseña, validación simple, no sé si ponerle validacion de mayusculas minusculas, números y carácteres especiales
}

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// registrar nuevo usuario
export const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body; // traemos los datos del usuario
        //verificar si los campos están vacíos
        if (!name || !email || !password) return res.status(400).json({ message: 'Todos los campos son obligatorios' });
        //validar nombre
        if (!expressions.name.test(name)) return res.status(400).json({ message: "Escribe un nombre o un apellido válido." });
        //validar correo
        if (!expressions.email.test(email)) return res.status(400).json({ message: "Escribe un correo válido. (gmail, .com o .co)" });
        // Verificar si el usuario ya existe
        let user = await Users.findOne({ email });
        if (user) return res.status(400).json({ message: 'Este correo ya está registrado' });

        // Generar código de 6 dígitos para verificar el correo
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        // Hashear la contraseña antes de guardarla en la base de datos
        const hashedPassword = await bcrypt.hash(password, 10);
        //crear un nuevo usuario
        user = new Users({
            name,
            email,
            password: hashedPassword,
            provider: ['local'],
            verificationCode: code,
            verificationCodeExpires: new Date (Date.now() + 1800000) // 30 minutos
        })
        await user.save(); // Guardar el nuevo usuario en la base de datos
        // Configurar correo
        const emailOption = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Código de Verificación - DEC',
            html: 
            `
            <div style="background-color: #f8fafc; padding: 40px 10px; font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; line-height: 1.5;">
                <div style="max-width: 520px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); border: 1px solid #e2e8f0; overflow: hidden;">
                    
                    <div style="height: 6px; background-color: #065f46;"></div>

                    <div style="padding: 35px;">
                        <div style="text-align: center; margin-bottom: 30px;">
                            <span style="font-size: 24px; font-weight: 800; color: #065f46; letter-spacing: -0.5px; border: 2px solid #065f46; padding: 5px 15px; border-radius: 8px;">
                                DEC
                            </span>
                            <p style="margin-top: 15px; font-size: 13px; color: #64748b; text-transform: uppercase; letter-spacing: 1px;">
                                Detector de Enfermedades en Cafetales
                            </p>
                        </div>

                        <h2 style="font-size: 22px; font-weight: 700; color: #0f172a; margin: 0 0 16px 0; text-align: center;">
                            ¡Bienvenido a DEC!
                        </h2>
                        
                        <p style="font-size: 15px; color: #475569; margin-bottom: 32px; text-align: center;">
                            Gracias por unirte a nuestra plataforma. Para completar tu registro y asegurar tu cuenta, por favor ingresa el siguiente código de verificación:
                        </p>

                        <div style="background-color: #f0fdf4; border-radius: 12px; padding: 25px; text-align: center; margin-bottom: 32px; border: 1px dashed #bbf7d0;">
                            <div style="font-size: 12px; color: #166534; font-weight: 600; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Código de activación</div>
                            <div style="font-family: 'SF Mono', Cascadia Code, monospace; font-size: 42px; font-weight: 800; color: #065f46; letter-spacing: 8px;">
                                ${code}
                            </div>
                        </div>

                        <p style="font-size: 13px; color: #64748b; text-align: center; margin-bottom: 24px;">
                            Este código es válido por <strong>15 minutos</strong>. Si no lo utilizas en este tiempo, deberás solicitar uno nuevo.
                        </p>

                        <div style="border-top: 1px solid #e2e8f0; padding-top: 24px;">
                            <p style="font-size: 12px; color: #94a3b8; text-align: center; margin: 0;">
                                ¿No creaste una cuenta en DEC? Puedes ignorar este mensaje con seguridad.
                            </p>
                        </div>
                    </div>

                    <div style="padding: 24px; background-color: #f1f5f9; text-align: center;">
                        <p style="font-size: 12px; color: #64748b; margin: 0; font-weight: 600;">
                            Equipo de Soporte DEC
                        </p>
                        <p style="font-size: 11px; color: #94a3b8; margin: 4px 0 0 0;">
                            Huila, Colombia • Innovación para el campo
                        </p>
                    </div>
                </div>
            </div>
            `
        };
        // Enviar el correo con el código de verificacion
        await transporter.sendMail(emailOption);

        res.status(201).json({ message: 'Se ha enviado el código de veerificación a tu correo' });
    } catch (error) {
        res.status(500).json({ message: "Error al crear el usuario", error: error.message });
    }
};
// verificar código de registro
export const verifyCode = async (req, res) => {
    try {
        const { email, code } = req.body;
        // validaciones
        if (!email || !code) return res.status(400).json({message: "Todos los campos son obligatorios."});
        // validamos el codigo
        if (!/^[0-9]{6}$/.test(code)) return res.status(400).json({message: "Escribe un código válido"})
        // encontrar al usuario que cimpla con el codigo y el tiempo
        const user = await Users.findOne({
            email,
            verificationCode: code,
            verificationCodeExpires: {$gt: new Date()} // Que no haya expirado
        });
        // validamos
        if (!user) return res.status(400).json({ message: 'Código inválido o expirado' });
        // Limpiamos el código y lo verificamos
        user.isVerified = true;
        user.verificationCode = undefined; 
        user.verificationCodeExpires = undefined;
        await user.save();
        res.status(200).json({ message: 'Cuenta verificada con éxito' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}