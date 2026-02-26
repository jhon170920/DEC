import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
    // El token suele venir en el header "Authorization" como "Bearer TOKEN"
    const authHeader = req.header("Authorization");
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({ message: "Acceso denegado. No hay token." });
    }

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET || 'tu_clave_secreta');
        req.user = verified; // Guardamos los datos del usuario (id, role) en el request
        next(); // Continuamos a la siguiente función (el controlador)
    } catch (error) {
        res.status(403).json({ message: "Token no válido o expirado." });
    }
};