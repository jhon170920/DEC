import nodemailer from "nodemailer";
import Users from "../models/users.js";
import dotenv from "dotenv";

dotenv.config();


const trasnporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

export const contactUs = async (req, res) => {
    try {
        const {name, email, message} = req.body;
        if ( !name ||!email || !message) {
            return res.status(400).json({message: "El correo electrónico es obligatorio."});
        };
        if(!/^[a-zA-Z0-9._%+-]+@gmail\.(com|co)$/.test(email)){
            return res.status(400).json({message: "Escrbie un correo electrónico válido"});
        }
        const user = await Users.findOne({email});

        if (!user) {
            return res.status(400).json({message: "No se encontró el usuario"});
        };

        const emailOption = {
            from: process.env.EMAIL_USER,
            to: "juanchoap06@gmail.com",
            subject: `Mensaje de ${name} - DEC`,
            html:
            `
            <div style="background-color: #f8fafc; padding: 40px 10px; font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; line-height: 1.5;">
            
                <div style="max-width: 550px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); border: 1px solid #e2e8f0; overflow: hidden;">
                    
                    <div style="background-color: #065f46; padding: 30px; text-align: center;">
                        <h2 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: 700; letter-spacing: 0.5px;">Nuevo Mensaje de Contacto</h2>
                        <p style="color: #d1fae5; margin: 5px 0 0 0; font-size: 13px;">Recibido desde el aplicativo App DEC</p>
                    </div>
            
                    <div style="padding: 40px;">
                        
                        <div style="margin-bottom: 25px;">
                            <label style="display: block; font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">Remitente</label>
                            <div style="font-size: 16px; color: #0f172a; padding: 12px; background-color: #f1f5f9; border-radius: 8px; border: 1px solid #e2e8f0;">
                                <strong>${name}</strong>
                            </div>
                        </div>
            
                        <div style="margin-bottom: 25px;">
                            <label style="display: block; font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">Correo Electrónico</label>
                            <div style="font-size: 16px; color: #065f46; padding: 12px; background-color: #f1f5f9; border-radius: 8px; border: 1px solid #e2e8f0;">
                                <a href="mailto:${email}" style="color: #065f46; text-decoration: none; font-weight: 600;">${email}</a>
                            </div>
                        </div>
            
                        <div style="margin-bottom: 10px;">
                            <label style="display: block; font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">Mensaje o Consulta</label>
                            <div style="font-size: 15px; color: #334155; padding: 20px; background-color: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; line-height: 1.6; font-style: italic;">
                                "${message}"
                            </div>
                        </div>
            
                    </div>
            
                    <div style="padding: 20px; background-color: #f1f5f9; text-align: center; border-top: 1px solid #e2e8f0;">
                        <p style="font-size: 11px; color: #94a3b8; margin: 0; text-transform: uppercase; letter-spacing: 1px;">
                            Este correo fue generado automáticamente por el sistema de soporte DEC.
                        </p>
                    </div>
                </div>
            
                <div style="text-align: center; margin-top: 20px;">
                    <p style="font-size: 12px; color: #94a3b8;">© 2026 App DEC | Garzón Huila</p>
                </div>
            </div>
            `
        };

        await trasnporter.sendMail(emailOption);

        res.status(200).json({message: "Mensaje de contacto enviado"});
    } catch (error) {
        console.error("Error al enviar el código", error)
        return res.status(500).json({message: "Error al procesar la solicitud", error: error.message});
    }
}