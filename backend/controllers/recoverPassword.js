import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

import Users from "../models/users.js";

dotenv.config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const codeGenerator = () => {
    return Math.floor(100000 + Math.random()*900000).toString();
};

export const requestCode = async (req, res) => {
    try {
        // traemos el email del usuario
        const {email} = req.body;
        //verificamos que exista
        if (!email) return res.status(400).json({message: "El correo electrónico es obligatorio."});
        // validamos que si esté bien escrito
        if(!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]{1,15}\.[a-zA-Z]{2,15}\s?$/.test(email)) return res.status(400).json({message: "Escrbie un correo electrónico válido"});
        // buscamos el usuario
        const user = await Users.findOne({email});
        // buscamos si existe
        if (!user) return res.status(400).json({message: "Este correo no está registrado."});
        // generamos el codigo
        const code = codeGenerator();
        // se lo agregamos al usuario
        user.codeRecuperation = code;
        // le ponemos la hora actual + 15 minutos
        user.codeExpiration = new Date (Date.now() + 900000); // 15 minutos
        // lo guardamos
        await user.save();
        // cargamos el correo a enviar
        const emailOption = {
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: 'Código de recuperación - DEC',
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
                
                            <h2 style="font-size: 22px; font-weight: 700; color: #0f172a; margin: 0 0 16px 0; text-align: center;">¿Olvidaste tu contraseña?</h2>
                            
                            <p style="font-size: 15px; color: #475569; margin-bottom: 32px; text-align: center;">
                                No te preocupes, <strong>${user.name}</strong>. Usa el código de seguridad de abajo para restablecer tu acceso a la plataforma.
                            </p>
                
                            <div style="background-color: #f0fdf4; border-radius: 12px; padding: 18px; text-align: center; margin-bottom: 32px;">
                                <div style="font-size: 12px; color: #166534; font-weight: 600; margin-bottom: 8px; text-transform: uppercase;">Tu código de verificación</div>
                                <div style="font-family: 'SF Mono', Cascadia Code, monospace; font-size: 38px; font-weight: 700; color: #065f46; letter-spacing: 6px;">
                                    ${code}
                                </div>
                            </div>
                
                            <div style="background-color: #fff9f0; border-left: 4px solid #f59e0b; padding: 15px; margin-bottom: 24px;">
                                <p style="font-size: 13px; color: #92400e; margin: 0;">
                                    <strong>Nota:</strong> El código expira en 15 minutos por razones de seguridad.
                                </p>
                            </div>
                
                            <p style="font-size: 13px; color: #94a3b8; text-align: center; margin: 0;">
                                Si tú no hiciste esta solicitud, puedes ignorar y borrar este correo con tranquilidad o contactarnos.
                            </p>
                        </div>
                
                        <div style="padding: 24px; background-color: #f1f5f9; text-align: center;">
                            <p style="font-size: 12px; color: #64748b; margin: 0;">
                                Este es un mensaje automático del aplicativo <strong>DEC</strong>.
                            </p>
                            <p style="font-size: 12px; color: #64748b; margin: 4px 0 0 0;">
                                Huila, Colombia
                            </p>
                        </div>
                    </div>
                </div>
            `
        };
        // lo confirmamos y lo enviamos
        await transporter.sendMail(emailOption);
        // DEBUG
        console.log(`Código enviado a ${user.email}: ${code}`);
        // mensaje de feedbakc al usuario
        res.status(200).json({message: "Si existe el correo, recibirás un código de verificación"});

    } catch (error) {
        console.error("Error al enviar el código", error)
        res.status(500).json({message: "Error al procesar la solicitud", error: error.message});
    };
};

export const changePassword = async (req, res) => {
    try {
        // traemos el correo del usuario, el codigo y la neuva contraseña
        const {email, code, newPass} = req.body;

        // validaciones
        if (!email|| !code|| !newPass) return res.status(400).json({message: "Todos los campos son obligatorios."});
        // validamos el codigo
        if (!/^[0-9]{6}$/.test(code)) return res.status(400).json({message: "Escribe un código válido"})
        // encontramos el usuario que cumpla con el codigo y que no supere a los 15 minutos que lo guardamos
        const user = await Users.findOne({
            email: email,
            codeRecuperation: code,
            codeExpiration: {$gt: new Date()}
        });
        // validmos
        if(!user) return res.status(400).json({message: "Código inválido o expirado"}) 
        // encriptamos la nueva contraseña
        const salt = await bcrypt.genSalt(10);
        const hashedNewPass = await bcrypt.hash(newPass, salt);
        // la guardamos al usuario y le quitamos el codigo
        user.password = hashedNewPass;
        user.codeRecuperation = undefined;
        user.codeExpiration = undefined;
        await user.save();

        const emailOption = {
            from: process.env.EMAIL_USER,
            to: Users.email,
            subject: 'Contraseña Actualizada - DEC',
            html:
            `
            <div style="background-color: #f8fafc; padding: 40px 10px; font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; line-height: 1.5;">
            
                <div style="max-width: 520px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); border: 1px solid #e2e8f0; overflow: hidden;">
                    
                    <div style="height: 6px; background-color: #065f46;"></div>
            
                    <div style="padding: 40px;">
                        <div style="text-align: center; margin-bottom: 25px;">
                            <div style="background-color: #f0fdf4; width: 80px; height: 80px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 20px;">
                                <span style="color: #166534; font-size: 40px;">✓</span>
                            </div>
                            <h2 style="font-size: 24px; font-weight: 800; color: #0f172a; margin: 0;">¡Contraseña Actualizada!</h2>
                        </div>
            
                        <p style="font-size: 16px; color: #475569; margin-bottom: 25px; text-align: center;">
                            Hola <strong>${user.name}</strong>, tu contraseña ha sido cambiada exitosamente. Ya puedes volver a iniciar sesión en el aplicativo.
                        </p>
            
                        <div style="background-color: #fef2f2; border-radius: 12px; padding: 15px; border: 1px solid #fee2e2;">
                            <p style="font-size: 13px; color: #991b1b; margin: 0; text-align: center;">
                                <strong>⚠️ ¿No fuiste tú?</strong> Si no realizaste este cambio, por favor contacta a nuestro equipo de soporte de inmediato para proteger tu cuenta.
                            </p>
                        </div>
                    </div>
            
                    <div style="padding: 24px; background-color: #f1f5f9; text-align: center;">
                        <p style="font-size: 12px; color: #64748b; margin: 0;">
                            © 2026 <strong>App DEC</strong> - Detector de Enfermedades en Cafetales
                        </p>
                        <p style="font-size: 11px; color: #94a3b8; margin: 5px 0 0 0; text-transform: uppercase; letter-spacing: 1px;">
                            Huila, Colombia
                        </p>
                    </div>
                </div>
            </div>
            `
        };

        await transporter.sendMail(emailOption);

        return res.status(200).json({message: "Contraseña actualizada exitosamente. Ya puedes iniciar sesión con tu nueva contraseña"});

    } catch (error) {
        console.error("Error al al cambiar la contraseña", error.message);
        return res.status(500).json({message: "Error al al cambiar la contraseña", error: error.message});
    };
};
