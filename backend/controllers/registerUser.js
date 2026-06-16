import bcrypt from "bcryptjs";
import { Resend } from "resend";
import dotenv from 'dotenv';

import Users from "../models/users.js";

dotenv.config();

// Configuración de Resend
const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = process.env.FROM_EMAIL // debe ser no-reply@dec-app.online

// ✅ VALIDACIONES MEJORADAS (más flexibles)
const expressions = {
    // Nombre: Solo letras, espacios, acentos - mínimo 2 caracteres
    name: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{2,50}$/,
    
    // Email: Cualquier email válido (no restringido a dominios específicos)
    email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    
    // Contraseña: Mínimo 6 caracteres (frontend ya valida mayúscula/minúscula)
    // Permite caracteres especiales ahora
    pass: /^.{6,}$/  // Al menos 6 caracteres de cualquier tipo
};

// Registrar nuevo usuario
export const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // ========== VALIDACIONES CON MENSAJES ESPECÍFICOS ==========
        
        // 1. Validar que todos los campos existan
        if (!name || !email || !password) {
            return res.status(400).json({ 
                errors: ["Campos vacíos"],
                message: 'Todos los campos son obligatorios',
                fields: {
                    name: !name ? 'El nombre es requerido' : null,
                    email: !email ? 'El email es requerido' : null,
                    password: !password ? 'La contraseña es requerida' : null
                }
            });
        }

        // 2. Validar nombre
        if (!expressions.name.test(name.trim())) {
            return res.status(400).json({ 
                errors: ["Nombre inválido"],
                message: "El nombre debe contener solo letras y espacios (mínimo 2 caracteres)",
                fields: { name: 'Nombre inválido' }
            });
        }

        // 3. Validar email
        if (!expressions.email.test(email)) {
            return res.status(400).json({ 
                errors: ["Email inválido"],
                message: "El formato del correo electrónico no es válido",
                fields: { email: 'Email inválido (ejemplo: usuario@ejemplo.com)' }
            });
        }

        // 4. Validar contraseña (mínimo 6 caracteres)
        if (!expressions.pass.test(password)) {
            return res.status(400).json({ 
                errors: ["Contraseña inválida"],
                message: "La contraseña debe tener al menos 6 caracteres",
                fields: { password: 'Mínimo 6 caracteres' }
            });
        }

        // 5. Verificar si el email ya existe
        let user = await Users.findOne({ email: email.toLowerCase() });
        if (user) {
            return res.status(400).json({ 
                errors: ["Email duplicado"],
                message: 'Este correo ya está registrado. ¿Deseas iniciar sesión?',
                fields: { email: 'Email ya registrado' }
            });
        }

        // ========== CREAR USUARIO ==========

        // Generar código de verificación
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Hash de contraseña
        const hashedPassword = await bcrypt.hash(password, 10);

        // Crear usuario en base de datos
        user = new Users({
            name: name.trim(),
            email: email.toLowerCase().trim(),
            password: hashedPassword,
            provider: ['local'],
            verificationCode: code,
            verificationCodeExpires: new Date(Date.now() + 1800000) // 30 minutos
        });

        await user.save();

        // ========== ENVIAR EMAIL DE VERIFICACIÓN ==========

        try {
            const { error } = await resend.emails.send({
                from: FROM_EMAIL,
                to: email.toLowerCase(),
                subject: 'Código de Verificación - DEC',
                html: `
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
                                    Este código es válido por <strong>30 minutos</strong>. Si no lo utilizas en este tiempo, deberás solicitar uno nuevo.
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
            });

            if (error) {
                console.error("Error al enviar email de verificación:", error);
                // Eliminar el usuario creado si falla el envío
                await Users.findByIdAndDelete(user._id);
                return res.status(500).json({ 
                    errors: ["Email no enviado"],
                    message: "No se pudo enviar el correo de verificación. Intente de nuevo más tarde." 
                });
            }

        } catch (emailError) {
            console.error("Error en Resend:", emailError);
            await Users.findByIdAndDelete(user._id);
            return res.status(500).json({ 
                errors: ["Error de email"],
                message: "Error al enviar el código de verificación" 
            });
        }

        // ✅ Éxito
        return res.status(201).json({ 
            success: true,
            message: 'Registro exitoso. Se ha enviado el código de verificación a tu correo',
            email: email.toLowerCase()
        });

    } catch (error) {
        console.error("Error en registerUser:", error);
        return res.status(500).json({ 
            errors: ["Error del servidor"],
            message: "Error al crear el usuario",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Verificar código de registro
export const verifyCode = async (req, res) => {
    try {
        const { email, code } = req.body;

        // Validaciones
        if (!email || !code) {
            return res.status(400).json({ 
                errors: ["Campos vacíos"],
                message: "Email y código son obligatorios",
                fields: {
                    email: !email ? 'Email requerido' : null,
                    code: !code ? 'Código requerido' : null
                }
            });
        }

        if (!/^[0-9]{6}$/.test(code)) {
            return res.status(400).json({ 
                errors: ["Código inválido"],
                message: "El código debe ser 6 dígitos",
                fields: { code: 'Código inválido (6 dígitos)' }
            });
        }

        // Buscar usuario con código válido
        const user = await Users.findOne({
            email: email.toLowerCase(),
            verificationCode: code,
            verificationCodeExpires: { $gt: new Date() }
        });

        if (!user) {
            return res.status(400).json({ 
                errors: ["Código inválido o expirado"],
                message: 'El código es inválido o ha expirado. Solicita uno nuevo.',
                fields: { code: 'Código inválido o expirado' }
            });
        }

        // Marcar como verificado
        user.isVerified = true;
        user.verificationCode = undefined;
        user.verificationCodeExpires = undefined;
        await user.save();

        return res.status(200).json({ 
            success: true,
            message: 'Cuenta verificada exitosamente',
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {
        console.error("Error en verifyCode:", error);
        return res.status(500).json({ 
            errors: ["Error del servidor"],
            message: "Error al verificar el código",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// ========== NOTA IMPORTANTE ==========
// Las validaciones de este archivo ahora son más flexibles:
// 
// ✅ Email: Acepta cualquier formato válido (no solo gmail, hotmail, etc)
// ✅ Contraseña: Mínimo 6 caracteres (permite caracteres especiales)
// ✅ Errores: Ahora indica específicamente qué falló
// 
// Esto permite que el frontend pueda validar de forma más flexible
// y el backend no rechace datos válidos.